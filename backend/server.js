const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockPortfolios = [
  {
    id: '1',
    userId: '1',
    title: 'The Magic Garden Adventure',
    theme: 'fantasy-adventure',
    originalIdea: 'A young girl discovers a magical garden where plants can talk...',
    story: 'Once upon a time, in a small town, there lived a curious girl named Lily. One day, while exploring her grandmother\'s backyard, she stumbled upon a hidden garden. To her amazement, the flowers could talk! The wise old Rose told her about an ancient magic that needed her help...',
    originalityScore: 92,
    likes: 156,
    likedBy: ['2', '3', '4'],
    createdAt: new Date('2024-10-01'),
    publishedAt: new Date('2024-10-02'),
  },
  {
    id: '2',
    userId: '2', 
    title: 'Robot Friends Forever',
    theme: 'creation-exploration',
    originalIdea: 'A boy builds a robot friend who helps him understand emotions...',
    story: 'In a world where technology and emotions collide, young Max creates a robot companion named Bolt. Together, they embark on a journey to understand what friendship truly means...',
    originalityScore: 88,
    likes: 203,
    likedBy: ['1', '3'],
    createdAt: new Date('2024-09-20'),
    publishedAt: new Date('2024-09-21'),
  },
];

const mockUsers = [
  {
    id: '1',
    username: 'Emma_Artist',
    email: 'emma@example.com',
    age: 12,
    type: 'child',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    tokens: 250,
    followersCount: 150,
    followingCount: 80,
    worksCount: 5,
    createdAt: new Date('2024-01-15'),
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WriteTalent API is running!' });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, type, age } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields: username, email, password' });
  }

  const duplicate = mockUsers.find(
    u => u.email?.toLowerCase() === String(email).toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({ error: 'Email already exists, please choose another.' });
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    type: type || 'child',
    age: typeof age === 'number' ? age : undefined,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
    tokens: 0,
    followersCount: 0,
    followingCount: 0,
    worksCount: 0,
    createdAt: new Date(),
  };

  mockUsers.push(newUser);

  return res.status(201).json({
    success: true,
    user: newUser,
  });
});

// Portfolio routes
app.get('/api/portfolios', (req, res) => {
  res.json(mockPortfolios);
});

app.get('/api/portfolios/:id', (req, res) => {
  const portfolio = mockPortfolios.find(p => p.id === req.params.id);
  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }
  res.json(portfolio);
});

app.post('/api/portfolios', (req, res) => {
  const newPortfolio = {
    id: Date.now().toString(),
    userId: '1', // Mock user
    ...req.body,
    originalityScore: Math.floor(Math.random() * 30) + 70, // 70-100
    likes: 0,
    likedBy: [],
    createdAt: new Date(),
    publishedAt: new Date(),
  };
  mockPortfolios.push(newPortfolio);
  res.status(201).json(newPortfolio);
});

// User routes
app.get('/api/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// AI routes (mock responses)
app.post('/api/ai/generate-story', (req, res) => {
  const { idea, theme } = req.body;
  
  // Mock story generation
  setTimeout(() => {
    const generatedStory = `Based on your idea: "${idea}", here's a wonderful story about ${theme}. 

Once upon a time, there was a young dreamer who had an amazing idea. This idea would change everything and lead to incredible adventures. The story unfolds with excitement, challenges, and ultimately triumph.

Through perseverance and creativity, our hero learns valuable lessons about friendship, courage, and the power of imagination. The journey teaches us that every great story begins with a single, brilliant idea.

And they all lived happily ever after, knowing that their creativity could change the world.`;

    res.json({ 
      success: true, 
      story: generatedStory,
      originalityScore: Math.floor(Math.random() * 30) + 70
    });
  }, 2000); // Simulate AI processing time
});

app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  
  // Mock AI mentor responses
  const responses = [
    "That's a fantastic idea! Let me help you develop it further. What specific problem does your idea solve?",
    "Great thinking! Now let's structure this concept. Who is your target audience?",
    "Excellent! Let's dive deeper into the market potential. Have you researched similar solutions?",
    "Perfect! Now we can start building your business plan. What resources would you need to get started?",
    "Outstanding progress! Let's create a compelling pitch for your idea. What makes it unique?"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  setTimeout(() => {
    res.json({ 
      success: true, 
      response: randomResponse,
      stage: 'structured-concept'
    });
  }, 1000);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WriteTalent Backend running on port ${PORT}`);
  console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
});
