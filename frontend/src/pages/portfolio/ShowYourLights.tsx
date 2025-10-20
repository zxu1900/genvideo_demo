import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Search, Filter, Star, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import { mockPortfolios, themeData } from '../../utils/mockData';

const ShowYourLights: React.FC = () => {
  const [portfolios] = useState(mockPortfolios);
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesTheme = selectedTheme === 'all' || portfolio.theme === selectedTheme;
    const matchesAge = selectedAge === 'all' || 
      (selectedAge === '7-10' && portfolio.creatorAge >= 7 && portfolio.creatorAge <= 10) ||
      (selectedAge === '11-14' && portfolio.creatorAge >= 11 && portfolio.creatorAge <= 14) ||
      (selectedAge === '15-18' && portfolio.creatorAge >= 15 && portfolio.creatorAge <= 18);
    const matchesSearch = searchQuery === '' || 
      portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.story.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTheme && matchesAge && matchesSearch;
  });

  const sortedPortfolios = [...filteredPortfolios].sort((a, b) => {
    switch (sortBy) {
      case 'likes':
        return b.likes - a.likes;
      case 'originality':
        return b.originalityScore - a.originalityScore;
      case 'latest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Show Your Lights
          </h1>
          <p className="text-xl text-gray-600">Discover amazing stories from young creators</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Theme Filter - Custom Dropdown */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between bg-white"
              >
                <span className="flex items-center gap-2">
                  {selectedTheme === 'all' ? (
                    <>All Themes</>
                  ) : (
                    <>
                      <span className="text-lg">{themeData.find(t => t.id === selectedTheme)?.icon}</span>
                      {themeData.find(t => t.id === selectedTheme)?.name}
                    </>
                  )}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isThemeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTheme('all');
                      setIsThemeDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 ${
                      selectedTheme === 'all' ? 'bg-primary-50 text-primary-600' : ''
                    }`}
                  >
                    All Themes
                  </button>
                  {themeData.map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(theme.id);
                        setIsThemeDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 ${
                        selectedTheme === theme.id ? 'bg-primary-50 text-primary-600' : ''
                      }`}
                    >
                      <span className="text-lg">{theme.icon}</span>
                      {theme.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Age Filter */}
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Ages</option>
              <option value="7-10">Ages 7-10</option>
              <option value="11-14">Ages 11-14</option>
              <option value="15-18">Ages 15-18</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="latest">Latest</option>
              <option value="likes">Most Liked</option>
              <option value="originality">Most Original</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {sortedPortfolios.length} of {portfolios.length} stories
          </p>
          <Link to="/portfolio/create" className="btn-primary">
            Create New Story
          </Link>
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedPortfolios.map((portfolio) => (
            <Link key={portfolio.id} to={`/portfolio/${portfolio.id}`} className="card group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mb-4 overflow-hidden">
                {portfolio.storybook?.pages[0]?.illustration ? (
                  <img 
                    src={portfolio.storybook.pages[0].illustration} 
                    alt={portfolio.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl opacity-50">{themeData.find(t => t.id === portfolio.theme)?.icon || '📖'}</div>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold">
                  {portfolio.originalityScore}% Original
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {portfolio.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <img 
                    src={portfolio.creatorAvatar} 
                    alt={portfolio.creatorName}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-600">{portfolio.creatorName}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{portfolio.creatorAge} years old</span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {portfolio.story.substring(0, 120)}...
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" /> {portfolio.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {portfolio.views}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(portfolio.rating) ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {sortedPortfolios.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No stories found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <Link to="/portfolio/create" className="btn-primary">
              Create the First Story
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowYourLights;
