import { Card, ReviewHistory } from '../types';

export function calculateNextReview(card: Card, rating: number): Partial<Card> {
  let { easeFactor, reviewInterval, reviewCount } = card;

  if (rating < 3) {
    reviewCount = 0;
    reviewInterval = 1;
  } else {
    if (reviewCount === 0) {
      reviewInterval = 1;
    } else if (reviewCount === 1) {
      reviewInterval = 6;
    } else {
      reviewInterval = Math.round(reviewInterval * easeFactor);
    }
    reviewCount++;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  return {
    easeFactor,
    reviewInterval,
    reviewCount,
    lastReviewedAt: new Date(),
  };
}

export function calculateLinkDensity(
  cardId: string,
  outgoingLinks: string[],
  incomingLinks: string[],
  totalCards: number
): number {
  if (totalCards <= 1) return 0;
  return (outgoingLinks.length + incomingLinks.length) / (totalCards - 1);
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1);
}

export function calculateTFIDF(documents: string[][]): Map<string, number>[] {
  const tfidfScores: Map<string, number>[] = [];
  const docFrequency = new Map<string, number>();

  documents.forEach((doc) => {
    const uniqueTerms = new Set(doc);
    uniqueTerms.forEach((term) => {
      docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
    });
  });

  documents.forEach((doc) => {
    const termFrequency = new Map<string, number>();
    const tfidf = new Map<string, number>();

    doc.forEach((term) => {
      termFrequency.set(term, (termFrequency.get(term) || 0) + 1);
    });

    termFrequency.forEach((freq, term) => {
      const tf = freq / doc.length;
      const df = docFrequency.get(term) || 1;
      const idf = Math.log(documents.length / df);
      tfidf.set(term, tf * idf);
    });

    tfidfScores.push(tfidf);
  });

  return tfidfScores;
}

export function calculateCosineSimilarity(
  vec1: Map<string, number>,
  vec2: Map<string, number>
): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  const allTerms = new Set([...vec1.keys(), ...vec2.keys()]);

  allTerms.forEach((term) => {
    const v1 = vec1.get(term) || 0;
    const v2 = vec2.get(term) || 0;
    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  });

  const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
  return denom === 0 ? 0 : dotProduct / denom;
}

export function calculateReviewPriority(
  card: Card,
  linkDensity: number,
  now: Date
): number {
  if (!card.lastReviewedAt) {
    return 1 + linkDensity * 2;
  }

  const daysSinceLastReview =
    (now.getTime() - card.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);
  const overdueRatio = daysSinceLastReview / card.reviewInterval;

  const timePriority = Math.min(Math.max(overdueRatio, 0), 2);
  const densityPriority = linkDensity * 2;
  const easePriority = (3 - card.easeFactor) * 0.5;

  return timePriority + densityPriority + Math.max(easePriority, 0);
}

export function parseWikiLinks(content: string): string[] {
  const regex = /\[\[([^\]]+)\]\]/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

export interface DailyReviewStats {
  date: string;
  reviewed: number;
  newCards: number;
}

export function getReviewStatsByDay(
  reviewHistories: ReviewHistory[],
  days: number = 7
): DailyReviewStats[] {
  const statsMap = new Map<string, { reviewed: number; newCards: number }>();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    statsMap.set(dateStr, { reviewed: 0, newCards: 0 });
  }

  reviewHistories.forEach((history) => {
    const dateStr = new Date(history.reviewDate).toISOString().split('T')[0];
    if (statsMap.has(dateStr)) {
      const stats = statsMap.get(dateStr)!;
      stats.reviewed++;
      if (history.rating >= 3) {
        stats.newCards++;
      }
    }
  });

  return Array.from(statsMap.entries()).map(([date, stats]) => ({
    date,
    reviewed: stats.reviewed,
    newCards: stats.newCards,
  }));
}

export function getConsecutiveDaysWithoutReview(
  reviewHistories: ReviewHistory[]
): number {
  if (reviewHistories.length === 0) {
    return Infinity;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviewDates = new Set(
    reviewHistories.map((h) =>
      new Date(h.reviewDate).toISOString().split('T')[0]
    )
  );

  let consecutiveDays = 0;
  let checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (reviewDates.has(dateStr)) {
      break;
    }
    consecutiveDays++;
    checkDate.setDate(checkDate.getDate() - 1);

    if (consecutiveDays > 365) {
      break;
    }
  }

  return consecutiveDays;
}

export function getTodayReviewedCount(
  reviewHistories: ReviewHistory[]
): number {
  const today = new Date().toISOString().split('T')[0];
  return reviewHistories.filter(
    (h) => new Date(h.reviewDate).toISOString().split('T')[0] === today
  ).length;
}
