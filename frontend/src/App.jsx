import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './pages/components/Sidebar';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import DevTools from './pages/DevTools';
import CreateDate from './pages/CreateDate';

function PrivateRoute({ children }) {
  return localStorage.getItem('user') ? children : <Navigate to="/" />;
}

function PageShell({ title, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-right">
        <header className="app-header">
          <span className="app-header-title">{title}</span>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><PageShell title="Profile"><Profile /></PageShell></PrivateRoute>} />
      <Route path="/create-date" element={<PrivateRoute><PageShell title="Create Date"><CreateDate /></PageShell></PrivateRoute>} />
      {import.meta.env.DEV && <Route path="/dev" element={<PageShell title="Dev Tools"><DevTools /></PageShell>} />}
    </Routes>
  );
}

export default App;