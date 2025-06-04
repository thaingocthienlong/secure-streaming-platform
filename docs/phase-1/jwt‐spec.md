# Entitlement JWT Specification

**Signing Algorithm:** RS256 (RSA SHA-256)  
**Key Length:** 2048 bits

## Payload (Claims)

| Claim       | Type       | Description                                                                  |
|-------------|------------|------------------------------------------------------------------------------|
| `sub`       | string     | Unique user identifier (e.g. Google `sub`).                                   |
| `email`     | string     | User’s email (optional).                                                      |
| `course_code`| string    | The code of the course the user has access to (e.g., `COURSE001`).            |
| `kid_list`  | string[]   | Array of key IDs (16-byte hex) that this user is allowed to play.             |
| `iat`       | number     | Issued At timestamp (automatically added by `jsonwebtoken`).                  |
| `exp`       | number     | Expiration time (automatically added—current time + 5 minutes).               |
| `jti`       | string     | Unique JWT ID (optional; used for replay detection if needed).                |

## Example Payload

```json
{
  "sub": "user-123",
  "email": "alice@example.com",
  "course_code": "COURSE001",
  "kid_list": ["3a1f2e4c5b6a7d8e9f0a1b2c3d4e5f6a"],
  "iat": 1850502996,
  "exp": 1850503296
}
