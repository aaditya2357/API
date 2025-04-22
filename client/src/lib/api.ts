import { apiRequest } from './queryClient';
import { 
  OAuthConfig, 
  ApiEndpoint, 
  InsertApiEndpoint, 
  Client, 
  InsertClient 
} from '@shared/schema';

// OAuth Configuration
export async function getOAuthConfig(): Promise<OAuthConfig> {
  const res = await apiRequest('GET', '/api/admin/oauth-config');
  return res.json();
}

export async function updateOAuthConfig(data: Partial<OAuthConfig>): Promise<OAuthConfig> {
  const res = await apiRequest('PUT', '/api/admin/oauth-config', data);
  return res.json();
}

// API Endpoints
export async function getApiEndpoints(): Promise<ApiEndpoint[]> {
  const res = await apiRequest('GET', '/api/admin/endpoints');
  return res.json();
}

export async function getApiEndpoint(id: number): Promise<ApiEndpoint> {
  const res = await apiRequest('GET', `/api/admin/endpoints/${id}`);
  return res.json();
}

export async function createApiEndpoint(data: InsertApiEndpoint): Promise<ApiEndpoint> {
  const res = await apiRequest('POST', '/api/admin/endpoints', data);
  return res.json();
}

export async function updateApiEndpoint(id: number, data: Partial<InsertApiEndpoint>): Promise<ApiEndpoint> {
  const res = await apiRequest('PUT', `/api/admin/endpoints/${id}`, data);
  return res.json();
}

// Clients
export async function getClients(): Promise<Client[]> {
  const res = await apiRequest('GET', '/api/admin/clients');
  return res.json();
}

export async function getClient(id: number): Promise<Client> {
  const res = await apiRequest('GET', `/api/admin/clients/${id}`);
  return res.json();
}

export async function createClient(data: InsertClient): Promise<Client> {
  const res = await apiRequest('POST', '/api/admin/clients', data);
  return res.json();
}

export async function updateClient(id: number, data: Partial<InsertClient>): Promise<Client> {
  const res = await apiRequest('PUT', `/api/admin/clients/${id}`, data);
  return res.json();
}

export async function updateClientStatus(data: { id: number, status: string }): Promise<Client> {
  const res = await apiRequest('PUT', `/api/admin/clients/${data.id}`, { status: data.status });
  return res.json();
}

// Token Management
export async function revokeToken(token: string): Promise<void> {
  await apiRequest('POST', '/api/oauth/revoke', { token });
}

export async function revokeClientTokens(clientId: string): Promise<void> {
  await apiRequest('POST', `/api/admin/clients/${clientId}/revoke-tokens`);
}

// Authorization
export async function getAuthorizationCode(
  clientId: string, 
  redirectUri: string, 
  scope: string, 
  state?: string
): Promise<string> {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope
  });
  
  if (state) {
    params.append('state', state);
  }
  
  const res = await apiRequest('GET', `/api/oauth/authorize?${params.toString()}`);
  const data = await res.json();
  return data.code;
}

export async function exchangeCodeForToken(
  code: string, 
  clientId: string, 
  clientSecret: string, 
  redirectUri: string
): Promise<{ access_token: string, refresh_token: string, expires_in: number }> {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch('/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    }),
    credentials: 'include'
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res.json();
}

// Client Credentials Flow
export async function getClientCredentialsToken(
  clientId: string, 
  clientSecret: string, 
  scope?: string
): Promise<{ access_token: string, expires_in: number }> {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch('/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      scope: scope || 'OAuth2Scopes'
    }),
    credentials: 'include'
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res.json();
}

// Refresh Token
export async function refreshAccessToken(
  refreshToken: string, 
  clientId: string, 
  clientSecret: string
): Promise<{ access_token: string, refresh_token: string, expires_in: number }> {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch('/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }),
    credentials: 'include'
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res.json();
}
