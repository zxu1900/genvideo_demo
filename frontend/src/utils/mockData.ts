import { Portfolio, Course, User, Theme } from '../types';

export const mockUsers: User[] = [
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
  },
  {
    id: '2',
    username: 'Alex_Creator',
    email: 'alex@example.com',
    age: 15,
    type: 'child',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    tokens: 420,
    followersCount: 300,
    followingCount: 120,
    worksCount: 12,
    createdAt: new Date('2023-11-20'),
  },
];

export const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    userId: '1',
    title: 'The Magic Garden Adventure',
    theme: 'fantasy-adventure',
    originalIdea: 'A young girl discovers a magical garden where plants can talk...',
    story: 'Once upon a time, in a small town, there lived a curious girl named Lily. One day, while exploring her grandmother\'s backyard, she stumbled upon a hidden garden. To her amazement, the flowers could talk! The wise old Rose told her about an ancient magic that needed her help...',
    creatorName: 'Emma_Artist',
    creatorAge: 12,
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    views: 1250,
    rating: 4.8,
    storybook: {
      pages: [
        {
          id: 'p1',
          pageNumber: 1,
          text: 'Lily discovered the secret garden behind the old oak tree.',
          illustration: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        },
        {
          id: 'p2',
          pageNumber: 2,
          text: 'The talking flowers welcomed her with songs and stories.',
          illustration: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
        },
      ],
      style: 'watercolor',
    },
    originalityScore: 92,
    likes: 156,
    likedBy: ['2', '3', '4'],
    comments: [
      {
        id: 'c1',
        userId: '2',
        userName: 'Alex_Creator',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        content: 'This is such a creative story! I love the talking flowers idea! 🌸',
        createdAt: new Date('2024-10-10'),
      },
    ],
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
    creatorName: 'Alex_Creator',
    creatorAge: 15,
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    views: 2100,
    rating: 4.9,
    originalityScore: 88,
    likes: 203,
    likedBy: ['1', '3'],
    comments: [],
    createdAt: new Date('2024-09-20'),
    publishedAt: new Date('2024-09-21'),
  },
];

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Marketing for Kids',
    description: 'Learn the basics of marketing and how to promote your creative works',
    thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=400',
    duration: '2 hours',
    difficulty: 'Beginner',
    topics: ['Marketing', 'Business'],
    progress: 0,
    enrolled: false,
    chapters: [
      {
        id: 'ch1',
        title: 'What is Marketing?',
        duration: '15 min',
        completed: false,
      },
      {
        id: 'ch2',
        title: 'Understanding Your Audience',
        duration: '20 min',
        completed: false,
      },
    ],
  },
  {
    id: '2',
    title: 'Creative Storytelling',
    description: 'Master the art of crafting engaging stories',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
    duration: '3 hours',
    difficulty: 'Intermediate',
    topics: ['Writing', 'Creativity'],
    progress: 45,
    enrolled: true,
    chapters: [
      {
        id: 'ch1',
        title: 'Story Structure',
        duration: '25 min',
        completed: true,
      },
      {
        id: 'ch2',
        title: 'Character Development',
        duration: '30 min',
        completed: false,
      },
    ],
  },
];

export const themeData: { id: Theme; name: string; icon: string; description: string }[] = [
  {
    id: 'emotions-relationships',
    name: 'Emotions & Relationships',
    icon: '❤️',
    description: 'Stories about feelings, friendships, and connections',
  },
  {
    id: 'self-growth',
    name: 'Self & Personal Growth',
    icon: '⭐',
    description: 'Tales of self-discovery and personal development',
  },
  {
    id: 'creation-exploration',
    name: 'Creation & Exploration',
    icon: '🔭',
    description: 'Adventures in making and discovering new things',
  },
  {
    id: 'society-world',
    name: 'Society & the Wider World',
    icon: '🌍',
    description: 'Understanding communities and global perspectives',
  },
  {
    id: 'fantasy-adventure',
    name: 'Fantasy & Adventure',
    icon: '🪄',
    description: 'Magical journeys and exciting quests',
  },
  {
    id: 'everyday-life',
    name: 'Everyday Life & Practical Skills',
    icon: '🏠',
    description: 'Real-world situations and life skills',
  },
];

