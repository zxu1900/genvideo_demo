const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Generate random 5-digit verification code
const generateVerificationCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map();

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

// Send verification code for password reset
app.post('/api/auth/send-verification-code', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check if email exists in our database
  const user = mockUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'Email not found in our system' });
  }

  try {
    const code = generateVerificationCode();
    
    // Store code with expiration (5 minutes)
    verificationCodes.set(email, {
      code,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'WriteTalent - Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">WriteTalent Password Reset</h2>
          <p>Hello ${user.username},</p>
          <p>You requested a password reset for your WriteTalent account.</p>
          <p>Your verification code is:</p>
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WriteTalent Team</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      // For testing purposes, also return the code
      testCode: code
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send verification code. Please try again.' 
    });
  }
});

// Verify code and reset password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, code, and new password are required' });
  }

  // Check if code exists and is not expired
  const storedData = verificationCodes.get(email);
  if (!storedData) {
    return res.status(400).json({ error: 'No verification code found for this email' });
  }

  if (Date.now() > storedData.expires) {
    verificationCodes.delete(email);
    return res.status(400).json({ error: 'Verification code has expired' });
  }

  if (storedData.code !== code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  // Find user and update password (in real app, hash the password)
  const userIndex = mockUsers.findIndex(u => u.email?.toLowerCase() === email.toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update password (in production, hash this password)
  mockUsers[userIndex].password = newPassword;

  // Remove used verification code
  verificationCodes.delete(email);

  return res.status(200).json({
    success: true,
    message: 'Password reset successfully'
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
