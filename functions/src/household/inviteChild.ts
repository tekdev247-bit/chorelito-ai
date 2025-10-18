import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const inviteChild = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { childName, phone } = data || {};
  
  if (!childName || !phone) {
    throw new functions.https.HttpsError('invalid-argument', 'childName and phone required.');
  }

  // Validate phone number format (basic validation)
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number format.');
  }

  try {
    const db = admin.firestore();
    const parentId = context.auth.uid;
    
    // Generate unique invite token
    const token = generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invite document
    const inviteRef = await db.collection('invites').add({
      parentId,
      childName,
      phone: cleanPhone,
      token,
      status: 'pending',
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create deep link URL
    const deepLinkUrl = await createDeepLink(token);
    
    // Send SMS invitation
    await sendSMSInvitation(cleanPhone, childName, deepLinkUrl);

    // Create notification for parent
    await db.collection('notifications').add({
      type: 'invite_sent',
      recipientId: parentId,
      payload: {
        childName,
        phone: cleanPhone,
        inviteId: inviteRef.id,
        token
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { 
      ok: true, 
      message: `Invitation sent to ${childName}`,
      inviteId: inviteRef.id,
      token,
      deepLinkUrl
    };
  } catch (error: any) {
    console.error('Invite child error:', error);
    throw error;
  }
});

/**
 * Process invite acceptance when child clicks deep link
 */
export const acceptInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { token } = data || {};
  
  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'Invite token required.');
  }

  try {
    const db = admin.firestore();
    const childId = context.auth.uid;

    // Find invite by token
    const inviteQuery = await db.collection('invites')
      .where('token', '==', token)
      .where('status', '==', 'pending')
      .get();

    if (inviteQuery.empty) {
      throw new functions.https.HttpsError('not-found', 'Invalid or expired invite token.');
    }

    const inviteDoc = inviteQuery.docs[0];
    const inviteData = inviteDoc.data();

    // Check if invite is expired
    const expiresAt = inviteData.expiresAt?.toDate();
    if (expiresAt && expiresAt < new Date()) {
      throw new functions.https.HttpsError('deadline-exceeded', 'Invite has expired.');
    }

    // Create child user record
    await db.collection('children').doc(childId).set({
      parentId: inviteData.parentId,
      name: inviteData.childName,
      phone: inviteData.phone,
      role: 'child',
      status: 'active',
      joinedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update user profile
    await db.collection('users').doc(childId).set({
      role: 'child',
      parentId: inviteData.parentId,
      name: inviteData.childName,
      phone: inviteData.phone,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Mark invite as accepted
    await inviteDoc.ref.update({
      status: 'accepted',
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      acceptedBy: childId
    });

    // Create initial screen time record
    const today = new Date().toISOString().slice(0, 10);
    await db.collection('screenTime').doc(`${childId}_${today}`).set({
      childId,
      date: today,
      budgetMinutes: 60, // Default 1 hour
      usedMinutes: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Notify parent
    await db.collection('notifications').add({
      type: 'child_joined',
      recipientId: inviteData.parentId,
      payload: {
        childId,
        childName: inviteData.childName
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { 
      ok: true, 
      message: 'Successfully joined the family!',
      parentId: inviteData.parentId
    };
  } catch (error: any) {
    console.error('Accept invite error:', error);
    throw error;
  }
});

/**
 * Generate a secure invite token
 */
function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create deep link URL for invite
 * TODO: Implement actual dynamic link creation with Firebase Dynamic Links
 */
async function createDeepLink(token: string): Promise<string> {
  // For now, return a placeholder URL
  // In production, this would use Firebase Dynamic Links or similar service
  const baseUrl = process.env.APP_DEEP_LINK_BASE_URL || 'https://chorelito.app';
  return `${baseUrl}/invite?token=${token}`;
}

/**
 * Send SMS invitation
 * TODO: Implement actual SMS sending via Twilio, AWS SNS, or similar
 */
async function sendSMSInvitation(phone: string, childName: string, deepLinkUrl: string): Promise<void> {
  // For now, just log the SMS content
  // In production, this would integrate with an SMS service
  const message = `Hi! You've been invited to join Chorelito by your parent. Click here to get started: ${deepLinkUrl}`;
  
  console.log(`SMS to ${phone}: ${message}`);
  
  // TODO: Replace with actual SMS service integration
  // Example with Twilio:
  // const twilio = require('twilio');
  // const client = twilio(accountSid, authToken);
  // await client.messages.create({
  //   body: message,
  //   from: '+1234567890',
  //   to: `+${phone}`
  // });
}
