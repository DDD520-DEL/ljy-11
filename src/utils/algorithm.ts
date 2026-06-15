import { Card, Link, ReviewHistory, ReadingRecord, Achievement, AchievementType, LearningDay, StreakInfo, WeeklyReport, TimeRange, ReviewPriorityLevel, DuplicateCandidate } from '../types';

export function getTimeRangeDates(range: TimeRange): { start: Date; end: Date; days: number } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (range === 'week') {
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(start.getDate() + mondayOffset);
    const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { start, end: now, days };
  }

  if (range === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { start, end: now, days };
  }

  const start = new Date(now);
  start.setDate(start.getDate() - 29);
  return { start, end: now, days: 30 };
}

const STOPWORDS = new Set([
  '的', '了', '和', '是', '在', '我', '有', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去',
  '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '他', '她', '它', '们', '这个', '那个', '什么', '怎么',
  '为什么', '可以', '可能', '应该', '如果', '因为', '所以', '但是', '然而', '虽然', '而且', '并且', '或者',
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their',
  'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
  'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
  'other', 'some', 'such', 'than', 'too', 'very', 'just', 'also', 'now', 'then', 'here', 'there',
  'with', 'without', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further'
]);

export function tokenizeWithFilter(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));
}

export function extractCommonKeywords(
  text1Tokens: string[],
  text2Tokens: string[],
  topN: number = 5
): string[] {
  const freq1 = new Map<string, number>();
  const freq2 = new Map<string, number>();

  text1Tokens.forEach((t) => freq1.set(t, (freq1.get(t) || 0) + 1));
  text2Tokens.forEach((t) => freq2.set(t, (freq2.get(t) || 0) + 1));

  const commonKeywords: { word: string; score: number }[] = [];
  freq1.forEach((count1, word) => {
    const count2 = freq2.get(word);
    if (count2) {
      const score = Math.min(count1, count2);
      commonKeywords.push({ word, score });
    }
  });

  return commonKeywords
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((k) => k.word);
}

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

export function getPriorityWeight(priority: ReviewPriorityLevel): number {
  switch (priority) {
    case 'high': return 100;
    case 'medium': return 50;
    case 'low': return 0;
  }
}

export function calculateReviewPriority(
  card: Card,
  linkDensity: number,
  now: Date
): number {
  const manualWeight = getPriorityWeight(card.reviewPriority);

  if (!card.lastReviewedAt) {
    return manualWeight + 1 + linkDensity * 2;
  }

  const daysSinceLastReview =
    (now.getTime() - card.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);
  const overdueRatio = daysSinceLastReview / card.reviewInterval;

  const timePriority = Math.min(Math.max(overdueRatio, 0), 2);
  const densityPriority = linkDensity * 2;
  const easePriority = (3 - card.easeFactor) * 0.5;

  return manualWeight + timePriority + densityPriority + Math.max(easePriority, 0);
}

export function isCardDueForReview(card: Card, now: Date): boolean {
  if (card.customNextReviewDate) {
    const customDate = new Date(card.customNextReviewDate);
    customDate.setHours(23, 59, 59, 999);
    return now.getTime() >= customDate.getTime();
  }

  if (!card.lastReviewedAt) return true;
  const daysSinceReview =
    (now.getTime() - card.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceReview >= card.reviewInterval;
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
  const checkDate = new Date(today);

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
  const todayCount = cards.filter((card) => isCardDueForReview(card, now)).length;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayCount = cards.filter((card) => isCardDueForReview(card, yesterday)).length;

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

export function generateWeeklyReport(
  cards: Card[],
  links: Link[],
  readingRecords: ReadingRecord[],
  reviewHistories: ReviewHistory[]
): WeeklyReport {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const weekDates = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekAgo);
    d.setDate(d.getDate() + i);
    weekDates.add(getDateKey(d));
  }

  const startDate = getDateKey(weekAgo);
  const endDate = getDateKey(now);

  const cardsInWeek = cards.filter(
    (c) => getDateKey(new Date(c.createdAt)) >= startDate && getDateKey(new Date(c.createdAt)) <= endDate
  );
  const linksInWeek = links.filter(
    (l) => getDateKey(new Date(l.createdAt)) >= startDate && getDateKey(new Date(l.createdAt)) <= endDate
  );
  const recordsInWeek = readingRecords.filter(
    (r) => getDateKey(new Date(r.startTime)) >= startDate && getDateKey(new Date(r.startTime)) <= endDate
  );
  const reviewsInWeek = reviewHistories.filter(
    (h) => getDateKey(new Date(h.reviewDate)) >= startDate && getDateKey(new Date(h.reviewDate)) <= endDate
  );

  const cardsNeedingReview = cards.filter((card) => isCardDueForReview(card, now));
  const reviewedCardIds = new Set(reviewsInWeek.map((h) => h.cardId));
  const totalReviewableCards = new Set(reviewsInWeek.map((h) => h.cardId)).size + cardsNeedingReview.length;
  const reviewCompletionRate = totalReviewableCards > 0
    ? Math.round((reviewedCardIds.size / totalReviewableCards) * 100)
    : 100;

  const cardVisits = new Map<string, number>();
  recordsInWeek.forEach((r) => {
    cardVisits.set(r.cardId, (cardVisits.get(r.cardId) || 0) + 1);
  });
  const topVisitedCards = Array.from(cardVisits.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cardId, visitCount]) => {
      const card = cards.find((c) => c.id === cardId);
      return {
        cardId,
        cardTitle: card?.title || '未知卡片',
        visitCount,
      };
    });

  const learningDays = getLearningDays(readingRecords, reviewHistories);
  const activeDaysSet = getActiveDays(learningDays);
  let activeDaysCount = 0;
  activeDaysSet.forEach((date) => {
    if (date >= startDate && date <= endDate) {
      activeDaysCount++;
    }
  });

  const totalReadingSeconds = recordsInWeek.reduce((sum, r) => sum + r.duration, 0);

  const streak = calculateCurrentStreak(activeDaysSet);

  return {
    startDate,
    endDate,
    reviewCompletionRate,
    totalReviews: reviewsInWeek.length,
    totalReviewCards: reviewedCardIds.size,
    newCardsCount: cardsInWeek.length,
    newLinksCount: linksInWeek.length,
    totalReadingSeconds,
    topVisitedCards,
    activeDays: activeDaysCount,
    currentStreak: streak,
  };
}

export function formatWeeklyReportMarkdown(report: WeeklyReport): string {
  const start = new Date(report.startDate);
  const end = new Date(report.endDate);
  const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;

  const totalMinutes = Math.floor(report.totalReadingSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const readingDisplay = hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;

  let md = `# 📊 学习周报\n\n`;
  md += `> 统计周期：${fmt(start)} — ${fmt(end)}\n\n`;
  md += `---\n\n`;
  md += `## 📈 总览\n\n`;
  md += `| 指标 | 数值 |\n`;
  md += `| --- | --- |\n`;
  md += `| 复习完成率 | ${report.reviewCompletionRate}% |\n`;
  md += `| 新增卡片 | ${report.newCardsCount} 张 |\n`;
  md += `| 新增关联 | ${report.newLinksCount} 条 |\n`;
  md += `| 总阅读时长 | ${readingDisplay} |\n`;
  md += `| 活跃天数 | ${report.activeDays} / 7 天 |\n`;
  md += `| 连续打卡 | ${report.currentStreak} 天 |\n`;
  md += `| 复习次数 | ${report.totalReviews} 次 |\n\n`;

  md += `## 🏆 最常访问卡片 Top ${report.topVisitedCards.length}\n\n`;
  if (report.topVisitedCards.length > 0) {
    md += `| 排名 | 卡片 | 访问次数 |\n`;
    md += `| --- | --- | --- |\n`;
    report.topVisitedCards.forEach((item, i) => {
      md += `| ${i + 1} | ${item.cardTitle} | ${item.visitCount} 次 |\n`;
    });
  } else {
    md += `暂无阅读记录\n`;
  }
  md += `\n---\n\n`;
  md += `*由知识库应用自动生成*\n`;

  return md;
}

function getPreviousPeriodDates(range: TimeRange): { start: Date; end: Date } {
  const current = getTimeRangeDates(range);
  const durationMs = current.end.getTime() - current.start.getTime();
  const prevEnd = new Date(current.start.getTime() - 1);
  prevEnd.setHours(23, 59, 59, 999);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  prevStart.setHours(0, 0, 0, 0);
  return { start: prevStart, end: prevEnd };
}

export function getCardsPeriodComparison(cards: Card[], range: TimeRange): PeriodComparison {
  const current = getTimeRangeDates(range);
  const previous = getPreviousPeriodDates(range);
  const currentStartKey = getDateKey(current.start);
  const currentEndKey = getDateKey(current.end);
  const prevStartKey = getDateKey(previous.start);
  const prevEndKey = getDateKey(previous.end);

  let currentCount = 0;
  let previousCount = 0;

  cards.forEach((card) => {
    const dateKey = getDateKey(new Date(card.createdAt));
    if (dateKey >= currentStartKey && dateKey <= currentEndKey) {
      currentCount++;
    }
    if (dateKey >= prevStartKey && dateKey <= prevEndKey) {
      previousCount++;
    }
  });

  const changePercent =
    previousCount === 0
      ? currentCount > 0 ? 100 : 0
      : Math.round(((currentCount - previousCount) / previousCount) * 100);

  return {
    currentPeriod: currentCount,
    previousPeriod: previousCount,
    changePercent,
    isPositive: changePercent >= 0,
  };
}

export function getLinksPeriodComparison(links: Link[], range: TimeRange): PeriodComparison {
  const current = getTimeRangeDates(range);
  const previous = getPreviousPeriodDates(range);
  const currentStartKey = getDateKey(current.start);
  const currentEndKey = getDateKey(current.end);
  const prevStartKey = getDateKey(previous.start);
  const prevEndKey = getDateKey(previous.end);

  let currentCount = 0;
  let previousCount = 0;

  links.forEach((link) => {
    const dateKey = getDateKey(new Date(link.createdAt));
    if (dateKey >= currentStartKey && dateKey <= currentEndKey) {
      currentCount++;
    }
    if (dateKey >= prevStartKey && dateKey <= prevEndKey) {
      previousCount++;
    }
  });

  const changePercent =
    previousCount === 0
      ? currentCount > 0 ? 100 : 0
      : Math.round(((currentCount - previousCount) / previousCount) * 100);

  return {
    currentPeriod: currentCount,
    previousPeriod: previousCount,
    changePercent,
    isPositive: changePercent >= 0,
  };
}

export function getReadingTimePeriodComparison(
  readingRecords: ReadingRecord[],
  range: TimeRange
): PeriodComparison {
  const current = getTimeRangeDates(range);
  const previous = getPreviousPeriodDates(range);
  const currentStartKey = getDateKey(current.start);
  const currentEndKey = getDateKey(current.end);
  const prevStartKey = getDateKey(previous.start);
  const prevEndKey = getDateKey(previous.end);

  let currentSeconds = 0;
  let previousSeconds = 0;

  readingRecords.forEach((record) => {
    const dateKey = getDateKey(new Date(record.startTime));
    if (dateKey >= currentStartKey && dateKey <= currentEndKey) {
      currentSeconds += record.duration;
    }
    if (dateKey >= prevStartKey && dateKey <= prevEndKey) {
      previousSeconds += record.duration;
    }
  });

  const changePercent =
    previousSeconds === 0
      ? currentSeconds > 0 ? 100 : 0
      : Math.round(((currentSeconds - previousSeconds) / previousSeconds) * 100);

  return {
    currentPeriod: currentSeconds,
    previousPeriod: previousSeconds,
    changePercent,
    isPositive: changePercent >= 0,
  };
}

export function getActiveDaysInRange(
  readingRecords: ReadingRecord[],
  reviewHistories: ReviewHistory[],
  range: TimeRange
): number {
  const { start, end } = getTimeRangeDates(range);
  const startKey = getDateKey(start);
  const endKey = getDateKey(end);
  const learningDays = getLearningDays(readingRecords, reviewHistories);
  const activeDays = getActiveDays(learningDays);
  let count = 0;
  activeDays.forEach((date) => {
    if (date >= startKey && date <= endKey) {
      count++;
    }
  });
  return count;
}

export function getReadingDurationInRange(
  readingRecords: ReadingRecord[],
  range: TimeRange
): number {
  const { start, end } = getTimeRangeDates(range);
  const startKey = getDateKey(start);
  const endKey = getDateKey(end);
  return readingRecords
    .filter((r) => {
      const dateKey = getDateKey(new Date(r.startTime));
      return dateKey >= startKey && dateKey <= endKey;
    })
    .reduce((sum, r) => sum + r.duration, 0);
}

export function getReviewCompletionRate(
  cards: Card[],
  reviewHistories: ReviewHistory[],
  range: TimeRange
): number {
  const { start, end } = getTimeRangeDates(range);
  const startKey = getDateKey(start);
  const endKey = getDateKey(end);

  const now = new Date();
  const cardsNeedingReview = cards.filter((card) => isCardDueForReview(card, now));

  const reviewedInPeriod = new Set(
    reviewHistories
      .filter((h) => {
        const dateKey = getDateKey(new Date(h.reviewDate));
        return dateKey >= startKey && dateKey <= endKey;
      })
      .map((h) => h.cardId)
  );

  const totalReviewableCards = reviewedInPeriod.size + cardsNeedingReview.length;
  return totalReviewableCards > 0
    ? Math.round((reviewedInPeriod.size / totalReviewableCards) * 100)
    : 100;
}

export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  const m = s1.length;
  const n = s2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

export function levenshteinSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

export function jaccardSimilarity(str1: string, str2: string): number {
  const tokens1 = new Set(tokenizeWithFilter(str1));
  const tokens2 = new Set(tokenizeWithFilter(str2));

  if (tokens1.size === 0 && tokens2.size === 0) return 0;

  const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return intersection.size / union.size;
}

export function calculateTitleSimilarity(title1: string, title2: string): number {
  const t1 = title1.trim().toLowerCase();
  const t2 = title2.trim().toLowerCase();

  if (t1 === t2) return 1;

  const levenshtein = levenshteinSimilarity(t1, t2);
  const jaccard = jaccardSimilarity(t1, t2);

  const containsScore =
    t1.includes(t2) || t2.includes(t1) ? 0.3 : 0;

  return Math.min(
    1,
    levenshtein * 0.4 + jaccard * 0.4 + containsScore
  );
}

export function findDuplicateCards(
  targetTitle: string,
  existingCards: Card[],
  threshold: number = 0.6
): DuplicateCandidate[] {
  const candidates: DuplicateCandidate[] = [];

  for (const card of existingCards) {
    const similarity = calculateTitleSimilarity(targetTitle, card.title);
    if (similarity >= threshold) {
      candidates.push({
        cardId: card.id,
        cardTitle: card.title,
        similarity: Math.round(similarity * 100) / 100,
      });
    }
  }

  return candidates.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}
