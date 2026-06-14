import Dexie, { Table } from 'dexie';
import { Card, Link, ReadingRecord, ImportSource, ReviewHistory } from '../types';

export class KnowledgeBaseDB extends Dexie {
  cards!: Table<Card, string>;
  links!: Table<Link, string>;
  readingRecords!: Table<ReadingRecord, string>;
  importSources!: Table<ImportSource, string>;
  reviewHistories!: Table<ReviewHistory, string>;

  constructor() {
    super('KnowledgeBaseDB');
    this.version(1).stores({
      cards: 'id, title, createdAt, updatedAt, lastReviewedAt',
      links: 'id, sourceCardId, targetCardId, createdAt',
      readingRecords: 'id, cardId, startTime, endTime, fromCardId',
      importSources: 'id, type, importedAt, processed',
      reviewHistories: 'id, cardId, reviewDate',
    });
  }
}

export const db = new KnowledgeBaseDB();
