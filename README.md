# API Gateway with OAuth 2.0

A secure API gateway with OAuth 2.0 authentication, token validation, and request routing capabilities.

## Features

- OAuth 2.0 authentication flows (Authorization Code, Client Credentials, Refresh Token)
- API endpoint management
- Client application registration and management
- JWT token validation
- Rate limiting
- Beautiful dashboard interface

## Deployment on Render

This application can be easily deployed on [Render](https://render.com).

### Deployment Steps

1. Create a new Web Service on Render
2. Connect your repository
3. Use the following settings:
   - **Name**: api-gateway (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Environment**: `production`
   - **Port**: `10000` (or any other port)

### Environment Variables

Set the following environment variables in your Render dashboard:

- `NODE_ENV`: `production`
- `PORT`: `10000` (or any other port)

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

The application will be available at http://localhost:5000.

## Building for Production

```bash
npm run build
npm start
```

## Technologies Used

- Node.js + Express
- React
- TypeScript
- Tailwind CSS
- Drizzle ORM
- TanStack Query
- Wouter (routing)
- shadcn/ui components