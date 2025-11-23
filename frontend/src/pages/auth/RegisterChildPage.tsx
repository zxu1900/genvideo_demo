import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserPlus, Heart, Shield } from 'lucide-react';
import { buildApiUrl } from '../../utils/api';

const RegisterChildPage: React.FC = () => {
  const navigate = useNavigate();
  const register = useAuthStore(state => state.register);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
    parentEmail: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const resp = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          type: 'child',
          age: parseInt(formData.age),
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        const msg = data?.error || 'Email or username already exists, please choose another.';
        setError(msg);
        return;
      }
      const data = await resp.json();
      register({
        ...data.user,
        tokens: 100,
      });
      navigate('/login', { state: { email: formData.email, username: formData.username } });
    } catch (err) {
      setError('Network error, please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Join as a Young Creator!</h2>
          <p className="text-gray-600">Start your creative journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded border border-red-200">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Choose a cool username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <select
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select your age</option>
              {Array.from({ length: 12 }, (_, i) => i + 7).map(age => (
                <option key={age} value={age}>{age} years old</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Create a strong password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Parent/Guardian Email</label>
            <input
              type="email"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="parent@example.com"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              We'll send a permission request to your parent/guardian
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Parental Consent Required</p>
                <p>Your parent or guardian will receive an email to approve your account creation.</p>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account? <Link to="/login" className="text-primary-600 font-semibold">Log In</Link>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Are you a parent? <Link to="/register/parent" className="text-primary-600">Register as Parent</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterChildPage;
