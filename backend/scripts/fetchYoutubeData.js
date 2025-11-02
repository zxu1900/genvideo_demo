const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// YouTube channel videos to fetch
const CHANNEL_URL = 'https://www.youtube.com/@writetalent/videos';

// Theme mapping for videos based on their content
const themeMapping = {
  'WriteTalent Introduction': 'creation-exploration',
  "Adam's Jet Card Dream": 'creation-exploration',
  'Adam "I design China Air Force Cards"': 'creation-exploration',
  'Kitty': 'creation-exploration',
  'Caterina "Me and AI"': 'creation-exploration',
  'Jason "I Made  A Healthy AI Agent for Seniors"': 'society-world',
  'Tony\'s "follow My Drone to visit my hometown Fuzhou"': 'creation-exploration',
  'Sissi: the Nature And AI': 'society-world',
  'An 11 - year - old Shanghai Girl': 'self-growth',
};

// Extract creator info from description
function extractCreatorInfo(title, description) {
  const ageMatch = description.match(/(\d+)\s*years?\s*old/i);
  const locationMatch = description.match(/from\s+([A-Za-z\s,]+?)[\.,]/i) || 
                       description.match(/study\s+in\s+([A-Za-z\s,]+?)[\.,]/i) ||
                       description.match(/born\s+in\s+([A-Za-z\s,]+?)[\.,]/i);
  
  // Extract name from title
  let creatorName = 'Anonymous';
  const nameMatch = title.match(/^([A-Za-z]+)/);
  if (nameMatch) {
    creatorName = nameMatch[1];
  }
  
  return {
    creatorName,
    creatorAge: ageMatch ? parseInt(ageMatch[1]) : 12,
    creatorLocation: locationMatch ? locationMatch[1].trim() : 'China'
  };
}

// Determine theme based on title and description
function determineTheme(title, description) {
  // Check exact matches first
  for (const [key, theme] of Object.entries(themeMapping)) {
    if (title.includes(key)) {
      return theme;
    }
  }
  
  // Check keywords in description
  const desc = description.toLowerCase();
  if (desc.includes('ai') || desc.includes('artificial intelligence') || desc.includes('technology')) {
    return 'creation-exploration';
  }
  if (desc.includes('nature') || desc.includes('environment') || desc.includes('earth') || desc.includes('health')) {
    return 'society-world';
  }
  if (desc.includes('family') || desc.includes('daughter') || desc.includes('sister')) {
    return 'emotions-relationships';
  }
  if (desc.includes('fashion') || desc.includes('business') || desc.includes('entrepreneur')) {
    return 'creation-exploration';
  }
  
  return 'creation-exploration'; // Default theme
}

async function fetchYoutubeVideos() {
  try {
    console.log('🎬 Fetching YouTube videos from @writetalent...\n');
    
    // Fetch playlist with basic info
    const { stdout } = await execPromise(
      `yt-dlp --flat-playlist --print-json "${CHANNEL_URL}" 2>/dev/null`
    );
    
    const lines = stdout.trim().split('\n').filter(line => line);
    const videos = lines.map(line => JSON.parse(line));
    
    console.log(`✅ Found ${videos.length} videos\n`);
    
    // Fetch detailed info for each video
    const detailedVideos = [];
    
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      console.log(`📹 Processing ${i + 1}/${videos.length}: ${video.title}`);
      
      try {
        const { stdout: detailStr } = await execPromise(
          `yt-dlp --dump-json "https://www.youtube.com/watch?v=${video.id}" 2>/dev/null`
        );
        
        const detail = JSON.parse(detailStr);
        const creatorInfo = extractCreatorInfo(video.title, video.description || '');
        const theme = determineTheme(video.title, video.description || '');
        
        const videoData = {
          youtube_id: video.id,
          title: video.title,
          description: video.description || '',
          duration: video.duration || 0,
          view_count: detail.view_count || 0,
          thumbnail: video.thumbnails && video.thumbnails.length > 0 
            ? video.thumbnails[video.thumbnails.length - 1].url 
            : '',
          upload_date: detail.upload_date || new Date().toISOString().split('T')[0].replace(/-/g, ''),
          youtube_url: `https://www.youtube.com/watch?v=${video.id}`,
          theme: theme,
          creator_name: creatorInfo.creatorName,
          creator_age: creatorInfo.creatorAge,
          creator_location: creatorInfo.creatorLocation,
          playlist_index: video.playlist_index
        };
        
        detailedVideos.push(videoData);
        
      } catch (err) {
        console.error(`❌ Error fetching details for ${video.id}:`, err.message);
        // Use basic info if detailed fetch fails
        const creatorInfo = extractCreatorInfo(video.title, video.description || '');
        const theme = determineTheme(video.title, video.description || '');
        
        detailedVideos.push({
          youtube_id: video.id,
          title: video.title,
          description: video.description || '',
          duration: video.duration || 0,
          view_count: video.view_count || 0,
          thumbnail: video.thumbnails && video.thumbnails.length > 0 
            ? video.thumbnails[video.thumbnails.length - 1].url 
            : '',
          upload_date: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          youtube_url: `https://www.youtube.com/watch?v=${video.id}`,
          theme: theme,
          creator_name: creatorInfo.creatorName,
          creator_age: creatorInfo.creatorAge,
          creator_location: creatorInfo.creatorLocation,
          playlist_index: video.playlist_index
        });
      }
    }
    
    console.log('\n✅ All videos processed successfully!\n');
    return detailedVideos;
    
  } catch (error) {
    console.error('❌ Error fetching YouTube videos:', error);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  fetchYoutubeVideos()
    .then(videos => {
      console.log('📊 Video Summary:');
      videos.forEach((v, i) => {
        console.log(`${i + 1}. ${v.title} (${v.theme}) - ${v.creator_name}, ${v.creator_age}yo`);
      });
      
      // Save to JSON file
      const fs = require('fs');
      fs.writeFileSync(
        './youtube_videos.json',
        JSON.stringify(videos, null, 2)
      );
      console.log('\n💾 Saved to youtube_videos.json');
    })
    .catch(error => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { fetchYoutubeVideos };

