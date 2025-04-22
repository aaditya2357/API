import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { PlusCircle } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import ApiEndpointsList from '@/components/dashboard/api-endpoints-list';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getApiEndpoints, createApiEndpoint } from '@/lib/api';
import { ApiEndpoint } from '@shared/schema';

const apiFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  endpoint: z.string().min(1, "Endpoint path is required"),
  method: z.string().min(1, "Method is required"),
  service: z.string().optional(),
  authType: z.string().min(1, "Authentication type is required"),
  status: z.string().min(1, "Status is required")
});

type ApiFormValues = z.infer<typeof apiFormSchema>;

const ApisPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch API endpoints
  const { data: endpoints, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/endpoints'],
    queryFn: getApiEndpoints
  });

  const form = useForm<ApiFormValues>({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      name: '',
      endpoint: '',
      method: 'GET',
      service: '',
      authType: 'oauth2',
      status: 'active'
    }
  });

  const createEndpointMutation = useMutation({
    mutationFn: createApiEndpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/endpoints'] });
      setIsFormOpen(false);
      toast({
        title: "API Endpoint Created",
        description: "The API endpoint has been created successfully",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create API endpoint",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddEndpoint = () => {
    setSelectedEndpoint(null);
    form.reset();
    setIsFormOpen(true);
  };

  const handleEditEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    form.reset({
      name: endpoint.name,
      endpoint: endpoint.endpoint,
      method: endpoint.method,
      service: endpoint.service || '',
      authType: endpoint.authType,
      status: endpoint.status
    });
    setIsFormOpen(true);
  };

  const handleViewEndpoint = (endpoint: ApiEndpoint) => {
    // In a real app, navigate to a detailed view
    toast({
      title: "View Endpoint",
      description: `Viewing details for ${endpoint.name}`,
    });
  };

  const onSubmit = (values: ApiFormValues) => {
    if (selectedEndpoint) {
      // Update endpoint logic would go here
      toast({
        title: "Update Not Implemented",
        description: "Updating endpoints is not implemented in this demo",
      });
    } else {
      // Create new endpoint
      createEndpointMutation.mutate(values);
    }
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
              <h3 className="text-gray-700 text-3xl font-medium">API Endpoints</h3>
              <Button 
                className="flex items-center bg-primary hover:bg-primary-600"
                onClick={handleAddEndpoint}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                New API Endpoint
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h4 className="text-lg font-semibold mb-4">API Gateway Endpoints</h4>
              <p className="text-gray-600 mb-4">
                API endpoints define the resources that clients can access through your API Gateway. 
                Each endpoint can have different authentication requirements, rate limits, and access controls.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-primary mb-2">OAuth Protected</h5>
                  <p className="text-sm text-gray-600">
                    Endpoints that require OAuth 2.0 authentication with valid access tokens.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-primary mb-2">Public APIs</h5>
                  <p className="text-sm text-gray-600">
                    Publicly accessible endpoints that don't require authentication.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-primary mb-2">Internal Services</h5>
                  <p className="text-sm text-gray-600">
                    Back-end services that serve authenticated internal requests.
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-500">Failed to load API endpoints. Please try again.</p>
              </div>
            ) : (
              <ApiEndpointsList 
                onEdit={handleEditEndpoint} 
                onView={handleViewEndpoint}
              />
            )}
          </div>
        </main>
      </div>

      {/* New/Edit Endpoint Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedEndpoint ? 'Edit API Endpoint' : 'Create New API Endpoint'}</DialogTitle>
            <DialogDescription>
              {selectedEndpoint 
                ? 'Update the details of the API endpoint.' 
                : 'Define a new API endpoint that will be available through your API Gateway.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="User Authentication" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for the API endpoint.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <FormControl>
                        <Input placeholder="User Service" {...field} />
                      </FormControl>
                      <FormDescription>
                        The service this endpoint belongs to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endpoint Path</FormLabel>
                      <FormControl>
                        <Input placeholder="/api/v1/auth" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL path for the endpoint.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTTP Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select HTTP method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The HTTP method for this endpoint.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="authType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select authentication type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="apikey">API Key</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of authentication required for this endpoint.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The current status of this endpoint.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary-600">
                  {selectedEndpoint ? 'Update Endpoint' : 'Create Endpoint'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApisPage;
