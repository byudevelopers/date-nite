import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
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
      // Cookie is automatically set by the browser - no localStorage needed!
      // Just store user info for UI purposes (optional)
      localStorage.setItem('user', JSON.stringify(result.data.user));
      navigate('/home');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const handleCreateAccount = async () => {
    // Validate inputs before sending request
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await registerUser(email, password);

    if (result.success) {
      // Cookie is automatically set by the browser - no localStorage needed!
      // Just store user info for UI purposes (optional)
      localStorage.setItem('user', JSON.stringify(result.data.user));
      navigate('/home');
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <main className="login-page">
      <h1>Login to Date-Nite</h1>
      <div className="formArea">
        <form onSubmit={handleLogin}>
          <div className="emailInput input-group mb-3">
            <input
              className="form-control"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="passwordInput input-group mb-3">
            <input
              className="form-control"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
          <div className="controlBtns">
            <button
              className="submitBtn btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Submit'}
            </button>
            <button
              className="createAccountBtn btn"
              type="button"
              onClick={handleCreateAccount}
              disabled={loading}
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Login;