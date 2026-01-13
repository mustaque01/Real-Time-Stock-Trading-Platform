import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-bg-secondary border-b border-gray-700 flex justify-between items-center px-8 h-16 sticky top-0 z-50">
      <div className="flex items-center">
        <Link to="/dashboard">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            TradeSphere
          </h2>
        </Link>
      </div>

      <ul className="flex gap-8">
        <li>
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isActive('/dashboard')
                ? 'text-white bg-bg-tertiary'
                : 'text-gray-400 hover:text-white hover:bg-bg-tertiary'
            }`}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/portfolio"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isActive('/portfolio')
                ? 'text-white bg-bg-tertiary'
                : 'text-gray-400 hover:text-white hover:bg-bg-tertiary'
            }`}
          >
            Portfolio
          </Link>
        </li>
        <li>
          <Link
            to="/wallet"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isActive('/wallet')
                ? 'text-white bg-bg-tertiary'
                : 'text-gray-400 hover:text-white hover:bg-bg-tertiary'
            }`}
          >
            Wallet
          </Link>
        </li>
        <li>
          <Link
            to="/orders"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isActive('/orders')
                ? 'text-white bg-bg-tertiary'
                : 'text-gray-400 hover:text-white hover:bg-bg-tertiary'
            }`}
          >
            Orders
          </Link>
        </li>
      </ul>

      <div>
        <button
          onClick={handleLogout}
          className="px-5 py-2 border border-gray-700 text-gray-400 rounded-lg hover:border-danger hover:text-danger transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
