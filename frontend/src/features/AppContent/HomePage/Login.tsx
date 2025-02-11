import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Fetch saved email and password from localStorage
  const savedEmail = localStorage.getItem('userEmail');
  const savedPassword = localStorage.getItem('userPassword');

  const handleLogin = () => {
    // Compare entered email and password with saved ones
    if (savedEmail === email && savedPassword === password) {
      alert('Login successful!');
      navigate('/profile'); // Redirect to profile page
    } else {
      setError('Incorrect email or password');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <div>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p>{error}</p>}
      <button onClick={handleLogin}>Login</button>
      <p>Don't have an account? <a href="/signup">Signup here</a></p>
    </div>
  );
};

export default Login;
