# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Prerequisites

### Firebase Configuration Files (Required)

Before building the application, you must place the Firebase Google Services configuration files in the `config/` directory:

- `config/google-services-production.json` - Firebase configuration for production builds
- `config/google-services-staging.json` - Firebase configuration for staging builds

**How to obtain these files:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (production or staging accordingly)
3. Navigate to Project Settings → Your apps
4. Download the `google-services.json` file for Android
5. Rename it according to the environment and place it in the `config/` directory

**Important:** These files are required for Android builds. The build script (`scripts/build.js`) will automatically copy the appropriate file based on the build profile:
- Staging builds use `google-services-staging.json`
- Production builds use `google-services-production.json`

These files are in `.gitignore` for security reasons as they contain sensitive Firebase configuration information.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Ensure Firebase configuration files are in place (see Prerequisites above)

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
