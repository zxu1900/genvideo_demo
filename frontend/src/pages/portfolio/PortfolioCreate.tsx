import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Mic, Volume2, Play, Pause, Image, Music, Video, Sparkles } from 'lucide-react';
import { themeData } from '../../utils/mockData';
import { Theme } from '../../types';

const PortfolioCreate: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [idea, setIdea] = useState('');
  const [story, setStory] = useState('');
  const [originalityScore, setOriginalityScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storybookPages, setStorybookPages] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const navigate = useNavigate();

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Choose Your Theme</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {themeData.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => { setSelectedTheme(theme.id); setStep(2); }}
                  className="card hover:scale-105 transition-transform text-left group"
                >
                  <div className="text-6xl mb-4">{theme.icon}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600">{theme.name}</h3>
                  <p className="text-gray-600">{theme.description}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Tell Us Your Amazing Idea!</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <textarea
                  value={idea}
                  onChange={(e) => {
                    setIdea(e.target.value);
                    // Simulate originality scoring
                    setOriginalityScore(Math.min(100, Math.floor(e.target.value.length / 5) + Math.random() * 20));
                  }}
                  placeholder="Once upon a time, there was a robot who loved to paint..."
                  className="w-full h-96 p-6 text-lg rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none"
                />
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      isRecording 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <span>Reject AI</span>
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                <div className="card text-center">
                  <h3 className="font-bold mb-4">Originality Score</h3>
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${(originalityScore / 100) * 314} 314`}
                        className="text-primary-600"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{Math.round(originalityScore)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Keep writing to increase your score!</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
              <button 
                onClick={() => { 
                  setIsGenerating(true);
                  setTimeout(() => {
                    setStory('Generated story based on: ' + idea);
                    setIsGenerating(false);
                    setStep(3);
                  }, 2000);
                }} 
                disabled={!idea || isGenerating} 
                className="btn-primary"
              >
                {isGenerating ? 'Generating...' : 'Next: Generate Story'} 
                <ArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Your Story</h2>
            {isGenerating ? (
              <div className="text-center py-20">
                <div className="animate-spin w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-2xl font-bold mb-2">Generating your story...</h3>
                <p className="text-gray-600">Our AI is crafting an amazing story based on your idea!</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card bg-gray-50">
                    <h3 className="font-bold mb-4">Your Original Idea</h3>
                    <p className="text-gray-700">{idea}</p>
                  </div>
                  <div className="card">
                    <h3 className="font-bold mb-4">Generated Story</h3>
                    <textarea
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      className="w-full h-64 p-4 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Your AI-generated story will appear here..."
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                  <div className="space-x-4">
                    <button 
                      onClick={() => {
                        setIsGenerating(true);
                        setTimeout(() => {
                          setStory('Regenerated story based on: ' + idea + '\n\nThis is a new version of your story with fresh ideas and creative twists!');
                          setIsGenerating(false);
                        }, 2000);
                      }}
                      className="btn-secondary"
                    >
                      Regenerate
                    </button>
                    <button 
                      onClick={() => {
                        setStorybookPages(['Page 1: ' + story.substring(0, 200), 'Page 2: ' + story.substring(200, 400)]);
                        setStep(4);
                      }}
                      className="btn-primary"
                    >
                      Next: Create Storybook <ArrowRight className="ml-2" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-12">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 6 && <div className={`w-12 h-1 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        {renderStep()}
      </div>
    </div>
  );
};

export default PortfolioCreate;
