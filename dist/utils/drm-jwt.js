// src/utils/drm-jwt.ts
import jwt from 'jsonwebtoken';
/**
 * Signs a short-lived JWT (RS256, 5 min expiration)
 */
export function signEntitlementJWT(payload) {
    // Read the private key from the environment
    const privateKey = process.env.DRM_JWT_PRIVATE_KEY;
    return jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '5m', // token valid for 5 minutes
    });
}
/**
 * Verifies a JWT and returns the payload.
 * (This will be used in Phase 2 on the license server.)
 */
export function verifyEntitlementJWT(token) {
    const publicKey = process.env.DRM_JWT_PUBLIC_KEY;
    return jwt.verify(token, publicKey);
}
