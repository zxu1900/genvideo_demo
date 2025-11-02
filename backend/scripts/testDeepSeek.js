const OpenAI = require('openai');
require('dotenv').config();

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
  timeout: 30000, // 30 seconds timeout
});

async function testDeepSeekConnection() {
  console.log('🔍 Testing DeepSeek API connection...\n');
  console.log('API Key:', process.env.DEEPSEEK_API_KEY ? `${process.env.DEEPSEEK_API_KEY.substring(0, 10)}...` : 'NOT SET');
  console.log('Base URL: https://api.deepseek.com\n');
  
  try {
    console.log('📝 Test 1: Simple completion...');
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: '请用一句话说"你好"' }
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    console.log('✅ API call successful!');
    console.log('Response:', completion.choices[0].message.content);
    console.log('Tokens used:', completion.usage?.total_tokens);
    console.log('\n');
    
    // Test story generation
    console.log('📝 Test 2: Story generation...');
    const storyCompletion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位儿童文学作家' },
        { role: 'user', content: '请根据这个想法写一个50字的儿童故事：一个会飞的机器人' }
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    console.log('✅ Story generation successful!');
    console.log('Story:', storyCompletion.choices[0].message.content);
    console.log('Tokens used:', storyCompletion.usage?.total_tokens);
    console.log('\n');
    
    console.log('🎉 All tests passed! DeepSeek API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    if (error.code) {
      console.error('Error code:', error.code);
    }
    console.error('\nFull error:', error);
  }
}

testDeepSeekConnection();

