import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { User, Portfolio } from '../../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [userWorks, setUserWorks] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        
        // Fetch user info
        const userResponse = await fetch(`${API_URL}/api/users/${userId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        // Fetch user's portfolios
        const portfoliosResponse = await fetch(`${API_URL}/api/portfolios`);
        if (portfoliosResponse.ok) {
          const portfolios = await portfoliosResponse.json();
          setUserWorks(portfolios.filter((p: Portfolio) => p.userId === userId));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

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
