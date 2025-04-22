import crypto from 'crypto';

// In a production environment, you would use proper environment variables for secrets
const SECRET_KEY = process.env.JWT_SECRET || 'this-is-a-secret-key-that-should-be-in-env-vars';

interface JWTPayload {
  [key: string]: any;
}

// Generate a JWT token
export function generateJWT(payload: JWTPayload): string {
  // Create JWT header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // Base64 encode header and payload
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // Create signature
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(signatureInput)
    .digest('base64url');

  // Combine to create the JWT
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify and decode a JWT token
export async function verifyJWT(token: string): Promise<JWTPayload> {
  // Split the token
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  // Verify signature
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(signatureInput)
    .digest('base64url');

  if (signature !== expectedSignature) {
    throw new Error('Invalid token signature');
  }

  // Decode payload
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    return payload;
  } catch (error) {
    throw new Error('Failed to decode token payload');
  }
}
