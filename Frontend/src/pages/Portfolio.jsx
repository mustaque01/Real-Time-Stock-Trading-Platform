import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Portfolio = () => {
  const { token } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalInvestment: 0,
    totalPL: 0,
    totalPLPercent: 0,
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('/api/portfolio', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const holdings = response.data.holdings || [];
      setPortfolio(holdings);
      
      // Calculate stats
      const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
      const totalInvestment = holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
      const totalPL = totalValue - totalInvestment;
      const totalPLPercent = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;

      setStats({
        totalValue,
        totalInvestment,
        totalPL,
        totalPLPercent,
      });
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPLClass = (value) => {
    if (value > 0) return 'text-positive';
    if (value < 0) return 'text-negative';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="p-8 max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Portfolio</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-bg-secondary border border-gray-700 rounded-xl p-6 flex flex-col gap-2">
            <span className="text-gray-400 text-sm font-medium">Total Value</span>
            <span className="text-3xl font-bold">${stats.totalValue.toFixed(2)}</span>
          </div>
          <div className="bg-bg-secondary border border-gray-700 rounded-xl p-6 flex flex-col gap-2">
            <span className="text-gray-400 text-sm font-medium">Total Investment</span>
            <span className="text-3xl font-bold">${stats.totalInvestment.toFixed(2)}</span>
          </div>
          <div className="bg-bg-secondary border border-gray-700 rounded-xl p-6 flex flex-col gap-2">
            <span className="text-gray-400 text-sm font-medium">Total P&L</span>
            <span className={`text-3xl font-bold ${getPLClass(stats.totalPL)}`}>
              {stats.totalPL > 0 ? '+' : ''}${stats.totalPL.toFixed(2)}
            </span>
          </div>
          <div className="bg-bg-secondary border border-gray-700 rounded-xl p-6 flex flex-col gap-2">
            <span className="text-gray-400 text-sm font-medium">P&L %</span>
            <span className={`text-3xl font-bold ${getPLClass(stats.totalPLPercent)}`}>
              {stats.totalPLPercent > 0 ? '+' : ''}{stats.totalPLPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10 text-gray-400">
            Loading portfolio...
          </div>
        ) : portfolio.length === 0 ? (
          <div className="bg-bg-secondary border border-gray-700 rounded-xl p-16 text-center text-gray-400">
            <p>You don't have any holdings yet. Start trading to build your portfolio!</p>
          </div>
        ) : (
          <div className="bg-bg-secondary border border-gray-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-8 gap-4 p-6 bg-bg-tertiary font-semibold text-gray-400 text-sm border-b border-gray-700">
              <div className="col-span-2">Symbol</div>
              <div>Quantity</div>
              <div>Avg Price</div>
              <div>Current Price</div>
              <div>Investment</div>
              <div>Current Value</div>
              <div>P&L</div>
            </div>

            {portfolio.map((holding) => {
              const investment = holding.quantity * holding.avgPrice;
              const currentValue = holding.quantity * holding.currentPrice;
              const pl = currentValue - investment;
              const plPercent = (pl / investment) * 100;

              return (
                <div key={holding.symbol} className="grid grid-cols-8 gap-4 p-6 border-b border-gray-700 last:border-b-0 items-center text-sm">
                  <div className="col-span-2 flex flex-col">
                    <span className="font-bold text-base">{holding.symbol}</span>
                    <span className="text-gray-400 text-xs mt-0.5">{holding.name}</span>
                  </div>
                  <div>{holding.quantity}</div>
                  <div>${holding.avgPrice.toFixed(2)}</div>
                  <div>${holding.currentPrice.toFixed(2)}</div>
                  <div>${investment.toFixed(2)}</div>
                  <div>${currentValue.toFixed(2)}</div>
                  <div className="flex flex-col">
                    <span className={getPLClass(pl)}>
                      {pl > 0 ? '+' : ''}${pl.toFixed(2)}
                    </span>
                    <span className={`text-xs ${getPLClass(plPercent)}`}>
                      ({plPercent > 0 ? '+' : ''}{plPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
