import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const applyAward = functions.firestore
  .document('submissions/{submissionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const submissionId = context.params.submissionId;

    // Only process if AI verdict changed to 'pass'
    if (before.aiVerdict === after.aiVerdict || after.aiVerdict !== 'pass') {
      return;
    }

    console.log(`Applying award for submission ${submissionId}`);

    try {
      const { childId, minutesAward, choreId } = after;
      
      if (!childId || !minutesAward) {
        console.error(`Submission ${submissionId} missing childId or minutesAward`);
        return;
      }

      const db = admin.firestore();
      
      // Calculate award date (next day)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const awardDate = tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD
      
      const screenTimeRef = db.collection('screenTime').doc(`${childId}_${awardDate}`);

      await db.runTransaction(async (tx) => {
        const screenTimeSnap = await tx.get(screenTimeRef);
        const currentData = screenTimeSnap.data();
        
        const newBudgetMinutes = (currentData?.budgetMinutes || 0) + minutesAward;
        const usedMinutes = currentData?.usedMinutes || 0;
        
        // Cap the budget at a reasonable maximum (e.g., 240 minutes = 4 hours)
        const maxDailyBudget = 240;
        const cappedBudget = Math.min(newBudgetMinutes, maxDailyBudget);
        
        tx.set(screenTimeRef, {
          childId,
          date: awardDate,
          budgetMinutes: cappedBudget,
          usedMinutes,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Create audit event
        const auditEventRef = db.collection('events').doc();
        tx.set(auditEventRef, {
          type: 'chore_reward_applied',
          actorId: 'system', // System-generated event
          payload: {
            childId,
            submissionId,
            choreId,
            minutesAward,
            awardDate,
            capped: cappedBudget !== newBudgetMinutes
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      // Update submission status
      await db.collection('submissions').doc(submissionId).update({
        rewardApplied: true,
        rewardAppliedAt: admin.firestore.FieldValue.serverTimestamp(),
        rewardDate: awardDate
      });

      // Send notification to child
      try {
        await db.collection('notifications').add({
          type: 'chore_reward',
          recipientId: childId,
          payload: {
            submissionId,
            minutesAward,
            awardDate
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // TODO: Send push notification via FCM
      } catch (notificationError) {
        console.error('Failed to send reward notification:', notificationError);
        // Don't fail the award if notification fails
      }

      console.log(`Award applied successfully for submission ${submissionId}: ${minutesAward} minutes`);
    } catch (error) {
      console.error(`Error applying award for submission ${submissionId}:`, error);
    }
  });

/**
 * Manual award function for parents to grant additional time
 */
export const grantBonusTime = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { childId, minutes, reason } = data || {};
  
  if (!childId || !minutes || minutes <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'childId and positive minutes required.');
  }

  try {
    const db = admin.firestore();
    
    // Verify parent-child relationship
    const childDoc = await db.collection('children').doc(childId).get();
    if (!childDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Child not found.');
    }

    const childData = childDoc.data();
    if (childData?.parentId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to grant time to this child.');
    }

    // Calculate award date (today or tomorrow)
    const awardDate = new Date().toISOString().slice(0, 10);
    const screenTimeRef = db.collection('screenTime').doc(`${childId}_${awardDate}`);

    const txResult = await db.runTransaction(async (tx) => {
      const screenTimeSnap = await tx.get(screenTimeRef);
      const currentData = screenTimeSnap.data();
      
      const newBudgetMinutes = (currentData?.budgetMinutes || 0) + minutes;
      const usedMinutes = currentData?.usedMinutes || 0;
      
      // Cap the budget at a reasonable maximum
      const maxDailyBudget = 240;
      const cappedBudget = Math.min(newBudgetMinutes, maxDailyBudget);
      
      tx.set(screenTimeRef, {
        childId,
        date: awardDate,
        budgetMinutes: cappedBudget,
        usedMinutes,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Create audit event
      const auditEventRef = db.collection('events').doc();
      tx.set(auditEventRef, {
        type: 'manual_bonus_granted',
        actorId: context.auth.uid,
        payload: {
          childId,
          minutes,
          reason: reason || null,
          awardDate,
          capped: cappedBudget !== newBudgetMinutes
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { newBudgetMinutes, cappedBudget };
    });

    return { 
      ok: true, 
      message: `Granted ${minutes} bonus minutes to child.`,
      awardDate,
      capped: txResult.cappedBudget !== txResult.newBudgetMinutes
    };
  } catch (error: any) {
    console.error('Grant bonus time error:', error);
    throw error;
  }
});
