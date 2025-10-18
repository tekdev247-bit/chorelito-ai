import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const submitRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { childId, minutes, reason } = data || {};
  
  if (!childId || !minutes || minutes <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'childId and positive minutes required.');
  }

  // Validate minutes is reasonable (1-120 minutes)
  if (minutes > 120) {
    throw new functions.https.HttpsError('invalid-argument', 'Cannot request more than 120 minutes at once.');
  }

  const db = admin.firestore();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const counterRef = db.collection('timeRequestCounters').doc(`${childId}_${today}`);

  try {
    // Use transaction to enforce daily limit
    const result = await db.runTransaction(async (tx) => {
      const counterSnap = await tx.get(counterRef);
      const currentCount = counterSnap.exists ? (counterSnap.data()?.count || 0) : 0;
      
      if (currentCount >= 3) {
        // Create exceeded record
        const exceededRequestRef = db.collection('timeRequests').doc();
        tx.set(exceededRequestRef, {
          childId,
          minutesRequested: minutes,
          status: 'exceeded',
          reason: reason || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          decidedAt: admin.firestore.FieldValue.serverTimestamp(),
          reviewerId: null
        });
        
        throw new functions.https.HttpsError('resource-exhausted', 'Daily limit of 3 requests exceeded.');
      }

      // Increment counter
      tx.set(counterRef, { 
        count: currentCount + 1,
        lastRequest: admin.firestore.FieldValue.serverTimestamp(),
        childId,
        date: today
      }, { merge: true });

      // Create the time request
      const requestRef = db.collection('timeRequests').doc();
      tx.set(requestRef, {
        childId,
        minutesRequested: minutes,
        status: 'pending',
        reason: reason || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        decidedAt: null,
        reviewerId: null
      });

      // Write audit event
      const auditRef = db.collection('events').doc();
      tx.set(auditRef, {
        type: 'time_request_submitted',
        actorId: childId,
        payload: { 
          requestId: requestRef.id, 
          minutesRequested: minutes, 
          reason: reason || null,
          requestNumber: currentCount + 1
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { requestId: requestRef.id, requestNumber: currentCount + 1 };
    });

    // Send notification to parent(s)
    try {
      // Get child info to find parent
      const childDoc = await db.collection('children').doc(childId).get();
      if (childDoc.exists) {
        const childData = childDoc.data();
        const parentId = childData?.parentId;
        
        if (parentId) {
          // Create notification
          await db.collection('notifications').add({
            type: 'time_request',
            recipientId: parentId,
            payload: {
              childId,
              childName: childData?.name || 'Child',
              minutes,
              reason: reason || null,
              requestId: result.requestId,
              requestNumber: result.requestNumber
            },
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // TODO: Send push notification via FCM
        }
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return { 
      ok: true, 
      id: result.requestId,
      message: `Time request submitted! This is request #${result.requestNumber} of 3 today.`
    };
  } catch (error: any) {
    console.error('Submit request error:', error);
    
    // Handle specific error cases
    if (error.code === 'resource-exhausted') {
      return { 
        ok: false, 
        error: 'Daily limit exceeded',
        message: 'You have already submitted 3 time requests today. Try again tomorrow.'
      };
    }
    
    throw error;
  }
});
