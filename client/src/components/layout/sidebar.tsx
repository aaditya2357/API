import { useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  FileText, 
  Key, 
  Clock, 
  UserCircle, 
  BarChart3, 
  AlertTriangle, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path ? 'active' : '';
  };

  return (
    <div className="w-64 bg-primary text-white h-screen flex-shrink-0 md:block hidden">
      <div className="flex items-center justify-center h-16 border-b border-primary-600">
        <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xl font-semibold">API Gateway</span>
      </div>
      <nav className="mt-5">
        <a href="/" className={`sidebar-link ${isActive('/')}`}>
          <LayoutDashboard className="sidebar-icon" />
          Dashboard
        </a>
        <a href="/apis" className={`sidebar-link ${isActive('/apis')}`}>
          <FileText className="sidebar-icon" />
          API Endpoints
        </a>
        <a href="/oauth-config" className={`sidebar-link ${isActive('/oauth-config')}`}>
          <Key className="sidebar-icon" />
          OAuth Configuration
        </a>
        <a href="/clients" className={`sidebar-link ${isActive('/clients')}`}>
          <UserCircle className="sidebar-icon" />
          Client Applications
        </a>
        <a href="/tokens" className={`sidebar-link ${isActive('/tokens')}`}>
          <Clock className="sidebar-icon" />
          Token Management
        </a>
        <div className="px-4 py-2 text-xs text-primary-200 mt-6">MONITORING</div>
        <a href="/analytics" className={`sidebar-link ${isActive('/analytics')}`}>
          <BarChart3 className="sidebar-icon" />
          Analytics
        </a>
        <a href="/rate-limiting" className={`sidebar-link ${isActive('/rate-limiting')}`}>
          <Clock className="sidebar-icon" />
          Rate Limiting
        </a>
        <a href="/logs" className={`sidebar-link ${isActive('/logs')}`}>
          <AlertTriangle className="sidebar-icon" />
          Alerts & Logs
        </a>
        <a href="/settings" className={`sidebar-link ${isActive('/settings')}`}>
          <Settings className="sidebar-icon" />
          Settings
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
