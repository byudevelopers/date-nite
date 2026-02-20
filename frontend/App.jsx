import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import React from 'react';

function App() {
  return (
    <div>
        <h1>Welcome to Date Nite!</h1>
        <Router>
          <Routes>
              <Route path="/" element={<Login />} />
              {/* <Route path="/about" element={<About />} /> */}
              {/* Add more routes as needed */}
              <Route path="/Home" element={<Home />}/>
          </Routes>
        </Router>
    </div>

  );
}

export default App;