import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import React from 'react';

//login, home (search with filter), add date, my stuff/favorites, date details, add review

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