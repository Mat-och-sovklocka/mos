import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      const user = result.user;

      // If admin or caregiver, always navigate to UserSettings
      if (user?.userType === 'ADMIN' || user?.userType === 'CAREGIVER') {
        navigate('/UserSettings');
        setLoading(false);
        return;
      }

      // If resident, always navigate to Home — Home will render active/inactive icons based on permissions
      if (user?.userType === 'RESIDENT') {
        navigate('/');
        setLoading(false);
        return;
      }
      // Default fallback: navigate to home
      navigate('/');

    } catch (err) {
      console.error('Login flow error', err);
      setError('Något gick fel vid inloggning. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>MOS</h1>
          <p>Mat och sovklocka</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-post</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ange din e-post"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Lösenord</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ange ditt lösenord"
              required
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Demo-uppgifter:</p>
          <p><strong>Admin:</strong> admin@mos.test / password123</p>
          <p><strong>Beware:</strong> resident1@mos.test / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
