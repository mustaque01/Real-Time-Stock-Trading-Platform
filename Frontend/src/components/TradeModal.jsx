import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TradeModal = ({ stock, tradeType, onClose }) => {
  const { token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('MARKET');
  const [limitPrice, setLimitPrice] = useState(stock.price);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totalAmount = orderType === 'MARKET' 
    ? quantity * stock.price 
    : quantity * limitPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const orderData = {
        symbol: stock.symbol,
        type: tradeType,
        orderType,
        quantity,
        price: orderType === 'LIMIT' ? limitPrice : stock.price,
      };

      const response = await axios.post('/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setSuccess(`Order placed successfully! Order ID: ${response.data.orderId}`);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-bg-secondary rounded-xl w-[90%] max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">{tradeType} {stock.symbol}</h2>
          <button 
            className="text-gray-400 hover:text-white text-3xl leading-none w-8 h-8 flex items-center justify-center transition" 
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="bg-bg-tertiary p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Price:</span>
              <span className="text-2xl font-bold">${stock.price.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-gray-400 font-medium">Order Type</label>
              <select 
                value={orderType} 
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-bg-tertiary text-white focus:outline-none focus:border-primary"
              >
                <option value="MARKET">Market Order</option>
                <option value="LIMIT">Limit Order</option>
              </select>
            </div>

            {orderType === 'LIMIT' && (
              <div>
                <label className="block mb-2 text-gray-400 font-medium">Limit Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-bg-tertiary text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
            )}

            <div>
              <label className="block mb-2 text-gray-400 font-medium">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-bg-tertiary text-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="bg-bg-tertiary p-4 rounded-lg my-5">
              <div className="flex justify-between items-center text-base">
                <span>Total Amount:</span>
                <span className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger text-danger p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-success/10 border border-success text-success p-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                type="button" 
                className="flex-1 px-6 py-3 rounded-lg bg-transparent border border-gray-700 text-gray-400 font-semibold hover:bg-bg-tertiary hover:text-white transition"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`flex-1 px-6 py-3 rounded-lg text-white font-semibold transition ${
                  tradeType === 'BUY' 
                    ? 'bg-success hover:bg-success/80' 
                    : 'bg-danger hover:bg-danger/80'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : `${tradeType} ${stock.symbol}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
