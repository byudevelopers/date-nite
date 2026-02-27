import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './pages/components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';

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
        </Routes>
      </main>
    </>
  );
}

export default App;