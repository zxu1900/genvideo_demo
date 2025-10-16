import React, { useState } from 'react';
import { Send, Bot, FileText, Video, BarChart3, Save, Zap, Clock, CheckCircle } from 'lucide-react';

const AIBoost: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hi! I'm your AI Business Mentor. Let's start with your creative idea. What problem are you trying to solve?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [currentStage, setCurrentStage] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const stages = [
    { name: 'Creative Idea', icon: '💡', status: 'completed' },
    { name: 'Structured Concept', icon: '📋', status: 'active' },
    { name: 'Market Analysis', icon: '📊', status: 'pending' },
    { name: 'Business Plan', icon: '📄', status: 'pending' },
    { name: 'Pitch Video', icon: '🎥', status: 'pending' }
  ];

  const aiResponses = [
    "That's a fantastic idea! Let me help you develop it further. What specific problem does your idea solve?",
    "Great thinking! Now let's structure this concept. Who is your target audience?",
    "Excellent! Let's dive deeper into the market potential. Have you researched similar solutions?",
    "Perfect! Now we can start building your business plan. What resources would you need to get started?",
    "Outstanding progress! Let's create a compelling pitch for your idea. What makes it unique?"
  ];

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage = { id: Date.now(), sender: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const aiMessage = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: aiResponse, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Progress to next stage occasionally
      if (Math.random() > 0.7 && currentStage < stages.length - 1) {
        setCurrentStage(prev => prev + 1);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Business Mentor</h1>
          <p className="text-xl text-gray-600">Your personal AI guide to building a successful business</p>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Progress Panel */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-600" />
                Project Progress
              </h3>
              <div className="space-y-4">
                {stages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i < currentStage ? 'bg-green-500 text-white' : 
                      i === currentStage ? 'bg-primary-600 text-white' : 
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {i < currentStage ? <CheckCircle className="w-4 h-4" /> : stage.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        i <= currentStage ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {stage.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {i < currentStage ? 'Completed' : i === currentStage ? 'In Progress' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="card flex flex-col h-[700px]">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.sender === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-5 h-5 text-primary-600" />
                          <span className="text-sm font-semibold text-primary-600">AI Mentor</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary-600" />
                        <span className="text-sm font-semibold text-primary-600">AI Mentor</span>
                      </div>
                      <div className="flex space-x-1 mt-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 p-4 border-t">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                  placeholder="Ask your AI mentor anything..." 
                  className="flex-1 px-4 py-3 border rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  disabled={isTyping}
                />
                <button 
                  onClick={handleSend} 
                  disabled={isTyping || !input.trim()}
                  className="btn-primary rounded-full px-6 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tools Panel */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                Quick Tools
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Generate Business Plan</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition">
                  <Video className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Create Pitch Video</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Market Research</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm">Access GPT-5</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition">
                  <Save className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Save Progress</span>
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <h4 className="font-semibold text-primary-800 mb-2">Session Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Messages:</span>
                    <span className="font-semibold">{messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">25 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-semibold text-primary-600">{Math.round((currentStage / stages.length) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBoost;
