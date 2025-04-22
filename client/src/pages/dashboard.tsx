import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { PlusCircle } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import StatusCards from '@/components/dashboard/status-cards';
import ApiTrafficChart from '@/components/dashboard/api-traffic-chart';
import OAuthConfigWidget from '@/components/dashboard/oauth-config-widget';
import ApiEndpointsList from '@/components/dashboard/api-endpoints-list';
import OAuthFlowVisualization from '@/components/dashboard/oauth-flow-visualization';
import ClientApplicationsList from '@/components/dashboard/client-applications-list';
import { Button } from '@/components/ui/button';
import { getApiEndpoints, getClients } from '@/lib/api';

const Dashboard = () => {
  const [, navigate] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch API endpoints
  const { data: endpoints } = useQuery({
    queryKey: ['/api/admin/endpoints'],
    queryFn: getApiEndpoints
  });

  // Fetch clients
  const { data: clients } = useQuery({
    queryKey: ['/api/admin/clients'],
    queryFn: getClients
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleEditConfig = () => {
    navigate('/oauth-config');
  };

  const handleEditEndpoint = (endpoint: any) => {
    navigate(`/apis/edit/${endpoint.id}`);
  };

  const handleViewEndpoint = (endpoint: any) => {
    navigate(`/apis/view/${endpoint.id}`);
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
            <div className="flex items-center justify-between">
              <h3 className="text-gray-700 text-3xl font-medium">Dashboard</h3>
              <Button 
                className="flex items-center bg-primary hover:bg-primary-600"
                onClick={() => navigate('/apis/new')}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                New API
              </Button>
            </div>

            {/* Status Cards */}
            <StatusCards 
              apiCount={endpoints?.length || 0} 
              clientCount={clients?.length || 0} 
              uptime={98.2} 
              alertsCount={5} 
            />

            {/* API Analytics & OAuth Configuration */}
            <div className="flex flex-col md:flex-row mt-8">
              {/* API Traffic Chart */}
              <div className="w-full md:w-2/3 lg:w-3/4 md:pr-4">
                <ApiTrafficChart />
              </div>

              {/* OAuth Configuration */}
              <div className="w-full md:w-1/3 lg:w-1/4 mt-6 md:mt-0">
                <OAuthConfigWidget onEditClick={handleEditConfig} />
              </div>
            </div>

            {/* API Endpoints */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">API Endpoints</h3>
              <ApiEndpointsList 
                onEdit={handleEditEndpoint} 
                onView={handleViewEndpoint} 
              />
            </div>

            {/* OAuth Flow Visualization */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">OAuth 2.0 Authentication Flow</h3>
              <OAuthFlowVisualization />
            </div>

            {/* Client Applications */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Registered Client Applications</h3>
                <Button 
                  className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary-600"
                  onClick={() => navigate('/clients/new')}
                >
                  Register New Client
                </Button>
              </div>
              <ClientApplicationsList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
