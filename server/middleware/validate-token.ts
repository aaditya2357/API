import { Request, Response, NextFunction } from 'express';
import { validateAccessToken } from '../auth/oauth';

// Extend Express Request interface to include token payload
declare global {
  namespace Express {
    interface Request {
      token?: any;
    }
  }
}

// Middleware to validate OAuth access tokens
export async function validateToken(req: Request, res: Response, next: NextFunction) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  // Check if it's a Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Authorization header must use Bearer scheme' });
  }

  const token = parts[1];

  try {
    // Validate token
    const payload = await validateAccessToken(token);
    
    // Attach token payload to request for use in route handlers
    req.token = payload;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Invalid access token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Middleware to validate specific scopes
export function requireScopes(requiredScopes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if token validation was performed
    if (!req.token) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    // Get scopes from token
    const tokenScopes = req.token.scope ? req.token.scope.split(' ') : [];

    // Check if token has all required scopes
    const hasAllScopes = requiredScopes.every(scope => tokenScopes.includes(scope));
    
    if (!hasAllScopes) {
      return res.status(403).json({ 
        message: 'Insufficient scope',
        requiredScopes
      });
    }

    next();
  };
}
