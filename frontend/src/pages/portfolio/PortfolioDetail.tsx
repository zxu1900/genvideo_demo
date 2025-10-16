import React from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2 } from 'lucide-react';
import { mockPortfolios } from '../../utils/mockData';

const PortfolioDetail: React.FC = () => {
  const { id } = useParams();
  const portfolio = mockPortfolios.find(p => p.id === id);

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
              <button className="w-full btn-primary mb-3 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" /> Like ({portfolio.likes})
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
