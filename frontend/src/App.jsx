import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './pages/components/navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import DevTools from './pages/DevTools';

function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/' && <Navbar />}
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorites" element={<Favorites />} />
          {import.meta.env.DEV ? <Route path="/dev" element={<DevTools />} /> : null}
        </Routes>
      </main>
    </>
  );
}

export default App;