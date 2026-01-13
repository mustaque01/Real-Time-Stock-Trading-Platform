import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ stock }) => {
  const { token } = useAuth();
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stock) {
      fetchChartData();
    }
  }, [stock, timeframe]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/stocks/${stock.symbol}/chart?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = response.data.data || [];
      
      const chartConfig = {
        labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [
          {
            label: stock.symbol,
            data: data.map(d => d.price),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };

      setChartData(chartConfig);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: `${stock.symbol} - ${stock.name}`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-bold">{stock.symbol} Chart</h3>
        <div className="flex gap-2">
          {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
            <button
              key={tf}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                timeframe === tf
                  ? 'bg-primary text-white'
                  : 'bg-bg-tertiary text-gray-400 hover:bg-bg-primary hover:text-white'
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[400px] relative">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            Loading chart...
          </div>
        ) : chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">
            Failed to load chart data
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-700">
        <div className="flex flex-col gap-1">
          <span className="text-gray-400 text-sm">Current Price:</span>
          <span className="text-lg font-semibold">${stock.price?.toFixed(2)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-400 text-sm">Change:</span>
          <span className={`text-lg font-semibold ${stock.change >= 0 ? 'text-positive' : 'text-negative'}`}>
            {stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2)} ({stock.changePercent?.toFixed(2)}%)
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-400 text-sm">Volume:</span>
          <span className="text-lg font-semibold">{stock.volume?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
