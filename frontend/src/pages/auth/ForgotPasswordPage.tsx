import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Password reset instructions have been sent to your email address.');
    } catch (err) {
      setError('Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <KeyRound className="w-16 h-16 mx-auto mb-4 text-primary-600" />
          <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
          <p className="text-gray-600">Enter your email address and we'll send you instructions to reset your password.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
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
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`btn-primary w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-gray-600">
            Remember your password? <Link to="/login" className="text-primary-600 font-semibold">Back to Login</Link>
          </p>
          <p className="text-gray-600">
            Don't have an account? <Link to="/register" className="text-primary-600 font-semibold">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
