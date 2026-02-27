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

    // Clear status after 5 seconds
    setTimeout(() => setHealthStatus(null), 5000);
  };

  return (
    <nav>
      <a href="/home">Home</a>
      <a href="/favorites">Favorites</a>
      <a href="/profile">Profile</a>

      <button
        onClick={handleHealthCheck}
        disabled={isChecking}
        style={{ marginLeft: '10px' }}
      >
        {isChecking ? 'Checking...' : 'Check Backend'}
      </button>

      {healthStatus && (
        <span
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            borderRadius: '4px',
            backgroundColor: healthStatus.type === 'success' ? '#d4edda' : '#f8d7da',
            color: healthStatus.type === 'success' ? '#155724' : '#721c24',
            fontSize: '14px'
          }}
        >
          {healthStatus.message}
        </span>
      )}
    </nav>
  );
}

export default Navbar;