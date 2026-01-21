# Data Model: JWT Verification API

## JWT Token Entity

**Description**: Represents a JWT token with its components and claims

**Attributes**:
- `token`: string (the complete JWT token string)
- `header`: dict (decoded header containing algorithm and token type)
- `payload`: dict (decoded payload containing claims like sub, exp, iss, etc.)
- `signature`: string (the signature part of the token)

**Validation Rules**:
- Token must have exactly 3 parts separated by dots
- Header must contain 'alg' field
- Payload must contain 'exp' field for expiration validation
- Token must not be expired at verification time

## JWTVerificationRequest

**Description**: Request model for JWT verification endpoint

**Attributes**:
- `token`: string (required, the JWT token to verify)
- `algorithms`: list of strings (optional, allowed signing algorithms, defaults to ['HS256'])

## JWTVerificationResponse

**Description**: Response model for successful JWT verification

**Attributes**:
- `valid`: boolean (indicates if the token is valid)
- `claims`: dict (the decoded payload claims)
- `expires_at`: datetime (the expiration time from the token)
- `issued_at`: datetime (when the token was issued)
- `subject`: string (the subject of the token, if present)

## JWTVerificationError

**Description**: Response model for JWT verification errors

**Attributes**:
- `valid`: boolean (false for all error responses)
- `error`: string (descriptive error message)
- `error_code`: string (standardized error code like 'TOKEN_EXPIRED', 'INVALID_SIGNATURE', etc.)