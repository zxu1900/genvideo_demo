const fs = require('fs');
const path = require('path');
const { pool } = require('../db/config');
const { fetchYoutubeVideos } = require('./fetchYoutubeData');

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database initialization...\n');
    
    // Read and execute schema SQL
    console.log('📋 Creating database schema...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../db/schema.sql'),
      'utf8'
    );
    await client.query(schemaSQL);
    console.log('✅ Database schema created successfully\n');
    
    // Create default users for the videos
    console.log('👥 Creating default users...');
    const defaultUsers = [
      { username: 'WriteTalent', email: 'admin@writetalent.chat', age: null, type: 'parent' },
      { username: 'Adam', email: 'adam@writetalent.chat', age: 11, type: 'child' },
      { username: 'Kitty', email: 'kitty@writetalent.chat', age: 16, type: 'child' },
      { username: 'Caterina', email: 'caterina@writetalent.chat', age: 11, type: 'child' },
      { username: 'Jason', email: 'jason@writetalent.chat', age: 13, type: 'child' },
      { username: 'Tony', email: 'tony@writetalent.chat', age: 9, type: 'child' },
      { username: 'Sissi', email: 'sissi@writetalent.chat', age: 8, type: 'child' },
      { username: 'Yania', email: 'yania@writetalent.chat', age: 11, type: 'child' },
    ];
    
    const userIds = {};
    for (const user of defaultUsers) {
      const result = await client.query(
        `INSERT INTO users (username, email, age, type, avatar, tokens, followers_count, following_count, works_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO UPDATE 
         SET username = EXCLUDED.username
         RETURNING id`,
        [
          user.username,
          user.email,
          user.age,
          user.type,
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
          150, // tokens
          Math.floor(Math.random() * 100), // random followers
          Math.floor(Math.random() * 50), // random following
          user.type === 'parent' ? 9 : 1 // works count
        ]
      );
      userIds[user.username] = result.rows[0].id;
      console.log(`  ✓ Created user: ${user.username}`);
    }
    console.log(`✅ Created ${defaultUsers.length} users\n`);
    
    // Fetch and insert YouTube videos
    console.log('🎬 Fetching YouTube videos...');
    let videos = [];
    try {
      videos = await fetchYoutubeVideos();
      console.log(`✅ Fetched ${videos.length} videos\n`);
    } catch (error) {
      console.log('⚠️  Failed to fetch from YouTube, using sample data...\n');
      // Use sample data if YouTube fetch fails
      videos = [
        { youtube_id: 'sample1', title: 'WriteTalent Introduction', description: 'Welcome to WriteTalent platform', theme: 'creation-exploration', creator_name: 'WriteTalent', creator_age: null, creator_location: 'Global', youtube_url: 'https://www.youtube.com/watch?v=sample1', duration: 56, view_count: 100, thumbnail: '', upload_date: '20241101' },
        { youtube_id: 'sample2', title: "Adam's Jet Card Dream", description: 'An 11-year-old from Tianjin designs China Air Force Cards', theme: 'creation-exploration', creator_name: 'Adam', creator_age: 11, creator_location: 'Tianjin', youtube_url: 'https://www.youtube.com/watch?v=sample2', duration: 46, view_count: 50, thumbnail: '', upload_date: '20241102' },
        { youtube_id: 'sample3', title: 'Kitty: Korean Fashion Buyer', description: 'A 16-year-old student from Australia explores Korean fashion', theme: 'creation-exploration', creator_name: 'Kitty', creator_age: 16, creator_location: 'Australia', youtube_url: 'https://www.youtube.com/watch?v=sample3', duration: 34, view_count: 75, thumbnail: '', upload_date: '20241103' },
        { youtube_id: 'sample4', title: 'Caterina: Me and AI', description: 'An 11-year-old from Shanghai shares her story with AI', theme: 'creation-exploration', creator_name: 'Caterina', creator_age: 11, creator_location: 'Shanghai', youtube_url: 'https://www.youtube.com/watch?v=sample4', duration: 74, view_count: 60, thumbnail: '', upload_date: '20241104' },
        { youtube_id: 'sample5', title: 'Jason: Healthy AI Agent', description: 'A 13-year-old creates a healthy AI agent for seniors', theme: 'society-world', creator_name: 'Jason', creator_age: 13, creator_location: 'China', youtube_url: 'https://www.youtube.com/watch?v=sample5', duration: 65, view_count: 80, thumbnail: '', upload_date: '20241105' },
        { youtube_id: 'sample6', title: "Tony: Drone Tour of Fuzhou", description: 'A 9-year-old takes us on a drone tour of his hometown Fuzhou', theme: 'creation-exploration', creator_name: 'Tony', creator_age: 9, creator_location: 'Fuzhou', youtube_url: 'https://www.youtube.com/watch?v=sample6', duration: 55, view_count: 45, thumbnail: '', upload_date: '20241106' },
        { youtube_id: 'sample7', title: 'Sissi: Nature And AI', description: 'An 8-year-old explores the relationship between nature and AI', theme: 'society-world', creator_name: 'Sissi', creator_age: 8, creator_location: 'China', youtube_url: 'https://www.youtube.com/watch?v=sample7', duration: 50, view_count: 55, thumbnail: '', upload_date: '20241107' },
        { youtube_id: 'sample8', title: 'Adam: China Air Force Cards', description: 'Designing China Air Force Cards', theme: 'creation-exploration', creator_name: 'Adam', creator_age: 11, creator_location: 'Tianjin', youtube_url: 'https://www.youtube.com/watch?v=sample8', duration: 48, view_count: 40, thumbnail: '', upload_date: '20241108' },
        { youtube_id: 'sample9', title: 'Yania: Eldest Daughter', description: 'An 11-year-old Shanghai girl shares her story', theme: 'self-growth', creator_name: 'Yania', creator_age: 11, creator_location: 'Shanghai', youtube_url: 'https://www.youtube.com/watch?v=sample9', duration: 70, view_count: 65, thumbnail: '', upload_date: '20241109' },
      ];
      console.log(`✅ Using ${videos.length} sample videos\n`);
    }
    
    console.log('💾 Inserting videos into database...');
    let insertedCount = 0;
    
    for (const video of videos) {
      // Map creator name to user ID
      let userId = userIds[video.creator_name];
      if (!userId) {
        userId = userIds['WriteTalent']; // Default to WriteTalent admin
      }
      
      // Parse upload date (format: YYYYMMDD)
      const uploadDate = video.upload_date;
      const publishedAt = uploadDate 
        ? `${uploadDate.substring(0, 4)}-${uploadDate.substring(4, 6)}-${uploadDate.substring(6, 8)}`
        : new Date().toISOString().split('T')[0];
      
      // Prepare video metadata
      const videoMetadata = {
        youtube_id: video.youtube_id,
        duration: video.duration,
        view_count: video.view_count,
        thumbnail: video.thumbnail,
        upload_date: video.upload_date,
        creator_location: video.creator_location
      };
      
      // Insert portfolio
      const result = await client.query(
        `INSERT INTO portfolios (
          user_id, title, theme, original_idea, story,
          video_url, video_metadata, originality_score,
          likes_count, views_count, rating, status,
          published_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT DO NOTHING
        RETURNING id`,
        [
          userId,
          video.title,
          video.theme,
          video.description.substring(0, 500), // First 500 chars as idea
          video.description, // Full description as story
          video.youtube_url,
          JSON.stringify(videoMetadata),
          Math.floor(Math.random() * 20) + 80, // Random score 80-100
          Math.floor(Math.random() * 50), // Random likes 0-50
          video.view_count || Math.floor(Math.random() * 100), // Use actual or random views
          (Math.random() * 1 + 4).toFixed(1), // Random rating 4.0-5.0
          'published',
          publishedAt,
          publishedAt
        ]
      );
      
      if (result.rows.length > 0) {
        insertedCount++;
        console.log(`  ✓ Inserted: ${video.title}`);
      }
    }
    
    console.log(`✅ Inserted ${insertedCount} videos into database\n`);
    
    // Update users' works_count
    await client.query(`
      UPDATE users u
      SET works_count = (
        SELECT COUNT(*) FROM portfolios p WHERE p.user_id = u.id
      )
    `);
    
    console.log('✅ Updated users works_count\n');
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('\n✨ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };




