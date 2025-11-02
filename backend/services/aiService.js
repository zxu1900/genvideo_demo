const OpenAI = require('openai');
require('dotenv').config();

/**
 * DeepSeek AI 服务
 * DeepSeek API 兼容 OpenAI SDK
 */
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

/**
 * 儿童故事创作专家 System Prompt
 */
const STORY_WRITER_SYSTEM_PROMPT = `你是一位世界知名的儿童文学作家，类似于《哈利·波特》作者 J.K. 罗琳、《夏洛的网》作者 E.B. 怀特那样富有想象力和温暖情感的作家。

你的专长是：
- 从孩子们的只言片语、零散想法中提炼出完整的故事核心
- 用简单、温暖、富有画面感的语言讲述故事
- 故事中蕴含积极的价值观和人生智慧
- 激发孩子的想象力和创造力
- 故事适合 7-14 岁儿童阅读

创作原则：
1. 尊重孩子的想法：保留孩子原创想法的核心，不要完全改变他们的创意
2. 温暖积极：故事要传递爱、友谊、勇气、成长等正向价值观
3. 富有想象力：可以天马行空，但要符合基本逻辑
4. 语言优美：使用生动、形象、富有诗意的语言
5. 情感共鸣：故事要能触动孩子的心灵，引发思考
6. 适当长度：故事长度控制在 400-600 字，适合 2-3 分钟阅读

故事结构：
- 开篇：引人入胜的开头，建立场景和主角
- 发展：遇到问题或挑战，展开冒险
- 高潮：解决问题的关键时刻
- 结尾：温暖的收尾，传递积极寓意`;

/**
 * 主题相关的创作提示
 */
const THEME_PROMPTS = {
  'fantasy-adventure': '这是一个充满魔法和冒险的故事，请创作一个奇幻冒险故事。',
  'creation-exploration': '这是一个关于创造和探索的故事，请创作一个充满创意和发明精神的故事。',
  'emotions-relationships': '这是一个关于情感和关系的故事，请创作一个温馨感人的故事。',
  'self-growth': '这是一个关于自我成长的故事，请创作一个鼓舞人心的成长故事。',
  'society-world': '这是一个关于社会和世界的故事，请创作一个开阔视野的故事。',
  'everyday-life': '这是一个关于日常生活的故事，请创作一个贴近生活的温暖故事。'
};

/**
 * 使用 DeepSeek API 生成儿童故事
 */
async function generateStoryWithAI(theme, idea) {
  // 检查是否配置了 DeepSeek API key
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'your_api_key_here') {
    console.log('⚠️  DeepSeek API key not configured, using local generation');
    return generateLocalStory(theme, idea);
  }

  try {
    const themePrompt = THEME_PROMPTS[theme] || '请创作一个温馨可爱的儿童故事。';
    
    const userPrompt = `${themePrompt}

孩子的想法：${idea}

请基于以上想法创作一个完整的儿童故事，要求：
1. 保留孩子想法的核心创意
2. 故事完整、流畅、富有画面感
3. 语言优美、适合儿童阅读
4. 传递积极正向的价值观
5. 字数控制在 400-600 字

请直接输出故事内容，不要包含任何额外说明或标题。`;

    console.log('🤖 Calling DeepSeek API for story generation...');
    
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: STORY_WRITER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      stream: false,
    });

    const story = completion.choices[0].message.content.trim();
    console.log('✅ Story generated successfully via DeepSeek API');
    console.log(`📊 Tokens used: ${completion.usage?.total_tokens || 'N/A'}`);
    
    return story;
  } catch (error) {
    console.error('❌ DeepSeek API error:', error.message);
    if (error.response) {
      console.error('API response error:', error.response.status, error.response.data);
    }
    
    // Fallback to local generation if API fails
    console.log('⚠️  Falling back to local generation...');
    return generateLocalStory(theme, idea);
  }
}

/**
 * 本地故事生成（作为 API 失败时的后备方案）
 */
function generateLocalStory(theme, idea) {
  const themeIntros = {
    'fantasy-adventure': ['在一个充满魔法的世界里', '在遥远的魔法王国中', '在星光闪烁的夜晚'],
    'creation-exploration': ['在一个充满创意的小镇上', '在科学实验室的角落里', '在发明家的工作室中'],
    'emotions-relationships': ['在温暖的阳光下', '在一个充满爱的家庭里', '在友谊的花园中'],
    'self-growth': ['在成长的路上', '在一个普通却特别的日子', '在面对挑战的时刻'],
    'society-world': ['在我们生活的世界里', '在一个美丽的小镇上', '在社区的中心'],
    'everyday-life': ['在平凡的一天', '在我们身边', '在日常生活中']
  };
  
  const intro = themeIntros[theme] 
    ? themeIntros[theme][Math.floor(Math.random() * themeIntros[theme].length)]
    : '很久很久以前';
  
  const keywords = extractKeywords(idea);
  const mainElement = keywords[0] || '一个特别的主角';
  
  const story = `${intro}，有${mainElement}的故事正在悄悄展开。

${idea.substring(0, 100)}${idea.length > 100 ? '...' : ''}

这个想法如同一颗种子，在心中慢慢发芽。从最初的小小念头，到逐渐清晰的梦想，每一步都充满了惊喜和挑战。

在探索的旅程中，遇到了许多有趣的伙伴。他们有的勇敢，有的善良，有的充满智慧。大家一起分享欢笑，也一起面对困难。当困难来临时，他们没有放弃，而是相互鼓励，共同寻找解决的方法。

终于，在大家的努力下，梦想变成了现实。那一刻，天空中仿佛绽放出最绚烂的烟花，每个人的脸上都洋溢着幸福的笑容。

这个故事告诉我们：每个人的想法都是珍贵的宝藏，只要勇敢地追求，用心去创造，就能让梦想之花绽放出最美的光芒。

故事的结尾，是全新的开始。因为在每个孩子的心中，都藏着无限的可能性，等待着被发现，被创造，被分享给这个世界。`;

  return story;
}

/**
 * 使用 DeepSeek API 评估原创度
 */
async function calculateOriginalityWithAI(idea, story) {
  // 检查是否配置了 DeepSeek API key
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'your_api_key_here') {
    console.log('⚠️  DeepSeek API key not configured, using local scoring');
    return calculateLocalOriginalityScore(idea, story);
  }

  try {
    const scoringPrompt = `你是一位专业的创意评审专家，擅长评估儿童故事的原创性。

请根据以下维度评估这个故事的原创度（满分 100 分）：

1. 创意新颖度 (30分) - 故事核心创意是否独特
2. 情节独特性 (25分) - 故事情节发展是否出人意料
3. 角色塑造 (20分) - 角色设定是否有特色
4. 语言表达 (15分) - 用词是否富有创造性
5. 主题深度 (10分) - 主题是否有深度

评分标准：
- 90-100分：极具原创性，令人眼前一亮
- 80-89分：很有创意，故事新颖独特
- 70-79分：有一定创意，但部分元素常见
- 60-69分：创意一般

原始想法：${idea}

生成的故事：${story.substring(0, 500)}...

请只输出一个 60-100 之间的整数分数，不要有任何其他内容。`;

    console.log('🤖 Calling DeepSeek API for originality scoring...');
    
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: scoringPrompt }
      ],
      temperature: 0.3,
      max_tokens: 20,
      stream: false,
    });

    const scoreText = completion.choices[0].message.content.trim();
    const score = parseInt(scoreText.match(/\d+/)?.[0] || '75');
    
    console.log('✅ Originality score calculated via DeepSeek:', score);
    console.log(`📊 Tokens used: ${completion.usage?.total_tokens || 'N/A'}`);
    
    return Math.min(Math.max(score, 60), 100);
  } catch (error) {
    console.error('❌ DeepSeek scoring error:', error.message);
    if (error.response) {
      console.error('API response error:', error.response.status);
    }
    
    // Fallback to local calculation
    console.log('⚠️  Falling back to local scoring...');
    return calculateLocalOriginalityScore(idea, story);
  }
}

/**
 * 本地原创度计算（后备方案）
 */
function calculateLocalOriginalityScore(idea, story) {
  let score = 60;
  
  const ideaLength = idea.length;
  if (ideaLength > 200) score += 15;
  else if (ideaLength > 100) score += 10;
  else if (ideaLength > 50) score += 5;
  
  const uniqueWords = new Set(idea.toLowerCase().match(/[\u4e00-\u9fa5a-z]+/g) || []);
  const diversity = Math.min(uniqueWords.size / 10, 1);
  score += Math.floor(diversity * 10);
  
  const emotionalWords = ['爱', '友谊', '勇敢', '梦想', '希望', '快乐', '温暖', '感动', 'love', 'dream', 'hope', 'happy'];
  const emotionalScore = emotionalWords.filter(word => 
    idea.toLowerCase().includes(word) || story.toLowerCase().includes(word)
  ).length;
  score += Math.min(emotionalScore * 2, 10);
  
  const creativeWords = ['机器人', '魔法', '太空', '发明', '冒险', '变身', 'robot', 'magic', 'space', 'invent'];
  const creativityScore = creativeWords.filter(word => 
    idea.toLowerCase().includes(word)
  ).length;
  score += Math.min(creativityScore * 2, 5);
  
  score += Math.floor(Math.random() * 6);
  
  return Math.min(Math.max(score, 60), 100);
}

/**
 * 提取关键词
 */
function extractKeywords(text) {
  const words = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [];
  return words.slice(0, 3);
}

module.exports = {
  generateStoryWithAI,
  calculateOriginalityWithAI,
  generateLocalStory,
  calculateLocalOriginalityScore,
  extractKeywords,
};

