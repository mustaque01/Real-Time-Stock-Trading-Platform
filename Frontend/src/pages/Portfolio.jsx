import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import '../styles/Portfolio.css';

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
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="portfolio-page">
      <Navbar />
      
      <div className="portfolio-content">
        <h1>My Portfolio</h1>

        <div className="portfolio-stats">
          <div className="stat-card">
            <span className="stat-label">Total Value</span>
            <span className="stat-value">${stats.totalValue.toFixed(2)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Investment</span>
            <span className="stat-value">${stats.totalInvestment.toFixed(2)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total P&L</span>
            <span className={`stat-value ${getPLClass(stats.totalPL)}`}>
              {stats.totalPL > 0 ? '+' : ''}${stats.totalPL.toFixed(2)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">P&L %</span>
            <span className={`stat-value ${getPLClass(stats.totalPLPercent)}`}>
              {stats.totalPLPercent > 0 ? '+' : ''}{stats.totalPLPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading portfolio...</div>
        ) : portfolio.length === 0 ? (
          <div className="empty-portfolio">
            <p>You don't have any holdings yet. Start trading to build your portfolio!</p>
          </div>
        ) : (
          <div className="holdings-table">
            <div className="table-header">
              <div>Symbol</div>
              <div>Quantity</div>
              <div>Avg Price</div>
              <div>Current Price</div>
              <div>Investment</div>
              <div>Current Value</div>
              <div>P&L</div>
              <div>P&L %</div>
            </div>

            {portfolio.map((holding) => {
              const investment = holding.quantity * holding.avgPrice;
              const currentValue = holding.quantity * holding.currentPrice;
              const pl = currentValue - investment;
              const plPercent = (pl / investment) * 100;

              return (
                <div key={holding.symbol} className="table-row">
                  <div className="stock-symbol">
                    <span className="symbol">{holding.symbol}</span>
                    <span className="name">{holding.name}</span>
                  </div>
                  <div>{holding.quantity}</div>
                  <div>${holding.avgPrice.toFixed(2)}</div>
                  <div>${holding.currentPrice.toFixed(2)}</div>
                  <div>${investment.toFixed(2)}</div>
                  <div>${currentValue.toFixed(2)}</div>
                  <div className={getPLClass(pl)}>
                    {pl > 0 ? '+' : ''}${pl.toFixed(2)}
                  </div>
                  <div className={getPLClass(plPercent)}>
                    {plPercent > 0 ? '+' : ''}{plPercent.toFixed(2)}%
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
