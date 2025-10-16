import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, FileText, Video, BookOpen, Check, Star, Award, TrendingUp, Calendar } from 'lucide-react';

const BootcampHome: React.FC = () => {
  const features = [
    { icon: <Brain />, title: 'AI Business Mentor', desc: 'Get personalized guidance from AI', link: '/bootcamp/ai-mentor' },
    { icon: <FileText />, title: 'Business Plan Generator', desc: 'Create professional business plans', link: '/bootcamp/business-plan' },
    { icon: <Video />, title: 'Pitch Video Creator', desc: 'Make compelling pitch videos', link: '#' },
    { icon: <BookOpen />, title: 'Online Courses', desc: 'Learn from expert instructors', link: '/bootcamp/courses' },
  ];

  return (
    <div className="min-h-screen">
      <section className="gradient-bg text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Transform Your Idea Into a Real Business</h1>
          <p className="text-xl mb-12">AI-powered mentorship for young entrepreneurs</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white text-gray-900 rounded-2xl p-8 text-left">
              <h3 className="text-2xl font-bold mb-4">Starter Pack</h3>
              <div className="text-4xl font-bold mb-6">$299</div>
              <ul className="space-y-3 mb-8">
                {['AI Mentor Access', 'Business Plan Tool', '3 Courses', 'Email Support'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" /> {item}
                  </li>
                ))}
              </ul>
              <button className="btn-primary w-full">Get Started</button>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-8 text-left transform scale-105">
              <h3 className="text-2xl font-bold mb-4">Elite Bootcamp</h3>
              <div className="text-4xl font-bold mb-6">$2,999</div>
              <ul className="space-y-3 mb-8">
                {['Everything in Starter', 'GPT-5 Access', 'All Courses', '7-Day Live Bootcamp', '1-on-1 Mentorship'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-5 h-5" /> {item}
                  </li>
                ))}
              </ul>
              <button className="bg-white text-orange-500 font-bold py-3 px-6 rounded-full w-full hover:bg-gray-100">Get Started</button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">What You'll Get</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Link key={i} to={feature.link} className="card hover:scale-105 transition-transform text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                age: 14,
                project: 'Eco-Friendly Lunch Boxes',
                result: '$5,000 in pre-orders',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                quote: 'The AI mentor helped me validate my idea and create a business plan that actually worked!'
              },
              {
                name: 'Marcus Johnson',
                age: 16,
                project: 'Study Buddy App',
                result: '10,000+ downloads',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
                quote: 'I learned so much about marketing and user research. The bootcamp was life-changing!'
              },
              {
                name: 'Lily Rodriguez',
                age: 13,
                project: 'Pet Care Service',
                result: '50+ happy customers',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
                quote: 'The mentorship program gave me confidence to start my own business at such a young age.'
              }
            ].map((story, i) => (
              <div key={i} className="card text-center">
                <img src={story.avatar} alt={story.name} className="w-20 h-20 rounded-full mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-1">{story.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{story.age} years old</p>
                <div className="bg-primary-100 rounded-lg p-3 mb-4">
                  <p className="font-semibold text-primary-800">{story.project}</p>
                  <p className="text-sm text-primary-600">{story.result}</p>
                </div>
                <p className="text-gray-600 italic">"{story.quote}"</p>
                <div className="flex justify-center mt-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Bootcamp Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">7-Day Intensive Live Bootcamp</h2>
          <p className="text-xl mb-8">Next Session: December 2024</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Calendar className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">What's Included</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> Daily live sessions with experts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> Hands-on project development
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> 1-on-1 mentorship calls
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> Pitch competition with prizes
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Award className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">Limited Spots Available</h3>
              <p className="mb-4">Only 20 students per session for personalized attention</p>
              <div className="bg-yellow-400 text-gray-900 rounded-lg p-4 mb-4">
                <p className="font-bold">Early Bird Special: Save $500</p>
                <p className="text-sm">Register before November 15th</p>
              </div>
              <Link to="/bootcamp/offline" className="btn-secondary w-full">
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Entrepreneurial Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of young entrepreneurs who are already building their dreams
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/bootcamp/ai-mentor" className="btn-primary text-lg px-8 py-4">
              Start with AI Mentor
            </Link>
            <Link to="/bootcamp/courses" className="btn-secondary text-lg px-8 py-4">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BootcampHome;
