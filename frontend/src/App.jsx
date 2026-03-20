import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './pages/components/navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import DevTools from './pages/DevTools';

function PrivateRoute({ children }) {
  return localStorage.getItem('user') ? children : <Navigate to="/" />;
}

function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/' && <Navbar />}
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
          {import.meta.env.DEV ? <Route path="/dev" element={<DevTools />} /> : null}
        </Routes>
      </main>
    </>
  );
}

export default App;