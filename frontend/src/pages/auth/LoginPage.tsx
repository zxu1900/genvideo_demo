import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const state = location.state as { email?: string; username?: string } | null;
    if (state?.email) setEmail(state.email);
    if (state?.username) setUsername(state.username);
  }, [location.state]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    login({
      id: '1',
      username: username || 'DemoUser',
      email: email || 'demo@example.com',
      type: 'child',
      age: 12,
      tokens: 250,
      followersCount: 50,
      followingCount: 30,
      worksCount: 3,
      createdAt: new Date(),
    });
    navigate('/portfolio');
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <LogIn className="w-16 h-16 mx-auto mb-4 text-primary-600" />
          <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Log in to continue your creative journey</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full">Log In</button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Don't have an account? <Link to="/register" className="text-primary-600 font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
