# NutriGuide Android APK

## First Android version

This is an installable Android launcher using AndroidX Browser Custom Tabs. It opens the existing responsive NutriGuide site at its fixed HTTPS /legacy URL. The browser toolbar remains visible. A compatible browser (Chrome recommended) and internet are required. Browser login, cookies, cloud sync, downloads and browser permissions remain browser-managed. No credentials or wellness data are copied into native Android storage. The app requests no native camera, microphone, fitness or location permission.

This is not a native offline rewrite. Fitbit/Health Connect integration, native reminders and Play Store release signing are not added. Existing website features and limitations still apply, including the pending publication of the latest web target fixes. The APK uses the current live website; it does not contain the newer unpublished web source.

Package: com.rishikesht775.nutriguide. Minimum Android 8.0 (API 26). Target/compile SDK 35. Java 17, Android Gradle plugin 8.9.2, Gradle 8.11.1 and AndroidX Browser 1.8.0 are pinned.

## Download and install

1. In this repository, open Actions -> NutriGuide Android APK -> the successful run.
2. Download NutriGuide-Android-APK and unzip it.
3. Transfer NutriGuide-Android-Test.apk to the Android phone, open it in Files, and allow installation from that source when Android asks.
4. Open NutriGuide. It launches the mobile wellness site in the browser. Sign in with the same account used on the website. Returning to the launcher offers a button to reopen the site.

This is a debug-signed test build, not a Play Store release. Each fresh runner may use a different debug signing key; if Android rejects an update because signatures differ, uninstall the old launcher and install the new APK. Browser-held account data is separate from this launcher. Do not uninstall or clear the browser to update the launcher. Production signing must use a stable privately managed release key; no signing secrets are committed.

## Kiro / Android Studio

Pull main, then open the android directory in Android Studio. Install SDK 35 and use JDK 17. The project does not check in a Gradle wrapper binary; use a locally installed Gradle 8.11.1 or configure Android Studio to use that distribution.

```powershell
git pull --ff-only origin main
gradle -p android assembleDebug lintDebug
```

Local APK: android/app/build/outputs/apk/debug/app-debug.apk. GitHub Actions builds it independently without requiring Android tools on the user's laptop. CI builds/lints; it does not prove real-phone login acceptance.

## Android acceptance cases

| ID | Check | Expected |
| --- | --- | --- |
| APK-01 | Install and launch on Samsung S21 FE | NutriGuide icon and mobile site open; browser toolbar visible |
| APK-02 | Email sign-in, confirmation and recovery | Browser-backed site flow completes; no separate native password handling |
| APK-03 | Existing browser login | Site can use that browser's session; different browsers can have different sessions |
| APK-04 | New test account and existing account | Existing website account isolation/target behavior applies; confirm deployed web version first |
| APK-05 | Food, Exercise, Journey, Plan & Reports | Existing responsive tabs and logs remain usable |
| APK-06 | Android Back and reopen | Browser returns to launcher; Open my wellness space reopens the site without an automatic loop |
| APK-07 | Rotate, enlarge text, gesture navigation | Launcher content scrolls and avoids system bars/cutouts |
| APK-08 | No internet or browser disabled | Browser displays its network state; launcher provides a no-browser message if none can open |
| APK-09 | Download/export | Browser handles files; verify download permission/availability on the device |
| APK-10 | Second device login | Website/cloud implementation supplies data; APK adds no cross-device datastore |

Build and lint results must come from the actual Android workflow run. Physical-phone acceptance is pending until installed and tested by the owner.

The SDK setup explicitly installs platform-tools instead of the action's obsolete default tools package. The first CI attempt failed during that SDK setup before compilation; the workflow was corrected and rebuilt.

## Verified build — 11 November 2026

GitHub Android workflow run 42908566596 completed successfully for source commit b67142f16fe41282333f7ee916921cfc306bd587. assembleDebug and lintDebug passed, and the 1.1 MB ZIP contains NutriGuide-Android-Test.apk, SHA256SUMS.txt and installation/limitations instructions. Download: https://github.com/rishikesht775/nutriguide-calorie-planner/actions/runs/42908566596/artifacts/13805977431 . The APK and lint report are retained as GitHub artifacts for 30 days; the workflow can regenerate them. No emulator or physical-device installation/sign-in result is claimed.
