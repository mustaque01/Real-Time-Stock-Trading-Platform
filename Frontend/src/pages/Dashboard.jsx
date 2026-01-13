import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StockList from '../components/StockList';
import TradeModal from '../components/TradeModal';
import StockChart from '../components/StockChart';
import websocketService from '../services/websocket';

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
    <div className="min-h-screen">
      <Navbar />
      
      <div className="p-8 max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Market Overview</h1>
          <div className="text-gray-400">
            <span>Welcome, {user?.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-secondary rounded-xl p-6 border border-gray-700">
            <StockList 
              stocks={stocks} 
              onTrade={handleTrade}
              onSelectStock={setSelectedStock}
            />
          </div>

          <div className="bg-bg-secondary rounded-xl p-6 border border-gray-700">
            {selectedStock ? (
              <StockChart stock={selectedStock} />
            ) : (
              <div className="flex justify-center items-center h-96 text-gray-400">
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
