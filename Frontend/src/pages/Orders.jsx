import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [trades, setTrades] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const response = await axios.get('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setOrders(response.data.orders || []);
      } else {
        const response = await axios.get('/api/trades', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setTrades(response.data.trades || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'FILLED':
        return 'bg-success/20 text-success';
      case 'PARTIAL':
        return 'bg-warning/20 text-warning';
      case 'PENDING':
        return 'bg-primary/20 text-primary';
      case 'CANCELLED':
        return 'bg-danger/20 text-danger';
      default:
        return '';
    }
  };

  const getTypeClass = (type) => {
    return type === 'BUY' ? 'text-success' : 'text-danger';
  };

  const cancelOrder = async (orderId) => {
    try {
      await axios.post(`/api/orders/${orderId}/cancel`, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="p-8 max-w-[1800px] mx-auto">
        <h1 className="text-3xl font-bold mb-8">Orders & Trades</h1>

        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button 
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'orders'
                ? 'text-white border-b-2 border-primary'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button 
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'trades'
                ? 'text-white border-b-2 border-primary'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('trades')}
          >
            Trade History
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10 text-gray-400">
            Loading...
          </div>
        ) : activeTab === 'orders' ? (
          <div className="bg-bg-secondary border border-gray-700 rounded-xl overflow-hidden">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p>No orders found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-10 gap-3 p-6 bg-bg-tertiary font-semibold text-gray-400 text-sm border-b border-gray-700">
                  <div>Order ID</div>
                  <div>Symbol</div>
                  <div>Type</div>
                  <div>Order Type</div>
                  <div>Quantity</div>
                  <div>Price</div>
                  <div>Filled</div>
                  <div>Status</div>
                  <div className="col-span-1">Date</div>
                  <div>Actions</div>
                </div>

                {orders.map((order) => (
                  <div key={order.id} className="grid grid-cols-10 gap-3 p-6 border-b border-gray-700 last:border-b-0 items-center text-sm">
                    <div className="font-mono text-gray-400 text-xs">{order.id.substring(0, 8)}</div>
                    <div className="font-bold">{order.symbol}</div>
                    <div className={`font-semibold ${getTypeClass(order.type)}`}>
                      {order.type}
                    </div>
                    <div>{order.orderType}</div>
                    <div>{order.quantity}</div>
                    <div>${order.price.toFixed(2)}</div>
                    <div>{order.filledQuantity || 0}</div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="col-span-1 text-xs">{new Date(order.createdAt).toLocaleString()}</div>
                    <div>
                      {(order.status === 'PENDING' || order.status === 'PARTIAL') && (
                        <button 
                          className="px-3 py-1.5 border border-danger text-danger rounded-lg text-xs font-semibold hover:bg-danger hover:text-white transition"
                          onClick={() => cancelOrder(order.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="bg-bg-secondary border border-gray-700 rounded-xl overflow-hidden">
            {trades.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p>No trades found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-4 p-6 bg-bg-tertiary font-semibold text-gray-400 text-sm border-b border-gray-700">
                  <div>Trade ID</div>
                  <div>Symbol</div>
                  <div>Type</div>
                  <div>Quantity</div>
                  <div>Price</div>
                  <div>Total</div>
                  <div className="col-span-1">Date</div>
                </div>

                {trades.map((trade) => (
                  <div key={trade.id} className="grid grid-cols-7 gap-4 p-6 border-b border-gray-700 last:border-b-0 items-center text-sm">
                    <div className="font-mono text-gray-400 text-xs">{trade.id.substring(0, 8)}</div>
                    <div className="font-bold">{trade.symbol}</div>
                    <div className={`font-semibold ${getTypeClass(trade.type)}`}>
                      {trade.type}
                    </div>
                    <div>{trade.quantity}</div>
                    <div>${trade.price.toFixed(2)}</div>
                    <div>${(trade.quantity * trade.price).toFixed(2)}</div>
                    <div className="col-span-1 text-xs">{new Date(trade.executedAt).toLocaleString()}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
