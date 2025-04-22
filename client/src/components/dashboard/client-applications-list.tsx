import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@shared/schema';
import { updateClientStatus } from '@/lib/api';
import CopyButton from '@/components/ui/copy-button';

interface ClientApplicationsListProps {
  clients?: Client[];
  onRefresh?: () => void;
}

const ClientApplicationsList: React.FC<ClientApplicationsListProps> = ({ 
  clients = [],
  onRefresh
}) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientSecretVisible, setIsClientSecretVisible] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If no clients are provided, use sample data
  const clientsToDisplay = clients.length > 0 ? clients : [
    {
      id: 1,
      clientId: 'client_85392f5a3e1d',
      clientSecret: 'secret_94c53d2b78ef',
      name: 'API Application',
      description: 'Web application with server-side logic',
      redirectUri: 'http://example.com/redirect',
      applicationType: 'confidential',
      status: 'active',
      createdAt: new Date()
    },
    {
      id: 2,
      clientId: 'client_3f7d9a2c8b6e',
      clientSecret: 'secret_a1e8b3c72d9f',
      name: 'Mobile App',
      description: 'iOS and Android mobile application',
      redirectUri: 'com.example.app:/oauth/callback',
      applicationType: 'confidential',
      status: 'active',
      createdAt: new Date()
    },
    {
      id: 3,
      clientId: 'client_7b45e8d1a93f',
      clientSecret: 'secret_e5c8f7d2a69b',
      name: 'Partner Service',
      description: 'Third-party integration service',
      redirectUri: 'https://partner.example.com/oauth/callback',
      applicationType: 'confidential',
      status: 'pending',
      createdAt: new Date()
    }
  ];

  const updateStatusMutation = useMutation({
    mutationFn: updateClientStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      toast({
        title: `Client ${selectedClient?.status === 'active' ? 'Deactivated' : 'Activated'}`,
        description: `${selectedClient?.name} has been ${selectedClient?.status === 'active' ? 'deactivated' : 'activated'} successfully.`,
      });
      if (onRefresh) {
        onRefresh();
      }
      setConfirmDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Status Update Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });

  const toggleClientSecret = (clientId: number) => {
    setIsClientSecretVisible(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  // This function was replaced with direct clipboard access in the dropdown menu

  const handleStatusChange = (client: Client) => {
    setSelectedClient(client);
    setConfirmDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (selectedClient) {
      const newStatus = selectedClient.status === 'active' ? 'inactive' : 'active';
      updateStatusMutation.mutate({ 
        id: selectedClient.id, 
        status: newStatus 
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clientsToDisplay.map((client) => (
        <div key={client.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">{client.name}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                client.status === 'active' ? 'bg-green-100 text-green-800' :
                client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">{client.description}</p>
            <div className="mt-4 flex flex-col space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500">Client ID</label>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                    {client.clientId}
                  </span>
                  <CopyButton 
                    value={client.clientId}
                    size="sm"
                    variant="ghost"
                    className="ml-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Client Secret</label>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                    {isClientSecretVisible[client.id] ? client.clientSecret : '••••••••••••••••'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-1 text-gray-400 hover:text-gray-500"
                    onClick={() => toggleClientSecret(client.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {isClientSecretVisible[client.id] && (
                    <CopyButton 
                      value={client.clientSecret}
                      size="sm"
                      variant="ghost"
                      className="ml-1"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Redirect URI</label>
                <span className="text-sm font-mono mt-1 block truncate">{client.redirectUri}</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Grant Types</label>
                <div className="flex flex-wrap mt-1 gap-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">authorization_code</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">client_credentials</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Scopes</label>
                <div className="flex flex-wrap mt-1 gap-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">OAuth2Scopes</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      navigator.clipboard.writeText(client.clientId);
                      toast({
                        title: "Client ID Copied",
                        description: "Client ID has been copied to clipboard."
                      });
                    }}
                  >
                    Copy Client ID
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      navigator.clipboard.writeText(client.clientSecret);
                      toast({
                        title: "Client Secret Copied",
                        description: "Client Secret has been copied to clipboard."
                      });
                    }}
                  >
                    Copy Client Secret
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange(client)}>
                    {client.status === 'active' ? 'Deactivate Client' : 'Activate Client'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 focus:text-red-700">
                    Delete Client
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedClient?.status === 'active' ? 'Deactivate Client' : 'Activate Client'}
            </DialogTitle>
            <DialogDescription>
              {selectedClient?.status === 'active' 
                ? 'This will deactivate the client and revoke all existing tokens. Users will no longer be able to authenticate using this client.' 
                : 'This will activate the client. Users will be able to authenticate using this client.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={selectedClient?.status === 'active' ? 'destructive' : 'default'}
              onClick={confirmStatusChange}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending 
                ? 'Processing...' 
                : selectedClient?.status === 'active' 
                  ? 'Deactivate' 
                  : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientApplicationsList;
