import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Login to Date-Nite</h1>
      <div className="formArea">
        <form>
          <div className="emailInput">
            <input className="form-control" type="email" placeholder="Email" />
          </div>
          <div className="passwordInput">
            <input className="form-control" type="password" placeholder="Password" />
          </div>
        </form>
        <div className="controlBtns">
          <button className="submitBtn" onClick={() => navigate('/home')}>Submit</button>
          <button className="createAccountBtn" onClick={() => navigate('/home')}>Create Account</button>
        </div>
      </div>
    </div>
  );
}

export default Login;