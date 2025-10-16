import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Rocket, ArrowRight, Users, FileText, Grid3x3 } from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: 'Make Ideas Visible',
      description: 'Turn thoughts into stories, books, music & videos',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Lightbulb className="w-12 h-12" />,
      title: 'Make Ideas Sellable',
      description: 'Transform creativity into business plans',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Rocket className="w-12 h-12" />,
      title: 'Make Ideas Profitable',
      description: 'Launch real products with mentorship',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const stats = [
    { icon: <Users className="w-8 h-8" />, value: '3000+', label: 'Young Creators' },
    { icon: <FileText className="w-8 h-8" />, value: '300+', label: 'Business Plans' },
    { icon: <Grid3x3 className="w-8 h-8" />, value: '6', label: 'Creative Categories' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-32 px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-accent-300 rounded-full mix-blend-overlay filter blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              When AI Meets
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
                Young Creativity
              </span>
            </h1>
            <p className="text-2xl md:text-3xl mb-12 text-gray-100 max-w-4xl mx-auto leading-relaxed">
              Empower children aged 7-18 to transform their creative ideas into stories, businesses, and real products with AI-powered tools and expert mentorship
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/portfolio/create" className="group bg-white text-primary-600 px-12 py-6 rounded-full font-black text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 inline-flex items-center justify-center">
                Start Creating
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link to="/bootcamp" className="group glass-effect border-2 border-white text-white px-12 py-6 rounded-full font-black text-xl hover:bg-white hover:text-primary-600 transition-all duration-300 inline-flex items-center justify-center">
                Join Bootcamp
                <Rocket className="ml-3 w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-gradient">
              Turn Ideas Into Reality
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Three powerful ways to bring your creativity to life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card group hover:scale-110 transition-all duration-500 text-center"
              >
                <div className={`w-24 h-24 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center text-white mb-8 group-hover:rotate-12 transition-transform duration-500 mx-auto`}>
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-black mb-6 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-xl leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 hero-gradient text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center glass-effect rounded-3xl p-8"
              >
                <div className="mb-6 opacity-90">
                  {stat.icon}
                </div>
                <div className="text-6xl font-black mb-4">{stat.value}</div>
                <div className="text-2xl font-bold opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-8 text-gradient">
              Ready to Start Your Journey?
            </h2>
            <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Join thousands of young creators who are already transforming their ideas into amazing projects
            </p>
            <Link to="/register" className="btn-primary text-xl px-16 py-6 inline-flex items-center">
              Get Started Free
              <ArrowRight className="ml-3 w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-300 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-white font-black text-3xl mb-6 text-gradient">WriteTalent</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Empowering young minds to create, innovate, and succeed in the digital age with AI-powered creativity tools.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-xl mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="hover:text-white transition text-lg">About</Link></li>
                <li><Link to="/portfolio" className="hover:text-white transition text-lg">First Portfolio</Link></li>
                <li><Link to="/bootcamp" className="hover:text-white transition text-lg">Boot Camp</Link></li>
                <li><Link to="/register" className="hover:text-white transition text-lg">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xl mb-6">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="hover:text-white transition text-lg">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition text-lg">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-white transition text-lg">Contact</Link></li>
                <li><Link to="/support" className="hover:text-white transition text-lg">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p className="text-lg">&copy; 2024 WriteTalent. All rights reserved. Made with ❤️ for young creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

