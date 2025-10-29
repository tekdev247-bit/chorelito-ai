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

## 🔒 Security: API Key Exposure Warning

### GitHub Secrets Detection

GitHub detected the Firebase API key in your repository. This is **normal and expected** for Firebase client apps.

### Why It's Safe:

Firebase API keys are **designed to be public** in client-side applications. They're not secret credentials.

### Important Security Measures:

1. **API Key Restrictions** (Required):

   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Select your project: `chorelito-ai`
   - Find your API key and click "Restrict key"
   - Set Application restrictions:
     - ✅ **Android apps**: Add your package name
     - ✅ **iOS apps**: Add your bundle ID
     - ✅ **HTTP referrers**: Add your web domains (if any)

2. **Firestore Rules** (Already configured):

   - ✅ Authentication required for all operations
   - ✅ Role-based access control (parent vs child)
   - ✅ Data isolation between users

3. **Authentication** (Required):
   - All functions require user authentication
   - Phone/Email verification for users
   - Role-based permissions enforced

### Rotating Your API Key (Optional):

If you want to generate a new key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new API key
3. Update `app/lib/firebase.ts` with the new key
4. Restrict the new key as described above
5. Delete the old key after deployment

### What's NOT Exposed:

- ✅ Service account credentials (never in client code)
- ✅ Admin SDK (server-side only)
- ✅ API secrets (in Cloud Functions, not client)
- ✅ Private keys or certificates

### Summary:

Your Firebase setup is secure as long as you:

1. ✅ Restrict the API key in Google Cloud Console
2. ✅ Deploy Firestore security rules (already done)
3. ✅ Require authentication for functions (already configured)
4. ✅ Use role-based access control (already implemented)

**The API key in your code is intentional and safe when properly restricted!**

---

**Ready to deploy?** Run the commands in Step 3-6 in your terminal! ��

## Firestore Data Integration

### Overview

The app now uses Firestore for persistent data storage instead of local state. All parent, child, chore, and settings data is stored in Firestore with proper relationships.

### Database Structure

#### Collections

1. **`parents`** - Parent user accounts

   - `id` (string): Unique parent ID
   - `name` (string): Parent's display name
   - `phone` (string): Normalized phone number (unique)
   - `avatar` (string): Emoji or avatar identifier
   - `role` (string): Always "parent"
   - `createdAt` (Timestamp): Account creation time
   - `updatedAt` (Timestamp): Last update time
   - `settings` (object): Default screen time settings
     - `defaultDailyLimit` (number): Default daily minutes
     - `quietHoursStart` (string): e.g., "07:00"
     - `quietHoursEnd` (string): e.g., "21:00"
     - `maxRequests` (number): Max time requests per day

2. **`children`** - Child profiles

   - `id` (string): Unique child ID (auto-generated)
   - `parentId` (string): Reference to parent document ID
   - `name` (string): Child's name
   - `age` (number): Child's age
   - `points` (number): Gamification points
   - `level` (number): Level based on points
   - `avatar` (string): Emoji or avatar
   - `dailyScreenTimeLimit` (number): Minutes allowed per day
   - `screenTimeStartTime` (string): Allowed start time
   - `screenTimeEndTime` (string): Allowed end time
   - `phone` (string, optional): Child's phone for login
   - `createdAt` (Timestamp)
   - `updatedAt` (Timestamp)

3. **`chores`** - Chore assignments

   - `id` (string): Unique chore ID
   - `childId` (string): Reference to child
   - `title` (string): Chore name
   - `description` (string, optional): Details
   - `points` (number): Points awarded
   - `status` (string): "open" | "completed" | "verified" | "rejected"
   - `assignedBy` (string): Parent user ID
   - `assignedAt` (Timestamp)
   - `completedAt` (Timestamp, optional)
   - `verifiedAt` (Timestamp, optional)
   - `notes` (string, optional): Verification notes
   - `imageUrl` (string, optional): Photo proof URL

4. **`screenTime`** - Daily screen time tracking

   - `id` (string): Composite ID "childId_date"
   - `childId` (string): Reference to child
   - `date` (string): "YYYY-MM-DD"
   - `usedMinutes` (number): Time used today
   - `budgetMinutes` (number): Available time
   - `createdAt` (Timestamp)
   - `updatedAt` (Timestamp)

5. **`reports`** - Weekly progress reports
   - `id` (string): Unique report ID
   - `childId` (string): Reference to child
   - `weekOf` (string): "YYYY-MM-DD" of week start
   - `choresCompleted` (number)
   - `choresTotal` (number)
   - `pointsEarned` (number)
   - `screenTimeUsed` (number)
   - `screenTimeAllowed` (number)
   - `achievements` (array): Achievement IDs
   - `createdAt` (Timestamp)

### Authentication Context

The app uses an `AuthContext` that persists user authentication state:

- **`parentId`**: Current parent's unique ID
- **`phoneNumber`**: Current parent's phone (for verification)
- **`setParentId(id, phone)`**: Set authenticated user
- **`clearAuth()`**: Logout and clear state
- **`isAuthenticated`**: Boolean auth status

Authentication state is persisted using `AsyncStorage` for offline capability.

### Data Services

All Firestore operations are accessed through service objects:

#### `parentService`

- `saveParent(id, data)` - Create or update parent
- `getParent(id)` - Get parent by ID
- `updateSettings(id, settings)` - Update parent settings
- `findByPhone(phone)` - Find parent by phone number

#### `childService`

- `createChild(parentId, childData)` - Create new child profile
- `getChild(id)` - Get child by ID
- `getChildrenByParent(parentId)` - Get all children for parent
- `updateChild(id, updates)` - Update child profile
- `deleteChild(id)` - Delete child profile
- `findByPhone(phone)` - Find child by phone (for login)

#### `choreService`

- `createChore(choreData)` - Assign new chore
- `getChore(id)` - Get chore by ID
- `getChoresByChild(childId)` - Get all chores for child
- `updateChore(id, updates)` - Update chore status
- `deleteChore(id)` - Remove chore

#### `screenTimeService`

- `getOrCreateEntry(childId, date)` - Get or create daily entry
- `updateUsage(childId, date, minutes)` - Update time used
- `grantBonus(childId, date, minutes)` - Add bonus time

#### `reportService`

- `getWeeklyReport(childId, weekOf)` - Get weekly report
- `saveReport(childId, weekOf, data)` - Create or update report

### Utility Functions

- `generateUniqueId()` - Generate unique string ID
- `normalizePhone(phone)` - Normalize phone to digits only

### Onboarding Flow Integration

During onboarding, the app:

1. Generates a unique parent ID
2. Normalizes the phone number
3. Saves parent profile to Firestore
4. Saves parent settings (screen time defaults)
5. Creates the first child profile if provided
6. Saves authentication state to `AsyncStorage`
7. Continues to the Home screen

All data is immediately available via Firestore queries.

### Next Steps for Full Integration

1. **Load data on mount**: Fetch parent, children, chores on screen load
2. **Update Settings screen**: Load and save settings via Firestore
3. **Update Children screen**: Load children from Firestore, save changes
4. **Update Chores screen**: Load and create chores via Firestore
5. **Update Reports screen**: Generate reports from Firestore data
6. **Add child login**: Implement phone-based authentication for child app
7. **Real-time updates**: Use Firestore listeners for live data updates
