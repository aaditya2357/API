import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Save, ChevronLeft } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getOAuthConfig, updateOAuthConfig } from '@/lib/api';

const OAuthConfigPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch OAuth configuration
  const { data: config, isLoading, error } = useQuery({
    queryKey: ['/api/admin/oauth-config'],
    queryFn: getOAuthConfig
  });

  // Local state to track form changes
  const [formData, setFormData] = useState({
    accessTokenLifetime: 3600,
    refreshTokenLifetime: 7200,
    authorizationCodeLifetime: 60,
    tokenFormat: 'jwt',
    issuer: 'https://auth.example.com',
    audience: 'https://api.example.com'
  });

  // Update form state when config data is loaded
  useState(() => {
    if (config) {
      setFormData({
        accessTokenLifetime: config.accessTokenLifetime,
        refreshTokenLifetime: config.refreshTokenLifetime,
        authorizationCodeLifetime: config.authorizationCodeLifetime,
        tokenFormat: config.tokenFormat,
        issuer: config.issuer,
        audience: config.audience
      });
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: updateOAuthConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/oauth-config'] });
      toast({
        title: "Configuration Updated",
        description: "OAuth configuration has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigMutation.mutate(formData);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Button variant="ghost" onClick={() => navigate('/')} className="mr-2">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h3 className="text-gray-700 text-3xl font-medium">OAuth Configuration</h3>
              </div>
              <Button 
                className="flex items-center bg-primary hover:bg-primary-600"
                onClick={handleSubmit}
                disabled={updateConfigMutation.isPending}
              >
                <Save className="h-5 w-5 mr-2" />
                {updateConfigMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Settings</CardTitle>
                    <CardDescription>
                      Configure how OAuth tokens are generated and validated
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoading ? (
                      <div className="py-4 text-center">Loading configuration...</div>
                    ) : error ? (
                      <div className="bg-red-50 p-4 rounded-md">
                        <p className="text-red-500">Failed to load OAuth configuration</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                          <Label>Access Token Lifetime (seconds)</Label>
                          <div className="flex items-center space-x-4">
                            <Slider
                              value={[formData.accessTokenLifetime]}
                              min={60}
                              max={86400}
                              step={60}
                              onValueChange={(value) => handleInputChange('accessTokenLifetime', value[0])}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={formData.accessTokenLifetime}
                              onChange={(e) => handleInputChange('accessTokenLifetime', parseInt(e.target.value))}
                              className="w-24"
                            />
                          </div>
                          <p className="text-sm text-gray-500">
                            {Math.floor(formData.accessTokenLifetime / 3600)} hours, {Math.floor((formData.accessTokenLifetime % 3600) / 60)} minutes
                          </p>
                        </div>

                        <div className="space-y-4">
                          <Label>Refresh Token Lifetime (seconds)</Label>
                          <div className="flex items-center space-x-4">
                            <Slider
                              value={[formData.refreshTokenLifetime]}
                              min={3600}
                              max={2592000} // 30 days
                              step={3600}
                              onValueChange={(value) => handleInputChange('refreshTokenLifetime', value[0])}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={formData.refreshTokenLifetime}
                              onChange={(e) => handleInputChange('refreshTokenLifetime', parseInt(e.target.value))}
                              className="w-24"
                            />
                          </div>
                          <p className="text-sm text-gray-500">
                            {Math.floor(formData.refreshTokenLifetime / 86400)} days, {Math.floor((formData.refreshTokenLifetime % 86400) / 3600)} hours
                          </p>
                        </div>

                        <div className="space-y-4">
                          <Label>Authorization Code Lifetime (seconds)</Label>
                          <div className="flex items-center space-x-4">
                            <Slider
                              value={[formData.authorizationCodeLifetime]}
                              min={10}
                              max={600}
                              step={10}
                              onValueChange={(value) => handleInputChange('authorizationCodeLifetime', value[0])}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={formData.authorizationCodeLifetime}
                              onChange={(e) => handleInputChange('authorizationCodeLifetime', parseInt(e.target.value))}
                              className="w-24"
                            />
                          </div>
                          <p className="text-sm text-gray-500">
                            {Math.floor(formData.authorizationCodeLifetime / 60)} minutes, {formData.authorizationCodeLifetime % 60} seconds
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Token Format</Label>
                          <RadioGroup 
                            value={formData.tokenFormat} 
                            onValueChange={(value) => handleInputChange('tokenFormat', value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="jwt" id="jwt" />
                              <Label htmlFor="jwt">JWT</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="opaque" id="opaque" disabled />
                              <Label htmlFor="opaque" className="text-gray-400">Opaque (coming soon)</Label>
                            </div>
                          </RadioGroup>
                          <p className="text-sm text-gray-500">
                            JWT tokens are self-contained and can be validated without a database lookup
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="issuer">Token Issuer (iss)</Label>
                            <Input
                              id="issuer"
                              value={formData.issuer}
                              onChange={(e) => handleInputChange('issuer', e.target.value)}
                              placeholder="https://auth.yourdomain.com"
                            />
                            <p className="text-sm text-gray-500">
                              The issuer claim identifies your authorization server
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="audience">Token Audience (aud)</Label>
                            <Input
                              id="audience"
                              value={formData.audience}
                              onChange={(e) => handleInputChange('audience', e.target.value)}
                              placeholder="https://api.yourdomain.com"
                            />
                            <p className="text-sm text-gray-500">
                              The audience claim identifies the intended recipient of the token
                            </p>
                          </div>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Supported Grant Types</CardTitle>
                    <CardDescription>
                      Configure which OAuth 2.0 grant types are enabled
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Authorization Code</p>
                        <p className="text-sm text-gray-500">For server-side applications</p>
                      </div>
                      <div className="h-5 w-5 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Client Credentials</p>
                        <p className="text-sm text-gray-500">For service-to-service auth</p>
                      </div>
                      <div className="h-5 w-5 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Refresh Token</p>
                        <p className="text-sm text-gray-500">For obtaining new access tokens</p>
                      </div>
                      <div className="h-5 w-5 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-400">Implicit Flow</p>
                        <p className="text-sm text-gray-400">Not recommended (security issues)</p>
                      </div>
                      <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-400">Password Grant</p>
                        <p className="text-sm text-gray-400">Not recommended (security issues)</p>
                      </div>
                      <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Configure additional security features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>CORS Allowed Origins</Label>
                        <Select defaultValue="all">
                          <SelectTrigger>
                            <SelectValue placeholder="Select CORS policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Origins (*))</SelectItem>
                            <SelectItem value="specified">Specified Origins Only</SelectItem>
                            <SelectItem value="none">No CORS (same origin only)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Enforce HTTPS</Label>
                        <Select defaultValue="always">
                          <SelectTrigger>
                            <SelectValue placeholder="Select HTTPS policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="always">Always Required</SelectItem>
                            <SelectItem value="production">Production Only</SelectItem>
                            <SelectItem value="optional">Optional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OAuthConfigPage;
