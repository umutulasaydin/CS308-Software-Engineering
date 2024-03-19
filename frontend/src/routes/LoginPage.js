import React, { useState } from 'react';
import { LoginPageContainer } from '../styled/LoginPageContainer';
import { LoginForm } from "../styled/LoginForm";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import spinner from "../assets/ring-resize.svg"
import backgroundImage from "../assets/background.png";

const LoginPage = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [showMsg, setShowMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/login", { email, password })
      window.localStorage.setItem('token', response.data)

      const token = `Bearer ${window.localStorage.getItem("token")}`
      const config = { headers: { Authorization: token } }
      window.localStorage.setItem('type', (await axios.get("http://localhost:8000/api/getUserType", config)).data)

      navigate("/")
    } catch {
      setMsg("Invalid email or password")
      setShowMsg(true)
      setTimeout(() => {
        setShowMsg(false);
      }, 5000);
    }
    setLoading(false)
  };

  return (
    <LoginPageContainer>
      <h1>PEAR.</h1>
      <LoginForm onSubmit={handleSubmit}>
        <h2>Login</h2>
        {showMsg ? <div id='msg'>{msg}</div> : null}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{loading ? <img src={spinner} alt="loading spinner" /> : "Login"}</button>
        <Link to={"/signup"}>Don't have an account? Sign up</Link>
      </LoginForm>
    </LoginPageContainer>
  );
};

export default LoginPage;
