import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './pages/components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import DevTools from './pages/DevTools';
import CreateDate from './pages/CreateDate';

function PrivateRoute({ children }) {
  return localStorage.getItem('user') ? children : <Navigate to="/" />;
}

function App() {
  const location = useLocation();

  return (
    <>
      {/* Navbar temporarily removed — navigation moved to sidebar */}
      {/* {location.pathname !== '/' && <Navbar />} */}
      <main className="page-content page-content--no-nav">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
          <Route path="/create-date" element={<PrivateRoute><CreateDate /></PrivateRoute>} />
          {import.meta.env.DEV ? <Route path="/dev" element={<DevTools />} /> : null}
        </Routes>
      </main>
    </>
  );
}

export default App;