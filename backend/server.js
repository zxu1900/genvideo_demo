const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { pool, query } = require('./db/config');
const { generateStoryWithAI, calculateOriginalityWithAI } = require('./services/aiService');
const { createImageGenerationJob, getImageJob } = require('./services/comfyService');
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
// AI Routes (enhanced story generation)
// ============================================
app.post('/api/ai/generate-story', async (req, res) => {
  const { idea, theme, useN8n = true } = req.body;
  
  if (!idea || !theme) {
    return res.status(400).json({ 
      error: 'Missing required fields: idea and theme' 
    });
  }

  try {
    console.log(`📝 Generating story for theme: ${theme}, idea length: ${idea.length}`);
    
    // 使用 DeepSeek API 生成分镜故事
    const storyboard = await generateStoryWithAI(theme, idea);
    const generatedStory = storyboard.story;
    const storyboardScenes = storyboard.scenes || [];

    let scenes = storyboardScenes;
    let imageJobId = null;
    let imageJobStatus = 'idle';

    // 判断是使用 n8n 还是直连 ComfyUI
    if (storyboardScenes.length > 0) {
      if (useN8n && process.env.N8N_BASE_URL) {
        // 使用 n8n 生成图片（回调模式）
        console.log('🎨 Using n8n for image generation (callback mode)');
        
        const taskId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002';
        const callbackUrl = `${backendUrl}/api/ai/image-callback/${taskId}`;
        
        // 创建任务记录
        imageTasks.set(taskId, {
          id: taskId,
          type: 'image',
          status: 'running',
          progress: 10,
          scenes: storyboardScenes.map((scene, index) => ({
            ...scene,
            scene_index: index,
            imageUrl: null
          })),
          result: null,
          error: null,
          n8nExecutionId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        console.log(`🔗 Callback URL for image task ${taskId}: ${callbackUrl}`);
        
        try {
          // 调用 n8n webhook
          const n8nWebhookUrl = `${process.env.N8N_BASE_URL}/webhook/story_images_parallel`;
          console.log(`📡 Calling n8n webhook: ${n8nWebhookUrl}`);
          
          const n8nPayload = {
            scenes: storyboardScenes.map((scene, index) => ({
              id: scene.id || index + 1,
              imagePrompt: scene.imagePrompt || scene.story || '',
              scene_index: index
            })),
            task_id: taskId,
            callback_url: callbackUrl
          };
          
          const n8nResponse = await axios.post(n8nWebhookUrl, n8nPayload, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
          });
          
          const task = imageTasks.get(taskId);
          task.n8nExecutionId = n8nResponse.data?.execution_id || 'unknown';
          task.updatedAt = new Date().toISOString();
          
          console.log(`✅ n8n image workflow triggered, execution ID: ${task.n8nExecutionId}`);
          
          imageJobId = taskId;
          imageJobStatus = 'running';
          scenes = task.scenes;
          
        } catch (error) {
          console.error('❌ n8n image workflow call failed:', error.message);
          
          // n8n 调用失败，回退到直连 ComfyUI
          console.log('⚠️  Falling back to direct ComfyUI connection');
          imageTasks.delete(taskId);
          
          const { jobId, job } = createImageGenerationJob(storyboardScenes);
          imageJobId = jobId;
          if (job) {
            scenes = job.scenes;
            imageJobStatus = job.status;
          }
        }
      } else {
        // 直连 ComfyUI（原有逻辑）
        console.log('🎨 Using direct ComfyUI connection');
        const { jobId, job } = createImageGenerationJob(storyboardScenes);
        imageJobId = jobId;
        if (job) {
          scenes = job.scenes;
          imageJobStatus = job.status;
        }
      }
    }
    
    // 使用 DeepSeek API 计算原创度分数
    const originalityScore = await calculateOriginalityWithAI(idea, generatedStory);
    
    console.log(`✅ Story generated, originality score: ${originalityScore}`);
    
    res.json({ 
      success: true, 
      story: generatedStory,
      scenes,
      originalityScore: originalityScore,
      imageJobId,
      imageJobStatus,
      metadata: {
        theme: theme,
        wordCount: generatedStory.length,
        sceneCount: storyboardScenes.length,
        generatedAt: new Date().toISOString(),
        aiProvider: 'deepseek',
        imageGenerator: useN8n && process.env.N8N_BASE_URL ? 'n8n' : 'comfyui'
      }
    });
  } catch (error) {
    console.error('❌ Story generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate story. Please try again.' 
    });
  }
});

// 图像生成回调接口（n8n 调用）
app.post('/api/ai/image-callback/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { status, task_id, images, stats, error } = req.body;
  
  console.log(`📥 [Image Callback] Received n8n callback for task ${taskId}:`, {
    status,
    imageCount: images?.length,
    stats,
    error
  });
  
  const task = imageTasks.get(taskId);
  
  if (!task) {
    console.warn(`⚠️  Image task ${taskId} not found for callback`);
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // 更新任务状态
  task.status = status || 'completed';
  task.progress = status === 'completed' ? 100 : (status === 'failed' ? task.progress : 90);
  task.updatedAt = new Date().toISOString();
  
  if (error) {
    task.error = error;
    console.error(`❌ [Image Callback] Task ${taskId} failed:`, error);
  }
  
  if (images && Array.isArray(images)) {
    // 更新场景的图片 URL
    images.forEach(img => {
      const scene = task.scenes.find(s => s.id === img.scene_id || s.scene_index === img.scene_index);
      if (scene) {
        scene.imageUrl = img.imageUrl;
        scene.imageError = img.error || null;
      }
    });
    
    task.result = { images };
    console.log(`✅ [Image Callback] Task ${taskId} completed with ${images.length} images`);
  }
  
  if (stats) {
    task.stats = stats;
  }
  
  res.json({
    success: true,
    message: 'Image task updated'
  });
});

app.get('/api/ai/image-jobs/:jobId', (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({ error: 'Missing image job ID' });
  }

  // 先检查 n8n 任务
  if (imageTasks.has(jobId)) {
    const task = imageTasks.get(jobId);
    return res.json({
      jobId: task.id,
      status: task.status,
      scenes: task.scenes,
      completedScenes: task.scenes.filter(s => s.imageUrl).length,
      totalScenes: task.scenes.length,
      progress: task.progress,
      stats: task.stats,
      errors: task.scenes.filter(s => s.imageError).map(s => ({
        sceneId: s.id,
        message: s.imageError
      })),
      timestamps: {
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    });
  }

  // 兼容旧的 ComfyUI 直连任务
  const job = getImageJob(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Image job not found' });
  }

  res.json({
    jobId: job.id,
    status: job.status,
    scenes: job.scenes,
    completedScenes: job.completedScenes,
    totalScenes: job.totalScenes,
    errors: job.errors,
    timestamps: {
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      updatedAt: job.updatedAt,
    },
    lastError: job.lastError,
  });
});

// ============================================
// Video Generation (Step6) - n8n Integration
// ============================================
const axios = require('axios');
const videoTasks = new Map(); // 简易内存任务存储
const imageTasks = new Map(); // 图像生成任务存储（n8n）

// Mock 视频生成接口 - 用于快速测试（无需等待 n8n）
app.post('/api/drama/generate-video-mock', async (req, res) => {
  try {
    const { scenes } = req.body;
    
    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({ error: '请提供有效的 scenes 数组' });
    }
    
    const taskId = `video_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const task = {
      id: taskId,
      type: 'video',
      status: 'running',
      progress: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      n8n_execution_id: 'mock',
      result: null,
      error: null
    };
    
    videoTasks.set(taskId, task);
    console.log(`🎭 [Mock] Created mock task ${taskId} with ${scenes.length} scenes`);
    
    // 模拟视频生成过程（5秒后自动完成）
    setTimeout(() => {
      task.status = 'completed';
      task.progress = 100;
      task.result = {
        videoUrl: 'http://49.235.210.6:8001/output/mock_final_video.mp4'
      };
      task.updated_at = new Date().toISOString();
      console.log(`✅ [Mock] Task ${taskId} completed automatically`);
    }, 5000); // 5秒后完成
    
    res.json({
      success: true,
      taskId: taskId,
      status: task.status,
      message: 'Mock 视频生成任务已创建（5秒后自动完成）',
      n8nExecutionId: 'mock',
      note: '这是测试接口，实际视频生成请使用 /api/drama/generate-video'
    });
    
  } catch (error) {
    console.error('❌ Mock video generation error:', error);
    res.status(500).json({ 
      error: 'Mock 任务创建失败', 
      details: error.message 
    });
  }
});

app.post('/api/drama/generate-video', async (req, res) => {
  try {
    console.log(`📥 [Step6] Received request, body keys:`, Object.keys(req.body));
    const { scenes } = req.body;
    
    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      console.error(`❌ [Step6] Invalid scenes:`, { scenesType: typeof scenes, scenesIsArray: Array.isArray(scenes), scenesLength: scenes?.length });
      return res.status(400).json({ 
        success: false, 
        error: '请提供有效的 scenes 数组' 
      });
    }

    console.log(`🎬 [Step6] Triggering video generation for ${scenes.length} scenes`);
    console.log(`📝 [Step6] First scene keys:`, Object.keys(scenes[0]));

    // 创建任务 ID
    const taskId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task = {
      id: taskId,
      type: 'video',
      status: 'queued',
      progress: 0,
      scenes: scenes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      n8n_execution_id: null,
      result: null,
      error: null
    };

    videoTasks.set(taskId, task);

    try {
      // 调用 n8n workflow (story_final_v2 - webhook path, workflow name is story_final_from_scenes)
      const n8nWebhookUrl = `${process.env.N8N_BASE_URL}/webhook/story_final_v2`;
      console.log(`📡 Calling n8n webhook: ${n8nWebhookUrl}`);
      
      // 字段映射：前端使用 voicePrompt，n8n 期望 audio_script
      const mappedScenes = scenes.map((scene, idx) => ({
        scene_id: scene.id || idx + 1,
        duration: scene.durationSeconds || 6,
        audio_script: scene.voicePrompt || scene.story || '',
        subtitle: scene.story || scene.voicePrompt || '',
        video_prompt: scene.videoPrompt || scene.imagePrompt || '',
        story: scene.story || ''
      }));

      console.log(`🎬 Mapped scenes for n8n:`, mappedScenes.length, 'scenes');
      console.log(`📝 First scene audio_script:`, mappedScenes[0]?.audio_script?.substring(0, 50) + '...');
      
      // 构建回调 URL（需要从环境变量或请求中获取后端地址）
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const callbackUrl = `${backendUrl}/api/drama/callback/${taskId}`;
      
      const n8nResponse = await axios.post(n8nWebhookUrl, {
        scenes: mappedScenes,
        original_story: scenes.map(s => s.story || s.voicePrompt || '').join(' '),
        task_id: taskId,
        callback_url: callbackUrl
      }, {
        timeout: 30000, // 30秒超时（n8n可能需要较长初始化时间）
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`📞 Callback URL for task ${taskId}: ${callbackUrl}`);

      // n8n webhook 返回后更新任务状态
      task.status = 'running';
      task.progress = 10;
      task.n8n_execution_id = n8nResponse.data?.executionId || 'unknown';
      task.updated_at = new Date().toISOString();

      console.log(`✅ n8n workflow triggered, execution ID: ${task.n8n_execution_id}`);

      res.json({
        success: true,
        taskId: taskId,
        status: task.status,
        message: '视频生成任务已提交到 n8n，请轮询任务状态',
        n8nExecutionId: task.n8n_execution_id
      });

    } catch (n8nError) {
      console.error('❌ n8n webhook调用失败:', n8nError.message);
      console.error('❌ n8n error stack:', n8nError.stack);
      
      task.status = 'failed';
      task.error = `n8n 调用失败: ${n8nError.message}`;
      task.updated_at = new Date().toISOString();

      res.status(500).json({
        success: false,
        taskId: taskId,
        error: 'n8n 视频生成服务暂时不可用',
        details: n8nError.message
      });
    }

  } catch (error) {
    console.error('❌ 视频生成任务创建失败:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: '视频生成失败，请稍后重试',
      details: error.message
    });
  }
});

// n8n 完成回调接口
app.post('/api/drama/callback/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { status, videoUrl, error } = req.body;

  console.log(`📥 [Callback] Received n8n callback for task ${taskId}:`, { status, videoUrl: videoUrl ? 'present' : 'null', error });

  const task = videoTasks.get(taskId);
  
  if (!task) {
    console.warn(`⚠️  Task ${taskId} not found for callback`);
    return res.status(404).json({ error: 'Task not found' });
  }

  // 更新任务状态
  task.status = status || 'completed';
  task.progress = status === 'completed' ? 100 : (status === 'failed' ? task.progress : 90);
  task.updated_at = new Date().toISOString();

  if (videoUrl) {
    task.result = { videoUrl };
    console.log(`✅ [Callback] Task ${taskId} completed with video: ${videoUrl}`);
  }

  if (error) {
    task.error = error;
    task.status = 'failed';
    console.error(`❌ [Callback] Task ${taskId} failed: ${error}`);
  }

  res.json({ success: true, message: 'Task updated' });
});

// 查询视频任务状态
app.get('/api/drama/task/:taskId', (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    return res.status(400).json({ error: 'Missing task ID' });
  }

  const task = videoTasks.get(taskId);

  if (!task) {
    return res.status(404).json({ error: 'Video task not found or expired' });
  }

  res.json({
    success: true,
    task: {
      id: task.id,
      type: task.type,
      status: task.status,
      progress: task.progress,
      result: task.result,
      error: task.error,
      n8nExecutionId: task.n8n_execution_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }
  });
});

// Note: Local fallback functions are now in services/aiService.js
// Kept here for backward compatibility if needed

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
// Start server
// ============================================
const server = app.listen(PORT, () => {
  console.log(`🚀 WriteTalent Backend running on port ${PORT}`);
  console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
});

const SERVER_TIMEOUT_MS = parseInt(process.env.SERVER_TIMEOUT_MS || '0', 10);
if (SERVER_TIMEOUT_MS > 0) {
  server.setTimeout(SERVER_TIMEOUT_MS);
  console.log(`⏱️  Server request timeout set to ${SERVER_TIMEOUT_MS}ms`);
} else {
  server.setTimeout(0); // disable timeout
  console.log('⏱️  Server request timeout disabled (infinite)');
}

