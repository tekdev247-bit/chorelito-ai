# Firebase Setup Guide for Chorelito AI

## 🎯 Overview
This guide will help you complete the Firebase setup so voice commands work in the app.

## ✅ What's Already Done
- ✅ Firebase config added to `app/lib/firebase.ts`
- ✅ Firebase Functions written and compiled
- ✅ Firestore security rules created
- ✅ Storage security rules created
- ✅ Firebase configuration files created
- ✅ Functions dependencies installed
- ✅ TypeScript compilation successful

## 📋 What You Need to Do

### Step 1: Login to Firebase
Open a **new terminal** (not in Cursor) and run:
```bash
firebase login
```

This will open a browser window. Sign in with your Google account that has access to the `chorelito-ai` Firebase project.

### Step 2: Verify Project Connection
After logging in, verify the project is connected:
```bash
cd c:\Users\Twrig\chorelito-ai
firebase projects:list
```

You should see `chorelito-ai` in the list.

### Step 3: Deploy Firebase Functions
Deploy the voice command functions to Firebase:
```bash
firebase deploy --only functions
```

This will deploy:
- `voice-dispatch` - Handles voice command execution
- `voice-parseIntent` - Parses voice commands using NLU
- `submitRequest` - Handles screen time requests
- `approveRequest` - Approves screen time requests
- `denyRequest` - Denies screen time requests
- `verifySubmission` - AI verification of chore completion
- `manualVerifySubmission` - Manual chore verification
- `applyAward` - Grants bonus screen time
- `grantBonusTime` - Grants bonus time
- `inviteChild` - Sends child invitations
- `acceptInvite` - Accepts child invitations

### Step 4: Deploy Firestore Rules
Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

### Step 5: Deploy Firestore Indexes
Deploy the database indexes:
```bash
firebase deploy --only firestore:indexes
```

### Step 6: Deploy Storage Rules
Deploy the storage security rules:
```bash
firebase deploy --only storage
```

### Step 7: Enable Authentication
In the Firebase Console (https://console.firebase.google.com):
1. Go to your `chorelito-ai` project
2. Click **Authentication** in the left menu
3. Click **Get Started**
4. Enable **Phone** authentication (for parent/child login)
5. Enable **Email/Password** authentication (optional backup)

### Step 8: Set Up Firestore Database
In the Firebase Console:
1. Click **Firestore Database** in the left menu
2. Click **Create Database**
3. Choose **Production mode** (we have custom rules)
4. Select your preferred region (e.g., `us-central1`)
5. Click **Enable**

### Step 9: Set Up Storage
In the Firebase Console:
1. Click **Storage** in the left menu
2. Click **Get Started**
3. Use the default security rules (we'll deploy ours)
4. Select the same region as Firestore
5. Click **Done**

### Step 10: Test Voice Commands
Once everything is deployed:
1. Restart your Expo dev server:
   ```bash
   npx expo start --clear
   ```
2. Open the app on your device
3. Navigate to the **Home** tab
4. Tap the voice command button
5. Try a command like:
   - "Add a new child named Emma with phone number 555-1234"
   - "Assign dishes to Emma"
   - "Show me screen time usage"
   - "Grant 15 bonus minutes to Emma"

## 🔍 Troubleshooting

### If deployment fails:
1. Check you're logged in: `firebase login:list`
2. Check project is set: `firebase use chorelito-ai`
3. Check functions build: `cd functions && npm run build`

### If voice commands don't work:
1. Check Firebase Console → Functions for errors
2. Check app logs for authentication errors
3. Verify you're signed in to the app
4. Check Firestore rules allow your user role

### If authentication fails:
1. Make sure Phone auth is enabled in Firebase Console
2. Check that your user document has a `role` field set to `'parent'`
3. Verify the Firebase config in `app/lib/firebase.ts` matches your project

## 📱 Testing in Expo Go vs Development Build

### Expo Go (Current):
- ✅ Text input fallback works
- ❌ Real voice recognition doesn't work (native module limitation)
- ✅ Firebase functions work
- ✅ Text-to-speech works

### Development Build (Recommended for production):
- ✅ Real voice recognition works
- ✅ Firebase functions work
- ✅ Text-to-speech works
- ✅ Full native functionality

To create a development build:
```bash
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

## 🎤 Supported Voice Commands

### Child Management:
- "Add a new child named [Name] with phone number [Number]"
- "Add [Name] phone [Number]"

### Chore Management:
- "Have [Child] do the dishes"
- "Assign [Task] to [Child]"
- "Have everyone clean their room"

### Screen Time:
- "Show me screen time usage"
- "How much screen time has [Child] used?"
- "Grant [Number] bonus minutes to [Child]"
- "Give [Child] [Number] more minutes"

## 🔐 Security Notes

### Firestore Rules:
- Parents can read/write their own data
- Children can only read their assigned data
- All writes are logged in the `events` collection
- Screen time data is protected by role-based rules

### Functions Security:
- All functions require authentication
- Parent-only actions are role-checked
- Transactions ensure data consistency
- Audit logging for all actions

## 📊 Database Structure

### Collections:
- `users` - User profiles with roles
- `children` - Child profiles linked to parents
- `chores` - Chore assignments
- `screenTime` - Daily screen time tracking
- `timeRequests` - Screen time extension requests
- `invites` - Pending child invitations
- `events` - Audit log of all actions

## 🚀 Next Steps

After Firebase is set up:
1. ✅ Test voice commands
2. ✅ Set up authentication flow
3. ✅ Create parent onboarding
4. ✅ Test child app features
5. ✅ Deploy to production

## 💡 Tips

- Use Firebase Emulator Suite for local testing:
  ```bash
  firebase emulators:start
  ```
- Monitor function logs in real-time:
  ```bash
  firebase functions:log
  ```
- Check function costs in Firebase Console → Functions → Usage

## 📞 Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Check app console for client-side errors
3. Verify all services are enabled in Firebase Console
4. Ensure billing is enabled (required for Cloud Functions)

---

**Ready to deploy?** Run the commands in Step 3-6 in your terminal! 🚀

