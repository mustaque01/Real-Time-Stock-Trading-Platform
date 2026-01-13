import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <h2>TradeSphere</h2>
        </Link>
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/dashboard" className={isActive('/dashboard')}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/portfolio" className={isActive('/portfolio')}>
            Portfolio
          </Link>
        </li>
        <li>
          <Link to="/wallet" className={isActive('/wallet')}>
            Wallet
          </Link>
        </li>
        <li>
          <Link to="/orders" className={isActive('/orders')}>
            Orders
          </Link>
        </li>
      </ul>

      <div className="navbar-actions">
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
