import Dexie, { Table } from 'dexie';
import { Card, Link, ReadingRecord, ImportSource, ReviewHistory, CardVersion, Achievement, CardTemplate, KnowledgeSpace, UserSettings } from '../types';

export class KnowledgeBaseDB extends Dexie {
  cards!: Table<Card, string>;
  links!: Table<Link, string>;
  readingRecords!: Table<ReadingRecord, string>;
  importSources!: Table<ImportSource, string>;
  reviewHistories!: Table<ReviewHistory, string>;
  cardVersions!: Table<CardVersion, string>;
  achievements!: Table<Achievement, string>;
  cardTemplates!: Table<CardTemplate, string>;
  knowledgeSpaces!: Table<KnowledgeSpace, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('KnowledgeBaseDB');
    this.version(1).stores({
      cards: 'id, title, createdAt, updatedAt, lastReviewedAt',
      links: 'id, sourceCardId, targetCardId, createdAt',
      readingRecords: 'id, cardId, startTime, endTime, fromCardId',
      importSources: 'id, type, importedAt, processed',
      reviewHistories: 'id, cardId, reviewDate',
    });
    this.version(2).stores({
      cards: 'id, title, createdAt, updatedAt, lastReviewedAt',
      links: 'id, sourceCardId, targetCardId, createdAt',
      readingRecords: 'id, cardId, startTime, endTime, fromCardId',
      importSources: 'id, type, importedAt, processed',
      reviewHistories: 'id, cardId, reviewDate',
      cardVersions: 'id, cardId, createdAt',
    });
    this.version(3).stores({
      cards: 'id, title, createdAt, updatedAt, lastReviewedAt',
      links: 'id, sourceCardId, targetCardId, createdAt',
      readingRecords: 'id, cardId, startTime, endTime, fromCardId',
      importSources: 'id, type, importedAt, processed',
      reviewHistories: 'id, cardId, reviewDate',
      cardVersions: 'id, cardId, createdAt',
      achievements: 'id, type, unlockedAt',
    });
    this.version(4).stores({
      cards: 'id, title, createdAt, updatedAt, lastReviewedAt',
      links: 'id, sourceCardId, targetCardId, createdAt',
      readingRecords: 'id, cardId, startTime, endTime, fromCardId',
      importSources: 'id, type, importedAt, processed',
      reviewHistories: 'id, cardId, reviewDate',
      cardVersions: 'id, cardId, createdAt',
      achievements: 'id, type, unlockedAt',
      cardTemplates: 'id, name, createdAt, updatedAt',
    });
    this.version(5).stores({
      cards: 'id, title, createdAt, updatedAt, lastReviewedAt, isFavorite',
      links: 'id, sourceCardId, targetCardId, createdAt',
      readingRecords: 'id, cardId, startTime, endTime, fromCardId',
      importSources: 'id, type, importedAt, processed',
      reviewHistories: 'id, cardId, reviewDate',
      cardVersions: 'id, cardId, createdAt',
      achievements: 'id, type, unlockedAt',
      cardTemplates: 'id, name, createdAt, updatedAt',
    }).upgrade(async (tx) => {
      await tx.table('cards').toCollection().modify((card: any) => {
        if (card.isFavorite === undefined) {
          card.isFavorite = false;
        }
      });
    });
    this.version(6).stores({
      cards: 'id, title, createdAt, updatedAt, lastReviewedAt, isFavorite, spaceId',
      links: 'id, sourceCardId, targetCardId, createdAt',
      readingRecords: 'id, cardId, startTime, endTime, fromCardId',
      importSources: 'id, type, importedAt, processed',
      reviewHistories: 'id, cardId, reviewDate',
      cardVersions: 'id, cardId, createdAt',
      achievements: 'id, type, unlockedAt',
      cardTemplates: 'id, name, createdAt, updatedAt',
      knowledgeSpaces: 'id, name, createdAt, updatedAt',
    }).upgrade(async (tx) => {
      await tx.table('cards').toCollection().modify((card: any) => {
        if (card.spaceId === undefined) {
          card.spaceId = null;
        }
      });
    });
    this.version(7).stores({
      cards: 'id, title, createdAt, updatedAt, lastReviewedAt, isFavorite, spaceId, reviewPriority',
      links: 'id, sourceCardId, targetCardId, createdAt',
      readingRecords: 'id, cardId, startTime, endTime, fromCardId',
      importSources: 'id, type, importedAt, processed',
      reviewHistories: 'id, cardId, reviewDate',
      cardVersions: 'id, cardId, createdAt',
      achievements: 'id, type, unlockedAt',
      cardTemplates: 'id, name, createdAt, updatedAt',
      knowledgeSpaces: 'id, name, createdAt, updatedAt',
    }).upgrade(async (tx) => {
      await tx.table('cards').toCollection().modify((card: any) => {
        if (card.reviewPriority === undefined) {
          card.reviewPriority = 'medium';
        }
        if (card.customNextReviewDate === undefined) {
          card.customNextReviewDate = null;
        }
      });
    });
    this.version(8).stores({
      cards: 'id, title, createdAt, updatedAt, lastReviewedAt, isFavorite, spaceId, reviewPriority',
      links: 'id, sourceCardId, targetCardId, createdAt',
      readingRecords: 'id, cardId, startTime, endTime, fromCardId',
      importSources: 'id, type, importedAt, processed',
      reviewHistories: 'id, cardId, reviewDate',
      cardVersions: 'id, cardId, createdAt',
      achievements: 'id, type, unlockedAt',
      cardTemplates: 'id, name, createdAt, updatedAt',
      knowledgeSpaces: 'id, name, createdAt, updatedAt',
      settings: 'id, updatedAt',
    });
  }
}

export const db = new KnowledgeBaseDB();
