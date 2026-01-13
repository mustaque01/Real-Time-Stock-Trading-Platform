import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

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
    if (type === 'DEPOSIT' || type === 'SELL') return 'text-positive';
    if (type === 'WITHDRAW' || type === 'BUY') return 'text-negative';
    return '';
  };

  const formatTransactionAmount = (transaction) => {
    const prefix = (transaction.type === 'DEPOSIT' || transaction.type === 'SELL') ? '+' : '-';
    return `${prefix}$${Math.abs(transaction.amount).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet</h1>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-10 flex flex-col gap-3 mb-8 shadow-lg">
          <span className="text-sm opacity-90 font-medium">Available Balance</span>
          <span className="text-5xl font-bold">${balance.toFixed(2)}</span>
        </div>

        <div className="bg-bg-secondary border border-gray-700 rounded-xl p-8 mb-8">
          <div className="flex gap-4 mb-6 border-b border-gray-700">
            <button 
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'deposit'
                  ? 'text-white border-b-2 border-primary'
                  : 'text-gray-400'
              }`}
              onClick={() => {
                setActiveTab('deposit');
                setMessage({ type: '', text: '' });
              }}
            >
              Deposit
            </button>
            <button 
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'withdraw'
                  ? 'text-white border-b-2 border-primary'
                  : 'text-gray-400'
              }`}
              onClick={() => {
                setActiveTab('withdraw');
                setMessage({ type: '', text: '' });
              }}
            >
              Withdraw
            </button>
          </div>

          <form onSubmit={handleTransaction} className="max-w-lg space-y-5">
            <div>
              <label htmlFor="amount" className="block mb-2 text-gray-400 font-medium">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-700 rounded-lg bg-bg-tertiary text-white font-semibold text-base focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-success/10 border border-success text-success'
                  : 'bg-danger/10 border border-danger text-danger'
              }`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              className={`w-full py-3.5 rounded-lg text-white font-semibold text-base transition transform hover:-translate-y-0.5 ${
                activeTab === 'deposit'
                  ? 'bg-success hover:bg-success/80'
                  : 'bg-danger hover:bg-danger/80'
              } disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none`}
              disabled={loading}
            >
              {loading ? 'Processing...' : activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </button>
          </form>
        </div>

        <div className="bg-bg-secondary border border-gray-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-px">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-4 bg-bg-primary border-b border-gray-700 last:border-b-0 first:rounded-t-lg last:rounded-b-lg">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{transaction.type}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className={`font-bold text-lg ${getTransactionClass(transaction.type)}`}>
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
