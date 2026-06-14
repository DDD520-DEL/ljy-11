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
} from '../types';
import { db } from '../db';
import {
  calculateNextReview,
  calculateLinkDensity,
  calculateReviewPriority,
  parseWikiLinks,
  tokenize,
  calculateTFIDF,
  calculateCosineSimilarity,
} from '../utils/algorithm';
import { generateMockData } from '../utils/mockData';

interface StoreState {
  cards: Card[];
  links: Link[];
  readingRecords: ReadingRecord[];
  importSources: ImportSource[];
  reviewHistories: ReviewHistory[];
  cardVersions: CardVersion[];
  currentCardId: string | null;
  isLoading: boolean;
  selectedTags: string[];
  searchQuery: string;
  currentReadingSession: {
    cardId: string;
    startTime: Date;
    fromCardId?: string;
  } | null;

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
  suggestLinks: (content: string) => Promise<LinkSuggestion[]>;

  startReading: (cardId: string, fromCardId?: string) => Promise<void>;
  endReading: () => Promise<void>;
  getReadingHeatmap: () => Map<string, number>;

  getReviewQueue: () => Card[];
  submitReview: (cardId: string, rating: number) => Promise<void>;

  importBookmarks: (file: File) => Promise<ImportSource[]>;
  importAnnotations: (content: string) => Promise<ImportSource[]>;
  processImport: (importId: string, createCard: boolean) => Promise<void>;

  getGraphData: () => GraphData;

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
  currentCardId: null,
  isLoading: true,
  selectedTags: [],
  searchQuery: '',
  currentReadingSession: null,

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
    const [cards, links, readingRecords, importSources, reviewHistories, cardVersions] =
      await Promise.all([
        db.cards.orderBy('updatedAt').reverse().toArray(),
        db.links.toArray(),
        db.readingRecords.orderBy('startTime').reverse().toArray(),
        db.importSources.orderBy('importedAt').reverse().toArray(),
        db.reviewHistories.toArray(),
        db.cardVersions.orderBy('createdAt').reverse().toArray(),
      ]);
    set({
      cards,
      links,
      readingRecords,
      importSources,
      reviewHistories,
      cardVersions,
      isLoading: false,
    });
  },

  createCard: async (partialCard) => {
    const now = new Date();
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

  suggestLinks: async (content) => {
    const { cards } = get();
    if (cards.length < 2) return [];

    const contentTokens = tokenize(content);
    const allTokens = cards.map((c) => tokenize(c.title + ' ' + c.content));
    allTokens.push(contentTokens);

    const tfidfVectors = calculateTFIDF(allTokens);
    const contentVector = tfidfVectors[tfidfVectors.length - 1];

    const suggestions: LinkSuggestion[] = cards
      .map((card, index) => {
        const cardVector = tfidfVectors[index];
        const similarity = calculateCosineSimilarity(contentVector, cardVector);

        const contentTags = new Set(
          content.toLowerCase().match(/#[\w\u4e00-\u9fa5]+/g) || []
        );
        const cardTags = new Set(card.tags.map((t) => t.toLowerCase()));
        const tagOverlap = [...contentTags].filter((t) => cardTags.has(t)).length;
        const tagScore =
          tagOverlap / Math.max(contentTags.size + cardTags.size, 1);

        const totalScore = similarity * 0.7 + tagScore * 0.3;

        let reason = `内容相似度: ${(similarity * 100).toFixed(0)}%`;
        if (tagOverlap > 0) {
          reason += `, 标签重叠: ${tagOverlap}个`;
        }

        return {
          cardId: card.id,
          cardTitle: card.title,
          similarity: totalScore,
          reason,
        };
      })
      .filter((s) => s.similarity > 0.05)
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
    const { cards, links } = get();
    const now = new Date();

    return cards
      .filter((card) => {
        if (!card.lastReviewedAt) return true;
        const daysSinceReview =
          (now.getTime() - card.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceReview >= card.reviewInterval;
      })
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
          reviewPriority: calculateReviewPriority(card, density, now),
        };
      })
      .sort((a, b) => b.reviewPriority - a.reviewPriority);
  },

  submitReview: async (cardId, rating) => {
    const card = await db.cards.get(cardId);
    if (!card) return;

    const updates = calculateNextReview(card, rating);
    await db.cards.update(cardId, updates);

    const history: ReviewHistory = {
      id: generateId(),
      cardId,
      reviewDate: new Date(),
      rating,
      newInterval: updates.reviewInterval || card.reviewInterval,
    };
    await db.reviewHistories.add(history);
    await get().loadAllData();
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
    const { cards, links } = get();

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

    const nodes: GraphNode[] = cards.map((card) => {
      const cardLinks = links.filter(
        (l) => l.sourceCardId === card.id || l.targetCardId === card.id
      );
      const outgoingLinks = links.filter((l) => l.sourceCardId === card.id);
      const incomingLinks = links.filter((l) => l.targetCardId === card.id);
      const density = calculateLinkDensity(
        card.id,
        outgoingLinks.map((l) => l.targetCardId),
        incomingLinks.map((l) => l.sourceCardId),
        cards.length
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

    const graphLinks: GraphLink[] = links.map((link) => ({
      source: link.sourceCardId,
      target: link.targetCardId,
      value: 1,
    }));

    return { nodes, links: graphLinks };
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
}));
