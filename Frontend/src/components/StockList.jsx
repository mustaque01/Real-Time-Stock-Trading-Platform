import React, { useEffect } from 'react';
import websocketService from '../services/websocket';

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
    if (change > 0) return 'text-positive';
    if (change < 0) return 'text-negative';
    return 'text-gray-400';
  };

  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold">Live Stocks</h2>
      
      <div className="flex flex-col gap-px">
        <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1.5fr] gap-4 p-4 bg-bg-tertiary rounded-t-lg font-semibold text-gray-400 text-sm">
          <div>Symbol</div>
          <div>Price</div>
          <div>Change</div>
          <div>Volume</div>
          <div>Actions</div>
        </div>

        {stocks.map((stock) => (
          <div 
            key={stock.symbol} 
            className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1.5fr] gap-4 p-4 bg-bg-primary border-b border-gray-700 cursor-pointer hover:bg-bg-tertiary transition items-center"
            onClick={() => onSelectStock(stock)}
          >
            <div className="flex flex-col">
              <span className="text-base font-bold">{stock.symbol}</span>
              <span className="text-gray-400 text-xs mt-0.5">{stock.name}</span>
            </div>
            
            <div className="text-base font-semibold">
              ${stock.price?.toFixed(2) || '0.00'}
            </div>
            
            <div className={`flex flex-col gap-0.5 ${getPriceChangeClass(stock.change)}`}>
              <span>{stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2) || '0.00'}</span>
              <span className="text-xs">
                ({stock.changePercent > 0 ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%)
              </span>
            </div>
            
            <div>
              {stock.volume?.toLocaleString() || '0'}
            </div>
            
            <div className="flex gap-2">
              <button 
                className="px-4 py-1.5 bg-success hover:bg-success/80 text-white rounded-lg text-sm font-semibold transition transform hover:-translate-y-0.5" 
                onClick={(e) => {
                  e.stopPropagation();
                  onTrade(stock, 'BUY');
                }}
              >
                Buy
              </button>
              <button 
                className="px-4 py-1.5 bg-danger hover:bg-danger/80 text-white rounded-lg text-sm font-semibold transition transform hover:-translate-y-0.5"
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
