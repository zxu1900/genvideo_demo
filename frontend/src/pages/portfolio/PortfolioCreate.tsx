import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Mic, Volume2, Play, Pause, Image, Music, Video, Sparkles, RefreshCw, Layout, Wand2, SkipForward, Loader2, Film, Settings, Clock } from 'lucide-react';
import { themeData } from '../../utils/mockData';
import { Theme } from '../../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const PortfolioCreate: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [idea, setIdea] = useState('');
  const [story, setStory] = useState('');
  const [originalityScore, setOriginalityScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storybookPages, setStorybookPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [artStyle, setArtStyle] = useState('watercolor');
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [playingMusic, setPlayingMusic] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoLength, setVideoLength] = useState('2');
  const [transition, setTransition] = useState('fade');
  const [voiceType, setVoiceType] = useState('child');
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
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
              <button 
                onClick={async () => { 
                  setIsGenerating(true);
                  setError(null);
                  
                  try {
                    const response = await fetch(`${API_URL}/api/ai/generate-story`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        idea: idea,
                        theme: selectedTheme
                      }),
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to generate story');
                    }
                    
                    const data = await response.json();
                    setStory(data.story);
                    setOriginalityScore(data.originalityScore);
                    setStep(3);
                  } catch (err) {
                    console.error('Story generation error:', err);
                    setError('Failed to generate story. Please try again.');
                  } finally {
                    setIsGenerating(false);
                  }
                }} 
                disabled={!idea || isGenerating} 
                className="btn-primary flex items-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generating Story...
                  </>
                ) : (
                  <>
                    Next: Generate Story
                    <ArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">✨ Your Story is Ready!</h2>
            <p className="text-center text-gray-600 mb-8">Step 3/6 - Review and edit your generated story</p>
            
            {isGenerating ? (
              <div className="text-center py-20">
                <div className="animate-spin w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-2xl font-bold mb-2">🎨 Crafting your story...</h3>
                <p className="text-gray-600">Our AI children's writer is creating an amazing story based on your idea!</p>
              </div>
            ) : (
              <>
                {/* Originality Score Banner */}
                <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center mb-8">
                  <div className="flex items-center justify-center gap-8">
                    <div>
                      <div className="text-6xl font-bold">{originalityScore}</div>
                      <div className="text-lg opacity-90">Originality Score</div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-6 h-6" />
                        <span className="text-xl font-semibold">
                          {originalityScore >= 90 ? '🌟 Exceptional!' : 
                           originalityScore >= 80 ? '✨ Excellent!' : 
                           originalityScore >= 70 ? '💫 Great!' : 
                           '⭐ Good!'}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">
                        {originalityScore >= 90 ? 'Your idea is extraordinarily creative and unique!' : 
                         originalityScore >= 80 ? 'Your story shows impressive originality!' : 
                         originalityScore >= 70 ? 'Your story has wonderful creative elements!' : 
                         'Your story has good creative potential!'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card bg-gray-50">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      Your Original Idea
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{idea}</p>
                  </div>
                  <div className="card">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <span className="text-2xl">📖</span>
                      Generated Story
                    </h3>
                    <textarea
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      className="w-full h-64 p-4 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none leading-relaxed"
                      placeholder="Your AI-generated story will appear here..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      You can edit the story above to make it perfect!
                    </p>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                  <div className="space-x-4">
                    <button 
                      onClick={async () => {
                        setIsGenerating(true);
                        setError(null);
                        
                        try {
                          const response = await fetch(`${API_URL}/api/ai/generate-story`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              idea: idea,
                              theme: selectedTheme
                            }),
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to regenerate story');
                          }
                          
                          const data = await response.json();
                          setStory(data.story);
                          setOriginalityScore(data.originalityScore);
                        } catch (err) {
                          console.error('Story regeneration error:', err);
                          setError('Failed to regenerate story. Please try again.');
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      className="btn-secondary flex items-center gap-2"
                      disabled={isGenerating}
                    >
                      <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                      {isGenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                    <button 
                      onClick={() => {
                        // Initialize storybook pages with mock data
                        setStorybookPages([
                          { id: 1, text: story.substring(0, 150) || 'Once upon a time, a little robot discovered the magic of painting...', image: '🎨' },
                          { id: 2, text: story.substring(150, 300) || 'Every day, the robot would create beautiful artworks in different colors...', image: '🖼️' },
                          { id: 3, text: story.substring(300, 450) || 'Other robots came to admire the paintings and wanted to learn...', image: '🤖' },
                          { id: 4, text: story.substring(450, 600) || 'Together, they transformed the gray city into a colorful paradise...', image: '🌈' }
                        ]);
                        setStep(4);
                      }}
                      className="btn-primary"
                    >
                      Next: Create Storybook <ArrowRight className="ml-2" />
                    </button>
                  </div>
                </div>
                <div className="text-center mt-8 text-sm text-gray-500">
                  Get your early access code at <a href="mailto:writetalentdev@gmail.com" className="text-primary-600 hover:underline">writetalentdev@gmail.com</a>
                </div>
              </>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">Generate Storybook</h2>
            <p className="text-center text-gray-600 mb-8">Step 4/6 - Customize your illustrations</p>
            
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar with thumbnails */}
              <div className="col-span-2 space-y-4">
                <h3 className="font-bold text-sm mb-4">Pages</h3>
                {storybookPages.map((page, idx) => (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      currentPage === idx 
                        ? 'border-primary-600 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-4xl">{page.image}</div>
                    <div className="text-xs mt-1">Page {idx + 1}</div>
                  </button>
                ))}
              </div>

              {/* Main preview area */}
              <div className="col-span-7">
                <div className="card bg-gradient-to-br from-purple-50 to-blue-50 min-h-[500px] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-8xl mb-6 animate-pulse">{storybookPages[currentPage]?.image}</div>
                    <div className="bg-white/80 backdrop-blur rounded-xl p-6 max-w-md">
                      <p className="text-lg leading-relaxed">{storybookPages[currentPage]?.text}</p>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      Page {currentPage + 1} of {storybookPages.length}
                    </div>
                  </div>
                </div>

                {/* Page navigation */}
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(storybookPages.length - 1, currentPage + 1))}
                    disabled={currentPage === storybookPages.length - 1}
                    className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Art style selector */}
              <div className="col-span-3">
                <div className="card sticky top-4">
                  <h3 className="font-bold mb-4 flex items-center">
                    <Wand2 className="w-5 h-5 mr-2" />
                    Art Style
                  </h3>
                  <div className="space-y-2">
                    {['Watercolor', 'Cartoon', '3D Render', 'Oil Painting', 'Pixel Art'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setArtStyle(style.toLowerCase().replace(' ', '-'))}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          artStyle === style.toLowerCase().replace(' ', '-')
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium">{style}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(3)} className="btn-secondary">
                Back
              </button>
              <div className="flex gap-3">
                <button className="btn-secondary flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Regenerate Images
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Edit Layout
                </button>
                <button onClick={() => setStep(5)} className="btn-primary flex items-center gap-2">
                  Next: Add Music
                  <Music className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center mt-8 text-sm text-gray-500">
              Get your early access code at <a href="mailto:writetalentdev@gmail.com" className="text-primary-600 hover:underline">writetalentdev@gmail.com</a>
            </div>
          </div>
        );

      case 5:
        const musicOptions = [
          { id: 'm1', name: 'Happy Adventure', mood: 'Happy', duration: '2:30', color: 'from-yellow-400 to-orange-500' },
          { id: 'm2', name: 'Calm Dreams', mood: 'Calm', duration: '2:45', color: 'from-blue-400 to-indigo-500' },
          { id: 'm3', name: 'Exciting Journey', mood: 'Exciting', duration: '2:15', color: 'from-red-400 to-pink-500' },
          { id: 'm4', name: 'Magical Wonder', mood: 'Mysterious', duration: '3:00', color: 'from-purple-400 to-violet-500' },
        ];

        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">Add Music</h2>
            <p className="text-center text-gray-600 mb-12">Step 5/6 - Choose the perfect soundtrack for your story</p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {musicOptions.map((music) => (
                <div
                  key={music.id}
                  className={`card cursor-pointer transition-all hover:scale-105 ${
                    selectedMusic === music.id ? 'ring-4 ring-primary-500' : ''
                  }`}
                  onClick={() => setSelectedMusic(music.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{music.name}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm text-white bg-gradient-to-r ${music.color} mt-2`}>
                        {music.mood}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayingMusic(playingMusic === music.id ? null : music.id);
                      }}
                      className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-all"
                    >
                      {playingMusic === music.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                  </div>

                  {/* Waveform visualization */}
                  <div className="flex items-end justify-between h-20 gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${
                          playingMusic === music.id ? 'bg-primary-600 animate-pulse' : 'bg-gray-300'
                        }`}
                        style={{ 
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.05}s`
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {music.duration}
                    </span>
                    <Volume2 className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <button className="btn-secondary flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate More Options
              </button>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(4)} className="btn-secondary">
                Back
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedMusic(null);
                    setStep(6);
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip Music
                </button>
                <button 
                  onClick={() => setStep(6)}
                  className="btn-primary flex items-center gap-2"
                  disabled={!selectedMusic}
                >
                  Next: Create Video
                  <Video className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center mt-8 text-sm text-gray-500">
              Get your early access code at <a href="mailto:writetalentdev@gmail.com" className="text-primary-600 hover:underline">writetalentdev@gmail.com</a>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">Generate Video</h2>
            <p className="text-center text-gray-600 mb-12">Step 6/6 - Final step! Create your masterpiece</p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Preview area */}
              <div className="md:col-span-2">
                <div className="card bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-[400px] flex items-center justify-center">
                  {isGeneratingVideo ? (
                    <div className="text-center w-full px-8">
                      <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-4">Generating Your Video...</h3>
                      <div className="max-w-md mx-auto">
                        <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-500"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>
                        <p className="text-sm mt-2">{videoProgress}% Complete</p>
                      </div>
                      <div className="mt-6 text-sm text-gray-400">
                        This may take a few minutes. Please don't close this page.
                      </div>
                    </div>
                  ) : videoProgress === 100 ? (
                    <div className="text-center">
                      <Check className="w-20 h-20 mx-auto mb-4 text-green-400" />
                      <h3 className="text-3xl font-bold mb-4">Video Ready! 🎉</h3>
                      <Film className="w-32 h-32 mx-auto text-primary-400 mb-4" />
                      <p className="text-gray-300 mb-6">Your amazing story is ready to share with the world!</p>
                      <button 
                        onClick={() => navigate('/portfolio/show-your-lights')}
                        className="btn-primary text-lg px-8 py-4"
                      >
                        Publish to Show Your Lights 🚀
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Film className="w-24 h-24 mx-auto mb-4 text-primary-400" />
                      <h3 className="text-2xl font-bold mb-2">Ready to Create</h3>
                      <p className="text-gray-400">Configure your options and generate your video</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Options panel */}
              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-bold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Video Length
                  </h3>
                  <div className="space-y-2">
                    {['1', '2', '3'].map((length) => (
                      <button
                        key={length}
                        onClick={() => setVideoLength(length)}
                        className={`w-full p-3 rounded-lg transition-all ${
                          videoLength === length
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {length} minute{length !== '1' ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-bold mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Transition Effect
                  </h3>
                  <div className="space-y-2">
                    {[
                      { id: 'fade', name: 'Fade', icon: '🌫️' },
                      { id: 'slide', name: 'Slide', icon: '➡️' },
                      { id: 'zoom', name: 'Zoom', icon: '🔍' },
                    ].map((trans) => (
                      <button
                        key={trans.id}
                        onClick={() => setTransition(trans.id)}
                        className={`w-full p-3 rounded-lg transition-all text-left flex items-center gap-2 ${
                          transition === trans.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <span>{trans.icon}</span>
                        <span>{trans.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-bold mb-4 flex items-center">
                    <Mic className="w-5 h-5 mr-2" />
                    Voice Narration
                  </h3>
                  <div className="space-y-2">
                    {[
                      { id: 'child', name: "Child's Voice", icon: '👶' },
                      { id: 'adult', name: 'Adult Voice', icon: '👨' },
                      { id: 'none', name: 'No Voice', icon: '🔇' },
                    ].map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => setVoiceType(voice.id)}
                        className={`w-full p-3 rounded-lg transition-all text-left flex items-center gap-2 ${
                          voiceType === voice.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <span>{voice.icon}</span>
                        <span>{voice.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(5)} className="btn-secondary" disabled={isGeneratingVideo}>
                Back
              </button>
              {videoProgress < 100 && (
                <button 
                  onClick={() => {
                    setIsGeneratingVideo(true);
                    setVideoProgress(0);
                    const interval = setInterval(() => {
                      setVideoProgress(prev => {
                        if (prev >= 100) {
                          clearInterval(interval);
                          setIsGeneratingVideo(false);
                          return 100;
                        }
                        return prev + 5;
                      });
                    }, 300);
                  }}
                  className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                  disabled={isGeneratingVideo}
                >
                  <Film className="w-6 h-6" />
                  {isGeneratingVideo ? 'Generating...' : 'Generate Video'}
                </button>
              )}
            </div>

            <div className="text-center mt-8 text-sm text-gray-500">
              Get your early access code at <a href="mailto:writetalentdev@gmail.com" className="text-primary-600 hover:underline">writetalentdev@gmail.com</a>
            </div>
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
