# TradeSphere Frontend

Real-Time Stock Trading Platform - Frontend Application

## 📋 Overview

TradeSphere is a modern, real-time stock trading platform built with React. It provides users with live stock data, portfolio management, order tracking, and wallet functionality.

## ✨ Features

- **User Authentication** (Login/Register with dummy auth for testing)
- **Live Stock Data** - Real-time price updates via WebSocket
- **Interactive Charts** - Visualize stock price movements
- **Trading Interface** - Buy and sell stocks with ease
- **Portfolio Management** - Track your investments
- **Order History** - View past transactions
- **Wallet Management** - Add funds and manage balance
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

- **React 18.2** - UI framework
- **React Router 6** - Navigation
- **Vite 5** - Build tool and dev server
- **TailwindCSS 4** - Styling
- **Axios** - HTTP client
- **Chart.js & Recharts** - Data visualization
- **Socket.IO Client** - WebSocket connections
- **Lucide React** - Icons

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Real-Time Stock Trading Platform/Frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
Frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── StockChart.jsx      # Stock price chart
│   │   ├── StockList.jsx       # List of stocks
│   │   └── TradeModal.jsx      # Buy/Sell modal
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication state management
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── Portfolio.jsx       # Portfolio view
│   │   ├── Orders.jsx          # Order history
│   │   └── Wallet.jsx          # Wallet management
│   ├── services/
│   │   └── websocket.js        # WebSocket service
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## ⚙️ Configuration

### TailwindCSS Custom Colors

The app uses custom color scheme defined in `index.css`:

- **Primary**: `#1a73e8`
- **Success**: `#0f9d58`
- **Danger**: `#db4437`
- **Warning**: `#f4b400`
- **Background**: `#0a0e27`, `#131b3a`, `#1a2342`
- **Positive**: `#00ff88`
- **Negative**: `#ff4444`

## 🔐 Authentication (Current Setup)

**⚠️ TEMPORARY DUMMY AUTHENTICATION**

Currently, the app uses dummy authentication for testing purposes (no backend required).

### How to Login:
1. Go to login page
2. Enter **any email and password** (anything will work)
   - Example: `test@example.com` / `password123`
3. Click Login
4. You'll be redirected to dashboard with ₹50,000 balance

### How it Works:
- Creates a dummy token and stores in localStorage
- Creates a test user with default balance
- No validation against real database

### When Backend is Ready:
Uncomment the real API calls in `AuthContext.jsx` and remove dummy authentication code.

## 📡 WebSocket Service

The WebSocket service (`websocket.js`) handles real-time stock data:

- Connects to WebSocket server
- Subscribes to stock updates
- Provides callback mechanism for price updates

**Note**: Configure WebSocket URL in `websocket.js` when backend is ready.

## 🎨 Styling

- TailwindCSS 4 with custom configuration
- CSS custom properties for theme colors
- Responsive design with mobile-first approach
- Dark theme optimized

## 🚧 Future Enhancements

- [ ] Connect to real backend API
- [ ] Real-time notifications
- [ ] Advanced charting with indicators
- [ ] Multiple theme options
- [ ] Trading analytics
- [ ] Watchlist feature
- [ ] Price alerts
- [ ] Social trading features

## 🐛 Known Issues

- Backend not implemented (dummy auth in use)
- WebSocket not connected (needs backend)
- Stock data is static (needs real API)

## 📝 Environment Variables

Create a `.env` file if needed:

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is for educational purposes.

---

**Note**: This is a frontend-only implementation. Backend development is pending.
