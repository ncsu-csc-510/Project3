import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const Signup: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/user/signup', {
        name,
        email,
        password,
      });
      setMessage('Account created successfully! Redirecting to login...');
      setIsError(false);
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Signup failed. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Create Account</h2>
        <p style={{ color: '#666', marginBottom: '25px' }}>Join CookBook to discover amazing recipes</p>
        
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              className="form-control"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="form-control"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="form-control"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              className="form-control"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          {message && (
            <div className={isError ? "error-message" : "success-message"}>
              {message}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
