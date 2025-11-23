const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { pool, query } = require('./db/config');
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

// ============================================
// Health Check
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      message: 'WriteTalent API is running!',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// ============================================
// Auth Routes
// ============================================
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, type, age } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields: username, email, password' });
  }

  try {
    // Check for duplicate email
    const duplicate = await query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists, please choose another.' });
    }

    // Insert new user
    const result = await query(
      `INSERT INTO users (username, email, password_hash, type, age, avatar, tokens, followers_count, following_count, works_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, username, email, type, age, avatar, tokens, followers_count, following_count, works_count, created_at`,
      [
        username,
        email,
        password, // In production, hash this password!
        type || 'child',
        typeof age === 'number' ? age : null,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
        0, // tokens
        0, // followers_count
        0, // following_count
        0  // works_count
      ]
    );

    const newUser = result.rows[0];
    return res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// Send verification code for password reset
app.post('/api/auth/send-verification-code', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if email exists
    const userResult = await query(
      'SELECT id, username, email FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found in our system' });
    }

    const user = userResult.rows[0];
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
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, code, and new password are required' });
  }

  try {
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

    // Update password (in production, hash the password)
    await query(
      'UPDATE users SET password_hash = $1 WHERE LOWER(email) = LOWER($2)',
      [newPassword, email]
    );

    // Remove used verification code
    verificationCodes.delete(email);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ============================================
// Portfolio Routes
// ============================================
app.get('/api/portfolios', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.*,
        u.username as creator_name,
        u.age as creator_age,
        u.avatar as creator_avatar
      FROM portfolios p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
    `);

    // Transform data to match frontend expectations
    const portfolios = result.rows.map(row => ({
      id: row.id.toString(),
      userId: row.user_id.toString(),
      title: row.title,
      theme: row.theme,
      originalIdea: row.original_idea,
      story: row.story,
      storybook: row.storybook,
      music: row.music_url,
      video: row.video_url,
      videoMetadata: row.video_metadata,
      originalityScore: row.originality_score,
      likes: row.likes_count,
      likedBy: [], // Would need to fetch from likes table
      comments: [], // Would need to fetch from comments table
      createdAt: row.created_at,
      publishedAt: row.published_at,
      creatorName: row.creator_name,
      creatorAge: row.creator_age,
      creatorAvatar: row.creator_avatar,
      views: row.views_count,
      rating: parseFloat(row.rating)
    }));

    res.json(portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

app.get('/api/portfolios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        p.*,
        u.username as creator_name,
        u.age as creator_age,
        u.avatar as creator_avatar
      FROM portfolios p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.status = 'published'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const row = result.rows[0];
    const portfolio = {
      id: row.id.toString(),
      userId: row.user_id.toString(),
      title: row.title,
      theme: row.theme,
      originalIdea: row.original_idea,
      story: row.story,
      storybook: row.storybook,
      music: row.music_url,
      video: row.video_url,
      videoMetadata: row.video_metadata,
      originalityScore: row.originality_score,
      likes: row.likes_count,
      likedBy: [],
      comments: [],
      createdAt: row.created_at,
      publishedAt: row.published_at,
      creatorName: row.creator_name,
      creatorAge: row.creator_age,
      creatorAvatar: row.creator_avatar,
      views: row.views_count,
      rating: parseFloat(row.rating)
    };

    // Increment view count
    await query(
      'UPDATE portfolios SET views_count = views_count + 1 WHERE id = $1',
      [id]
    );

    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

app.post('/api/portfolios', async (req, res) => {
  try {
    const { title, theme, originalIdea, story, storybook, music, video } = req.body;
    const userId = req.body.userId || 1; // Mock user ID

    const result = await query(
      `INSERT INTO portfolios (
        user_id, title, theme, original_idea, story,
        storybook, music_url, video_url, originality_score,
        status, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *`,
      [
        userId,
        title,
        theme,
        originalIdea,
        story,
        storybook ? JSON.stringify(storybook) : null,
        music,
        video,
        Math.floor(Math.random() * 30) + 70, // 70-100
        'published'
      ]
    );

    const newPortfolio = result.rows[0];
    res.status(201).json({
      id: newPortfolio.id.toString(),
      userId: newPortfolio.user_id.toString(),
      title: newPortfolio.title,
      theme: newPortfolio.theme,
      originalIdea: newPortfolio.original_idea,
      story: newPortfolio.story,
      storybook: newPortfolio.storybook,
      originalityScore: newPortfolio.originality_score,
      likes: 0,
      likedBy: [],
      createdAt: newPortfolio.created_at,
      publishedAt: newPortfolio.published_at,
    });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({ error: 'Failed to create portfolio' });
  }
});

// ============================================
// User Routes
// ============================================
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT id, username, email, age, type, avatar, tokens, 
              followers_count, following_count, works_count, bio, created_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      age: user.age,
      type: user.type,
      avatar: user.avatar,
      tokens: user.tokens,
      followersCount: user.followers_count,
      followingCount: user.following_count,
      worksCount: user.works_count,
      bio: user.bio,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ============================================
// AI Routes (mock responses)
// ============================================
app.post('/api/ai/generate-story', (req, res) => {
  const { idea, theme } = req.body || {};
  (async () => {
    try {
      const { generateStoryWithAI, calculateOriginalityWithAI } = require('./services/aiService');
      const { createImageGenerationJob } = require('./services/comfyService');
 
      console.log('[GenerateStory] incoming payload:', { idea: !!idea, theme });
      console.log('[GenerateStory] COMFYUI_BASE_URL:', process.env.COMFYUI_BASE_URL);

      if (!idea || !theme) {
        return res.status(400).json({ error: 'Missing required fields: idea, theme' });
      }
 
      // 1) 生成故事与分镜
      const storyboard = await generateStoryWithAI(theme, idea);
      const scenes = Array.isArray(storyboard?.scenes) ? storyboard.scenes : [];
      const story = String(storyboard?.story || '');
 
      if (!scenes.length) {
        return res.status(500).json({ error: 'Failed to generate scenes' });
      }
 
      // 2) 异步创建图像生成任务（直连 ComfyUI）
      console.log('[GenerateStory] creating image job with scenes:', scenes.length);
      const { jobId, job } = createImageGenerationJob(scenes);
 
      // 3) 计算原创度（尽量异步完成，并行不阻塞主要返回）
      let originalityScore = 0;
      try {
        originalityScore = await calculateOriginalityWithAI(idea, story);
      } catch (err) {
        originalityScore = 0;
      }
 
      return res.json({
      success: true, 
        story,
        scenes,
        imageJobId: jobId,
        imageJobStatus: job?.status || 'queued',
        originalityScore,
      });
    } catch (error) {
      console.error('generate-story error:', error);
      return res.status(500).json({ error: 'Failed to generate story' });
    }
  })();
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

// ============================================
// Image Job Routes (ComfyUI)
// ============================================
app.get('/api/ai/image-jobs/:id', (req, res) => {
  try {
    const { getImageJob } = require('./services/comfyService');
    const jobId = req.params.id;
    const job = getImageJob(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Image job not found' });
    }
    return res.json(job);
  } catch (error) {
    console.error('get image job error:', error);
    return res.status(500).json({ error: 'Failed to fetch image job' });
  }
});

// ============================================
// Start server
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 WriteTalent Backend running on port ${PORT}`);
  console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
});




