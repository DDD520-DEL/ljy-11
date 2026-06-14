import { Card, Link, ReviewHistory, ReadingRecord, Achievement, AchievementType, LearningDay, StreakInfo } from '../types';

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

export interface PeriodComparison {
  currentPeriod: number;
  previousPeriod: number;
  changePercent: number;
  isPositive: boolean;
}

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDaysInRange(daysAgoStart: number, daysAgoEnd: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = daysAgoStart; i <= daysAgoEnd; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(getDateKey(date));
  }

  return dates;
}

export function getCardsWeekOverWeek(cards: Card[]): PeriodComparison {
  const thisWeekDates = new Set(getDaysInRange(0, 6));
  const lastWeekDates = new Set(getDaysInRange(7, 13));

  let thisWeekCount = 0;
  let lastWeekCount = 0;

  cards.forEach((card) => {
    const dateKey = getDateKey(new Date(card.createdAt));
    if (thisWeekDates.has(dateKey)) {
      thisWeekCount++;
    }
    if (lastWeekDates.has(dateKey)) {
      lastWeekCount++;
    }
  });

  const changePercent =
    lastWeekCount === 0
      ? thisWeekCount > 0
        ? 100
        : 0
      : Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);

  return {
    currentPeriod: thisWeekCount,
    previousPeriod: lastWeekCount,
    changePercent,
    isPositive: changePercent >= 0,
  };
}

export function getLinksWeekOverWeek(links: Link[]): PeriodComparison {
  const thisWeekDates = new Set(getDaysInRange(0, 6));
  const lastWeekDates = new Set(getDaysInRange(7, 13));

  let thisWeekCount = 0;
  let lastWeekCount = 0;

  links.forEach((link) => {
    const dateKey = getDateKey(new Date(link.createdAt));
    if (thisWeekDates.has(dateKey)) {
      thisWeekCount++;
    }
    if (lastWeekDates.has(dateKey)) {
      lastWeekCount++;
    }
  });

  const changePercent =
    lastWeekCount === 0
      ? thisWeekCount > 0
        ? 100
        : 0
      : Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);

  return {
    currentPeriod: thisWeekCount,
    previousPeriod: lastWeekCount,
    changePercent,
    isPositive: changePercent >= 0,
  };
}

export function getReadingTimeWeekOverWeek(
  readingRecords: ReadingRecord[]
): PeriodComparison {
  const thisWeekDates = new Set(getDaysInRange(0, 6));
  const lastWeekDates = new Set(getDaysInRange(7, 13));

  let thisWeekSeconds = 0;
  let lastWeekSeconds = 0;

  readingRecords.forEach((record) => {
    const dateKey = getDateKey(new Date(record.startTime));
    if (thisWeekDates.has(dateKey)) {
      thisWeekSeconds += record.duration;
    }
    if (lastWeekDates.has(dateKey)) {
      lastWeekSeconds += record.duration;
    }
  });

  const changePercent =
    lastWeekSeconds === 0
      ? thisWeekSeconds > 0
        ? 100
        : 0
      : Math.round(((thisWeekSeconds - lastWeekSeconds) / lastWeekSeconds) * 100);

  return {
    currentPeriod: thisWeekSeconds,
    previousPeriod: lastWeekSeconds,
    changePercent,
    isPositive: changePercent >= 0,
  };
}

export function getReviewQueueDayOverDay(cards: Card[]): PeriodComparison {
  const now = new Date();
  const todayCount = cards.filter((card) => {
    if (!card.lastReviewedAt) return true;
    const daysSinceReview =
      (now.getTime() - card.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceReview >= card.reviewInterval;
  }).length;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayCount = cards.filter((card) => {
    if (!card.lastReviewedAt) return true;
    const daysSinceReview =
      (yesterday.getTime() - card.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceReview >= card.reviewInterval;
  }).length;

  const changePercent =
    yesterdayCount === 0
      ? todayCount > 0
        ? 100
        : 0
      : Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);

  return {
    currentPeriod: todayCount,
    previousPeriod: yesterdayCount,
    changePercent,
    isPositive: changePercent <= 0,
  };
}

export function getLearningDays(
  readingRecords: ReadingRecord[],
  reviewHistories: ReviewHistory[]
): Map<string, LearningDay> {
  const learningDays = new Map<string, LearningDay>();

  readingRecords.forEach((record) => {
    const date = getDateKey(new Date(record.startTime));
    const day = learningDays.get(date) || {
      date,
      readCount: 0,
      reviewCount: 0,
      duration: 0,
      cardsRead: [],
      cardsReviewed: [],
    };
    day.readCount++;
    day.duration += record.duration;
    if (!day.cardsRead.includes(record.cardId)) {
      day.cardsRead.push(record.cardId);
    }
    learningDays.set(date, day);
  });

  reviewHistories.forEach((history) => {
    const date = getDateKey(new Date(history.reviewDate));
    const day = learningDays.get(date) || {
      date,
      readCount: 0,
      reviewCount: 0,
      duration: 0,
      cardsRead: [],
      cardsReviewed: [],
    };
    day.reviewCount++;
    if (!day.cardsReviewed.includes(history.cardId)) {
      day.cardsReviewed.push(history.cardId);
    }
    learningDays.set(date, day);
  });

  return learningDays;
}

export function getActiveDays(learningDays: Map<string, LearningDay>): Set<string> {
  const activeDays = new Set<string>();
  learningDays.forEach((day, date) => {
    if (day.cardsRead.length > 0 || day.cardsReviewed.length > 0) {
      activeDays.add(date);
    }
  });
  return activeDays;
}

export function calculateCurrentStreak(activeDays: Set<string>): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = getDateKey(checkDate);
    
    if (activeDays.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(activeDays: Set<string>): number {
  if (activeDays.size === 0) return 0;

  const sortedDates = Array.from(activeDays).sort();
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

export function calculateWeekDuration(readingRecords: ReadingRecord[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return readingRecords
    .filter((r) => new Date(r.startTime) >= weekAgo)
    .reduce((sum, r) => sum + r.duration, 0);
}

export function getStreakInfo(
  readingRecords: ReadingRecord[],
  reviewHistories: ReviewHistory[],
  achievements: Achievement[]
): StreakInfo {
  const learningDays = getLearningDays(readingRecords, reviewHistories);
  const activeDays = getActiveDays(learningDays);
  
  return {
    currentStreak: calculateCurrentStreak(activeDays),
    longestStreak: calculateLongestStreak(activeDays),
    weekDuration: calculateWeekDuration(readingRecords),
    totalDuration: readingRecords.reduce((sum, r) => sum + r.duration, 0),
    activeDays: activeDays.size,
    achievements,
  };
}

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementType, { name: string; description: string; icon: string; days: number }> = {
  streak_7: {
    name: '坚持一周',
    description: '连续 7 天每天至少阅读或复习一张卡片',
    icon: '🔥',
    days: 7,
  },
  streak_30: {
    name: '月度达人',
    description: '连续 30 天每天至少阅读或复习一张卡片',
    icon: '⭐',
    days: 30,
  },
  streak_100: {
    name: '百日修行',
    description: '连续 100 天每天至少阅读或复习一张卡片',
    icon: '👑',
    days: 100,
  },
};

export function checkNewAchievements(
  currentStreak: number,
  existingAchievements: Achievement[]
): AchievementType[] {
  const newAchievements: AchievementType[] = [];
  const existingTypes = new Set(existingAchievements.map((a) => a.type));

  (Object.keys(ACHIEVEMENT_DEFINITIONS) as AchievementType[]).forEach((type) => {
    const def = ACHIEVEMENT_DEFINITIONS[type];
    if (currentStreak >= def.days && !existingTypes.has(type)) {
      newAchievements.push(type);
    }
  });

  return newAchievements;
}

export function createAchievement(type: AchievementType): Achievement {
  const def = ACHIEVEMENT_DEFINITIONS[type];
  return {
    id: `${type}_${Date.now().toString(36)}`,
    type,
    name: def.name,
    description: def.description,
    icon: def.icon,
    unlockedAt: new Date(),
  };
}
