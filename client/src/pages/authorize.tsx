import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Shield, User, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import AuthCodeFlow from '@/components/oauth/auth-code-flow';

const AuthorizePage = () => {
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [scopes, setScopes] = useState<string[]>([]);
  const [state, setState] = useState('');
  const { toast } = useToast();

  // Parse query parameters from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const responseType = searchParams.get('response_type');
    const scope = searchParams.get('scope');
    const state = searchParams.get('state');

    // Validate required parameters
    if (!clientId || !redirectUri || responseType !== 'code') {
      toast({
        variant: "destructive",
        title: "Invalid Request",
        description: "Missing or invalid required parameters for OAuth authorization.",
      });
      navigate('/');
      return;
    }

    // In a real app, fetch client details from the server
    setClientId(clientId);
    setRedirectUri(redirectUri);
    setState(state || '');
    setScopes(scope ? scope.split(' ') : ['OAuth2Scopes']);

    // Simulate API call to get client details
    setTimeout(() => {
      // This would normally come from an API call
      if (clientId === 'client_85392f5a3e1d') {
        setClientName('API Application');
      } else if (clientId === 'client_3f7d9a2c8b6e') {
        setClientName('Mobile App');
      } else if (clientId === 'client_7b45e8d1a93f') {
        setClientName('Partner Service');
      } else {
        setClientName('Unknown Application');
      }
      setIsLoading(false);
    }, 1000);
  }, [location, navigate, toast]);

  const handleAuthorize = async () => {
    setIsLoading(true);

    try {
      // In a real app, this would make an API call to generate an authorization code
      // and then redirect to the client's redirect URI with the code
      const authorizationCode = 'auth_code_' + Math.random().toString(36).substring(2, 15);
      
      // Build the redirect URL with the authorization code
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.append('code', authorizationCode);
      if (state) {
        redirectUrl.searchParams.append('state', state);
      }

      // Simulate API call delay
      setTimeout(() => {
        window.location.href = redirectUrl.toString();
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Authorization Failed",
        description: "There was an error processing your authorization request.",
      });
    }
  };

  const handleCancel = () => {
    // Redirect back to the client with an error
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.append('error', 'access_denied');
    redirectUrl.searchParams.append('error_description', 'The user denied the authorization request');
    if (state) {
      redirectUrl.searchParams.append('state', state);
    }
    window.location.href = redirectUrl.toString();
  };

  // Map scope to display name and description
  const getScopeDetails = (scope: string) => {
    switch (scope) {
      case 'OAuth2Scopes':
        return {
          displayName: 'Basic Access',
          description: 'Access to basic API functionality'
        };
      case 'read:profile':
        return {
          displayName: 'Read Profile',
          description: 'View your profile information'
        };
      case 'read:orders':
        return {
          displayName: 'Read Orders',
          description: 'View your order history'
        };
      case 'write:orders':
        return {
          displayName: 'Manage Orders',
          description: 'Create and update orders'
        };
      default:
        return {
          displayName: scope,
          description: 'Custom scope'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authorization request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Authorize Access</CardTitle>
          <CardDescription className="text-center">
            <span className="font-semibold">{clientName}</span> is requesting access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-center">
            <User className="h-12 w-12 text-gray-500 mr-4" />
            <div>
              <h3 className="font-semibold">You are logged in as:</h3>
              <p className="text-gray-600">john.doe@example.com</p>
              <p className="text-xs text-gray-500 mt-1">Not you? <a href="/login" className="text-primary hover:underline">Log in with a different account</a></p>
            </div>
          </div>

          <h3 className="font-semibold mb-3">This application will be able to:</h3>
          <div className="space-y-3 mb-6">
            {scopes.map((scope) => {
              const { displayName, description } = getScopeDetails(scope);
              return (
                <div key={scope} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          <div className="text-sm text-gray-500">
            <p>By authorizing this application, you are allowing it to access your data according to the permissions above.</p>
            <p className="mt-2">You can revoke access at any time from your account settings.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between flex-col sm:flex-row space-y-2 sm:space-y-0">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Deny
          </Button>
          <Button 
            className="w-full sm:w-auto bg-primary hover:bg-primary-600" 
            onClick={handleAuthorize}
            disabled={isLoading}
          >
            <Check className="h-4 w-4 mr-2" />
            {isLoading ? "Authorizing..." : "Authorize"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Technical details (for developers) */}
      <div className="mt-8 w-full max-w-lg">
        <div className="text-sm text-gray-500 mb-2 px-4">
          <p>OAuth 2.0 Authorization Code Flow Technical Details:</p>
        </div>
        <AuthCodeFlow
          clientId={clientId}
          redirectUri={redirectUri}
          scope={scopes.join(' ')}
          state={state}
        />
      </div>
    </div>
  );
};

export default AuthorizePage;
