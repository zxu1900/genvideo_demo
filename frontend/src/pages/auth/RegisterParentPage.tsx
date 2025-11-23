import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Users, Shield, Heart } from 'lucide-react';
import { buildApiUrl } from '../../utils/api';

const RegisterParentPage: React.FC = () => {
  const navigate = useNavigate();
  const register = useAuthStore(state => state.register);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    childUsername: '',
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
          username: formData.name,
          email: formData.email,
          password: formData.password,
          type: 'parent',
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
        tokens: 0,
      });
      navigate('/login', { state: { email: formData.email, username: formData.name } });
    } catch (err) {
      setError('Network error, please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Parent Registration</h2>
          <p className="text-gray-600">Support your child's creative journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded border border-red-200">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Your full name"
              required
            />
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
              placeholder="Create a secure password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Child's Username (Optional)</label>
            <input
              type="text"
              name="childUsername"
              value={formData.childUsername}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="If your child already has an account"
            />
            <p className="text-sm text-gray-500 mt-1">
              Link your account to your child's account for better monitoring
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">Parent Benefits</p>
                <ul className="space-y-1">
                  <li>• Monitor your child's creative progress</li>
                  <li>• Approve account activities</li>
                  <li>• Access to safety features</li>
                  <li>• Receive progress reports</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Safety First</p>
                <p>We prioritize your child's safety with age-appropriate content and parental controls.</p>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            Create Parent Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account? <Link to="/login" className="text-primary-600 font-semibold">Log In</Link>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Registering for your child? <Link to="/register/child" className="text-primary-600">Child Registration</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterParentPage;
