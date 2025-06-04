// test-sign.js (only for local testing)
import { signEntitlementJWT } from './dist/utils/drm-jwt.js';
import 'dotenv/config';

const fakePayload = {
  sub: 'user-123',
  email: 'alice@example.com',
  course_code: 'COURSE001',
  kid_list: ['3a1f2e4c5b6a7d8e9f0a1b2c3d4e5f6a'], // the test KID you generated
}

const token = signEntitlementJWT(fakePayload)
console.log('Entitlement JWT:', token)
