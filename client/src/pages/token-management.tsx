import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle, Clock, Ban, EyeOff, DownloadCloud, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getClients } from '@/lib/api';
import CopyButton from '@/components/ui/copy-button';

const TokenManagementPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  // Fetch clients
  const { data: clients, isLoading: isClientsLoading } = useQuery({
    queryKey: ['/api/admin/clients'],
    queryFn: getClients
  });

  // Mock token data - in a real app, this would be fetched from the API
  const tokens = [
    {
      id: 1,
      clientId: 'client_85392f5a3e1d',
      clientName: 'API Application',
      userId: 1,
      username: 'john.doe',
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV...',
      scopes: 'OAuth2Scopes',
      issuedAt: new Date(Date.now() - 3600000), // 1 hour ago
      expiresAt: new Date(Date.now() + 3600000), // in 1 hour
    },
    {
      id: 2,
      clientId: 'client_3f7d9a2c8b6e',
      clientName: 'Mobile App',
      userId: 2,
      username: 'jane.smith',
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV...',
      scopes: 'OAuth2Scopes read:profile',
      issuedAt: new Date(Date.now() - 7200000), // 2 hours ago
      expiresAt: new Date(Date.now() + 1800000), // in 30 minutes
    },
    {
      id: 3,
      clientId: 'client_7b45e8d1a93f',
      clientName: 'Partner Service',
      userId: null,
      username: null,
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV...',
      scopes: 'read:orders write:orders',
      issuedAt: new Date(Date.now() - 1800000), // 30 minutes ago
      expiresAt: new Date(Date.now() + 5400000), // in 1.5 hours
    },
  ];

  const filteredTokens = tokens.filter(token => {
    if (selectedClient !== 'all' && token.clientId !== selectedClient) {
      return false;
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        token.clientName.toLowerCase().includes(searchLower) ||
        (token.username && token.username.toLowerCase().includes(searchLower)) ||
        token.accessToken.toLowerCase().includes(searchLower) ||
        token.scopes.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString();
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff < 0) {
      return 'Expired';
    }
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes % 60} min`;
    }
    
    return `${minutes} min`;
  };

  const handleRevokeToken = (id: number) => {
    // In a real app, make API call to revoke token
    toast({
      title: "Token Revoked",
      description: `Token ID ${id} has been revoked successfully.`,
    });
  };

  const handleRevokeAll = () => {
    // In a real app, make API call to revoke all tokens
    toast({
      title: "All Tokens Revoked",
      description: "All tokens have been revoked successfully.",
      variant: "destructive",
    });
  };

  const handleExportTokens = () => {
    // In a real app, generate and download a CSV/JSON file
    toast({
      title: "Export Initiated",
      description: "Token data export has started.",
    });
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
              <h3 className="text-gray-700 text-3xl font-medium">Token Management</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={handleExportTokens}
                >
                  <DownloadCloud className="h-5 w-5 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex items-center"
                  onClick={handleRevokeAll}
                >
                  <Ban className="h-5 w-5 mr-2" />
                  Revoke All
                </Button>
              </div>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Active Tokens</CardTitle>
                <CardDescription>
                  Manage all active OAuth 2.0 tokens issued by your authorization server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by client, user, or scope"
                      className="pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.clientId}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Token (preview)</TableHead>
                        <TableHead>Scopes</TableHead>
                        <TableHead>Issued At</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTokens.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p>No active tokens found matching your criteria</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTokens.map((token) => (
                          <TableRow key={token.id}>
                            <TableCell>
                              <div className="font-medium">{token.clientName}</div>
                              <div className="text-sm text-gray-500">{token.clientId}</div>
                            </TableCell>
                            <TableCell>
                              {token.username ? (
                                <div>
                                  <div className="font-medium">{token.username}</div>
                                  <div className="text-sm text-gray-500">ID: {token.userId}</div>
                                </div>
                              ) : (
                                <span className="text-gray-500">Client Credentials</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <code className="text-xs bg-gray-100 p-1 rounded truncate max-w-[140px]">
                                  {token.accessToken}
                                </code>
                                <CopyButton 
                                  value={token.accessToken} 
                                  size="sm" 
                                  className="ml-1" 
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-6 w-6 ml-1"
                                  title="View full token"
                                >
                                  <Eye className="h-4 w-4 text-gray-400" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {token.scopes.split(' ').map((scope) => (
                                  <span key={scope} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    {scope}
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{formatDateTime(token.issuedAt)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-amber-500" />
                                <span>{getTimeRemaining(token.expiresAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRevokeToken(token.id)}
                              >
                                Revoke
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Token Security</CardTitle>
                  <CardDescription>Best practices for token management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Short Lifetimes</h4>
                    <p className="text-sm text-gray-600">
                      Use short access token lifetimes and refresh tokens to limit the impact of token compromise.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Scope Restrictions</h4>
                    <p className="text-sm text-gray-600">
                      Limit token scopes to only what is necessary for the client application.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Token Revocation</h4>
                    <p className="text-sm text-gray-600">
                      Implement token revocation when users log out or change permissions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Token Statistics</CardTitle>
                  <CardDescription>Overview of token usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Active Tokens</p>
                      <p className="text-2xl font-semibold">{tokens.length}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Unique Clients</p>
                      <p className="text-2xl font-semibold">
                        {new Set(tokens.map(t => t.clientId)).size}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Unique Users</p>
                      <p className="text-2xl font-semibold">
                        {tokens.filter(t => t.userId).length}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Avg Token Lifetime</p>
                      <p className="text-2xl font-semibold">1 hr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TokenManagementPage;
