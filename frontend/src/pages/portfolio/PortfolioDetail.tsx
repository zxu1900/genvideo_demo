import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2 } from 'lucide-react';
import { mockPortfolios } from '../../utils/mockData';

const PortfolioDetail: React.FC = () => {
  const { id } = useParams();
  const portfolio = mockPortfolios.find(p => p.id === id);
  
  // 点赞状态管理
  const [likes, setLikes] = useState(portfolio?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

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

  if (!portfolio) return <div className="text-center py-20">Portfolio not found</div>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 card">
            <h1 className="text-4xl font-bold mb-6">{portfolio.title}</h1>
            <div className="prose max-w-none">{portfolio.story}</div>
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
