import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RegisterChildPage from './pages/auth/RegisterChildPage';
import RegisterParentPage from './pages/auth/RegisterParentPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import PortfolioCreate from './pages/portfolio/PortfolioCreate';
import ShowYourLights from './pages/portfolio/ShowYourLights';
import PortfolioDetail from './pages/portfolio/PortfolioDetail';
import ProfilePage from './pages/portfolio/ProfilePage';
import BootcampHome from './pages/bootcamp/BootcampHome';
import AIBoost from './pages/bootcamp/AIBoost';
import BusinessPlanGenerator from './pages/bootcamp/BusinessPlanGenerator';
import CoursesPage from './pages/bootcamp/CoursesPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/child" element={<RegisterChildPage />} />
          <Route path="/register/parent" element={<RegisterParentPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/portfolio" element={<ShowYourLights />} />
          <Route path="/portfolio/create" element={<PortfolioCreate />} />
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/bootcamp" element={<BootcampHome />} />
          <Route path="/bootcamp/ai-mentor" element={<AIBoost />} />
          <Route path="/bootcamp/business-plan" element={<BusinessPlanGenerator />} />
          <Route path="/bootcamp/courses" element={<CoursesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
