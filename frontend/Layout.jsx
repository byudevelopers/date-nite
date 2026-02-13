import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <div>
      <h1>Welcome to Date Nite!</h1>
          <nav>
      <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', gap: '1rem' }}>
        <li>
          <Link to="/">Home</Link>
        </li>
        {/* <li>
          <Link to="/about">About</Link>
        </li> */}
      </ul>
    </nav>
      <hr />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;