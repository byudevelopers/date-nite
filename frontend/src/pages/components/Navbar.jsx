import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { checkHealth } from '../../services/api';

function Navbar() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleHealthCheck = async () => {
    setIsChecking(true);
    setHealthStatus(null);
    const result = await checkHealth();
    if (result.success) {
      setHealthStatus({
        type: 'success',
        message: `Backend is healthy! Uptime: ${Math.floor(result.data.uptime)}s`
      });
    } else {
      setHealthStatus({
        type: 'error',
        message: `Backend is down: ${result.error}`
      });
    }
    setIsChecking(false);
    setTimeout(() => setHealthStatus(null), 5000);
  };

  return (
    <nav className="navbar navbar-dark">
      <NavLink className="navbar-brand" to="/home">DateNite</NavLink>
      <ul className="navbar-nav flex-row">
        <li className="nav-item">
          <NavLink className="nav-link" to="/favorites">Favorites</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/profile">Profile</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/">Logout</NavLink>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={handleHealthCheck} disabled={isChecking}>
            {isChecking ? 'Checking...' : 'Check Backend'}
          </button>
        </li>
      </ul>
      {healthStatus && (
        <span style={{
          marginLeft: '10px',
          padding: '5px 10px',
          borderRadius: '4px',
          backgroundColor: healthStatus.type === 'success' ? '#d4edda' : '#f8d7da',
          color: healthStatus.type === 'success' ? '#155724' : '#721c24',
          fontSize: '14px'
        }}>
          {healthStatus.message}
        </span>
      )}
    </nav>
  );
}

export default Navbar;