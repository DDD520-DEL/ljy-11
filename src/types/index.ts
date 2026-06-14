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

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  linkCount: number;
  reviewPriority: number;
  tagColor: string;
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
