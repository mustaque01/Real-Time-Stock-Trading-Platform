import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import '../styles/Orders.css';

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
        return 'status-filled';
      case 'PARTIAL':
        return 'status-partial';
      case 'PENDING':
        return 'status-pending';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getTypeClass = (type) => {
    return type === 'BUY' ? 'type-buy' : 'type-sell';
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
    <div className="orders-page">
      <Navbar />
      
      <div className="orders-content">
        <h1>Orders & Trades</h1>

        <div className="tabs">
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button 
            className={activeTab === 'trades' ? 'active' : ''}
            onClick={() => setActiveTab('trades')}
          >
            Trade History
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : activeTab === 'orders' ? (
          <div className="orders-table">
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>No orders found</p>
              </div>
            ) : (
              <>
                <div className="table-header">
                  <div>Order ID</div>
                  <div>Symbol</div>
                  <div>Type</div>
                  <div>Order Type</div>
                  <div>Quantity</div>
                  <div>Price</div>
                  <div>Filled</div>
                  <div>Status</div>
                  <div>Date</div>
                  <div>Actions</div>
                </div>

                {orders.map((order) => (
                  <div key={order.id} className="table-row">
                    <div className="order-id">{order.id.substring(0, 8)}</div>
                    <div className="symbol">{order.symbol}</div>
                    <div className={getTypeClass(order.type)}>
                      {order.type}
                    </div>
                    <div>{order.orderType}</div>
                    <div>{order.quantity}</div>
                    <div>${order.price.toFixed(2)}</div>
                    <div>{order.filledQuantity || 0}</div>
                    <div>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div>{new Date(order.createdAt).toLocaleString()}</div>
                    <div>
                      {(order.status === 'PENDING' || order.status === 'PARTIAL') && (
                        <button 
                          className="btn-cancel"
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
          <div className="trades-table">
            {trades.length === 0 ? (
              <div className="empty-state">
                <p>No trades found</p>
              </div>
            ) : (
              <>
                <div className="table-header">
                  <div>Trade ID</div>
                  <div>Symbol</div>
                  <div>Type</div>
                  <div>Quantity</div>
                  <div>Price</div>
                  <div>Total</div>
                  <div>Date</div>
                </div>

                {trades.map((trade) => (
                  <div key={trade.id} className="table-row">
                    <div className="trade-id">{trade.id.substring(0, 8)}</div>
                    <div className="symbol">{trade.symbol}</div>
                    <div className={getTypeClass(trade.type)}>
                      {trade.type}
                    </div>
                    <div>{trade.quantity}</div>
                    <div>${trade.price.toFixed(2)}</div>
                    <div>${(trade.quantity * trade.price).toFixed(2)}</div>
                    <div>{new Date(trade.executedAt).toLocaleString()}</div>
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
