// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For testing - hardcoded login
    if (username === 'admin' && password === 'admin123') {
      const user = { id: 1, username: 'admin', fullName: 'Administrator' };
      setAuth(user, 'fake-token-for-testing');
      navigate('/masters');
    } else {
      alert('Invalid credentials. Use admin / admin123');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #4f46e5, #7c3aed)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '10px', width: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '5px' }}
              placeholder="Enter username"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '5px' }}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '12px', background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '5px', fontWeight: '600', cursor: 'pointer' }}
          >
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#6b7280' }}>
          Demo: admin / admin123
        </p>
      </div>
    </div>
  );
};

export default Login;
