import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/Home');
  }

  return (
    <div>
      <h1>Login to Date-Nite</h1>
      <div className="formArea">
        <form method="get">
          <div className="emailInput">
            <input className="form-control" type="email" placeholder="Email" />
          </div>
          <div className="passwordInput">
            <input className="form-control" type="password" placeholder="Password" />
          </div>
        </form>
        <div className="controlBtns">
          <button className="submitBtn" type="submit" onClick={handleLogin}>Submit</button>
          <button className="createAccountBtn" type="submit">Create Account</button>
        </div>
      </div>
    </div>
  );
}




export default Login;