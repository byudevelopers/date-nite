import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { checkHealth, logoutUser } from '../../services/api';

function Navbar() {
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleLogout = async () => {
    // Call backend logout endpoint to clear cookie
    await logoutUser();

    // Clear any user data from localStorage
    localStorage.removeItem('user');

    // Navigate to login page
    navigate('/');
  };

  return (
    <nav className="navbar navbar-dark">
      <NavLink className="navbar-brand" to="/home">DateNite</NavLink>
      <ul className="navbar-nav flex-row">
        <li className="nav-item">
          <NavLink className="nav-link" to="/favorites">Favorites</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link nav-link--create" to="/create-date">+ Create Date</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/profile">Profile</NavLink>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={handleLogout}>
            Logout
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={handleHealthCheck} disabled={isChecking}>
            {isChecking ? 'Checking...' : 'Check Backend'}
          </button>
        </li>
        {import.meta.env.DEV && (
          <li className="nav-item">
            <NavLink className="nav-link nav-link--dev" to="/dev">⚙</NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
