import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <div>
        <h1>Welcome to Date Nite!</h1>
        <Routes>
            <Route path="/" element={<Login />} />
            {/* <Route path="/about" element={<About />} /> */}
            {/* Add more routes as needed */}
        </Routes>
    </div>

  );
}

export default App;