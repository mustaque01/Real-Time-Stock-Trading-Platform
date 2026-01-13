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
import '../styles/StockChart.css';

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
    <div className="stock-chart">
      <div className="chart-header">
        <h3>{stock.symbol} Chart</h3>
        <div className="timeframe-selector">
          {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
            <button
              key={tf}
              className={timeframe === tf ? 'active' : ''}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        {loading ? (
          <div className="chart-loading">Loading chart...</div>
        ) : chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="chart-error">Failed to load chart data</div>
        )}
      </div>

      <div className="stock-details">
        <div className="detail-item">
          <span className="label">Current Price:</span>
          <span className="value">${stock.price?.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Change:</span>
          <span className={`value ${stock.change >= 0 ? 'positive' : 'negative'}`}>
            {stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2)} ({stock.changePercent?.toFixed(2)}%)
          </span>
        </div>
        <div className="detail-item">
          <span className="label">Volume:</span>
          <span className="value">{stock.volume?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
