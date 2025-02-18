import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [retypePassword, setRetypePassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Simple in-memory user store
  let savedEmail = localStorage.getItem('userEmail');
  let savedPassword = localStorage.getItem('userPassword');

  const handleSignup = () => {
    // Check if user already exists
    if (savedEmail && savedPassword) {
      if (savedEmail === email) {
        setError('User already exists!');
        return;
      }
    }

    // check if the password and retyped password match
    if (password !== retypePassword) {
      setError('Passwords do not match!');
      return;
    }

    // Save the new user data to local storage
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPassword', password);
    localStorage.setItem('userName', name);
    alert('Signup successful!');
    navigate('/login'); // Redirect to login page
  };

  return (
    <div>
      <h2>Signup</h2>
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
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
      <div>
        <input
          type="password"
          placeholder="Retype password"
          value={retypePassword}
          onChange={(e) => setRetypePassword(e.target.value)}
        />
      </div>
      {error && <p>{error}</p>}
      <button onClick={handleSignup}>Signup</button>
      <p>Already a user? <a href="/login">Login here</a></p>
    </div>
  );
};

export default Signup;
