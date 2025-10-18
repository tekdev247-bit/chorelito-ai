import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const approveRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { requestId, approved = true, reason } = data || {};
  
  if (!requestId) {
    throw new functions.https.HttpsError('invalid-argument', 'requestId required.');
  }

  const db = admin.firestore();
  const requestRef = db.collection('timeRequests').doc(requestId);

  try {
    const result = await db.runTransaction(async (tx) => {
      const requestSnap = await tx.get(requestRef);
      
      if (!requestSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Request not found.');
      }

      const requestData = requestSnap.data();
      const currentStatus = requestData?.status;
      
      if (currentStatus !== 'pending') {
        throw new functions.https.HttpsError('failed-precondition', 'Request has already been processed.');
      }

      const childId = requestData.childId;
      const minutes = requestData.minutesRequested || 0;
      const reviewerId = context.auth!.uid;

      // Update request status
      tx.update(requestRef, {
        status: approved ? 'approved' : 'denied',
        decidedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewerId,
        decisionReason: reason || null
      });

      if (approved) {
        // Increment today's screenTime budgetMinutes for child
        const today = new Date().toISOString().slice(0, 10);
        const screenTimeRef = db.collection('screenTime').doc(`${childId}_${today}`);
        
        const screenTimeSnap = await tx.get(screenTimeRef);
        const currentData = screenTimeSnap.data();
        
        const newBudgetMinutes = (currentData?.budgetMinutes || 0) + minutes;
        const usedMinutes = currentData?.usedMinutes || 0;
        
        tx.set(screenTimeRef, {
          childId,
          date: today,
          budgetMinutes: newBudgetMinutes,
          usedMinutes,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Create audit event
        const auditEventRef = db.collection('events').doc();
        tx.set(auditEventRef, {
          type: 'time_request_approved',
          actorId: reviewerId,
          payload: {
            childId,
            requestId,
            minutesApproved: minutes,
            newBudgetMinutes,
            reason: reason || null
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { childId, minutes, newBudgetMinutes };
      } else {
        // Create audit event for denial
        const auditEventRef = db.collection('events').doc();
        tx.set(auditEventRef, {
          type: 'time_request_denied',
          actorId: reviewerId,
          payload: {
            childId,
            requestId,
            minutesRequested: minutes,
            reason: reason || null
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { childId, minutes, newBudgetMinutes: null };
      }
    });

    // Send notification to child
    try {
      const requestDoc = await requestRef.get();
      const requestData = requestDoc.data();
      const childId = requestData?.childId;
      
      if (childId) {
        await db.collection('notifications').add({
          type: 'time_request_decision',
          recipientId: childId,
          payload: {
            requestId,
            approved,
            minutes: requestData?.minutesRequested || 0,
            reason: reason || null,
            newBudgetMinutes: result.newBudgetMinutes
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // TODO: Send push notification via FCM
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the approval if notification fails
    }

    // Return helpful messages for UI
    if (approved) {
      return { 
        ok: true, 
        message: `Approved ${result.minutes} minutes! Child's screen time budget updated.`,
        childId: result.childId,
        minutesApproved: result.minutes,
        newBudgetMinutes: result.newBudgetMinutes
      };
    } else {
      return { 
        ok: true, 
        message: 'Request denied.',
        childId: result.childId,
        minutesDenied: result.minutes
      };
    }
  } catch (error: any) {
    console.error('Approve request error:', error);
    
    // Handle specific error cases
    if (error.code === 'not-found') {
      return { 
        ok: false, 
        error: 'Request not found',
        message: 'The time request could not be found.'
      };
    }
    if (error.code === 'failed-precondition') {
      return { 
        ok: false, 
        error: 'Request already processed',
        message: 'This request has already been approved or denied.'
      };
    }
    
    throw error;
  }
});

export const denyRequest = functions.https.onCall(async (data, context) => {
  return approveRequest({ ...data, approved: false }, context);
});
