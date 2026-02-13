import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';

function App() {
  return (
    <div>
        <h1>Welcome to Date Nite!</h1>
        <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/about" element={<About />} /> */}
            {/* Add more routes as needed */}
        </Routes>
        </Router>
    </div>

  );
}

export default App;