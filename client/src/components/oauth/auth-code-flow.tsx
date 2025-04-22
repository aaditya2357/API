import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthCodeFlowProps {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
}

const AuthCodeFlow: React.FC<AuthCodeFlowProps> = ({
  clientId,
  redirectUri,
  scope,
  state
}) => {
  // Generate the full authorization request URL
  const authorizationUrl = `/api/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;

  // Generate a curl command for the token exchange
  const curlCommand = `curl -X POST \\
  https://your-api-gateway.com/api/oauth/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -H "Authorization: Basic $(echo -n "${clientId}:your_client_secret" | base64)" \\
  -d "grant_type=authorization_code" \\
  -d "code=AUTHORIZATION_CODE" \\
  -d "redirect_uri=${redirectUri}"`;

  // Generate Node.js code for the token exchange
  const nodeCode = `const fetch = require('node-fetch');

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code) {
  const response = await fetch('https://your-api-gateway.com/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from('${clientId}:your_client_secret').toString('base64')
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: '${redirectUri}'
    })
  });

  return await response.json();
}

// Call the protected API with the access token
async function callProtectedApi(accessToken) {
  const response = await fetch('https://your-api-gateway.com/api/v1/userinfo', {
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  });

  return await response.json();
}`;

  return (
    <Card className="bg-white shadow-md overflow-hidden">
      <CardContent className="p-4">
        <Tabs defaultValue="auth-request">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auth-request">Authorization Request</TabsTrigger>
            <TabsTrigger value="token-request">Token Exchange</TabsTrigger>
            <TabsTrigger value="api-request">API Request</TabsTrigger>
          </TabsList>
          <TabsContent value="auth-request" className="pt-4">
            <div className="text-sm mb-2 font-medium">Authorization Request URL</div>
            <div className="bg-gray-800 text-gray-100 p-4 rounded-md text-xs overflow-x-auto font-mono">
              GET {authorizationUrl}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">This URL initiates the authorization flow by redirecting the user to the authorization server.</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>client_id</strong>: Your client identifier</li>
                <li><strong>redirect_uri</strong>: Where to send the user after authorization</li>
                <li><strong>response_type</strong>: <code>code</code> for Authorization Code flow</li>
                <li><strong>scope</strong>: Space-separated list of permissions</li>
                <li><strong>state</strong>: (Optional) Value to maintain state between request and callback</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="token-request" className="pt-4">
            <div className="text-sm mb-2 font-medium">Exchange Authorization Code for Tokens (cURL)</div>
            <div className="bg-gray-800 text-gray-100 p-4 rounded-md text-xs overflow-x-auto font-mono whitespace-pre">
              {curlCommand}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">After receiving the authorization code, exchange it for access and refresh tokens.</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Authorization</strong>: Basic auth with client_id and client_secret</li>
                <li><strong>grant_type</strong>: <code>authorization_code</code></li>
                <li><strong>code</strong>: The authorization code from the previous step</li>
                <li><strong>redirect_uri</strong>: Must match the one used in authorization request</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="api-request" className="pt-4">
            <div className="text-sm mb-2 font-medium">Node.js Implementation</div>
            <div className="bg-gray-800 text-gray-100 p-4 rounded-md text-xs overflow-x-auto font-mono whitespace-pre">
              {nodeCode}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">Use the access token to call protected API endpoints.</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Include the token in the <strong>Authorization</strong> header</li>
                <li>Use the format: <code>Bearer {'{access_token}'}</code></li>
                <li>When the token expires, use the refresh token to get a new one</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthCodeFlow;
