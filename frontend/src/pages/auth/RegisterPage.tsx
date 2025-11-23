import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { buildApiUrl } from '../../utils/api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<'child' | 'parent'>('child');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '7',
    parentEmail: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (accountType === 'child' && !formData.parentEmail) {
      setError('Parent email is required for child accounts');
      setIsLoading(false);
      return;
    }

    // Call real backend API
    try {
      console.log('=== REGISTRATION ATTEMPT ===');
      console.log('Email:', formData.email);
      console.log('Username:', formData.username);
      
      const response = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          type: accountType,
          age: accountType === 'child' ? parseInt(formData.age) : undefined,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        // Handle duplicate email or other errors
        if (response.status === 409) {
          console.log('❌ DUPLICATE EMAIL DETECTED');
          setError('Registration failed, email already exists');
        } else {
          console.log('❌ OTHER ERROR:', data.error);
          setError(data.error || 'Registration failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Registration successful
      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login page with prefilled data after 1 second
      setTimeout(() => {
        navigate('/login', {
          state: {
            email: formData.email,
            username: formData.username,
            password: formData.password
          }
        });
      }, 1000);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-8">
          <UserPlus className="w-16 h-16 mx-auto mb-4 text-primary-600" />
          <h2 className="text-3xl font-bold mb-2">Create Your Account</h2>
        </div>
        <div className="flex gap-4 mb-6">
          <button onClick={() => setAccountType('child')} className={`flex-1 py-3 rounded-lg font-semibold ${accountType === 'child' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
            Child Account
          </button>
          <button onClick={() => setAccountType('parent')} className={`flex-1 py-3 rounded-lg font-semibold ${accountType === 'parent' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
            Parent Account
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <span className="text-red-800 font-bold text-lg">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                required 
                placeholder="Enter your username"
              />
            </div>
            {accountType === 'child' && (
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <select 
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  required
                >
                  {[...Array(12)].map((_, i) => <option key={i} value={i+7}>{i+7}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              required 
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              required 
              placeholder="Enter your password"
            />
          </div>
          {accountType === 'child' && (
            <div>
              <label className="block text-sm font-medium mb-2">Parent Email</label>
              <input 
                type="email" 
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                required 
                placeholder="Enter parent's email"
              />
              <p className="text-sm text-gray-500 mt-1">Parental authorization required</p>
            </div>
          )}
          <button 
            type="submit" 
            disabled={isLoading}
            className={`btn-primary w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Already have an account? <Link to="/login" className="text-primary-600 font-semibold">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
