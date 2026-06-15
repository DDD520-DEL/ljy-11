import { create } from 'zustand';
import {
  Card,
  Link,
  ReadingRecord,
  ImportSource,
  ReviewHistory,
  GraphData,
  GraphNode,
  GraphLink,
  LinkSuggestion,
  TagStats,
  CardVersion,
  Achievement,
  StreakInfo,
  AchievementType,
  WeeklyReport,
  CardTemplate,
  KnowledgeSpace,
  RelationNode,
  CardRelations,
} from '../types';
import { db } from '../db';
import {
  calculateNextReview,
  calculateLinkDensity,
  calculateReviewPriority,
  isCardDueForReview,
  parseWikiLinks,
  tokenizeWithFilter,
  extractCommonKeywords,
  calculateTFIDF,
  calculateCosineSimilarity,
  getStreakInfo,
  checkNewAchievements,
  createAchievement,
  generateWeeklyReport,
  formatWeeklyReportMarkdown,
} from '../utils/algorithm';
import { generateMockData } from '../utils/mockData';

interface StoreState {
  cards: Card[];
  links: Link[];
  readingRecords: ReadingRecord[];
  importSources: ImportSource[];
  reviewHistories: ReviewHistory[];
  cardVersions: CardVersion[];
  achievements: Achievement[];
  currentCardId: string | null;
  isLoading: boolean;
  selectedTags: string[];
  searchQuery: string;
  currentReadingSession: {
    cardId: string;
    startTime: Date;
    fromCardId?: string;
  } | null;
  newlyUnlockedAchievements: Achievement[];
  cardTemplates: CardTemplate[];
  knowledgeSpaces: KnowledgeSpace[];
  activeSpaceId: string | null;

  initializeData: () => Promise<void>;
  loadAllData: () => Promise<void>;
  createCard: (card: Partial<Card>) => Promise<Card>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setCurrentCardId: (id: string | null) => void;
  setSelectedTags: (tags: string[]) => void;
  setSearchQuery: (query: string) => void;

  saveCardVersion: (cardId: string, card: Card) => Promise<void>;
  getCardVersions: (cardId: string) => CardVersion[];
  restoreCardVersion: (cardId: string, versionId: string) => Promise<void>;

  createLink: (sourceId: string, targetId: string) => Promise<void>;
  deleteLink: (linkId: string) => Promise<void>;
  getCardLinks: (cardId: string) => { outgoing: Link[]; incoming: Link[] };
  suggestLinks: (content: string, currentCardId?: string) => Promise<LinkSuggestion[]>;

  startReading: (cardId: string, fromCardId?: string) => Promise<void>;
  endReading: () => Promise<void>;
  getReadingHeatmap: () => Map<string, number>;

  getReviewQueue: () => Card[];
  submitReview: (cardId: string, rating: number) => Promise<void>;

  importBookmarks: (file: File) => Promise<ImportSource[]>;
  importAnnotations: (content: string) => Promise<ImportSource[]>;
  processImport: (importId: string, createCard: boolean) => Promise<void>;

  getGraphData: () => GraphData;
  getCardRelations: (cardId: string) => CardRelations;

  exportToJSON: () => string;
  exportToMarkdown: () => string;

  getTagStats: () => TagStats[];
  renameTag: (oldName: string, newName: string) => Promise<void>;
  deleteTag: (tagName: string) => Promise<void>;
  mergeTags: (sourceTags: string[], targetTag: string) => Promise<void>;

  batchDeleteCards: (cardIds: string[]) => Promise<void>;
  batchAddTags: (cardIds: string[], tags: string[]) => Promise<void>;
  batchRemoveTags: (cardIds: string[], tags: string[]) => Promise<void>;
  exportCardsToJSON: (cardIds: string[]) => string;
  exportCardsToMarkdown: (cardIds: string[]) => string;

  getStreakInfo: () => StreakInfo;
  checkAchievements: () => Promise<Achievement[]>;
  clearNewAchievements: () => void;
  getWeeklyReport: () => WeeklyReport;
  getWeeklyReportMarkdown: () => string;

  createTemplate: (template: Partial<CardTemplate>) => Promise<CardTemplate>;
  updateTemplate: (id: string, updates: Partial<CardTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  toggleFavorite: (cardId: string) => Promise<void>;
  getFavoriteCards: () => Card[];

  setActiveSpaceId: (spaceId: string | null) => void;
  createSpace: (space: Partial<KnowledgeSpace>) => Promise<KnowledgeSpace>;
  updateSpace: (id: string, updates: Partial<KnowledgeSpace>) => Promise<void>;
  deleteSpace: (id: string) => Promise<void>;
  moveCardToSpace: (cardId: string, spaceId: string | null) => Promise<void>;
  getCardsBySpace: (spaceId: string | null) => Card[];
}

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useStore = create<StoreState>((set, get) => ({
  cards: [],
  links: [],
  readingRecords: [],
  importSources: [],
  reviewHistories: [],
  cardVersions: [],
  achievements: [],
  currentCardId: null,
  isLoading: true,
  selectedTags: [],
  searchQuery: '',
  currentReadingSession: null,
  newlyUnlockedAchievements: [],
  cardTemplates: [],
  knowledgeSpaces: [],
  activeSpaceId: null,

  initializeData: async () => {
    const cards = await db.cards.count();
    if (cards === 0) {
      const mockData = generateMockData();
      await db.transaction('rw', db.cards, db.links, async () => {
        await db.cards.bulkAdd(mockData.cards);
        await db.links.bulkAdd(mockData.links);
      });
    }
    await get().loadAllData();
  },

  loadAllData: async () => {
    set({ isLoading: true });
    const [cards, links, readingRecords, importSources, reviewHistories, cardVersions, achievements, cardTemplates, knowledgeSpaces] =
      await Promise.all([
        db.cards.orderBy('updatedAt').reverse().toArray(),
        db.links.toArray(),
        db.readingRecords.orderBy('startTime').reverse().toArray(),
        db.importSources.orderBy('importedAt').reverse().toArray(),
        db.reviewHistories.toArray(),
        db.cardVersions.orderBy('createdAt').reverse().toArray(),
        db.achievements.orderBy('unlockedAt').reverse().toArray(),
        db.cardTemplates.orderBy('updatedAt').reverse().toArray(),
        db.knowledgeSpaces.orderBy('updatedAt').reverse().toArray(),
      ]);
    set({
      cards,
      links,
      readingRecords,
      importSources,
      reviewHistories,
      cardVersions,
      achievements,
      cardTemplates,
      knowledgeSpaces,
      isLoading: false,
    });
  },

  createCard: async (partialCard) => {
    const now = new Date();
    const { activeSpaceId } = get();
    const newCard: Card = {
      id: generateId(),
      title: partialCard.title || '未命名卡片',
      content: partialCard.content || '',
      tags: partialCard.tags || [],
      createdAt: now,
      updatedAt: now,
      reviewInterval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      isFavorite: false,
      spaceId: partialCard.spaceId !== undefined ? partialCard.spaceId : (activeSpaceId || undefined),
      reviewPriority: partialCard.reviewPriority || 'medium',
      customNextReviewDate: partialCard.customNextReviewDate || undefined,
    };

    await db.cards.add(newCard);

    const wikiLinks = parseWikiLinks(newCard.content);
    const { cards } = get();
    for (const linkTitle of wikiLinks) {
      const targetCard = cards.find(
        (c) => c.title.toLowerCase() === linkTitle.toLowerCase()
      );
      if (targetCard && targetCard.id !== newCard.id) {
        await get().createLink(newCard.id, targetCard.id);
      }
    }

    await get().loadAllData();
    return newCard;
  },

  updateCard: async (id, updates) => {
    const card = await db.cards.get(id);
    if (!card) return;

    await get().saveCardVersion(id, card);

    const updatedCard = {
      ...card,
      ...updates,
      updatedAt: new Date(),
    };

    await db.cards.update(id, updatedCard);

    const wikiLinks = parseWikiLinks(updatedCard.content);
    const { cards, links } = get();
    const existingLinks = links.filter(
      (l) => l.sourceCardId === id || l.targetCardId === id
    );

    for (const linkTitle of wikiLinks) {
      const targetCard = cards.find(
        (c) => c.title.toLowerCase() === linkTitle.toLowerCase()
      );
      if (
        targetCard &&
        targetCard.id !== id &&
        !existingLinks.some(
          (l) =>
            (l.sourceCardId === id && l.targetCardId === targetCard.id) ||
            (l.sourceCardId === targetCard.id && l.targetCardId === id)
        )
      ) {
        await get().createLink(id, targetCard.id);
      }
    }

    await get().loadAllData();
  },

  deleteCard: async (id) => {
    await db.transaction('rw', db.cards, db.links, db.cardVersions, async () => {
      await db.cards.delete(id);
      await db.links
        .where('sourceCardId')
        .equals(id)
        .or('targetCardId')
        .equals(id)
        .delete();
      await db.cardVersions.where('cardId').equals(id).delete();
    });
    await get().loadAllData();
  },

  setCurrentCardId: (id) => set({ currentCardId: id }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  saveCardVersion: async (cardId, card) => {
    const size =
      new Blob([card.title + card.content + card.tags.join(',')]).size;

    const existingVersions = await db.cardVersions
      .where('cardId')
      .equals(cardId)
      .sortBy('createdAt');

    const lastVersion = existingVersions[existingVersions.length - 1];
    if (
      lastVersion &&
      lastVersion.title === card.title &&
      lastVersion.content === card.content &&
      JSON.stringify(lastVersion.tags) === JSON.stringify(card.tags)
    ) {
      return;
    }

    const version: CardVersion = {
      id: generateId(),
      cardId,
      title: card.title,
      content: card.content,
      tags: card.tags,
      createdAt: new Date(),
      size,
    };

    await db.cardVersions.add(version);

    const allVersions = await db.cardVersions
      .where('cardId')
      .equals(cardId)
      .sortBy('createdAt');

    if (allVersions.length > 20) {
      const toDelete = allVersions.slice(0, allVersions.length - 20);
      await db.cardVersions.bulkDelete(toDelete.map((v) => v.id));
    }
  },

  getCardVersions: (cardId) => {
    const { cardVersions } = get();
    return cardVersions
      .filter((v) => v.cardId === cardId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  restoreCardVersion: async (cardId, versionId) => {
    const version = await db.cardVersions.get(versionId);
    if (!version || version.cardId !== cardId) return;

    const currentCard = await db.cards.get(cardId);
    if (!currentCard) return;

    await get().saveCardVersion(cardId, currentCard);

    await db.cards.update(cardId, {
      title: version.title,
      content: version.content,
      tags: version.tags,
      updatedAt: new Date(),
    });

    await get().loadAllData();
  },

  createLink: async (sourceId, targetId) => {
    if (sourceId === targetId) return;

    const { links } = get();
    const exists = links.some(
      (l) =>
        (l.sourceCardId === sourceId && l.targetCardId === targetId) ||
        (l.sourceCardId === targetId && l.targetCardId === sourceId)
    );

    if (exists) return;

    const newLink: Link = {
      id: generateId(),
      sourceCardId: sourceId,
      targetCardId: targetId,
      linkType: 'bidirectional',
      createdAt: new Date(),
    };

    await db.links.add(newLink);
    await get().loadAllData();
  },

  deleteLink: async (linkId) => {
    await db.links.delete(linkId);
    await get().loadAllData();
  },

  getCardLinks: (cardId) => {
    const { links } = get();
    return {
      outgoing: links.filter((l) => l.sourceCardId === cardId),
      incoming: links.filter((l) => l.targetCardId === cardId),
    };
  },

  suggestLinks: async (content, currentCardId) => {
    const { cards, links } = get();
    if (cards.length < 2) return [];

    const contentTokens = tokenizeWithFilter(content);

    const linkedCardIds = new Set<string>();
    if (currentCardId) {
      links.forEach((link) => {
        if (link.sourceCardId === currentCardId) {
          linkedCardIds.add(link.targetCardId);
        }
        if (link.targetCardId === currentCardId) {
          linkedCardIds.add(link.sourceCardId);
        }
      });
    }

    const otherCards = cards.filter(
      (c) => c.id !== currentCardId && !linkedCardIds.has(c.id)
    );

    if (otherCards.length === 0) return [];

    const allTokens = otherCards.map((c) =>
      tokenizeWithFilter(c.title + ' ' + c.content)
    );
    allTokens.push(contentTokens);

    const tfidfVectors = calculateTFIDF(allTokens);
    const contentVector = tfidfVectors[tfidfVectors.length - 1];

    const suggestions: LinkSuggestion[] = otherCards
      .map((card, index) => {
        const cardTokens = tokenizeWithFilter(card.title + ' ' + card.content);
        const cardVector = tfidfVectors[index];
        const similarity = calculateCosineSimilarity(contentVector, cardVector);

        const contentTags = new Set(
          content.toLowerCase().match(/#[\w\u4e00-\u9fa5]+/g) || []
        );
        const cardTags = new Set(card.tags.map((t) => t.toLowerCase()));
        const tagOverlap = [...contentTags].filter((t) => cardTags.has(t));
        const tagScore =
          tagOverlap.length / Math.max(contentTags.size + cardTags.size, 1);

        const commonKeywords = extractCommonKeywords(
          contentTokens,
          cardTokens,
          3
        );

        const totalScore = similarity * 0.6 + tagScore * 0.4;

        const reasons: string[] = [];
        if (commonKeywords.length > 0) {
          reasons.push(`共同关键词：${commonKeywords.join('、')}`);
        }
        if (tagOverlap.length > 0) {
          reasons.push(`共同标签：${tagOverlap.join('、')}`);
        }
        reasons.push(`内容相似度 ${(similarity * 100).toFixed(0)}%`);

        return {
          cardId: card.id,
          cardTitle: card.title,
          similarity: totalScore,
          reason: reasons.join(' | '),
        };
      })
      .filter((s) => s.similarity > 0.03)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return suggestions;
  },

  startReading: async (cardId, fromCardId) => {
    const { currentReadingSession, endReading } = get();
    if (currentReadingSession) {
      await endReading();
    }
    set({
      currentReadingSession: {
        cardId,
        startTime: new Date(),
        fromCardId,
      },
    });
  },

  endReading: async () => {
    const { currentReadingSession } = get();
    if (!currentReadingSession) return;

    const endTime = new Date();
    const duration =
      (endTime.getTime() - currentReadingSession.startTime.getTime()) / 1000;

    if (duration > 5) {
      const record: ReadingRecord = {
        id: generateId(),
        cardId: currentReadingSession.cardId,
        startTime: currentReadingSession.startTime,
        endTime,
        duration: Math.round(duration),
        fromCardId: currentReadingSession.fromCardId,
      };
      await db.readingRecords.add(record);
      await get().loadAllData();
      await get().checkAchievements();
    }

    set({ currentReadingSession: null });
  },

  getReadingHeatmap: () => {
    const { readingRecords } = get();
    const heatmap = new Map<string, number>();

    readingRecords.forEach((record) => {
      const date = record.startTime.toISOString().split('T')[0];
      heatmap.set(date, (heatmap.get(date) || 0) + record.duration);
    });

    return heatmap;
  },

  getReviewQueue: () => {
    const { cards, links, activeSpaceId } = get();
    const now = new Date();

    let filteredCards = cards;
    if (activeSpaceId) {
      filteredCards = cards.filter((c) => c.spaceId === activeSpaceId);
    }

    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

    return filteredCards
      .filter((card) => isCardDueForReview(card, now))
      .map((card) => {
        const outgoingLinks = links.filter((l) => l.sourceCardId === card.id);
        const incomingLinks = links.filter((l) => l.targetCardId === card.id);
        const density = calculateLinkDensity(
          card.id,
          outgoingLinks.map((l) => l.targetCardId),
          incomingLinks.map((l) => l.sourceCardId),
          cards.length
        );
        return {
          ...card,
          reviewPriority: card.reviewPriority,
          _algorithmicPriority: calculateReviewPriority(card, density, now),
        };
      })
      .sort((a, b) => {
        const pa = priorityOrder[a.reviewPriority] ?? 1;
        const pb = priorityOrder[b.reviewPriority] ?? 1;
        if (pa !== pb) return pa - pb;
        return b._algorithmicPriority - a._algorithmicPriority;
      })
      .map(({ _algorithmicPriority, ...card }) => card as Card);
  },

  submitReview: async (cardId, rating) => {
    const card = await db.cards.get(cardId);
    if (!card) return;

    const updates = calculateNextReview(card, rating);
    await db.cards.update(cardId, {
      ...updates,
      customNextReviewDate: null,
    });

    const history: ReviewHistory = {
      id: generateId(),
      cardId,
      reviewDate: new Date(),
      rating,
      newInterval: updates.reviewInterval || card.reviewInterval,
    };
    await db.reviewHistories.add(history);
    await get().loadAllData();
    await get().checkAchievements();
  },

  importBookmarks: async (file) => {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const bookmarks = doc.querySelectorAll('a');

    const imports: ImportSource[] = [];
    const { suggestLinks, cards } = get();

    for (const bookmark of Array.from(bookmarks)) {
      const title = bookmark.textContent || '未命名书签';
      const url = bookmark.getAttribute('href') || '';
      const addDate = bookmark.getAttribute('add_date');

      const importItem: ImportSource = {
        id: generateId(),
        type: 'bookmark',
        title,
        url,
        content: title,
        importedAt: addDate ? new Date(parseInt(addDate) * 1000) : new Date(),
        processed: false,
        suggestedLinks: [],
      };

      const suggestions = await suggestLinks(title);
      importItem.suggestedLinks = suggestions
        .filter((s) => s.similarity > 0.1)
        .slice(0, 3)
        .map((s) => s.cardId);

      imports.push(importItem);
    }

    await db.importSources.bulkAdd(imports);
    await get().loadAllData();
    return imports;
  },

  importAnnotations: async (content) => {
    const lines = content.split('\n').filter((line) => line.trim());
    const imports: ImportSource[] = [];

    for (const line of lines) {
      const importItem: ImportSource = {
        id: generateId(),
        type: 'annotation',
        title: line.slice(0, 50) + (line.length > 50 ? '...' : ''),
        content: line,
        importedAt: new Date(),
        processed: false,
        suggestedLinks: [],
      };

      const suggestions = await get().suggestLinks(line);
      importItem.suggestedLinks = suggestions
        .filter((s) => s.similarity > 0.1)
        .slice(0, 3)
        .map((s) => s.cardId);

      imports.push(importItem);
    }

    await db.importSources.bulkAdd(imports);
    await get().loadAllData();
    return imports;
  },

  processImport: async (importId, createCardFlag) => {
    const importItem = await db.importSources.get(importId);
    if (!importItem || importItem.processed) return;

    if (createCardFlag) {
      const newCard = await get().createCard({
        title: importItem.title,
        content: importItem.content + (importItem.url ? `\n\n来源: ${importItem.url}` : ''),
      });

      for (const suggestedCardId of importItem.suggestedLinks) {
        await get().createLink(newCard.id, suggestedCardId);
      }
    }

    await db.importSources.update(importId, { processed: true });
    await get().loadAllData();
  },

  getGraphData: () => {
    const { cards, links, activeSpaceId } = get();

    let filteredCards = cards;
    if (activeSpaceId) {
      filteredCards = cards.filter((c) => c.spaceId === activeSpaceId);
    }

    const tagColors = [
      '#f59e0b',
      '#10b981',
      '#3b82f6',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#f97316',
    ];

    const allTags = new Set(filteredCards.flatMap((c) => c.tags));
    const tagColorMap = new Map(
      Array.from(allTags).map((tag, i) => [tag, tagColors[i % tagColors.length]])
    );

    const nodes: GraphNode[] = filteredCards.map((card) => {
      const cardLinks = links.filter(
        (l) => l.sourceCardId === card.id || l.targetCardId === card.id
      );
      const outgoingLinks = links.filter((l) => l.sourceCardId === card.id);
      const incomingLinks = links.filter((l) => l.targetCardId === card.id);
      const density = calculateLinkDensity(
        card.id,
        outgoingLinks.map((l) => l.targetCardId),
        incomingLinks.map((l) => l.sourceCardId),
        filteredCards.length
      );
      const priority = calculateReviewPriority(card, density, new Date());

      return {
        id: card.id,
        name: card.title,
        val: Math.max(cardLinks.length * 2 + 5, 8),
        linkCount: cardLinks.length,
        reviewPriority: priority,
        tagColor: card.tags[0] ? tagColorMap.get(card.tags[0]) || '#6b7280' : '#6b7280',
        tags: card.tags,
      };
    });

    const nodeIds = new Set(nodes.map((n) => n.id));
    const graphLinks: GraphLink[] = links
      .filter((l) => nodeIds.has(l.sourceCardId) && nodeIds.has(l.targetCardId))
      .map((link) => ({
        source: link.sourceCardId,
        target: link.targetCardId,
        value: 1,
      }));

    return { nodes, links: graphLinks };
  },

  getCardRelations: (cardId) => {
    const { cards, links } = get();
    const currentCard = cards.find((c) => c.id === cardId);
    if (!currentCard) {
      return {
        currentCardId: cardId,
        currentCardTitle: '',
        firstOrder: { outgoing: [], incoming: [] },
        secondOrder: [],
      };
    }

    const tagColors = [
      '#f59e0b',
      '#10b981',
      '#3b82f6',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#f97316',
    ];

    const allTags = new Set(cards.flatMap((c) => c.tags));
    const tagColorMap = new Map(
      Array.from(allTags).map((tag, i) => [tag, tagColors[i % tagColors.length]])
    );

    const getTagColor = (card: Card) => {
      return card.tags[0] ? tagColorMap.get(card.tags[0]) || '#6b7280' : '#6b7280';
    };

    const createRelationNode = (
      card: Card,
      relationType: 'outgoing' | 'incoming' | 'second-order',
      path: string[],
      depth: number,
      direction?: 'forward' | 'backward'
    ): RelationNode => ({
      cardId: card.id,
      cardTitle: card.title,
      relationType,
      direction,
      path,
      depth,
      tagColor: getTagColor(card),
      tags: card.tags,
    });

    const outgoingLinks = links.filter((l) => l.sourceCardId === cardId);
    const incomingLinks = links.filter((l) => l.targetCardId === cardId);

    const outgoingNodes: RelationNode[] = outgoingLinks.map((link) => {
      const targetCard = cards.find((c) => c.id === link.targetCardId);
      return targetCard
        ? createRelationNode(targetCard, 'outgoing', [cardId, targetCard.id], 1, 'forward')
        : null;
    }).filter((n): n is RelationNode => n !== null);

    const incomingNodes: RelationNode[] = incomingLinks.map((link) => {
      const sourceCard = cards.find((c) => c.id === link.sourceCardId);
      return sourceCard
        ? createRelationNode(sourceCard, 'incoming', [sourceCard.id, cardId], 1, 'backward')
        : null;
    }).filter((n): n is RelationNode => n !== null);

    const firstOrderIds = new Set([
      cardId,
      ...outgoingNodes.map((n) => n.cardId),
      ...incomingNodes.map((n) => n.cardId),
    ]);

    const secondOrderMap = new Map<string, RelationNode>();

    outgoingNodes.forEach((firstNode) => {
      const firstOutgoing = links.filter(
        (l) => l.sourceCardId === firstNode.cardId && !firstOrderIds.has(l.targetCardId)
      );
      const firstIncoming = links.filter(
        (l) => l.targetCardId === firstNode.cardId && !firstOrderIds.has(l.sourceCardId)
      );

      firstOutgoing.forEach((link) => {
        const targetCard = cards.find((c) => c.id === link.targetCardId);
        if (targetCard && !secondOrderMap.has(targetCard.id)) {
          secondOrderMap.set(
            targetCard.id,
            createRelationNode(
              targetCard,
              'second-order',
              [cardId, firstNode.cardId, targetCard.id],
              2,
              'forward'
            )
          );
        }
      });

      firstIncoming.forEach((link) => {
        const sourceCard = cards.find((c) => c.id === link.sourceCardId);
        if (sourceCard && !secondOrderMap.has(sourceCard.id)) {
          secondOrderMap.set(
            sourceCard.id,
            createRelationNode(
              sourceCard,
              'second-order',
              [sourceCard.id, firstNode.cardId, cardId],
              2,
              'backward'
            )
          );
        }
      });
    });

    incomingNodes.forEach((firstNode) => {
      const firstOutgoing = links.filter(
        (l) => l.sourceCardId === firstNode.cardId && !firstOrderIds.has(l.targetCardId)
      );
      const firstIncoming = links.filter(
        (l) => l.targetCardId === firstNode.cardId && !firstOrderIds.has(l.sourceCardId)
      );

      firstOutgoing.forEach((link) => {
        const targetCard = cards.find((c) => c.id === link.targetCardId);
        if (targetCard && !secondOrderMap.has(targetCard.id)) {
          secondOrderMap.set(
            targetCard.id,
            createRelationNode(
              targetCard,
              'second-order',
              [cardId, firstNode.cardId, targetCard.id],
              2,
              'forward'
            )
          );
        }
      });

      firstIncoming.forEach((link) => {
        const sourceCard = cards.find((c) => c.id === link.sourceCardId);
        if (sourceCard && !secondOrderMap.has(sourceCard.id)) {
          secondOrderMap.set(
            sourceCard.id,
            createRelationNode(
              sourceCard,
              'second-order',
              [sourceCard.id, firstNode.cardId, cardId],
              2,
              'backward'
            )
          );
        }
      });
    });

    return {
      currentCardId: cardId,
      currentCardTitle: currentCard.title,
      firstOrder: {
        outgoing: outgoingNodes,
        incoming: incomingNodes,
      },
      secondOrder: Array.from(secondOrderMap.values()),
    };
  },

  exportToJSON: () => {
    const { cards, links } = get();

    const cardsWithLinks = cards.map((card) => {
      const outgoing = links
        .filter((l) => l.sourceCardId === card.id)
        .map((l) => {
          const targetCard = cards.find((c) => c.id === l.targetCardId);
          return {
            cardId: l.targetCardId,
            cardTitle: targetCard?.title || '',
            linkType: l.linkType,
            createdAt: l.createdAt,
          };
        });

      const incoming = links
        .filter((l) => l.targetCardId === card.id)
        .map((l) => {
          const sourceCard = cards.find((c) => c.id === l.sourceCardId);
          return {
            cardId: l.sourceCardId,
            cardTitle: sourceCard?.title || '',
            linkType: l.linkType,
            createdAt: l.createdAt,
          };
        });

      return {
        id: card.id,
        title: card.title,
        content: card.content,
        tags: card.tags,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        outgoingLinks: outgoing,
        incomingLinks: incoming,
      };
    });

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalCards: cards.length,
      totalLinks: links.length,
      cards: cardsWithLinks,
    };

    return JSON.stringify(exportData, null, 2);
  },

  exportToMarkdown: () => {
    const { cards, links } = get();

    let markdown = `# 知识卡片导出\n\n`;
    markdown += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n`;
    markdown += `> 卡片数量: ${cards.length}\n`;
    markdown += `> 链接数量: ${links.length}\n\n`;
    markdown += `---\n\n`;

    cards.forEach((card, index) => {
      markdown += `## ${card.title}\n\n`;

      if (card.tags.length > 0) {
        markdown += `**标签**: ${card.tags.map((t) => `\`${t}\``).join(' ')}\n\n`;
      }

      markdown += `**创建时间**: ${new Date(card.createdAt).toLocaleString('zh-CN')}\n`;
      markdown += `**更新时间**: ${new Date(card.updatedAt).toLocaleString('zh-CN')}\n\n`;

      const outgoing = links.filter((l) => l.sourceCardId === card.id);
      const incoming = links.filter((l) => l.targetCardId === card.id);

      if (outgoing.length > 0) {
        markdown += `**出链** (${outgoing.length}):\n`;
        outgoing.forEach((l) => {
          const targetCard = cards.find((c) => c.id === l.targetCardId);
          if (targetCard) {
            markdown += `- [[${targetCard.title}]]\n`;
          }
        });
        markdown += `\n`;
      }

      if (incoming.length > 0) {
        markdown += `**入链** (${incoming.length}):\n`;
        incoming.forEach((l) => {
          const sourceCard = cards.find((c) => c.id === l.sourceCardId);
          if (sourceCard) {
            markdown += `- [[${sourceCard.title}]]\n`;
          }
        });
        markdown += `\n`;
      }

      markdown += `### 正文\n\n${card.content}\n\n`;

      if (index < cards.length - 1) {
        markdown += `---\n\n`;
      }
    });

    return markdown;
  },

  getTagStats: () => {
    const { cards } = get();
    const tagMap = new Map<string, Card[]>();

    cards.forEach((card) => {
      card.tags.forEach((tag) => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push(card);
      });
    });

    const stats: TagStats[] = Array.from(tagMap.entries()).map(([name, tagCards]) => {
      const lastUsedAt = tagCards.reduce(
        (latest, card) =>
          card.updatedAt > latest ? card.updatedAt : latest,
        new Date(0)
      );
      return {
        name,
        cardCount: tagCards.length,
        cards: tagCards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
        lastUsedAt,
      };
    });

    return stats.sort((a, b) => b.cardCount - a.cardCount);
  },

  renameTag: async (oldName, newName) => {
    if (!oldName.trim() || !newName.trim() || oldName === newName) return;

    const { cards } = get();
    const cardsToUpdate = cards.filter((card) => card.tags.includes(oldName));

    await db.transaction('rw', db.cards, async () => {
      for (const card of cardsToUpdate) {
        const updatedTags = card.tags.map((t) => (t === oldName ? newName : t));
        const uniqueTags = [...new Set(updatedTags)];
        await db.cards.update(card.id, {
          ...card,
          tags: uniqueTags,
          updatedAt: new Date(),
        });
      }
    });

    await get().loadAllData();
  },

  deleteTag: async (tagName) => {
    if (!tagName.trim()) return;

    const { cards } = get();
    const cardsToUpdate = cards.filter((card) => card.tags.includes(tagName));

    await db.transaction('rw', db.cards, async () => {
      for (const card of cardsToUpdate) {
        const updatedTags = card.tags.filter((t) => t !== tagName);
        await db.cards.update(card.id, {
          ...card,
          tags: updatedTags,
          updatedAt: new Date(),
        });
      }
    });

    await get().loadAllData();
  },

  mergeTags: async (sourceTags, targetTag) => {
    if (sourceTags.length === 0 || !targetTag.trim()) return;

    const { cards } = get();
    const cardsToUpdate = cards.filter((card) =>
      sourceTags.some((sourceTag) => card.tags.includes(sourceTag))
    );

    await db.transaction('rw', db.cards, async () => {
      for (const card of cardsToUpdate) {
        let updatedTags = card.tags.map((t) =>
          sourceTags.includes(t) ? targetTag : t
        );
        const uniqueTags = [...new Set(updatedTags)];
        await db.cards.update(card.id, {
          ...card,
          tags: uniqueTags,
          updatedAt: new Date(),
        });
      }
    });

    await get().loadAllData();
  },

  batchDeleteCards: async (cardIds) => {
    if (cardIds.length === 0) return;

    await db.transaction('rw', db.cards, db.links, async () => {
      for (const cardId of cardIds) {
        await db.cards.delete(cardId);
        await db.links
          .where('sourceCardId')
          .equals(cardId)
          .or('targetCardId')
          .equals(cardId)
          .delete();
      }
    });

    await get().loadAllData();
  },

  batchAddTags: async (cardIds, tags) => {
    if (cardIds.length === 0 || tags.length === 0) return;

    const { cards } = get();
    const cardsToUpdate = cards.filter((c) => cardIds.includes(c.id));

    await db.transaction('rw', db.cards, async () => {
      for (const card of cardsToUpdate) {
        const updatedTags = [...new Set([...card.tags, ...tags])];
        await db.cards.update(card.id, {
          ...card,
          tags: updatedTags,
          updatedAt: new Date(),
        });
      }
    });

    await get().loadAllData();
  },

  batchRemoveTags: async (cardIds, tags) => {
    if (cardIds.length === 0 || tags.length === 0) return;

    const { cards } = get();
    const cardsToUpdate = cards.filter((c) => cardIds.includes(c.id));

    await db.transaction('rw', db.cards, async () => {
      for (const card of cardsToUpdate) {
        const updatedTags = card.tags.filter((t) => !tags.includes(t));
        await db.cards.update(card.id, {
          ...card,
          tags: updatedTags,
          updatedAt: new Date(),
        });
      }
    });

    await get().loadAllData();
  },

  exportCardsToJSON: (cardIds) => {
    const { cards, links } = get();
    const selectedCards = cards.filter((c) => cardIds.includes(c.id));

    const cardsWithLinks = selectedCards.map((card) => {
      const outgoing = links
        .filter((l) => l.sourceCardId === card.id)
        .map((l) => {
          const targetCard = cards.find((c) => c.id === l.targetCardId);
          return {
            cardId: l.targetCardId,
            cardTitle: targetCard?.title || '',
            linkType: l.linkType,
            createdAt: l.createdAt,
          };
        });

      const incoming = links
        .filter((l) => l.targetCardId === card.id)
        .map((l) => {
          const sourceCard = cards.find((c) => c.id === l.sourceCardId);
          return {
            cardId: l.sourceCardId,
            cardTitle: sourceCard?.title || '',
            linkType: l.linkType,
            createdAt: l.createdAt,
          };
        });

      return {
        id: card.id,
        title: card.title,
        content: card.content,
        tags: card.tags,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        outgoingLinks: outgoing,
        incomingLinks: incoming,
      };
    });

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalCards: selectedCards.length,
      totalLinks: links.filter(
        (l) => cardIds.includes(l.sourceCardId) || cardIds.includes(l.targetCardId)
      ).length,
      cards: cardsWithLinks,
    };

    return JSON.stringify(exportData, null, 2);
  },

  exportCardsToMarkdown: (cardIds) => {
    const { cards, links } = get();
    const selectedCards = cards.filter((c) => cardIds.includes(c.id));

    let markdown = `# 知识卡片导出\n\n`;
    markdown += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n`;
    markdown += `> 卡片数量: ${selectedCards.length}\n`;
    markdown += `> 链接数量: ${
      links.filter(
        (l) => cardIds.includes(l.sourceCardId) || cardIds.includes(l.targetCardId)
      ).length
    }\n\n`;
    markdown += `---\n\n`;

    selectedCards.forEach((card, index) => {
      markdown += `## ${card.title}\n\n`;

      if (card.tags.length > 0) {
        markdown += `**标签**: ${card.tags.map((t) => `\`${t}\``).join(' ')}\n\n`;
      }

      markdown += `**创建时间**: ${new Date(card.createdAt).toLocaleString('zh-CN')}\n`;
      markdown += `**更新时间**: ${new Date(card.updatedAt).toLocaleString('zh-CN')}\n\n`;

      const outgoing = links.filter((l) => l.sourceCardId === card.id);
      const incoming = links.filter((l) => l.targetCardId === card.id);

      if (outgoing.length > 0) {
        markdown += `**出链** (${outgoing.length}):\n`;
        outgoing.forEach((l) => {
          const targetCard = cards.find((c) => c.id === l.targetCardId);
          if (targetCard) {
            markdown += `- [[${targetCard.title}]]\n`;
          }
        });
        markdown += `\n`;
      }

      if (incoming.length > 0) {
        markdown += `**入链** (${incoming.length}):\n`;
        incoming.forEach((l) => {
          const sourceCard = cards.find((c) => c.id === l.sourceCardId);
          if (sourceCard) {
            markdown += `- [[${sourceCard.title}]]\n`;
          }
        });
        markdown += `\n`;
      }

      markdown += `### 正文\n\n${card.content}\n\n`;

      if (index < selectedCards.length - 1) {
        markdown += `---\n\n`;
      }
    });

    return markdown;
  },

  getStreakInfo: () => {
    const { readingRecords, reviewHistories, achievements } = get();
    return getStreakInfo(readingRecords, reviewHistories, achievements);
  },

  checkAchievements: async () => {
    const { readingRecords, reviewHistories, achievements } = get();
    const streakInfo = getStreakInfo(readingRecords, reviewHistories, achievements);
    const newAchievementTypes = checkNewAchievements(
      streakInfo.currentStreak,
      achievements
    );

    if (newAchievementTypes.length === 0) {
      return [];
    }

    const newAchievements: Achievement[] = [];
    for (const type of newAchievementTypes) {
      const achievement = createAchievement(type);
      await db.achievements.add(achievement);
      newAchievements.push(achievement);
    }

    await get().loadAllData();
    set({ newlyUnlockedAchievements: newAchievements });
    return newAchievements;
  },

  clearNewAchievements: () => {
    set({ newlyUnlockedAchievements: [] });
  },

  getWeeklyReport: () => {
    const { cards, links, readingRecords, reviewHistories } = get();
    return generateWeeklyReport(cards, links, readingRecords, reviewHistories);
  },

  getWeeklyReportMarkdown: () => {
    const { cards, links, readingRecords, reviewHistories } = get();
    const report = generateWeeklyReport(cards, links, readingRecords, reviewHistories);
    return formatWeeklyReportMarkdown(report);
  },

  createTemplate: async (partialTemplate) => {
    const now = new Date();
    const newTemplate: CardTemplate = {
      id: generateId(),
      name: partialTemplate.name || '未命名模板',
      description: partialTemplate.description || '',
      titleFormat: partialTemplate.titleFormat || '',
      contentSkeleton: partialTemplate.contentSkeleton || '',
      defaultTags: partialTemplate.defaultTags || [],
      icon: partialTemplate.icon || '📄',
      createdAt: now,
      updatedAt: now,
    };
    await db.cardTemplates.add(newTemplate);
    await get().loadAllData();
    return newTemplate;
  },

  updateTemplate: async (id, updates) => {
    const template = await db.cardTemplates.get(id);
    if (!template) return;
    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };
    await db.cardTemplates.update(id, updatedTemplate);
    await get().loadAllData();
  },

  deleteTemplate: async (id) => {
    await db.cardTemplates.delete(id);
    await get().loadAllData();
  },

  toggleFavorite: async (cardId) => {
    const card = await db.cards.get(cardId);
    if (!card) return;

    await db.cards.update(cardId, {
      isFavorite: !card.isFavorite,
      updatedAt: new Date(),
    });
    await get().loadAllData();
  },

  getFavoriteCards: () => {
    const { cards } = get();
    return cards
      .filter((c) => c.isFavorite)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  setActiveSpaceId: (spaceId) => set({ activeSpaceId: spaceId }),

  createSpace: async (partialSpace) => {
    const now = new Date();
    const newSpace: KnowledgeSpace = {
      id: generateId(),
      name: partialSpace.name || '未命名空间',
      description: partialSpace.description || '',
      icon: partialSpace.icon || '📁',
      color: partialSpace.color || '#f59e0b',
      createdAt: now,
      updatedAt: now,
    };
    await db.knowledgeSpaces.add(newSpace);
    await get().loadAllData();
    return newSpace;
  },

  updateSpace: async (id, updates) => {
    const space = await db.knowledgeSpaces.get(id);
    if (!space) return;
    const updatedSpace = {
      ...space,
      ...updates,
      updatedAt: new Date(),
    };
    await db.knowledgeSpaces.update(id, updatedSpace);
    await get().loadAllData();
  },

  deleteSpace: async (id) => {
    const { activeSpaceId } = get();
    await db.transaction('rw', db.knowledgeSpaces, db.cards, async () => {
      await db.knowledgeSpaces.delete(id);
      await db.cards
        .where('spaceId')
        .equals(id)
        .modify({ spaceId: null });
    });
    if (activeSpaceId === id) {
      set({ activeSpaceId: null });
    }
    await get().loadAllData();
  },

  moveCardToSpace: async (cardId, spaceId) => {
    await db.cards.update(cardId, {
      spaceId: spaceId || null,
      updatedAt: new Date(),
    });
    await get().loadAllData();
  },

  getCardsBySpace: (spaceId) => {
    const { cards } = get();
    if (spaceId === null) {
      return cards.filter((c) => !c.spaceId);
    }
    return cards.filter((c) => c.spaceId === spaceId);
  },
}));
