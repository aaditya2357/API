import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const OAuthFlowVisualization: React.FC = () => {
  return (
    <Card className="bg-white shadow-md rounded-lg p-6">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-2/3 mb-6 lg:mb-0 lg:pr-6">
            <div className="border border-gray-200 rounded-lg p-4 h-full">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-700">Authorization Code Flow</h4>
                <div className="mt-2 md:mt-0">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Recommended</span>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="flex flex-row items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-semibold">1</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700">Client application redirects user to authorization server</p>
                    <p className="mt-1 text-xs text-gray-500">
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">/api/oauth/authorize</span> with 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">client_id</span>, 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">redirect_uri</span>, 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">scope</span>
                    </p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-gray-300 h-6 ml-4"></div>
                <div className="flex flex-row items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-semibold">2</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700">User authenticates and grants permissions</p>
                    <p className="mt-1 text-xs text-gray-500">User logs in and approves requested scopes</p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-gray-300 h-6 ml-4"></div>
                <div className="flex flex-row items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-semibold">3</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700">Authorization server redirects back to client with authorization code</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Redirect to 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">redirect_uri</span> with 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">code</span> parameter
                    </p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-gray-300 h-6 ml-4"></div>
                <div className="flex flex-row items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-semibold">4</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700">Client exchanges authorization code for access token</p>
                    <p className="mt-1 text-xs text-gray-500">
                      POST to 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">/api/oauth/token</span> with 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">code</span>, 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">client_id</span>, 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">client_secret</span>, 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">redirect_uri</span>
                    </p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-gray-300 h-6 ml-4"></div>
                <div className="flex flex-row items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-semibold">5</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700">Client receives access token and refresh token</p>
                    <p className="mt-1 text-xs text-gray-500">
                      JSON response with 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">access_token</span>, 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">refresh_token</span>, 
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">expires_in</span>
                    </p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-gray-300 h-6 ml-4"></div>
                <div className="flex flex-row items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-semibold">6</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700">Client uses access token to call protected APIs</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Include token in Authorization header:
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">Authorization: Bearer {'{token}'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/3">
            <div className="border border-gray-200 rounded-lg p-4 h-full">
              <h4 className="text-lg font-medium text-gray-700 mb-4">JWT Access Token Example</h4>
              <div className="bg-gray-800 text-gray-100 p-4 rounded-md text-xs overflow-x-auto font-mono">
                <div><span className="text-red-400">"access_token"</span><span className="text-gray-300">: </span><span className="text-blue-300 break-all">"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDUwMjIsImlzcyI6Imh0dHBzOi8vYXV0aC5leGFtcGxlLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tIiwic2NvcGUiOiJPQXV0aDJTY29wZXMifQ.signature"</span><span className="text-gray-300">,</span></div>
                <div><span className="text-red-400">"token_type"</span><span className="text-gray-300">: </span><span className="text-blue-300">"Bearer"</span><span className="text-gray-300">,</span></div>
                <div><span className="text-red-400">"expires_in"</span><span className="text-gray-300">: </span><span className="text-green-300">3600</span><span className="text-gray-300">,</span></div>
                <div><span className="text-red-400">"refresh_token"</span><span className="text-gray-300">: </span><span className="text-blue-300">"tGzv3JOkF0XG5Qx2TlKWIA"</span></div>
              </div>

              <h4 className="text-lg font-medium text-gray-700 mt-6 mb-4">Decoded JWT Payload</h4>
              <div className="bg-gray-800 text-gray-100 p-4 rounded-md text-xs overflow-x-auto font-mono">
                <div><span className="text-gray-300">{'{'}</span></div>
                <div className="pl-4"><span className="text-red-400">"sub"</span><span className="text-gray-300">: </span><span className="text-blue-300">"1234567890"</span><span className="text-gray-300">,</span></div>
                <div className="pl-4"><span className="text-red-400">"name"</span><span className="text-gray-300">: </span><span className="text-blue-300">"John Doe"</span><span className="text-gray-300">,</span></div>
                <div className="pl-4"><span className="text-red-400">"iat"</span><span className="text-gray-300">: </span><span className="text-green-300">1516239022</span><span className="text-gray-300">,</span></div>
                <div className="pl-4"><span className="text-red-400">"exp"</span><span className="text-gray-300">: </span><span className="text-green-300">1516245022</span><span className="text-gray-300">,</span></div>
                <div className="pl-4"><span className="text-red-400">"iss"</span><span className="text-gray-300">: </span><span className="text-blue-300">"https://auth.example.com"</span><span className="text-gray-300">,</span></div>
                <div className="pl-4"><span className="text-red-400">"aud"</span><span className="text-gray-300">: </span><span className="text-blue-300">"https://api.example.com"</span><span className="text-gray-300">,</span></div>
                <div className="pl-4"><span className="text-red-400">"scope"</span><span className="text-gray-300">: </span><span className="text-blue-300">"OAuth2Scopes"</span></div>
                <div><span className="text-gray-300">{'}'}</span></div>
              </div>

              <div className="mt-6">
                <a 
                  href="https://jwt.io/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary text-sm hover:text-primary-600 flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View JWT Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OAuthFlowVisualization;
