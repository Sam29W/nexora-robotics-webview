# Integration Guide for S's Mobile Application

This guide outlines how S can connect their React Native mobile application to V's completed backend and Supabase infrastructure.

---

## 1. Quick Integration Overview

Because S is using React Native WebView, integration is straightforward:
- S's app already loads the deployed website through `<WebView source={{ uri: WEBSITE_URL }} />`.
- When V updates the website with the Auth & Profile system, **S's mobile app automatically receives the updated experience without rebuilding the APK!**

---

## 2. Environment Configuration for S

S should set the target URL in their mobile project configuration (`android-app/.env` or `app.json`):

```env
# android-app/.env
EXPO_PUBLIC_WEBSITE_URL=https://<your-username>.github.io/nexora-robotics-webview/
EXPO_PUBLIC_API_URL=https://<your-backend>.onrender.com/api
```

And in `android-app/src/app/index.tsx`:
```tsx
const WEBSITE_URL =
  process.env.EXPO_PUBLIC_WEBSITE_URL ||
  'https://sam29w.github.io/nexora-robotics-webview/';
```

---

## 3. WebView Native Optimization Checklist for S

To guarantee that mobile users experience responsive app-like behavior:

1. **Hardware Back Button Handling:**
   Already configured in `android-app/src/app/index.tsx` using `BackHandler` and `webViewRef.current?.goBack()`.
2. **User-Agent Customization:**
   Set to a modern mobile Chrome string to prevent Google OAuth from rejecting embedded web views.
3. **Safe Area Insets:**
   Wrap the WebView in `<SafeAreaView edges={['top', 'bottom']}>` to prevent content overlapping device status bars and navigation notches.
4. **Offline and Network Error Boundary:**
   The error overlay with **Try again** retry handler ensures seamless UX when users transition through tunnels or poor reception.

---

## 4. Future Native Migration Roadmap (Hybrid or Full Native)

If S later decides to transition specific screens (such as Camera capture, Push notifications, or Bluetooth robot pairing) from WebView to native React Native screens:

1. **Direct Backend API Calls:**
   S can install `@supabase/supabase-js` in `android-app` and call the exact same REST endpoints:
   - `GET /api/v1/profile/me`
   - `PATCH /api/v1/profile/me`
2. **PostMessage WebView Bridge:**
   The web page can send messages to React Native via `window.ReactNativeWebView.postMessage(JSON.stringify(data))`, allowing the website to trigger native device features (e.g. haptic feedback, camera, biometrics).
3. **API Versioning Safety:**
   Because all backend routes are versioned under `/api/v1/`, V can introduce new fields or endpoints without breaking older installed APK versions.
