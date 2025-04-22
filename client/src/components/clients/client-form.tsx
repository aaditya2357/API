import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/api';

// Define schema for client registration form
const clientFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  redirectUri: z.string().url("Must be a valid URL or URI scheme"),
  applicationType: z.enum(["confidential", "public"]),
  grantTypes: z.array(z.string()).min(1, "Select at least one grant type"),
  scopes: z.array(z.string()).min(1, "Select at least one scope"),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  onSuccess?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Available grant types
  const grantTypes = [
    { id: "authorization_code", label: "Authorization Code" },
    { id: "client_credentials", label: "Client Credentials" },
    { id: "refresh_token", label: "Refresh Token" },
    { id: "implicit", label: "Implicit Flow (Legacy)", disabled: true },
    { id: "password", label: "Password Grant (Legacy)", disabled: true },
  ];

  // Available scopes
  const scopes = [
    { id: "OAuth2Scopes", label: "Basic OAuth2 Scopes" },
    { id: "read:profile", label: "Read Profile" },
    { id: "read:orders", label: "Read Orders" },
    { id: "write:orders", label: "Write Orders" },
  ];

  // Form initialization
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      description: "",
      redirectUri: "",
      applicationType: "confidential",
      grantTypes: ["authorization_code"],
      scopes: ["OAuth2Scopes"],
    },
  });

  // Client creation mutation
  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      toast({
        title: "Client Registered",
        description: "The client has been registered successfully.",
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: ClientFormValues) => {
    // Generate a random client ID and secret
    const clientId = `client_${Math.random().toString(36).substring(2, 15)}`;
    const clientSecret = `secret_${Math.random().toString(36).substring(2, 15)}`;
    
    // Submit the client registration
    createClientMutation.mutate({
      clientId,
      clientSecret,
      name: values.name,
      description: values.description || "",
      redirectUri: values.redirectUri,
      applicationType: values.applicationType,
      status: "active",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Application" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive name for your application
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="applicationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="confidential">Confidential (server-side)</SelectItem>
                    <SelectItem value="public">Public (client-side)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value === "confidential" 
                    ? "For server-side applications that can securely store secrets" 
                    : "For client-side applications like SPAs and mobile apps"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="A brief description of your application" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Optional description to help identify this client
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="redirectUri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Redirect URI</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://myapp.com/callback" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                URI where users will be redirected after authorization. Use http://localhost:3000/callback for local development.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="grantTypes"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Grant Types</FormLabel>
                <FormDescription>
                  OAuth 2.0 grant types this client is allowed to use
                </FormDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grantTypes.map((type) => (
                  <FormField
                    key={type.id}
                    control={form.control}
                    name="grantTypes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={type.id}
                          className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(type.id)}
                              disabled={type.disabled}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, type.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== type.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className={type.disabled ? "text-gray-400" : ""}>
                              {type.label}
                            </FormLabel>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="scopes"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Allowed Scopes</FormLabel>
                <FormDescription>
                  Permissions this client can request
                </FormDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scopes.map((scope) => (
                  <FormField
                    key={scope.id}
                    control={form.control}
                    name="scopes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={scope.id}
                          className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(scope.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, scope.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== scope.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {scope.label}
                            </FormLabel>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary-600"
            disabled={createClientMutation.isPending}
          >
            {createClientMutation.isPending ? "Registering..." : "Register Client"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;
