import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOAuthConfig } from '@/lib/api';

interface OAuthConfigWidgetProps {
  onEditClick: () => void;
}

const OAuthConfigWidget: React.FC<OAuthConfigWidgetProps> = ({ onEditClick }) => {
  const { data: config, isLoading, error } = useQuery({
    queryKey: ['/api/admin/oauth-config'],
    queryFn: getOAuthConfig
  });

  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">OAuth Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="animate-pulse">Loading configuration...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">OAuth Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px]">
          <XCircle className="text-red-500 w-12 h-12 mb-4" />
          <p className="text-gray-600">Failed to load OAuth configuration</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-700">OAuth Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Authorization Server Status</label>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm">Active</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Access Token Format</label>
          <span className="text-sm">{config?.tokenFormat?.toUpperCase() || 'JWT'}</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Token Lifetime</label>
          <span className="text-sm">{config?.accessTokenLifetime || 3600} seconds</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grant Types Enabled</label>
          <div className="space-y-1">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm">Authorization Code</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm">Client Credentials</span>
            </div>
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-gray-300 mr-1" />
              <span className="text-sm text-gray-400">Implicit Flow</span>
            </div>
          </div>
        </div>
        <div>
          <Button 
            variant="link" 
            className="text-primary text-sm font-medium p-0 hover:text-primary-600"
            onClick={onEditClick}
          >
            Edit Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OAuthConfigWidget;
