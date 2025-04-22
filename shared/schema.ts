import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// OAuth Client Applications
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  redirectUri: text("redirect_uri").notNull(),
  applicationType: text("application_type").notNull().default("confidential"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  clientId: true,
  clientSecret: true,
  name: true,
  description: true,
  redirectUri: true,
  applicationType: true,
  status: true,
});

// OAuth Scopes
export const scopes = pgTable("scopes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const insertScopeSchema = createInsertSchema(scopes).pick({
  name: true,
  description: true,
});

// Client Scopes (many-to-many relationship)
export const clientScopes = pgTable("client_scopes", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  scopeId: integer("scope_id").notNull(),
});

export const insertClientScopeSchema = createInsertSchema(clientScopes).pick({
  clientId: true,
  scopeId: true,
});

// Grant Types
export const grantTypes = pgTable("grant_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertGrantTypeSchema = createInsertSchema(grantTypes).pick({
  name: true,
});

// Client Grant Types (many-to-many relationship)
export const clientGrantTypes = pgTable("client_grant_types", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  grantTypeId: integer("grant_type_id").notNull(),
});

export const insertClientGrantTypeSchema = createInsertSchema(clientGrantTypes).pick({
  clientId: true,
  grantTypeId: true,
});

// Authorization Codes
export const authorizationCodes = pgTable("authorization_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  clientId: text("client_id").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  userId: integer("user_id").notNull(),
  scopes: text("scopes").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuthorizationCodeSchema = createInsertSchema(authorizationCodes).pick({
  code: true,
  clientId: true,
  redirectUri: true,
  userId: true,
  scopes: true,
  expiresAt: true,
});

// Access Tokens
export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  accessToken: text("access_token").notNull().unique(),
  refreshToken: text("refresh_token"),
  clientId: text("client_id").notNull(),
  userId: integer("user_id"),
  scopes: text("scopes").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTokenSchema = createInsertSchema(tokens).pick({
  accessToken: true,
  refreshToken: true,
  clientId: true,
  userId: true,
  scopes: true,
  expiresAt: true,
});

// API Endpoints
export const apiEndpoints = pgTable("api_endpoints", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  method: text("method").notNull(),
  service: text("service"),
  authType: text("auth_type").notNull().default("oauth2"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertApiEndpointSchema = createInsertSchema(apiEndpoints).pick({
  name: true,
  endpoint: true,
  method: true,
  service: true,
  authType: true,
  status: true,
});

// API Request Logs
export const requestLogs = pgTable("request_logs", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  status: integer("status").notNull(),
  clientId: text("client_id"),
  userId: integer("user_id"),
  responseTime: integer("response_time"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertRequestLogSchema = createInsertSchema(requestLogs).pick({
  endpoint: true,
  method: true,
  status: true,
  clientId: true,
  userId: true,
  responseTime: true,
});

// OAuth Configuration
export const oauthConfig = pgTable("oauth_config", {
  id: serial("id").primaryKey(),
  accessTokenLifetime: integer("access_token_lifetime").notNull().default(3600),
  refreshTokenLifetime: integer("refresh_token_lifetime").notNull().default(7200),
  authorizationCodeLifetime: integer("authorization_code_lifetime").notNull().default(60),
  tokenFormat: text("token_format").notNull().default("jwt"),
  issuer: text("issuer").notNull(),
  audience: text("audience").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOAuthConfigSchema = createInsertSchema(oauthConfig).pick({
  accessTokenLifetime: true,
  refreshTokenLifetime: true,
  authorizationCodeLifetime: true,
  tokenFormat: true,
  issuer: true,
  audience: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Scope = typeof scopes.$inferSelect;
export type InsertScope = z.infer<typeof insertScopeSchema>;

export type ClientScope = typeof clientScopes.$inferSelect;
export type InsertClientScope = z.infer<typeof insertClientScopeSchema>;

export type GrantType = typeof grantTypes.$inferSelect;
export type InsertGrantType = z.infer<typeof insertGrantTypeSchema>;

export type ClientGrantType = typeof clientGrantTypes.$inferSelect;
export type InsertClientGrantType = z.infer<typeof insertClientGrantTypeSchema>;

export type AuthorizationCode = typeof authorizationCodes.$inferSelect;
export type InsertAuthorizationCode = z.infer<typeof insertAuthorizationCodeSchema>;

export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;

export type ApiEndpoint = typeof apiEndpoints.$inferSelect;
export type InsertApiEndpoint = z.infer<typeof insertApiEndpointSchema>;

export type RequestLog = typeof requestLogs.$inferSelect;
export type InsertRequestLog = z.infer<typeof insertRequestLogSchema>;

export type OAuthConfig = typeof oauthConfig.$inferSelect;
export type InsertOAuthConfig = z.infer<typeof insertOAuthConfigSchema>;
