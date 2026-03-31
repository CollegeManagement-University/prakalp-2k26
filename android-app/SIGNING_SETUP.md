# Android Release Signing Setup

This app is configured to use release signing from `android/keystore.properties`.

## Local signing files

- Keystore file: `android/app/orchestra-release-key.jks`
- Signing config: `android/keystore.properties`

`keystore.properties` format:

```
storeFile=orchestra-release-key.jks
storePassword=your_store_password
keyAlias=your_alias
keyPassword=your_key_password
```

`storeFile` is resolved relative to `android/app`.

## Build signed artifacts

From `android-app` directory:

- Signed APK: `npm run build:apk`
- Signed AAB: `npm run build:aab`

Output locations:

- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
