import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2 } from 'lucide-react';
import type { Portfolio } from '../../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const PortfolioDetail: React.FC = () => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch portfolio from backend API
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/portfolios/${id}`);
        if (!response.ok) {
          throw new Error('Portfolio not found');
        }
        const data = await response.json();
        setPortfolio(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError('Failed to load portfolio');
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [id]);
  
  // 点赞状态管理
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // 初始化点赞数
  useEffect(() => {
    if (portfolio) {
      setLikes(portfolio.likes);
    }
  }, [portfolio]);

  // 点赞处理函数
  const handleLike = () => {
    if (isLiked) {
      // 如果已经点赞，则取消点赞
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      // 如果未点赞，则点赞
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading portfolio...</p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">{error || 'Portfolio not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 card">
            <h1 className="text-4xl font-bold mb-6">{portfolio.title}</h1>
            
            {/* YouTube Video or Thumbnail */}
            {portfolio.video && (
              <div className="mb-6">
                {portfolio.video.includes('youtube.com') || portfolio.video.includes('youtu.be') ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={portfolio.video.replace('watch?v=', 'embed/')}
                      title={portfolio.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : portfolio.videoMetadata?.thumbnail ? (
                  <img 
                    src={portfolio.videoMetadata.thumbnail} 
                    alt={portfolio.title}
                    className="w-full rounded-lg"
                  />
                ) : null}
              </div>
            )}
            
            <div className="prose max-w-none mb-6">{portfolio.story}</div>
            
            {portfolio.storybook?.pages.map((page) => (
              <div key={page.id} className="mt-8">
                {page.illustration && <img src={page.illustration} alt={`Page ${page.pageNumber}`} className="w-full rounded-lg mb-4" />}
                <p className="text-lg">{page.text}</p>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="card">
              <div className="text-6xl font-bold text-primary-600 mb-2">{portfolio.originalityScore}%</div>
              <div className="text-gray-600">Originality Score</div>
            </div>
            <div className="card">
              <button 
                onClick={handleLike}
                className={`w-full mb-3 flex items-center justify-center gap-2 transition-all ${
                  isLiked 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'btn-primary'
                } px-4 py-3 rounded-lg font-medium`}
              >
                <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-current' : ''}`} /> 
                Like ({likes})
              </button>
              <button className="w-full btn-secondary flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetail;
