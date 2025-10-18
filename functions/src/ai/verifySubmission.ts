import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const verifySubmission = functions.firestore
  .document('submissions/{submissionId}')
  .onCreate(async (snap, context) => {
    const submissionData = snap.data();
    const submissionId = context.params.submissionId;
    
    console.log(`Processing submission ${submissionId}`);

    try {
      // Get submission details
      const { childId, choreId, beforeImageUrl, afterImageUrl, description } = submissionData;
      
      if (!beforeImageUrl || !afterImageUrl) {
        console.log('Submission missing required images');
        await snap.ref.update({
          aiVerdict: 'failed',
          aiScore: 0,
          aiReason: 'Missing before or after images',
          decidedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return;
      }

      // TODO: Download and analyze images using AI/ML service
      // For now, implement a simple heuristic-based verification
      const score = await analyzeSubmission(beforeImageUrl, afterImageUrl, description);
      
      const verdict = score >= 0.6 ? 'pass' : 'suspect';
      const reason = score >= 0.6 
        ? 'Chore appears to be completed successfully' 
        : 'Insufficient evidence of chore completion';

      await snap.ref.update({
        aiVerdict: verdict,
        aiScore: score,
        aiReason: reason,
        decidedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // If approved, trigger award process
      if (verdict === 'pass') {
        const choreDoc = await admin.firestore().collection('chores').doc(choreId).get();
        const choreData = choreDoc.data();
        const minutesAward = choreData?.minutesAward || 10;

        await admin.firestore().collection('submissions').doc(submissionId).update({
          minutesAward,
          status: 'approved'
        });
      }

      console.log(`Submission ${submissionId} processed with score ${score} and verdict ${verdict}`);
    } catch (error) {
      console.error(`Error processing submission ${submissionId}:`, error);
      
      await snap.ref.update({
        aiVerdict: 'error',
        aiScore: 0,
        aiReason: 'Processing error occurred',
        decidedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

/**
 * Analyze submission using heuristics and AI
 * TODO: Replace with actual AI/ML service integration
 */
async function analyzeSubmission(
  beforeImageUrl: string,
  afterImageUrl: string,
  description?: string
): Promise<number> {
  try {
    // Placeholder implementation - in real implementation, this would:
    // 1. Download images from URLs
    // 2. Use computer vision to analyze clutter reduction
    // 3. Check for completion indicators
    // 4. Return a confidence score 0-1

    let score = 0.5; // Base score

    // Simple text-based analysis if description is provided
    if (description) {
      const desc = description.toLowerCase();
      
      // Positive indicators
      if (desc.includes('done') || desc.includes('finished') || desc.includes('complete')) {
        score += 0.2;
      }
      if (desc.includes('clean') || desc.includes('tidy') || desc.includes('organized')) {
        score += 0.1;
      }
      
      // Negative indicators
      if (desc.includes('not done') || desc.includes('partial') || desc.includes('almost')) {
        score -= 0.2;
      }
    }

    // Simulate image analysis variance
    const randomFactor = Math.random() * 0.3 - 0.15; // -0.15 to +0.15
    score += randomFactor;

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error('Error analyzing submission:', error);
    return 0.3; // Low confidence on error
  }
}

/**
 * Manual verification function for edge cases
 */
export const manualVerifySubmission = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { submissionId, verdict, score, reason } = data || {};
  
  if (!submissionId || !verdict) {
    throw new functions.https.HttpsError('invalid-argument', 'submissionId and verdict required.');
  }

  if (!['pass', 'suspect', 'failed'].includes(verdict)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid verdict. Must be pass, suspect, or failed.');
  }

  try {
    const submissionRef = admin.firestore().collection('submissions').doc(submissionId);
    
    await submissionRef.update({
      aiVerdict: verdict,
      aiScore: Math.max(0, Math.min(1, score || 0.5)),
      aiReason: reason || 'Manually verified',
      manualReview: true,
      reviewedBy: context.auth.uid,
      decidedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { ok: true, message: 'Submission manually verified.' };
  } catch (error) {
    console.error('Manual verification error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to verify submission.');
  }
});
