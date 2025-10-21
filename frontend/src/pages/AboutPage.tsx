import React from 'react';
import { Sparkles, MessageSquare, Palette, Music, Film, Users, Award, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Andy Liu, CEO',
      description: 'Founding Team Member of Baby Tree, IPO on HK in 2018. Former Marketing Director of Meituan.',
      avatar: '👨‍💼'
    },
    {
      name: 'Zhen Xu, CTO',
      description: "Microsoft AI architect and Scientist. Upgraded Tencent's content engine & built ByteDance's LLM infrastructure.",
      avatar: '👨‍💻'
    },
    {
      name: 'Xinyu Yang, CMO',
      description: 'Designed child development-focused curricula for 10K+ students across HK/Shenzhen schools.',
      avatar: '👩‍🏫'
    },
    {
      name: 'Dr. Peter Kook',
      title: 'Academic & Marketing Support',
      description: 'Founder of education frameworks adopted by 20+ kindergartens & parenting workshops. Chairman of HK Neuro-Mental Health Center.',
      avatar: '👨‍⚕️'
    },
    {
      name: 'Limin Xu (Sylvia Tsui)',
      title: 'Strategic Government Liaison & Education Ecosystem Architect',
      description: 'Chief Director of International Center for Cultural & Economic Trade Cooperation.',
      avatar: '👩‍💼'
    },
    {
      name: 'Aili Chen, COO',
      description: '16-year expert in corporate strategy & sales. Founder of Greater Bay Area 1000-Enterprise Summit.',
      avatar: '👩‍💼'
    }
  ];

  const advisors = [
    {
      name: 'Ivan Yong',
      description: "A best-selling author whose Fortune-500 startup playbook is taught in five of the world's top universities and the EMCC's Asia-Pacific Co-President who sets global coaching standards.",
      avatar: '🎓'
    },
    {
      name: 'Prof. Chu Kai Wah Samuel',
      description: 'Obtained 2 PhDs in Education. He is a multidisciplinary researcher/professor in 4 disciplines - Health Sciences, e-Learning, Information Science and Early Childhood Education.',
      avatar: '🎓'
    }
  ];

  const painPoints = [
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: 'Ideas Without Expression',
      description: 'Children have wild imaginations but often struggle to articulate, illustrate, or narrate their creative ideas.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'Too Many Tools, No Integration',
      description: 'With countless AI tools available, parents and children don\'t know where to start.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: 'Potential Without Business Foundation',
      description: 'Many families want their children to learn entrepreneurial thinking, but there\'s no systematic training designed for young learners.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const solutions = [
    { icon: <MessageSquare className="w-8 h-8" />, text: 'Guide children to articulate their ideas', number: '1' },
    { icon: <Palette className="w-8 h-8" />, text: 'Transform ideas into illustrations', number: '2' },
    { icon: <Music className="w-8 h-8" />, text: 'Create music based on stories', number: '3' },
    { icon: <Film className="w-8 h-8" />, text: 'Produce stories into short films', number: '4' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            When AI Can Do Everything,<br />What Can Our Children Do?
          </h1>
          <p className="text-2xl md:text-3xl mb-8 leading-relaxed font-light italic">
            The future belongs to children who have both{' '}
            <span className="font-bold text-yellow-300 not-italic">creativity</span> and the ability to{' '}
            <span className="font-bold text-yellow-300 not-italic">collaborate with AI</span>.
          </p>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed bg-white/10 backdrop-blur-sm rounded-2xl py-6 px-8 border-2 border-white/30 shadow-2xl">
            <span className="font-semibold bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Transform every child's original idea into tangible works, products, and opportunities to reach the market.
            </span>
          </p>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">Challenges Children Face</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {painPoints.map((point, index) => (
              <div key={index} className="card hover:shadow-xl transition-all">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${point.color} flex items-center justify-center text-white mb-6 mx-auto`}>
                  {point.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">{point.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">Step One</h2>
            <h3 className="text-3xl font-bold text-primary-600 mb-4">
              Make Your Child's Creativity Clearly "Visible"
            </h3>
            <p className="text-xl text-gray-600">Create Their First Original Portfolio</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {solutions.map((solution, index) => (
              <div key={index} className="flex items-center gap-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {solution.number}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-primary-600">
                    {solution.icon}
                  </div>
                  <p className="text-lg font-medium">{solution.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Our Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-white/10 backdrop-blur border-white/20">
              <div className="text-6xl font-bold mb-4">3,000+</div>
              <p className="text-xl">Children Empowered</p>
            </div>
            <div className="card bg-white/10 backdrop-blur border-white/20">
              <div className="text-6xl font-bold mb-4">5,000+</div>
              <p className="text-xl">Original Portfolios</p>
            </div>
            <div className="card bg-white/10 backdrop-blur border-white/20">
              <div className="text-6xl font-bold mb-4">100%</div>
              <p className="text-xl">Growth Witnessed</p>
            </div>
          </div>
          <p className="text-xl mt-12 leading-relaxed max-w-3xl mx-auto">
            We have accompanied <span className="font-bold text-yellow-300">3,000+ children</span> in creating their original works,
            resulting in <span className="font-bold text-yellow-300">5,000+ portfolios</span>.
            Each piece is a testament to the growth of children's thinking and expression.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">International Core Team</h2>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Globe className="w-6 h-6" />
              <p className="text-xl">Bringing Together Top Global Education & Technology Talent</p>
            </div>
          </div>

          {/* Core Team */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="card hover:shadow-xl transition-all">
                <div className="text-6xl text-center mb-4">{member.avatar}</div>
                <h3 className="text-xl font-bold mb-2 text-center text-primary-600">{member.name}</h3>
                {member.title && <p className="text-sm font-semibold text-gray-600 text-center mb-3">{member.title}</p>}
                <p className="text-gray-600 text-sm leading-relaxed text-center">{member.description}</p>
              </div>
            ))}
          </div>

          {/* Advisors */}
          <div className="mt-16">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Advisory Board</h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {advisors.map((advisor, index) => (
                <div key={index} className="card bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all">
                  <div className="text-5xl text-center mb-4">{advisor.avatar}</div>
                  <h4 className="text-lg font-bold mb-3 text-center text-orange-600">Advisor: {advisor.name}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed text-center">{advisor.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl md:text-3xl mb-8 leading-relaxed font-light">
            "When AI can code, create, and analyze —<br />
            the future belongs to those who can bridge<br />
            human creativity and AI capability."
          </p>
          <div className="h-px bg-white/30 my-12 max-w-md mx-auto"></div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
            The Future Belongs to This Generation.
          </h2>
          <p className="text-2xl md:text-3xl leading-relaxed mb-8">
            WriteTalent lets the world see their imagination,<br />
            empowering them to create the future!
          </p>
          <p className="text-xl text-gray-300">—— WriteTalent</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-6">Ready to Unleash Your Child's Creativity?</h3>
          <p className="text-xl mb-8">Get your early access code at <a href="mailto:writetalentdev@gmail.com" className="underline hover:text-yellow-300 transition">writetalentdev@gmail.com</a></p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

