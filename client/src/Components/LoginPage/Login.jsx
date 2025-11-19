import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_IP;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const res = await axios.post(`${backendUrl}/api/admin/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess(true);
      console.log('Login response:', res.data);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="login-container">
        <div className="left-side">
          <div className="image-wrapper">
            <img
              src="https://img.freepik.com/premium-vector/diverse-team-collaborates-office-with-one-person-focused-laptop-front-others-office-management-customizable-cartoon-illustration_538213-148926.jpg"
              alt="Team collaborating in office"
            />
          </div>
        </div>

        <div className="right-side">
          <h1>Get more things done.</h1>
          <p>Access to the most powerful tool to automate your entire Business with ease.</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign In</button>
          </form>

          <a href="/reset-password">Forgot Password? RESET</a>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">Login successful!</p>}
        </div>
      </div>
    </>
  );
};

export default Login;