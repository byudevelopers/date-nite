import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/api';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem('user');
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
          <NavLink className="nav-link" to="/profile">Profile</NavLink>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={handleLogout}>Logout</button>
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
