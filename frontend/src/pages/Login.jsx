//css statement goes here
import { useNavigate } from 'react-router-dom';
import React from 'react';

function Login() {
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
          <button className="submitBtn" type="submit">Submit</button>
          <button className="createAccountBtn" type="submit">Create Account</button>
        </div>
      </div>


    </div>
  );
}

//After login the user goes here



export default Login;