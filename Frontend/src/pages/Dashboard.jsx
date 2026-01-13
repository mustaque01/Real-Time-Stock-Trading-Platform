import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StockList from '../components/StockList';
import TradeModal from '../components/TradeModal';
import StockChart from '../components/StockChart';
import websocketService from '../services/websocket';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');

  useEffect(() => {
    // Connect WebSocket
    websocketService.connect(token);

    // Subscribe to stock price updates
    const unsubscribe = websocketService.subscribe('stockPrice', (data) => {
      setStocks(prevStocks => {
        const stockIndex = prevStocks.findIndex(s => s.symbol === data.symbol);
        if (stockIndex >= 0) {
          const newStocks = [...prevStocks];
          newStocks[stockIndex] = { ...newStocks[stockIndex], ...data };
          return newStocks;
        }
        return prevStocks;
      });
    });

    // Fetch initial stocks
    fetchStocks();

    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, [token]);

  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/stocks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStocks(data.stocks || []);
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    }
  };

  const handleTrade = (stock, type) => {
    setSelectedStock(stock);
    setTradeType(type);
    setShowTradeModal(true);
  };

  const handleCloseModal = () => {
    setShowTradeModal(false);
    setSelectedStock(null);
  };

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Market Overview</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="stocks-section">
            <StockList 
              stocks={stocks} 
              onTrade={handleTrade}
              onSelectStock={setSelectedStock}
            />
          </div>

          <div className="chart-section">
            {selectedStock ? (
              <StockChart stock={selectedStock} />
            ) : (
              <div className="no-stock-selected">
                <p>Select a stock to view its chart</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showTradeModal && (
        <TradeModal
          stock={selectedStock}
          tradeType={tradeType}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
