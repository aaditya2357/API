import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Edit, Eye } from 'lucide-react';
import { ApiEndpoint } from '@shared/schema';
import { getApiEndpoints } from '@/lib/api';
import CopyButton from '@/components/ui/copy-button';

interface ApiEndpointsListProps {
  onEdit?: (endpoint: ApiEndpoint) => void;
  onView?: (endpoint: ApiEndpoint) => void;
}

const ApiEndpointsList: React.FC<ApiEndpointsListProps> = ({ onEdit, onView }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Match the design with 4 items per page
  
  const { data: endpoints, isLoading, error } = useQuery({
    queryKey: ['/api/admin/endpoints'],
    queryFn: getApiEndpoints
  });

  if (isLoading) {
    return <div className="py-8 text-center">Loading API endpoints...</div>;
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Error loading API endpoints. Please try again.
      </div>
    );
  }

  if (!endpoints || endpoints.length === 0) {
    return <div className="py-8 text-center">No API endpoints found.</div>;
  }

  // Calculate pagination
  const totalPages = Math.ceil(endpoints.length / itemsPerPage);
  const paginatedEndpoints = endpoints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'method-badge get';
      case 'POST': return 'method-badge post';
      case 'PUT': return 'method-badge put';
      case 'DELETE': return 'method-badge delete';
      default: return 'method-badge get';
    }
  };

  const getAuthBadgeClass = (authType: string) => {
    switch (authType.toLowerCase()) {
      case 'oauth2': return 'auth-badge oauth2';
      case 'public': return 'auth-badge public';
      default: return 'auth-badge oauth2';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'status-badge active';
      case 'pending': return 'status-badge pending';
      case 'inactive': return 'status-badge inactive';
      default: return 'status-badge active';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedEndpoints.map((endpoint) => (
            <TableRow key={endpoint.id}>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                <div className="text-sm text-gray-500">{endpoint.service}</div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm text-gray-900 font-mono mr-2">{endpoint.endpoint}</div>
                  <CopyButton value={endpoint.endpoint} size="sm" className="ml-1" />
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <span className={getMethodBadgeClass(endpoint.method)}>{endpoint.method}</span>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <span className={getAuthBadgeClass(endpoint.authType)}>{endpoint.authType}</span>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadgeClass(endpoint.status)}>{endpoint.status}</span>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary-600 mr-2"
                  onClick={() => onEdit && onEdit(endpoint)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-600"
                  onClick={() => onView && onView(endpoint)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, endpoints.length)}
              </span>{' '}
              of <span className="font-medium">{endpoints.length}</span> results
            </p>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(index + 1);
                    }}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default ApiEndpointsList;
