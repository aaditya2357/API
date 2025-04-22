import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface ApiTrafficChartProps {
  // Would typically fetch this data from the API
  successfulRequests?: number[];
  failedRequests?: number[];
  timeLabels?: string[];
  totalRequests?: number;
  avgResponseTime?: number;
}

const ApiTrafficChart: React.FC<ApiTrafficChartProps> = ({ 
  successfulRequests: initialSuccessfulRequests, 
  failedRequests: initialFailedRequests,
  timeLabels: initialTimeLabels,
  totalRequests = 124856,
  avgResponseTime = 267
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  
  // Generate sample data if not provided
  const generateHourlyLabels = () => Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const generateDailyLabels = () => Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }).reverse();
  const generateMonthlyLabels = () => Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }).reverse();
  
  const generateSuccessData = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 300) + 100);
  };
  
  const generateErrorData = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 20) + 5);
  };
  
  const [successfulRequests, setSuccessfulRequests] = useState(
    initialSuccessfulRequests || generateSuccessData(24)
  );
  const [failedRequests, setFailedRequests] = useState(
    initialFailedRequests || generateErrorData(24)
  );
  const [timeLabels, setTimeLabels] = useState(
    initialTimeLabels || generateHourlyLabels()
  );

  // Create or update chart when data changes
  useEffect(() => {
    if (chartRef.current) {
      // If chart already exists, destroy it
      if (chartInstance) {
        chartInstance.destroy();
      }
      
      // Create new chart
      const newChartInstance = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: timeLabels,
          datasets: [
            {
              label: 'Successful Requests',
              data: successfulRequests,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Failed Requests',
              data: failedRequests,
              borderColor: '#F44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
      
      setChartInstance(newChartInstance);
    }
    
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [successfulRequests, failedRequests, timeLabels]);

  // Update data when time range changes
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    
    switch (value) {
      case '24h':
        setTimeLabels(generateHourlyLabels());
        setSuccessfulRequests(generateSuccessData(24));
        setFailedRequests(generateErrorData(24));
        break;
      case '7d':
        setTimeLabels(generateDailyLabels());
        setSuccessfulRequests(generateSuccessData(7));
        setFailedRequests(generateErrorData(7));
        break;
      case '30d':
        setTimeLabels(generateMonthlyLabels());
        setSuccessfulRequests(generateSuccessData(30));
        setFailedRequests(generateErrorData(30));
        break;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-gray-700">API Traffic</CardTitle>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <canvas ref={chartRef} height={300}></canvas>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Total Requests</p>
            <p className="text-xl font-semibold">{totalRequests.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Avg. Response Time</p>
            <p className="text-xl font-semibold">{avgResponseTime}ms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTrafficChart;
