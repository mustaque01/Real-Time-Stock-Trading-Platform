import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import '../styles/Wallet.css';

const Wallet = () => {
  const { token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        axios.get('/api/wallet/balance', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        axios.get('/api/wallet/transactions', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      setBalance(balanceRes.data.balance || 0);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);

    try {
      const endpoint = activeTab === 'deposit' ? '/api/wallet/deposit' : '/api/wallet/withdraw';
      const response = await axios.post(
        endpoint,
        { amount: parseFloat(amount) },
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      setMessage({ 
        type: 'success', 
        text: `Successfully ${activeTab === 'deposit' ? 'deposited' : 'withdrew'} $${amount}` 
      });
      setAmount('');
      fetchWalletData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || `Failed to ${activeTab}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionClass = (type) => {
    if (type === 'DEPOSIT' || type === 'SELL') return 'credit';
    if (type === 'WITHDRAW' || type === 'BUY') return 'debit';
    return '';
  };

  const formatTransactionAmount = (transaction) => {
    const prefix = (transaction.type === 'DEPOSIT' || transaction.type === 'SELL') ? '+' : '-';
    return `${prefix}$${Math.abs(transaction.amount).toFixed(2)}`;
  };

  return (
    <div className="wallet-page">
      <Navbar />
      
      <div className="wallet-content">
        <h1>Wallet</h1>

        <div className="wallet-balance-card">
          <span className="balance-label">Available Balance</span>
          <span className="balance-amount">${balance.toFixed(2)}</span>
        </div>

        <div className="wallet-actions">
          <div className="tabs">
            <button 
              className={activeTab === 'deposit' ? 'active' : ''}
              onClick={() => {
                setActiveTab('deposit');
                setMessage({ type: '', text: '' });
              }}
            >
              Deposit
            </button>
            <button 
              className={activeTab === 'withdraw' ? 'active' : ''}
              onClick={() => {
                setActiveTab('withdraw');
                setMessage({ type: '', text: '' });
              }}
            >
              Withdraw
            </button>
          </div>

          <form onSubmit={handleTransaction} className="transaction-form">
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <div className="input-wrapper">
                <span className="currency">$</span>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              className={`btn-submit ${activeTab}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </button>
          </form>
        </div>

        <div className="transactions-section">
          <h2>Transaction History</h2>
          
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-type">{transaction.type}</span>
                    <span className="transaction-date">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className={`transaction-amount ${getTransactionClass(transaction.type)}`}>
                    {formatTransactionAmount(transaction)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
