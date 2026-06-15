export type TimeRange = 'week' | 'month' | 'last30';

export type ReviewPriorityLevel = 'high' | 'medium' | 'low';

export interface Card {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastReviewedAt?: Date;
  reviewInterval: number;
  easeFactor: number;
  reviewCount: number;
  isFavorite: boolean;
  spaceId?: string;
  reviewPriority: ReviewPriorityLevel;
  customNextReviewDate?: Date;
}

export interface Link {
  id: string;
  sourceCardId: string;
  targetCardId: string;
  linkType: 'forward' | 'backward' | 'bidirectional';
  createdAt: Date;
}

export interface ReadingRecord {
  id: string;
  cardId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  fromCardId?: string;
}

export interface ImportSource {
  id: string;
  type: 'bookmark' | 'annotation';
  title: string;
  url?: string;
  content: string;
  importedAt: Date;
  processed: boolean;
  suggestedLinks: string[];
}

export interface ReviewHistory {
  id: string;
  cardId: string;
  reviewDate: Date;
  rating: number;
  newInterval: number;
}

export interface CardVersion {
  id: string;
  cardId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  size: number;
}

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  linkCount: number;
  reviewPriority: number;
  tagColor: string;
  tags: string[];
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface LinkSuggestion {
  cardId: string;
  cardTitle: string;
  similarity: number;
  reason: string;
}

export type ReviewRating = 0 | 1 | 2 | 3 | 4 | 5;

export interface TagStats {
  name: string;
  cardCount: number;
  cards: Card[];
  lastUsedAt: Date;
}

export interface Achievement {
  id: string;
  type: 'streak_7' | 'streak_30' | 'streak_100';
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface LearningDay {
  date: string;
  readCount: number;
  reviewCount: number;
  duration: number;
  cardsRead: string[];
  cardsReviewed: string[];
}

export interface WeeklyReport {
  startDate: string;
  endDate: string;
  reviewCompletionRate: number;
  totalReviews: number;
  totalReviewCards: number;
  newCardsCount: number;
  newLinksCount: number;
  totalReadingSeconds: number;
  topVisitedCards: { cardId: string; cardTitle: string; visitCount: number }[];
  activeDays: number;
  currentStreak: number;
}

export interface RelationNode {
  cardId: string;
  cardTitle: string;
  relationType: 'outgoing' | 'incoming' | 'second-order';
  direction?: 'forward' | 'backward';
  path: string[];
  depth: number;
  tagColor: string;
  tags: string[];
}

export interface CardRelations {
  currentCardId: string;
  currentCardTitle: string;
  firstOrder: {
    outgoing: RelationNode[];
    incoming: RelationNode[];
  };
  secondOrder: RelationNode[];
}

export type AchievementType = 'streak_7' | 'streak_30' | 'streak_100';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  weekDuration: number;
  totalDuration: number;
  activeDays: number;
  achievements: Achievement[];
}

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  titleFormat: string;
  contentSkeleton: string;
  defaultTags: string[];
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeSpace {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
