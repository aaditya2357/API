import { FileText, Key, TrendingUp, AlertTriangle } from 'lucide-react';

interface StatusCardsProps {
  apiCount: number;
  clientCount: number;
  uptime: number;
  alertsCount: number;
}

const StatusCards: React.FC<StatusCardsProps> = ({ 
  apiCount, 
  clientCount, 
  uptime, 
  alertsCount 
}) => {
  return (
    <div className="flex flex-wrap -mx-6 mt-6">
      <div className="w-full md:w-1/2 xl:w-1/4 px-6 mb-6 xl:mb-0">
        <div className="status-card">
          <div className="status-card-icon-container bg-primary-100">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-gray-700">{apiCount}</h4>
            <div className="text-gray-500">Active APIs</div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 xl:w-1/4 px-6 mb-6 xl:mb-0">
        <div className="status-card">
          <div className="status-card-icon-container bg-secondary-100">
            <Key className="h-8 w-8 text-accent" />
          </div>
          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-gray-700">{clientCount}</h4>
            <div className="text-gray-500">Registered Clients</div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 xl:w-1/4 px-6 mb-6 xl:mb-0">
        <div className="status-card">
          <div className="status-card-icon-container bg-green-100">
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-gray-700">{uptime.toFixed(1)}%</h4>
            <div className="text-gray-500">Uptime</div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 xl:w-1/4 px-6 mb-6 xl:mb-0">
        <div className="status-card">
          <div className="status-card-icon-container bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-gray-700">{alertsCount}</h4>
            <div className="text-gray-500">Security Alerts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCards;
