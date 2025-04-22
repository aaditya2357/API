import {
  User,
  InsertUser,
  Client,
  InsertClient,
  Scope,
  InsertScope,
  ClientScope,
  InsertClientScope,
  GrantType,
  InsertGrantType,
  ClientGrantType,
  InsertClientGrantType,
  AuthorizationCode,
  InsertAuthorizationCode,
  Token,
  InsertToken,
  ApiEndpoint,
  InsertApiEndpoint,
  RequestLog,
  InsertRequestLog,
  OAuthConfig,
  InsertOAuthConfig
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getClientByClientId(clientId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  listClients(): Promise<Client[]>;

  // Scopes
  getScope(id: number): Promise<Scope | undefined>;
  getScopeByName(name: string): Promise<Scope | undefined>;
  createScope(scope: InsertScope): Promise<Scope>;
  listScopes(): Promise<Scope[]>;

  // Client Scopes
  createClientScope(clientScope: InsertClientScope): Promise<ClientScope>;
  getClientScopes(clientId: number): Promise<Scope[]>;

  // Grant Types
  getGrantType(id: number): Promise<GrantType | undefined>;
  getGrantTypeByName(name: string): Promise<GrantType | undefined>;
  createGrantType(grantType: InsertGrantType): Promise<GrantType>;
  listGrantTypes(): Promise<GrantType[]>;

  // Client Grant Types
  createClientGrantType(clientGrantType: InsertClientGrantType): Promise<ClientGrantType>;
  getClientGrantTypes(clientId: number): Promise<GrantType[]>;

  // Authorization Codes
  createAuthorizationCode(code: InsertAuthorizationCode): Promise<AuthorizationCode>;
  getAuthorizationCode(code: string): Promise<AuthorizationCode | undefined>;
  deleteAuthorizationCode(code: string): Promise<boolean>;

  // Tokens
  createToken(token: InsertToken): Promise<Token>;
  getTokenByAccessToken(accessToken: string): Promise<Token | undefined>;
  getTokenByRefreshToken(refreshToken: string): Promise<Token | undefined>;
  listClientTokens(clientId: string): Promise<Token[]>;
  listUserTokens(userId: number): Promise<Token[]>;
  revokeToken(id: number): Promise<boolean>;
  revokeClientTokens(clientId: string): Promise<boolean>;
  revokeUserTokens(userId: number): Promise<boolean>;

  // API Endpoints
  createApiEndpoint(endpoint: InsertApiEndpoint): Promise<ApiEndpoint>;
  getApiEndpoint(id: number): Promise<ApiEndpoint | undefined>;
  listApiEndpoints(): Promise<ApiEndpoint[]>;
  updateApiEndpoint(id: number, endpoint: Partial<InsertApiEndpoint>): Promise<ApiEndpoint | undefined>;

  // Request Logs
  createRequestLog(log: InsertRequestLog): Promise<RequestLog>;
  getRequestLogs(limit?: number): Promise<RequestLog[]>;
  getRequestLogsByEndpoint(endpoint: string, limit?: number): Promise<RequestLog[]>;
  getRequestLogsByClient(clientId: string, limit?: number): Promise<RequestLog[]>;

  // OAuth Config
  getOAuthConfig(): Promise<OAuthConfig | undefined>;
  updateOAuthConfig(config: Partial<InsertOAuthConfig>): Promise<OAuthConfig | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private scopes: Map<number, Scope>;
  private clientScopes: Map<number, ClientScope>;
  private grantTypes: Map<number, GrantType>;
  private clientGrantTypes: Map<number, ClientGrantType>;
  private authorizationCodes: Map<number, AuthorizationCode>;
  private tokens: Map<number, Token>;
  private apiEndpoints: Map<number, ApiEndpoint>;
  private requestLogs: Map<number, RequestLog>;
  private oauthConfig: OAuthConfig | undefined;

  private currentUserId: number;
  private currentClientId: number;
  private currentScopeId: number;
  private currentClientScopeId: number;
  private currentGrantTypeId: number;
  private currentClientGrantTypeId: number;
  private currentAuthorizationCodeId: number;
  private currentTokenId: number;
  private currentApiEndpointId: number;
  private currentRequestLogId: number;
  
  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.scopes = new Map();
    this.clientScopes = new Map();
    this.grantTypes = new Map();
    this.clientGrantTypes = new Map();
    this.authorizationCodes = new Map();
    this.tokens = new Map();
    this.apiEndpoints = new Map();
    this.requestLogs = new Map();

    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentScopeId = 1;
    this.currentClientScopeId = 1;
    this.currentGrantTypeId = 1;
    this.currentClientGrantTypeId = 1;
    this.currentAuthorizationCodeId = 1;
    this.currentTokenId = 1;
    this.currentApiEndpointId = 1;
    this.currentRequestLogId = 1;

    // Initialize with some data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add default scopes
    this.createScope({ name: "OAuth2Scopes", description: "Default OAuth 2.0 scope" });
    this.createScope({ name: "read:profile", description: "Read user profile information" });
    this.createScope({ name: "read:orders", description: "Read order information" });
    this.createScope({ name: "write:orders", description: "Create and update orders" });

    // Add default grant types
    this.createGrantType({ name: "authorization_code" });
    this.createGrantType({ name: "client_credentials" });
    this.createGrantType({ name: "refresh_token" });
    this.createGrantType({ name: "implicit" });

    // Add default user
    this.createUser({
      username: "admin",
      password: "password", // In a real app, we would hash this
      name: "Administrator",
      email: "admin@example.com"
    });

    // Add default API endpoints
    this.createApiEndpoint({
      name: "User Authentication",
      endpoint: "/api/v1/auth",
      method: "POST",
      service: "User Service",
      authType: "oauth2",
      status: "active"
    });

    this.createApiEndpoint({
      name: "User Profile",
      endpoint: "/api/v1/users/:id",
      method: "GET",
      service: "User Service",
      authType: "oauth2",
      status: "active"
    });

    this.createApiEndpoint({
      name: "Order Creation",
      endpoint: "/api/v1/orders",
      method: "POST",
      service: "Order Service",
      authType: "oauth2",
      status: "active"
    });

    this.createApiEndpoint({
      name: "Product Catalog",
      endpoint: "/api/v1/products",
      method: "GET",
      service: "Product Service",
      authType: "public",
      status: "active"
    });

    // Add default OAuth config
    this.oauthConfig = {
      id: 1,
      accessTokenLifetime: 3600,
      refreshTokenLifetime: 7200,
      authorizationCodeLifetime: 60,
      tokenFormat: "jwt",
      issuer: "https://auth.example.com",
      audience: "https://api.example.com",
      updatedAt: new Date()
    };

    // Add default client
    this.createClient({
      clientId: "client_85392f5a3e1d",
      clientSecret: "secret_94c53d2b78ef",
      name: "API Application",
      description: "Web application with server-side logic",
      redirectUri: "http://example.com/redirect",
      applicationType: "confidential",
      status: "active"
    }).then(client => {
      // Add scopes and grant types to the client
      this.createClientScope({ clientId: client.id, scopeId: 1 }); // Add OAuth2Scopes
      this.createClientGrantType({ clientId: client.id, grantTypeId: 1 }); // Add authorization_code
      this.createClientGrantType({ clientId: client.id, grantTypeId: 2 }); // Add client_credentials
    });

    // Add a second client
    this.createClient({
      clientId: "client_3f7d9a2c8b6e",
      clientSecret: "secret_a1e8b3c72d9f",
      name: "Mobile App",
      description: "iOS and Android mobile application",
      redirectUri: "com.example.app:/oauth/callback",
      applicationType: "confidential",
      status: "active"
    }).then(client => {
      // Add scopes and grant types to the client
      this.createClientScope({ clientId: client.id, scopeId: 1 }); // Add OAuth2Scopes
      this.createClientScope({ clientId: client.id, scopeId: 2 }); // Add read:profile
      this.createClientGrantType({ clientId: client.id, grantTypeId: 1 }); // Add authorization_code
      this.createClientGrantType({ clientId: client.id, grantTypeId: 3 }); // Add refresh_token
    });

    // Add a third client with pending status
    this.createClient({
      clientId: "client_7b45e8d1a93f",
      clientSecret: "secret_e5c8f7d2a69b",
      name: "Partner Service",
      description: "Third-party integration service",
      redirectUri: "https://partner.example.com/oauth/callback",
      applicationType: "confidential",
      status: "pending"
    }).then(client => {
      // Add scopes and grant types to the client
      this.createClientScope({ clientId: client.id, scopeId: 3 }); // Add read:orders
      this.createClientScope({ clientId: client.id, scopeId: 4 }); // Add write:orders
      this.createClientGrantType({ clientId: client.id, grantTypeId: 2 }); // Add client_credentials
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByClientId(clientId: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(
      (client) => client.clientId === clientId
    );
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const newClient: Client = { ...client, id, createdAt: new Date() };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;

    const updatedClient = { ...existingClient, ...client };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async listClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  // Scopes
  async getScope(id: number): Promise<Scope | undefined> {
    return this.scopes.get(id);
  }

  async getScopeByName(name: string): Promise<Scope | undefined> {
    return Array.from(this.scopes.values()).find(
      (scope) => scope.name === name
    );
  }

  async createScope(scope: InsertScope): Promise<Scope> {
    const id = this.currentScopeId++;
    const newScope: Scope = { ...scope, id };
    this.scopes.set(id, newScope);
    return newScope;
  }

  async listScopes(): Promise<Scope[]> {
    return Array.from(this.scopes.values());
  }

  // Client Scopes
  async createClientScope(clientScope: InsertClientScope): Promise<ClientScope> {
    const id = this.currentClientScopeId++;
    const newClientScope: ClientScope = { ...clientScope, id };
    this.clientScopes.set(id, newClientScope);
    return newClientScope;
  }

  async getClientScopes(clientId: number): Promise<Scope[]> {
    const clientScopeRelations = Array.from(this.clientScopes.values()).filter(
      (cs) => cs.clientId === clientId
    );
    
    return Promise.all(
      clientScopeRelations.map(async (cs) => {
        const scope = await this.getScope(cs.scopeId);
        if (!scope) throw new Error(`Scope not found: ${cs.scopeId}`);
        return scope;
      })
    );
  }

  // Grant Types
  async getGrantType(id: number): Promise<GrantType | undefined> {
    return this.grantTypes.get(id);
  }

  async getGrantTypeByName(name: string): Promise<GrantType | undefined> {
    return Array.from(this.grantTypes.values()).find(
      (gt) => gt.name === name
    );
  }

  async createGrantType(grantType: InsertGrantType): Promise<GrantType> {
    const id = this.currentGrantTypeId++;
    const newGrantType: GrantType = { ...grantType, id };
    this.grantTypes.set(id, newGrantType);
    return newGrantType;
  }

  async listGrantTypes(): Promise<GrantType[]> {
    return Array.from(this.grantTypes.values());
  }

  // Client Grant Types
  async createClientGrantType(clientGrantType: InsertClientGrantType): Promise<ClientGrantType> {
    const id = this.currentClientGrantTypeId++;
    const newClientGrantType: ClientGrantType = { ...clientGrantType, id };
    this.clientGrantTypes.set(id, newClientGrantType);
    return newClientGrantType;
  }

  async getClientGrantTypes(clientId: number): Promise<GrantType[]> {
    const clientGrantTypeRelations = Array.from(this.clientGrantTypes.values()).filter(
      (cgt) => cgt.clientId === clientId
    );
    
    return Promise.all(
      clientGrantTypeRelations.map(async (cgt) => {
        const grantType = await this.getGrantType(cgt.grantTypeId);
        if (!grantType) throw new Error(`Grant type not found: ${cgt.grantTypeId}`);
        return grantType;
      })
    );
  }

  // Authorization Codes
  async createAuthorizationCode(code: InsertAuthorizationCode): Promise<AuthorizationCode> {
    const id = this.currentAuthorizationCodeId++;
    const newCode: AuthorizationCode = { ...code, id, createdAt: new Date() };
    this.authorizationCodes.set(id, newCode);
    return newCode;
  }

  async getAuthorizationCode(code: string): Promise<AuthorizationCode | undefined> {
    return Array.from(this.authorizationCodes.values()).find(
      (ac) => ac.code === code
    );
  }

  async deleteAuthorizationCode(code: string): Promise<boolean> {
    const authCode = Array.from(this.authorizationCodes.values()).find(
      (ac) => ac.code === code
    );

    if (!authCode) return false;
    return this.authorizationCodes.delete(authCode.id);
  }

  // Tokens
  async createToken(token: InsertToken): Promise<Token> {
    const id = this.currentTokenId++;
    const newToken: Token = { ...token, id, createdAt: new Date() };
    this.tokens.set(id, newToken);
    return newToken;
  }

  async getTokenByAccessToken(accessToken: string): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(
      (token) => token.accessToken === accessToken
    );
  }

  async getTokenByRefreshToken(refreshToken: string): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(
      (token) => token.refreshToken === refreshToken
    );
  }

  async listClientTokens(clientId: string): Promise<Token[]> {
    return Array.from(this.tokens.values()).filter(
      (token) => token.clientId === clientId
    );
  }

  async listUserTokens(userId: number): Promise<Token[]> {
    return Array.from(this.tokens.values()).filter(
      (token) => token.userId === userId
    );
  }

  async revokeToken(id: number): Promise<boolean> {
    return this.tokens.delete(id);
  }

  async revokeClientTokens(clientId: string): Promise<boolean> {
    const clientTokens = Array.from(this.tokens.values()).filter(
      (token) => token.clientId === clientId
    );

    for (const token of clientTokens) {
      this.tokens.delete(token.id);
    }

    return true;
  }

  async revokeUserTokens(userId: number): Promise<boolean> {
    const userTokens = Array.from(this.tokens.values()).filter(
      (token) => token.userId === userId
    );

    for (const token of userTokens) {
      this.tokens.delete(token.id);
    }

    return true;
  }

  // API Endpoints
  async createApiEndpoint(endpoint: InsertApiEndpoint): Promise<ApiEndpoint> {
    const id = this.currentApiEndpointId++;
    const newEndpoint: ApiEndpoint = { ...endpoint, id, createdAt: new Date() };
    this.apiEndpoints.set(id, newEndpoint);
    return newEndpoint;
  }

  async getApiEndpoint(id: number): Promise<ApiEndpoint | undefined> {
    return this.apiEndpoints.get(id);
  }

  async listApiEndpoints(): Promise<ApiEndpoint[]> {
    return Array.from(this.apiEndpoints.values());
  }

  async updateApiEndpoint(id: number, endpoint: Partial<InsertApiEndpoint>): Promise<ApiEndpoint | undefined> {
    const existingEndpoint = this.apiEndpoints.get(id);
    if (!existingEndpoint) return undefined;

    const updatedEndpoint = { ...existingEndpoint, ...endpoint };
    this.apiEndpoints.set(id, updatedEndpoint);
    return updatedEndpoint;
  }

  // Request Logs
  async createRequestLog(log: InsertRequestLog): Promise<RequestLog> {
    const id = this.currentRequestLogId++;
    const newLog: RequestLog = { ...log, id, timestamp: new Date() };
    this.requestLogs.set(id, newLog);
    return newLog;
  }

  async getRequestLogs(limit: number = 100): Promise<RequestLog[]> {
    return Array.from(this.requestLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getRequestLogsByEndpoint(endpoint: string, limit: number = 100): Promise<RequestLog[]> {
    return Array.from(this.requestLogs.values())
      .filter((log) => log.endpoint === endpoint)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getRequestLogsByClient(clientId: string, limit: number = 100): Promise<RequestLog[]> {
    return Array.from(this.requestLogs.values())
      .filter((log) => log.clientId === clientId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // OAuth Config
  async getOAuthConfig(): Promise<OAuthConfig | undefined> {
    return this.oauthConfig;
  }

  async updateOAuthConfig(config: Partial<InsertOAuthConfig>): Promise<OAuthConfig | undefined> {
    if (!this.oauthConfig) return undefined;

    this.oauthConfig = {
      ...this.oauthConfig,
      ...config,
      updatedAt: new Date()
    };

    return this.oauthConfig;
  }
}

export const storage = new MemStorage();
