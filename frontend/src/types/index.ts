export type ShelfType = 'WANT_TO_READ' | 'CURRENTLY_READING' | 'READ' | 'DID_NOT_FINISH' | 'CUSTOM';

export interface User {
  id: string;
  biDanh: string;
  avatarSeed: string;
  currentStreak: number;
  longestStreak?: number;
  lastReadDate?: string | null;
  createdAt?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    dailyReadingTargetMinutes?: number;
  };
}

export interface Book {
  id: string;
  googleBookId?: string | null;
  isbn13?: string | null;
  title: string;
  authors: string[];
  description?: string | null;
  coverUrl?: string | null;
  pageCount?: number | null;
  categories: string[];
  publishedDate?: string | null;
  avgRating: number | string;
  ratingsCount?: number;
  _count?: {
    reviews: number;
    shelves: number;
  };
}

export interface ShelfItem {
  id: string;
  userId: string;
  bookId: string;
  type: ShelfType;
  customShelfName?: string | null;
  currentPage: number;
  startedAt?: string | null;
  finishedAt?: string | null;
  updatedAt: string;
  book: Book;
}

export interface Review {
  id: string;
  rating: number;
  content: string;
  hasSpoilers: boolean;
  isAnonymous: boolean;
  anonymousAlias?: string | null;
  authorName?: string;
  avatarSeed?: string;
  likesCount: number;
  createdAt: string;
  user?: {
    id: string;
    biDanh: string;
    avatarSeed: string;
  } | null;
}

export interface Thread {
  id: string;
  title: string;
  content?: string;
  tags: string[];
  hasSpoilers: boolean;
  displayAlias: string;
  viewsCount: number;
  postsCount: number;
  createdAt: string;
  isPinned: boolean;
  isLocked?: boolean;
  bookId?: string | null;
  book?: {
    id: string;
    title: string;
    coverUrl?: string | null;
  } | null;
}

export interface Post {
  id: string;
  threadId: string;
  parentPostId?: string | null;
  content: string;
  hasSpoilers: boolean;
  displayAlias: string;
  isOp: boolean;
  upvotes: number;
  createdAt: string;
  replies?: Post[];
}

export interface ReadingLog {
  id: string;
  clientLogId: string;
  bookId: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  durationMinutes: number;
  note?: string | null;
  loggedAt: string;
}

export interface Goal {
  id: string;
  year: number;
  targetBooks: number;
  completedBooks: number;
  targetPages?: number | null;
  completedPages: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';
}

export interface DashboardStats {
  user: User;
  goal: Goal | null;
  last30Days: {
    pagesRead: number;
    minutesRead: number;
    sessionsCount: number;
  };
  shelves: Record<ShelfType, number>;
}

export interface ReadingChartPoint {
  date: string;
  pages: number;
  minutes: number;
}

export interface BookRecommendation {
  title: string;
  author: string;
  category: string;
  matchScore: number;
  whyItMatches: string;
  estimatedReadingDays: number;
}

export interface AIRecommendationResponse {
  readerPersonaSummary: string;
  recommendations: BookRecommendation[];
  source: 'cache' | 'openai';
  generatedAt: string;
}
