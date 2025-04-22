import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { PlusCircle } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import ClientApplicationsList from '@/components/dashboard/client-applications-list';
import ClientForm from '@/components/clients/client-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { getClients } from '@/lib/api';

const ClientsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [, navigate] = useLocation();

  // Fetch clients
  const { data: clients, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/clients'],
    queryFn: getClients
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddClient = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    // Refresh the client list after adding a new client
    refetch();
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
              <h3 className="text-gray-700 text-3xl font-medium">Client Applications</h3>
              <Button 
                className="flex items-center bg-primary hover:bg-primary-600"
                onClick={handleAddClient}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Register New Client
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h4 className="text-lg font-semibold mb-4">What are Client Applications?</h4>
              <p className="text-gray-600 mb-4">
                Client applications are external services or applications that need to access your API resources. 
                Each client needs to be registered and authorized to request tokens that grant access to protected resources.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-primary mb-2">Confidential Clients</h5>
                  <p className="text-sm text-gray-600">
                    Server-side applications that can securely store client secrets and credentials.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-primary mb-2">Public Clients</h5>
                  <p className="text-sm text-gray-600">
                    Client-side applications like SPAs that can't securely store credentials.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-primary mb-2">Native Clients</h5>
                  <p className="text-sm text-gray-600">
                    Mobile or desktop applications installed on a user's device.
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
                <p className="text-red-500">Failed to load client applications. Please try again.</p>
              </div>
            ) : (
              <ClientApplicationsList clients={clients} onRefresh={refetch} />
            )}
          </div>
        </main>
      </div>

      {/* New Client Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Register New Client Application</DialogTitle>
            <DialogDescription>
              Fill in the details below to register a new client application.
            </DialogDescription>
          </DialogHeader>
          <ClientForm onSuccess={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
