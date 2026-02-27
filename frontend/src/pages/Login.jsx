import { useNavigate } from 'react-router-dom';
import React from 'react';
import App from '../App';
import '../styles/login.css';

function Login() {
  const navigate = useNavigate();

  return (
    <main className="container-fluid">
      <h1>Login to Date-Nite</h1>
      <div className="formArea">
        <form method="get">
          <div className="emailInput input-group mb-3">
            <input className="form-control" type="email" placeholder="Email" />
          </div>
          <div className="passwordInput input-group mb-3">
            <input className="form-control" type="password" placeholder="Password" />
          </div>
        </form>
        <div className="controlBtns">
          <button className="submitBtn btn btn-primary" onClick={() => navigate('/home')}>Submit</button>
          <button className="createAccountBtn btn" onClick={() => navigate('/home')}>Create Account</button>
        </div>
      </div>
    </main>
  );
}

export default Login;