import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export voice functions
export { parseIntent } from './voice/parseIntent';
export { dispatch } from './voice/dispatch';

// Export time management functions
export { submitRequest } from './time/submitRequest';
export { approveRequest, denyRequest } from './time/approveRequest';

// Export AI functions
export { verifySubmission, manualVerifySubmission } from './ai/verifySubmission';

// Export screen time functions
export { applyAward, grantBonusTime } from './screenTime/applyAward';

// Export household functions
export { inviteChild, acceptInvite } from './household/inviteChild';