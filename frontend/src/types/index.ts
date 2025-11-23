// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  age?: number;
  type: 'child' | 'parent';
  avatar?: string;
  parentEmail?: string;
  tokens: number;
  followersCount: number;
  followingCount: number;
  worksCount: number;
  createdAt: Date;
}

// Portfolio Types
export type Theme = 
  | 'emotions-relationships'
  | 'self-growth'
  | 'creation-exploration'
  | 'society-world'
  | 'fantasy-adventure'
  | 'everyday-life';

export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  theme: Theme;
  originalIdea: string;
  story: string;
  storybook?: {
    pages: StoryPage[];
    style: IllustrationStyle;
  };
  music?: string; // URL or ID
  video?: string; // URL or ID
  videoMetadata?: {
    youtube_id?: string;
    duration?: number;
    view_count?: number;
    thumbnail?: string;
    upload_date?: string;
    creator_location?: string;
  };
  originalityScore: number;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: Date;
  publishedAt?: Date;
  // Additional fields for display
  creatorName: string;
  creatorAge: number;
  creatorAvatar: string;
  views: number;
  rating: number;
}

export interface StoryScene {
  id: number;
  title?: string;
  durationSeconds: number;
  story: string;
  voicePrompt: string;
  imagePrompt: string;
  videoPrompt: string;
  imageUrl?: string | null;
  comfyImage?: {
    filename: string;
    subfolder?: string;
    type?: string;
  };
  imageError?: string | null;
}

export interface StoryPage {
  id: string;
  pageNumber: number;
  text: string;
  illustration?: string; // URL
}

export type IllustrationStyle = 'watercolor' | 'cartoon' | '3d' | 'sketch' | 'digital';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
}

// Boot Camp Types
export interface BusinessPlan {
  id: string;
  userId: string;
  title: string;
  sections: {
    executiveSummary: string;
    problemSolution: string;
    marketAnalysis: string;
    productService: string;
    marketingStrategy: string;
    financialProjections: string;
    team: string;
  };
  stage: BusinessStage;
  createdAt: Date;
  updatedAt: Date;
}

export type BusinessStage = 
  | 'creative-idea'
  | 'structured-concept'
  | 'market-analysis'
  | 'business-plan'
  | 'pitch-video';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string; // "2 hours"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  progress?: number; // 0-100
  enrolled: boolean;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  completed: boolean;
}

export interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

// Token System
export interface TokenTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend';
  reason: string;
  timestamp: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
}

