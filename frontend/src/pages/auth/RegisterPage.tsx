import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [accountType, setAccountType] = useState<'child' | 'parent'>('child');

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
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input type="text" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500" required />
            </div>
            {accountType === 'child' && (
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <select className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500" required>
                  {[...Array(12)].map((_, i) => <option key={i} value={i+7}>{i+7}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500" required />
          </div>
          {accountType === 'child' && (
            <div>
              <label className="block text-sm font-medium mb-2">Parent Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500" required />
              <p className="text-sm text-gray-500 mt-1">Parental authorization required</p>
            </div>
          )}
          <button type="submit" className="btn-primary w-full">Create Account</button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Already have an account? <Link to="/login" className="text-primary-600 font-semibold">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
