import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Coins, User, LogOut, Settings, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              WriteTalent
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition">
              Home
            </Link>
            <Link to="/portfolio" className="text-gray-700 hover:text-primary-600 font-medium transition">
              First Portfolio
            </Link>
            <Link to="/bootcamp" className="text-gray-700 hover:text-primary-600 font-medium transition">
              Boot Camp
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium transition">
              About
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Token Display */}
                <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full">
                  <Coins className="w-5 h-5" />
                  <span className="font-bold">{user.tokens}</span>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <img
                      src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt={user.username}
                      className="w-10 h-10 rounded-full border-2 border-primary-600"
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                      <Link
                        to={`/profile/${user.id}`}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>My Portfolio</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition w-full text-left text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/portfolio"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              First Portfolio
            </Link>
            <Link
              to="/bootcamp"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Boot Camp
            </Link>
            <Link
              to="/about"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-2 py-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span className="font-bold">{user.tokens} Tokens</span>
                </div>
                <Link
                  to={`/profile/${user.id}`}
                  className="block py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Portfolio
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block py-2 text-red-600 text-left w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block btn-primary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

