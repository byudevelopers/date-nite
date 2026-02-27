import { NavLink } from 'react-router-dom';

function Navbar() {
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
      </ul>
    </nav>
  );
}

export default Navbar;