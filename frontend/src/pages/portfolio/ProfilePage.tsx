import React from 'react';
import { useParams } from 'react-router-dom';
import { mockUsers, mockPortfolios } from '../../utils/mockData';

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const user = mockUsers.find(u => u.id === userId);
  const userWorks = mockPortfolios.filter(p => p.userId === userId);

  if (!user) return <div className="text-center py-20">User not found</div>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="card mb-8">
          <div className="flex items-center gap-6">
            <img src={user.avatar} alt={user.username} className="w-32 h-32 rounded-full" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
              <div className="flex gap-6 text-gray-600">
                <div><span className="font-bold">{user.worksCount}</span> Works</div>
                <div><span className="font-bold">{user.followersCount}</span> Followers</div>
                <div><span className="font-bold">{user.tokens}</span> Tokens</div>
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6">Published Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {userWorks.map((work) => (
            <div key={work.id} className="card">
              <h3 className="font-bold text-lg mb-2">{work.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3">{work.story}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
