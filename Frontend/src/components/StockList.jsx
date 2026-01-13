import React, { useEffect } from 'react';
import websocketService from '../services/websocket';
import '../styles/StockList.css';

const StockList = ({ stocks, onTrade, onSelectStock }) => {
  useEffect(() => {
    // Subscribe to all stocks
    stocks.forEach(stock => {
      websocketService.subscribeToStock(stock.symbol);
    });

    return () => {
      stocks.forEach(stock => {
        websocketService.unsubscribeFromStock(stock.symbol);
      });
    };
  }, [stocks]);

  const getPriceChangeClass = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="stock-list">
      <h2>Live Stocks</h2>
      
      <div className="stock-table">
        <div className="stock-table-header">
          <div>Symbol</div>
          <div>Price</div>
          <div>Change</div>
          <div>Volume</div>
          <div>Actions</div>
        </div>

        {stocks.map((stock) => (
          <div 
            key={stock.symbol} 
            className="stock-row"
            onClick={() => onSelectStock(stock)}
          >
            <div className="stock-symbol">
              <span className="symbol">{stock.symbol}</span>
              <span className="name">{stock.name}</span>
            </div>
            
            <div className="stock-price">
              ${stock.price?.toFixed(2) || '0.00'}
            </div>
            
            <div className={`stock-change ${getPriceChangeClass(stock.change)}`}>
              <span>{stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2) || '0.00'}</span>
              <span className="percentage">
                ({stock.changePercent > 0 ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%)
              </span>
            </div>
            
            <div className="stock-volume">
              {stock.volume?.toLocaleString() || '0'}
            </div>
            
            <div className="stock-actions">
              <button 
                className="btn-buy" 
                onClick={(e) => {
                  e.stopPropagation();
                  onTrade(stock, 'BUY');
                }}
              >
                Buy
              </button>
              <button 
                className="btn-sell"
                onClick={(e) => {
                  e.stopPropagation();
                  onTrade(stock, 'SELL');
                }}
              >
                Sell
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockList;
