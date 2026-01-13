import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div classNamemin-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-5">
      <div className="bg-bg-secondary rounded-xl p-10 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            TradeSphere
          </h1>
          <p className="text-gray-400 text-sm">Real-Time Stock Trading Platform</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-2xl font-semibold text-center">Register</h2>
          
          {error && (
            <div className="bg-danger/10 border border-danger text-danger p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block mb-2 text-gray-400 text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-bg-tertiary text-white focus:outline-none focus:border-primary transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block mb-2 text-gray-400 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-bg-tertiary text-white focus:outline-none focus:border-primary transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-2 text-gray-400 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-bg-tertiary text-white focus:outline-none focus:border-primary transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 text-gray-400 text-sm font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-bg-tertiary text-white focus:outline-none focus:border-primary transition"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
          
          <div className="text-center text-gray-400 text-sm">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition">
                Login
              </Link>
            
        </form>
      </div>
    </div>
  );
};

export default Register;
