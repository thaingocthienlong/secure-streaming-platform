# DRM License API Endpoints (Phase 1)

## 1. Widevine & PlayReady License Endpoint

**URL:**  

POST /api/drm/license

**Headers:**  
- `Content-Type: application/octet-stream`  
- `Authorization: Bearer <entitlement-JWT>`

**Request Body:**  
- Raw bytes of the EME “initData” (the `encrypted` event’s message).  
- Client-side (EME) will do something like:
  ```js
  // Example in Shaka Player:
  player.getNetworkingEngine().setRequestFilter((type, request) => {
    if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) {
      request.uris = [`https://your-domain.com/api/drm/license`];
      request.headers['Authorization'] = `Bearer ${entitlementJWT}`;
    }
  });
