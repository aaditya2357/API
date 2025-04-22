import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { rateLimit } from "./middleware/rate-limit";
import { validateToken, requireScopes } from "./middleware/validate-token";
import { z } from "zod";
import { generateAuthorizationCode, exchangeAuthorizationCode, clientCredentialsGrant, refreshTokenGrant, validateAccessToken, revokeToken } from "./auth/oauth";
import { insertApiEndpointSchema, insertClientSchema, insertScopeSchema, insertOAuthConfigSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic API route that returns status
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString()
    });
  });

  // OAuth 2.0 endpoints
  
  // Authorization endpoint - used for authorization code flow
  app.get('/api/oauth/authorize', async (req, res) => {
    try {
      const { client_id, redirect_uri, response_type, scope, state } = req.query;

      if (!client_id || !redirect_uri || response_type !== 'code') {
        return res.status(400).json({ 
          message: 'Invalid request. Required parameters: client_id, redirect_uri, response_type=code' 
        });
      }

      // Check if client exists and is active
      const client = await storage.getClientByClientId(client_id as string);
      if (!client) {
        return res.status(400).json({ message: 'Invalid client' });
      }

      if (client.status !== 'active') {
        return res.status(400).json({ message: 'Client is not active' });
      }

      // In a real app, you would redirect to a login page here if user is not authenticated
      // For simplicity, we'll use a default user ID
      const userId = 1;
      
      // Generate authorization code
      const code = await generateAuthorizationCode(
        client_id as string,
        redirect_uri as string,
        userId,
        scope as string || 'OAuth2Scopes'
      );

      // Redirect back to client with code
      const redirectUrl = new URL(redirect_uri as string);
      redirectUrl.searchParams.append('code', code);
      if (state) {
        redirectUrl.searchParams.append('state', state as string);
      }

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Error in authorization endpoint:', error);
      res.status(500).json({ 
        message: 'Server error during authorization',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Login page endpoint
  app.get('/api/login', (req, res) => {
    // Normally you would render a login page, but for this demo we'll just use a JSON response
    res.json({
      message: 'This would be a login page where the user authenticates',
      nextStep: 'After successful login, redirect to the authorization endpoint with user context'
    });
  });

  // Token endpoint - used to exchange authorization code for token or refresh tokens
  app.post('/api/oauth/token', rateLimit('auth'), async (req, res) => {
    try {
      const { grant_type, code, redirect_uri, refresh_token, scope } = req.body;
      const authHeader = req.headers.authorization;

      // Check for client credentials in authorization header
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ 
          message: 'Missing client authentication',
          error: 'Client credentials must be provided using Basic Authentication'
        });
      }

      // Decode client credentials
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [clientId, clientSecret] = credentials.split(':');

      if (!clientId || !clientSecret) {
        return res.status(401).json({ message: 'Invalid client credentials format' });
      }

      // Handle different grant types
      switch (grant_type) {
        case 'authorization_code': {
          // Validate required parameters
          if (!code || !redirect_uri) {
            return res.status(400).json({ 
              message: 'Invalid request',
              error: 'Missing required parameters: code, redirect_uri'
            });
          }

          const tokens = await exchangeAuthorizationCode(code, clientId, clientSecret, redirect_uri);
          return res.json({
            access_token: tokens.accessToken,
            token_type: 'Bearer',
            expires_in: tokens.expiresIn,
            refresh_token: tokens.refreshToken
          });
        }

        case 'refresh_token': {
          // Validate required parameters
          if (!refresh_token) {
            return res.status(400).json({ 
              message: 'Invalid request',
              error: 'Missing required parameter: refresh_token'
            });
          }

          const tokens = await refreshTokenGrant(refresh_token, clientId, clientSecret);
          return res.json({
            access_token: tokens.accessToken,
            token_type: 'Bearer',
            expires_in: tokens.expiresIn,
            refresh_token: tokens.refreshToken
          });
        }

        case 'client_credentials': {
          const tokens = await clientCredentialsGrant(clientId, clientSecret, scope || 'OAuth2Scopes');
          return res.json({
            access_token: tokens.accessToken,
            token_type: 'Bearer',
            expires_in: tokens.expiresIn
          });
        }

        default:
          return res.status(400).json({ 
            message: 'Invalid grant type',
            error: 'Supported grant types: authorization_code, refresh_token, client_credentials'
          });
      }
    } catch (error) {
      console.error('Error in token endpoint:', error);
      res.status(400).json({ 
        message: 'Token request failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Token revocation endpoint
  app.post('/api/oauth/revoke', rateLimit('auth'), async (req, res) => {
    try {
      const { token, token_type_hint } = req.body;
      const authHeader = req.headers.authorization;

      // Check for client credentials in authorization header
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ message: 'Missing client authentication' });
      }

      // Decode client credentials
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [clientId, clientSecret] = credentials.split(':');

      if (!clientId || !clientSecret) {
        return res.status(401).json({ message: 'Invalid client credentials format' });
      }

      // Validate client
      const client = await storage.getClientByClientId(clientId);
      if (!client || client.clientSecret !== clientSecret) {
        return res.status(401).json({ message: 'Invalid client credentials' });
      }

      // Revoke the token
      await revokeToken(token);

      // RFC 7009 requires a 200 OK response with no body for successful revocation
      return res.status(200).end();
    } catch (error) {
      console.error('Error in revocation endpoint:', error);
      res.status(400).json({ 
        message: 'Token revocation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Token introspection endpoint
  app.post('/api/oauth/introspect', rateLimit('auth'), async (req, res) => {
    try {
      const { token } = req.body;
      const authHeader = req.headers.authorization;

      // Check for client credentials in authorization header
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ message: 'Missing client authentication' });
      }

      // Decode client credentials
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [clientId, clientSecret] = credentials.split(':');

      if (!clientId || !clientSecret) {
        return res.status(401).json({ message: 'Invalid client credentials format' });
      }

      // Validate client
      const client = await storage.getClientByClientId(clientId);
      if (!client || client.clientSecret !== clientSecret) {
        return res.status(401).json({ message: 'Invalid client credentials' });
      }

      try {
        // Validate token
        const payload = await validateAccessToken(token);
        
        // Return token information
        return res.json({
          active: true,
          client_id: payload.client_id,
          username: payload.sub,
          scope: payload.scope,
          exp: payload.exp,
          iat: payload.iat,
          iss: payload.iss,
          aud: payload.aud
        });
      } catch (error) {
        // Token is invalid
        return res.json({ active: false });
      }
    } catch (error) {
      console.error('Error in introspection endpoint:', error);
      res.status(400).json({ 
        message: 'Token introspection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Protected resource endpoints (requires valid token)

  // User information endpoint
  app.get('/api/v1/userinfo', validateToken, requireScopes(['OAuth2Scopes']), async (req, res) => {
    try {
      const userId = req.token.sub;
      const user = await storage.getUser(parseInt(userId));

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't return sensitive information
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
      });
    } catch (error) {
      console.error('Error in userinfo endpoint:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve user information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Management APIs (these would typically require admin permissions)

  // List clients
  app.get('/api/admin/clients', validateToken, async (req, res) => {
    try {
      const clients = await storage.listClients();
      
      // Don't return client secrets
      const safeClients = clients.map(client => ({
        id: client.id,
        clientId: client.clientId,
        name: client.name,
        description: client.description,
        redirectUri: client.redirectUri,
        applicationType: client.applicationType,
        status: client.status,
        createdAt: client.createdAt
      }));
      
      res.json(safeClients);
    } catch (error) {
      console.error('Error listing clients:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve clients',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get client details
  app.get('/api/admin/clients/:id', validateToken, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }

      // Get client scopes and grant types
      const scopes = await storage.getClientScopes(clientId);
      const grantTypes = await storage.getClientGrantTypes(clientId);
      
      // Don't return client secret
      const safeClient = {
        id: client.id,
        clientId: client.clientId,
        name: client.name,
        description: client.description,
        redirectUri: client.redirectUri,
        applicationType: client.applicationType,
        status: client.status,
        createdAt: client.createdAt,
        scopes: scopes.map(s => ({ id: s.id, name: s.name, description: s.description })),
        grantTypes: grantTypes.map(g => ({ id: g.id, name: g.name }))
      };
      
      res.json(safeClient);
    } catch (error) {
      console.error('Error getting client details:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve client details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create client
  app.post('/api/admin/clients', validateToken, async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      
      // Don't return client secret in response
      const safeClient = {
        id: client.id,
        clientId: client.clientId,
        name: client.name,
        description: client.description,
        redirectUri: client.redirectUri,
        applicationType: client.applicationType,
        status: client.status,
        createdAt: client.createdAt
      };
      
      res.status(201).json(safeClient);
    } catch (error) {
      console.error('Error creating client:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors
        });
      }
      res.status(500).json({ 
        message: 'Failed to create client',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update client
  app.put('/api/admin/clients/:id', validateToken, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const clientData = req.body;
      
      // Validate client exists
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      const client = await storage.updateClient(clientId, clientData);
      
      // Don't return client secret in response
      const safeClient = {
        id: client!.id,
        clientId: client!.clientId,
        name: client!.name,
        description: client!.description,
        redirectUri: client!.redirectUri,
        applicationType: client!.applicationType,
        status: client!.status,
        createdAt: client!.createdAt
      };
      
      res.json(safeClient);
    } catch (error) {
      console.error('Error updating client:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors
        });
      }
      res.status(500).json({ 
        message: 'Failed to update client',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List API endpoints
  app.get('/api/admin/endpoints', validateToken, async (req, res) => {
    try {
      const endpoints = await storage.listApiEndpoints();
      res.json(endpoints);
    } catch (error) {
      console.error('Error listing API endpoints:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve API endpoints',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create API endpoint
  app.post('/api/admin/endpoints', validateToken, async (req, res) => {
    try {
      const endpointData = insertApiEndpointSchema.parse(req.body);
      const endpoint = await storage.createApiEndpoint(endpointData);
      res.status(201).json(endpoint);
    } catch (error) {
      console.error('Error creating API endpoint:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors
        });
      }
      res.status(500).json({ 
        message: 'Failed to create API endpoint',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update API endpoint
  app.put('/api/admin/endpoints/:id', validateToken, async (req, res) => {
    try {
      const endpointId = parseInt(req.params.id);
      const endpointData = req.body;
      
      // Validate endpoint exists
      const existingEndpoint = await storage.getApiEndpoint(endpointId);
      if (!existingEndpoint) {
        return res.status(404).json({ message: 'API endpoint not found' });
      }
      
      const endpoint = await storage.updateApiEndpoint(endpointId, endpointData);
      res.json(endpoint);
    } catch (error) {
      console.error('Error updating API endpoint:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors
        });
      }
      res.status(500).json({ 
        message: 'Failed to update API endpoint',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List scopes
  app.get('/api/admin/scopes', validateToken, async (req, res) => {
    try {
      const scopes = await storage.listScopes();
      res.json(scopes);
    } catch (error) {
      console.error('Error listing scopes:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve scopes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create scope
  app.post('/api/admin/scopes', validateToken, async (req, res) => {
    try {
      const scopeData = insertScopeSchema.parse(req.body);
      const scope = await storage.createScope(scopeData);
      res.status(201).json(scope);
    } catch (error) {
      console.error('Error creating scope:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors
        });
      }
      res.status(500).json({ 
        message: 'Failed to create scope',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get OAuth configuration
  app.get('/api/admin/oauth-config', validateToken, async (req, res) => {
    try {
      const config = await storage.getOAuthConfig();
      if (!config) {
        return res.status(404).json({ message: 'OAuth configuration not found' });
      }
      res.json(config);
    } catch (error) {
      console.error('Error getting OAuth configuration:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve OAuth configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update OAuth configuration
  app.put('/api/admin/oauth-config', validateToken, async (req, res) => {
    try {
      const configData = insertOAuthConfigSchema.partial().parse(req.body);
      const config = await storage.updateOAuthConfig(configData);
      if (!config) {
        return res.status(404).json({ message: 'OAuth configuration not found' });
      }
      res.json(config);
    } catch (error) {
      console.error('Error updating OAuth configuration:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors
        });
      }
      res.status(500).json({ 
        message: 'Failed to update OAuth configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get request logs
  app.get('/api/admin/logs', validateToken, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getRequestLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error('Error getting request logs:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve request logs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test user authentication endpoint
  app.post('/api/v1/auth', validateToken, async (req, res) => {
    // This is a protected endpoint that requires a valid token
    res.json({
      message: 'Authentication successful',
      userId: req.token.sub,
      scopes: req.token.scope
    });
  });

  // Test user profile endpoint
  app.get('/api/v1/users/:id', validateToken, async (req, res) => {
    // This is a protected endpoint that requires a valid token
    const userId = parseInt(req.params.id);
    
    // In a real app, you'd check if the token subject matches the requested user ID
    // or if the token has admin privileges
    if (req.token.sub !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied to this user profile' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email
    });
  });

  // Public endpoint - does not require authentication
  app.get('/api/v1/products', rateLimit('api'), async (req, res) => {
    // This is a public endpoint that doesn't require authentication
    // In a real app, you would fetch products from a database
    res.json({
      products: [
        { id: 1, name: 'Product 1', price: 9.99 },
        { id: 2, name: 'Product 2', price: 19.99 },
        { id: 3, name: 'Product 3', price: 29.99 }
      ]
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
