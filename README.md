# Chorelito AI — Parenting Assistant App

An AI-powered parenting assistant that helps parents manage chores, screen time, and rewards for their children using voice commands.

## 🚀 Quick Start

### Install Expo Go

Download Expo Go on your mobile device:

**iOS (App Store):**
- Search for "Expo Go" in the App Store
- Tap the QR code below to install

**Android (Google Play):**
- Search for "Expo Go" in Google Play Store
- Tap the QR code below to install

### Connect to Development Server

1. **Start the development server:**
   ```bash
   npm install
   npm run start
   ```

2. **On iOS:**
   - Open Camera app
   - Point at the QR code below
   - Tap the notification to open in Expo Go

3. **On Android:**
   - Open Expo Go app
   - Tap "Scan QR code"
   - Point at the QR code below

## 📱 App Store QR Code

```
╔════════════════════════════════════╗
║   App Store QR Code (Placeholder)  ║
║                                    ║
║    ████  ██  ████  █████  ████    ║
║    ██ ██ ██  ██ ██ ██     ██ ██    ║
║    ██  ████  ████  █████  ████    ║
║    ██   ██   ██ ██    ██  ██ ██    ║
║    ██   ██   ██ ██ █████  ██ ██    ║
║                                    ║
║    Scan with Camera (iOS)          ║
║    or Expo Go app                  ║
╚════════════════════════════════════╝
```

### Scan this QR code for iOS (App Store)

Use your iPhone Camera app or Expo Go to scan the code above and download the app.

## 🤖 Google Play Store QR Code

```
╔════════════════════════════════════╗
║  Google Play QR Code (Placeholder) ║
║                                    ║
║    ████  ████  █████  █████  ████  ║
║    ██ ██ ██ ██ ██     ██     ██    ║
║    ████  ████  █████  █████  ████  ║
║    ██    ██ ██    ██     ██  ██    ║
║    ██    ██ ██ █████ █████   ██    ║
║                                    ║
║    Scan with Expo Go app           ║
╚════════════════════════════════════╝
```

### Scan this QR code for Android (Google Play)

Use the Expo Go app to scan the code above and download the app.

## 📋 Detailed Setup Instructions

### Step 1: Install Expo Go

**For iOS (iPhone/iPad):**
1. Open the App Store on your device
2. Search for "Expo Go"
3. Tap "Get" to install
4. Open the Expo Go app

**For Android:**
1. Open Google Play Store on your device
2. Search for "Expo Go"
3. Tap "Install"
4. Open the Expo Go app

### Step 2: Install Dependencies

On your computer, run:
```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run start
```

This will start the Metro bundler and display a QR code in your terminal.

### Step 4: Connect Your Device

**On iOS:**
1. Open the Camera app
2. Point it at the QR code in your terminal
3. Tap the notification that appears
4. The app will open in Expo Go

**On Android:**
1. Open the Expo Go app
2. Tap "Scan QR code"
3. Point at the QR code in your terminal
4. The app will load automatically

## 🎯 App Features

### For Parents:
- 🎤 **Voice Commands**: Control the app hands-free
- 👨‍👩‍👧‍👦 **Manage Children**: Add and manage child profiles
- 🧹 **Assign Chores**: Assign tasks to kids with rewards
- ⏱️ **Screen Time Management**: Set daily limits and quiet hours
- 📊 **Progress Reports**: Track children's achievements
- 🎁 **Rewards System**: Grant bonus screen time for completed chores
- ⚙️ **Settings**: Configure app preferences and policies
- ❓ **Help & Support**: Get assistance when needed

### Voice Commands:
- "Add a new child named [Name] with phone number [Number]"
- "Assign dishes to [Child]"
- "Show me screen time usage"
- "Grant [Number] bonus minutes to [Child]"

## 🏗️ Project Structure

```
chorelito-ai/
├── app/
│   ├── child/           # Child-facing features
│   │   ├── gamification/
│   │   └── overlay/
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── policy/
│   │   └── voice/
│   ├── parent/          # Parent dashboard
│   │   ├── components/
│   │   ├── dashboard/
│   │   └── navigation/
│   └── styles/
├── functions/           # Firebase Cloud Functions
│   └── src/
│       ├── ai/
│       ├── household/
│       ├── screenTime/
│       ├── time/
│       └── voice/
└── assets/
```

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Start with clearing cache
npm start -- --clear

# Build for production
npm run build

# Run iOS simulator
npm run ios

# Run Android emulator
npm run android
```

### Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Backend**: Firebase (Functions, Firestore, Authentication)
- **Voice**: `@react-native-voice/voice` + `expo-speech`
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet with custom theme

## 🔐 Firebase Setup

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions on:
- Deploying Firebase Functions
- Setting up Firestore database
- Configuring security rules
- Enabling authentication

## 📱 Testing Voice Commands

**Note**: Real voice recognition requires a development build. In Expo Go, you can:
1. Tap the voice button
2. Enter your command as text
3. The app will process it the same way

To create a development build with full voice support:
```bash
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

## 🐛 Troubleshooting

### QR Code Not Working
- Make sure your phone and computer are on the same WiFi network
- Try restarting the Expo dev server
- Clear cache with `npm start -- --clear`

### App Not Loading
- Check your terminal for error messages
- Try reloading the app in Expo Go (shake device, tap "Reload")
- Restart the development server

### Voice Commands Not Working
- In Expo Go, use the text input fallback
- For full voice support, create a development build
- Check Firebase Functions are deployed

## 📞 Support

- Check [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for backend setup
- Review Firebase Console for function logs
- Check app console for client-side errors

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Made with ❤️ for modern parents**
