import crypto from 'crypto';
import { storage } from '../storage';
import { generateJWT, verifyJWT } from './jwt';

// Authorization Code Grant Flow
export async function generateAuthorizationCode(clientId: string, redirectUri: string, userId: number, scopes: string): Promise<string> {
  // Validate client
  const client = await storage.getClientByClientId(clientId);
  if (!client) {
    throw new Error('Invalid client');
  }

  // Validate redirect URI
  if (client.redirectUri !== redirectUri) {
    throw new Error('Invalid redirect URI');
  }

  // Generate a random authorization code
  const code = crypto.randomBytes(16).toString('hex');
  
  // Get OAuth config for code lifetime
  const config = await storage.getOAuthConfig();
  if (!config) {
    throw new Error('OAuth configuration not found');
  }

  // Set expiration time based on config
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + config.authorizationCodeLifetime);

  // Store authorization code
  await storage.createAuthorizationCode({
    code,
    clientId,
    redirectUri,
    userId,
    scopes,
    expiresAt
  });

  return code;
}

// Exchange authorization code for tokens
export async function exchangeAuthorizationCode(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<{ accessToken: string, refreshToken: string, expiresIn: number }> {
  // Validate client credentials
  const client = await storage.getClientByClientId(clientId);
  if (!client || client.clientSecret !== clientSecret) {
    throw new Error('Invalid client credentials');
  }

  // Get authorization code
  const authCode = await storage.getAuthorizationCode(code);
  if (!authCode) {
    throw new Error('Invalid authorization code');
  }

  // Validate the code belongs to this client and redirect URI
  if (authCode.clientId !== clientId || authCode.redirectUri !== redirectUri) {
    throw new Error('Invalid authorization code for this client or redirect URI');
  }

  // Check if the code has expired
  if (new Date() > authCode.expiresAt) {
    throw new Error('Authorization code has expired');
  }

  // Get OAuth config
  const config = await storage.getOAuthConfig();
  if (!config) {
    throw new Error('OAuth configuration not found');
  }

  // Generate tokens
  const tokens = await generateTokens(clientId, authCode.userId, authCode.scopes, config.accessTokenLifetime, config.refreshTokenLifetime);

  // Delete the used authorization code
  await storage.deleteAuthorizationCode(code);

  return tokens;
}

// Client Credentials Grant Flow
export async function clientCredentialsGrant(clientId: string, clientSecret: string, scopes: string): Promise<{ accessToken: string, expiresIn: number }> {
  // Validate client credentials
  const client = await storage.getClientByClientId(clientId);
  if (!client || client.clientSecret !== clientSecret) {
    throw new Error('Invalid client credentials');
  }

  // Get OAuth config
  const config = await storage.getOAuthConfig();
  if (!config) {
    throw new Error('OAuth configuration not found');
  }

  // Generate access token but no refresh token
  const accessToken = await generateAccessToken(clientId, undefined, scopes, config.accessTokenLifetime);

  return {
    accessToken,
    expiresIn: config.accessTokenLifetime
  };
}

// Refresh Token Grant Flow
export async function refreshTokenGrant(refreshToken: string, clientId: string, clientSecret: string): Promise<{ accessToken: string, refreshToken: string, expiresIn: number }> {
  // Validate client credentials
  const client = await storage.getClientByClientId(clientId);
  if (!client || client.clientSecret !== clientSecret) {
    throw new Error('Invalid client credentials');
  }

  // Find the token with this refresh token
  const token = await storage.getTokenByRefreshToken(refreshToken);
  if (!token) {
    throw new Error('Invalid refresh token');
  }

  // Validate the token belongs to this client
  if (token.clientId !== clientId) {
    throw new Error('Refresh token is not valid for this client');
  }

  // Check if the token has expired
  if (new Date() > token.expiresAt) {
    throw new Error('Refresh token has expired');
  }

  // Get OAuth config
  const config = await storage.getOAuthConfig();
  if (!config) {
    throw new Error('OAuth configuration not found');
  }

  // Generate new tokens
  const tokens = await generateTokens(clientId, token.userId, token.scopes, config.accessTokenLifetime, config.refreshTokenLifetime);

  // Revoke the old token
  await storage.revokeToken(token.id);

  return tokens;
}

// Helper function to generate both access and refresh tokens
async function generateTokens(clientId: string, userId: number | undefined, scopes: string, accessTokenLifetime: number, refreshTokenLifetime: number): Promise<{ accessToken: string, refreshToken: string, expiresIn: number }> {
  const accessToken = await generateAccessToken(clientId, userId, scopes, accessTokenLifetime);
  const refreshToken = crypto.randomBytes(32).toString('hex');

  // Set expiration time for refresh token
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + refreshTokenLifetime);

  // Store the tokens
  await storage.createToken({
    accessToken,
    refreshToken,
    clientId,
    userId,
    scopes,
    expiresAt
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTokenLifetime
  };
}

// Helper function to generate an access token (JWT)
async function generateAccessToken(clientId: string, userId: number | undefined, scopes: string, lifetime: number): Promise<string> {
  const config = await storage.getOAuthConfig();
  if (!config) {
    throw new Error('OAuth configuration not found');
  }

  // Create JWT payload
  const payload = {
    sub: userId?.toString() || clientId,
    iss: config.issuer,
    aud: config.audience,
    client_id: clientId,
    scope: scopes,
    exp: Math.floor(Date.now() / 1000) + lifetime,
    iat: Math.floor(Date.now() / 1000)
  };

  // Generate JWT
  return generateJWT(payload);
}

// Validate access token
export async function validateAccessToken(accessToken: string): Promise<any> {
  try {
    // First check if token exists in storage
    const token = await storage.getTokenByAccessToken(accessToken);
    if (!token) {
      throw new Error('Access token not found');
    }

    // Check if token has expired
    if (new Date() > token.expiresAt) {
      throw new Error('Access token has expired');
    }

    // For JWT tokens, also verify the signature and claims
    const config = await storage.getOAuthConfig();
    if (!config) {
      throw new Error('OAuth configuration not found');
    }

    if (config.tokenFormat === 'jwt') {
      const payload = await verifyJWT(accessToken);
      
      // Additional validation for JWT claims
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token has expired');
      }
      
      if (payload.iss !== config.issuer) {
        throw new Error('Invalid token issuer');
      }
      
      if (payload.aud !== config.audience) {
        throw new Error('Invalid token audience');
      }
      
      return payload;
    }

    // For non-JWT tokens, just return client and scope info
    return {
      client_id: token.clientId,
      user_id: token.userId,
      scope: token.scopes
    };
  } catch (error) {
    throw new Error(`Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Revoke tokens
export async function revokeToken(accessToken: string): Promise<boolean> {
  const token = await storage.getTokenByAccessToken(accessToken);
  if (!token) {
    return false;
  }
  
  return storage.revokeToken(token.id);
}
