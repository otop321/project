"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface HistoryData {
  timestamp: string;
  temp: number;
  humidity: number;
  pm25: number;
  light: number;
  gas: number;
}

interface SensorChartProps {
  data: HistoryData[];
  dataKey: keyof Omit<HistoryData, "timestamp">;
  title: string;
  color: string;
}

export default function SensorChart({ data, dataKey, title, color }: SensorChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="bg-gray-800/40 rounded-2xl p-6 border border-white/5 backdrop-blur-sm shadow-xl h-[300px] flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }}></span>
        {title} History
      </h3>
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              width={30}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              itemStyle={{ color: '#F3F4F6' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color${dataKey})`}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
