## 1. 架构设计

```mermaid
graph TD
    A["React 前端层"] --> B["状态管理层 (Zustand)"]
    A --> C["UI组件层"]
    C --> C1["知识卡片组件"]
    C --> C2["图谱可视化组件"]
    C --> C3["阅读轨迹组件"]
    C --> C4["复习中心组件"]
    B --> D["数据持久层 (IndexedDB)"]
    D --> E["本地存储"]
    A --> F["可视化引擎 (D3.js + React Force)"]
    A --> G["Markdown解析 (react-markdown)"]
    H["数据导入模块"] --> I["书签解析器"]
    H --> J["标注解析器"]
    H --> K["关联建议引擎"]
    L["间隔重复引擎"] --> M["SM-2算法"]
    L --> N["关联密度分析"]
```

## 2. 技术描述

- **前端框架**: React@18 + TypeScript + Vite
- **样式方案**: TailwindCSS@3 + CSS Variables
- **状态管理**: Zustand
- **本地数据库**: IndexedDB (Dexie.js)
- **图谱可视化**: d3-force + react-force-graph
- **Markdown解析**: react-markdown + remark-gfm
- **路由管理**: React Router v6
- **图标库**: Lucide React
- **动画库**: Framer Motion
- **日期处理**: date-fns

## 3. 路由定义

| 路由 | 页面 | 组件 |
|------|------|------|
| / | 仪表盘 | DashboardPage |
| /cards | 知识卡片列表 | CardListPage |
| /cards/new | 创建新卡片 | CardEditorPage |
| /cards/:id | 卡片详情/编辑 | CardEditorPage |
| /graph | 知识图谱 | GraphPage |
| /import | 数据导入 | ImportPage |
| /trajectory | 阅读轨迹 | TrajectoryPage |
| /review | 复习中心 | ReviewPage |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    CARD {
        string id PK
        string title
        string content
        string[] tags
        datetime createdAt
        datetime updatedAt
        datetime lastReviewedAt
        int reviewInterval
        float easeFactor
        int reviewCount
    }
    
    LINK {
        string id PK
        string sourceCardId FK
        string targetCardId FK
        string linkType
        datetime createdAt
    }
    
    READING_RECORD {
        string id PK
        string cardId FK
        datetime startTime
        datetime endTime
        int duration
        string fromCardId FK
    }
    
    IMPORT_SOURCE {
        string id PK
        string type
        string title
        string url
        string content
        datetime importedAt
    }
    
    REVIEW_HISTORY {
        string id PK
        string cardId FK
        datetime reviewDate
        string rating
        int newInterval
    }

    CARD ||--o{ LINK : "source"
    CARD ||--o{ LINK : "target"
    CARD ||--o{ READING_RECORD : "reads"
    CARD ||--o{ REVIEW_HISTORY : "reviews"
```

### 4.2 TypeScript 类型定义

```typescript
interface Card {
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

interface Link {
  id: string;
  sourceCardId: string;
  targetCardId: string;
  linkType: 'forward' | 'backward' | 'bidirectional';
  createdAt: Date;
}

interface ReadingRecord {
  id: string;
  cardId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  fromCardId?: string;
}

interface GraphNode {
  id: string;
  title: string;
  tagCount: number;
  linkCount: number;
  reviewPriority: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}
```

## 5. 核心算法模块

### 5.1 双向链接解析
- 解析卡片内容中的 `[[卡片标题]]` 语法
- 自动创建反向链接
- 维护链接索引表

### 5.2 关联密度计算
```typescript
function calculateLinkDensity(cardId: string): number {
  const outgoingLinks = getOutgoingLinks(cardId);
  const incomingLinks = getIncomingLinks(cardId);
  const allCards = getAllCards();
  return (outgoingLinks.length + incomingLinks.length) / Math.max(allCards.length, 1);
}
```

### 5.3 间隔重复算法 (SM-2)
```typescript
function calculateNextReview(card: Card, rating: number): Card {
  let { easeFactor, reviewInterval, reviewCount } = card;
  
  if (rating < 3) {
    reviewCount = 0;
    reviewInterval = 1;
  } else {
    if (reviewCount === 0) reviewInterval = 1;
    else if (reviewCount === 1) reviewInterval = 6;
    else reviewInterval = Math.round(reviewInterval * easeFactor);
    reviewCount++;
  }
  
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
  
  return {
    ...card,
    easeFactor,
    reviewInterval,
    reviewCount,
    lastReviewedAt: new Date()
  };
}
```

### 5.4 智能关联建议
- 基于TF-IDF计算内容相似度
- 基于标签重叠度计算关联概率
- 综合评分排序推荐关联卡片
