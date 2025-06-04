> **Our target support (Phase 1):**  
> - **Desktop & Android Chrome / Edge / Firefox → Widevine**  
> - **Safari (macOS & iOS) → FairPlay**  
> - **PlayReady** only if you expect many Edge/Windows SmartTV users (optional).  
> - **ClearKey** only for local development/testing; never for production.

# Browser × DRM Support Matrix

| Browser / Platform      | Widevine | PlayReady | FairPlay | ClearKey (test only) | Notes       |
|-------------------------|:--------:|:---------:|:--------:|:--------------------:|-------------|
| Chrome (Windows/macOS)  |    ✅    |     ✅     |    ❌    |         ✅           |             |
| Chrome (Android)        |    ✅    |     ✅     |    ❌    |         ✅           |             |
| Edge (Chromium, Win)    |    ✅    |     ✅     |    ❌    |         ✅           |             |
| Firefox (Win/mac)       |    ✅    |     ❌     |    ❌    |         ✅           |             |
| Safari (macOS)          |    ❌    |     ❌     |    ✅    |         ✅           |             |
| Safari (iOS)            |    ❌    |     ❌     |    ✅    |         ✅           |             |
| Mobile Chrome (iOS)     |    ❌    |     ❌     |    ✅    |         ✅           | Apple forces HLS |
| Android WebView         |    ✅    |     ✅     |    ❌    |         ✅           |             |
| IE11 / Legacy browsers  |    ❌    |     ❌     |    ❌    |         ✅           | test only   |

_Legend:_  
- ✅ = Supported (native CDM)  
- ❌ = Not supported  
- ClearKey = a minimal “test-only” CDM that won’t protect you in production  

**Key:**  
- **Widevine** — used by Chrome, Firefox, Edge on desktop & Android.  
- **PlayReady** — used by Edge on Windows + some Smart TVs.  
- **FairPlay** — used by Safari on macOS & iOS (requires HLS+SAMPLE-AES packaging).  
- **ClearKey** — a basic reference CDM available in every EME-compatible browser, but NOT secure for real usage (only for local testing).
