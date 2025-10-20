import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sentCode, setSentCode] = useState('');

  // Generate random 5-digit verification code
  const generateVerificationCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    // Call real backend API to send verification code
    try {
      const response = await fetch('http://localhost:3001/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send verification code');
        setIsLoading(false);
        return;
      }

      // Store the code for verification
      setSentCode(data.testCode);
      setCodeSent(true);
      setSuccess(`Verification code sent to ${email}. Code: ${data.testCode} (for testing)`);
    } catch (err) {
      console.error('Send code error:', err);
      setError('Failed to send verification code. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    // Call real backend API to reset password
    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      setSuccess('Password has been reset successfully! Redirecting to login...');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to reset password. Please check your connection and try again.');
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

        {!codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-4">
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
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-lg border bg-gray-100" 
                value={email}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                required 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 5-digit verification code"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className={`btn-primary w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button 
              type="button"
              onClick={() => {
                setCodeSent(false);
                setVerificationCode('');
                setNewPassword('');
                setConfirmPassword('');
                setSentCode('');
                setError('');
                setSuccess('');
              }}
              className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to send new code
            </button>
          </form>
        )}

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
