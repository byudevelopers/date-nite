import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import App from '../App';
import { loginUser, registerUser } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginUser(email, password);
    
    if (result.success) {
      // Store the session token (auth data)
      localStorage.setItem('authToken', result.data.auth.access_token);
      localStorage.setItem('user', JSON.stringify(result.data.auth.user));
      navigate('/home');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    setError('');

    const result = await registerUser(email, password);
    
    if (result.success) {
      // Auto-login after registration
      localStorage.setItem('authToken', result.data.auth.access_token);
      localStorage.setItem('user', JSON.stringify(result.data.auth.user));
      navigate('/home');
    } else {
      setError(result.error || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <main className="container-fluid">
      <h1>Login to Date-Nite</h1>
      <div className="formArea">
        <form method="get">
          <div className="emailInput input-group mb-3">
            <input 
              className="form-control" 
              type="email" 
              placeholder="Email"
              value={email}                           // ← Connect to state
              onChange={(e) => setEmail(e.target.value)}  // ← Update state on typing
              required
            />
          </div>
          <div className="passwordInput input-group mb-3">
           <input 
              className="form-control" 
              type="password" 
              placeholder="Password"
              value={password}                        // ← Connect to state
              onChange={(e) => setPassword(e.target.value)} // ← Update state on typing
              required
            />
          </div>
        </form>
        {error && <p className="error">{error}</p>}
        <div className="controlBtns">
          <button className="submitBtn btn btn-primary" onClick={handleLogin}>Submit</button>
          <button className="createAccountBtn btn" onClick={handleCreateAccount}>Create Account</button>
        </div>
      </div>
    </main>
  );
}

export default Login;