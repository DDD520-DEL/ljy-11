import { Card, Link } from '../types';

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

const now = new Date();

export function generateMockData(): { cards: Card[]; links: Link[] } {
  const cards: Card[] = [
    {
      id: generateId(),
      title: '认知科学基础',
      content: `认知科学是研究心智和智力的跨学科领域，涉及心理学、语言学、哲学、计算机科学、神经科学和人类学。

核心概念包括：
- **信息加工理论**：将心智视为信息处理系统
- **联结主义**：强调神经网络的并行处理
- **具身认知**：认为认知过程与身体互动密切相关

[[学习科学]] 是认知科学的重要应用领域。`,
      tags: ['认知科学', '心理学', '基础理论'],
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      lastReviewedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      reviewInterval: 3,
      easeFactor: 2.5,
      reviewCount: 4,
    },
    {
      id: generateId(),
      title: '学习科学',
      content: `学习科学是研究如何有效学习的跨学科领域。

主要研究方向：
1. **建构主义学习**：学习者主动构建知识
2. **协作学习**：通过社会互动促进学习
3. **技术增强学习**：利用技术工具支持学习

[[间隔重复]] 是基于学习科学的高效复习方法。
[[认知科学基础]] 为学习科学提供理论基础。`,
      tags: ['学习科学', '教育', '方法论'],
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      lastReviewedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      reviewInterval: 6,
      easeFactor: 2.6,
      reviewCount: 3,
    },
    {
      id: generateId(),
      title: '间隔重复',
      content: `间隔重复（Spaced Repetition）是一种基于记忆遗忘曲线的学习方法。

## SM-2算法
间隔重复最著名的实现是SM-2算法，由Piotr Woźniak在1987年提出：

- 初次复习：1天后
- 第二次复习：6天后
- 后续复习：上次间隔 × 难度系数

## 核心原理
1. **记忆巩固**：复习时机恰好位于遗忘临界点
2. **难度调整**：根据回忆难度动态调整间隔
3. **主动回忆**：测试效应增强记忆痕迹

[[学习科学]] 为间隔重复提供理论支持。
[[知识网络]] 中的高关联节点应优先复习。`,
      tags: ['学习方法', '记忆', '算法'],
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      lastReviewedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      reviewInterval: 10,
      easeFactor: 2.8,
      reviewCount: 5,
    },
    {
      id: generateId(),
      title: '知识网络',
      content: `知识网络是由知识节点和关联边构成的网络结构。

## 关键特性
- **节点**：代表概念或知识卡片
- **边**：代表概念间的语义关联
- **中心性**：衡量节点在网络中的重要性

## 关联密度
高关联密度的节点通常代表核心概念，应优先复习巩固。

[[认知科学基础]] 解释知识如何在大脑中形成网络。
[[双链笔记]] 是构建知识网络的有效方法。`,
      tags: ['知识管理', '网络科学', '概念'],
      createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      lastReviewedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      reviewInterval: 4,
      easeFactor: 2.4,
      reviewCount: 2,
    },
    {
      id: generateId(),
      title: '双链笔记',
      content: `双链笔记（Bi-directional Linking Note-taking）是一种笔记方法，强调笔记之间的双向关联。

## 核心概念
- **正向链接**：笔记A引用笔记B
- **反向链接**：笔记B自动显示被笔记A引用
- **图谱可视化**：直观展示知识网络结构

## 优势
1. 发现知识间的隐式关联
2. 促进知识的有机生长
3. 支持非线性思考

[[知识网络]] 是双链笔记的底层结构。
[[Zettelkasten方法]] 是双链笔记的先驱。`,
      tags: ['笔记方法', '知识管理', '工具'],
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      lastReviewedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      reviewInterval: 2,
      easeFactor: 2.3,
      reviewCount: 3,
    },
    {
      id: generateId(),
      title: 'Zettelkasten方法',
      content: `Zettelkasten（卡片盒笔记法）由德国社会学家尼克拉斯·卢曼发明。

## 方法特点
- 每个笔记一张卡片
- 每个卡片有唯一编号
- 通过引用建立笔记间的关联
- 强调自下而上的知识涌现

## 与现代双链笔记的关系
[[双链笔记]] 可以看作是Zettelkasten的数字化演进。`,
      tags: ['笔记方法', '历史', '知识管理'],
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      lastReviewedAt: undefined,
      reviewInterval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
    },
    {
      id: generateId(),
      title: '艾宾浩斯遗忘曲线',
      content: `艾宾浩斯遗忘曲线描述了人类记忆随时间衰减的规律。

遗忘速度：
- 20分钟后：遗忘42%
- 1小时后：遗忘56%
- 1天后：遗忘74%
- 1周后：遗忘77%

[[间隔重复]] 正是基于这一规律设计的复习方法。`,
      tags: ['记忆', '心理学', '基础理论'],
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      lastReviewedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      reviewInterval: 7,
      easeFactor: 2.5,
      reviewCount: 1,
    },
    {
      id: generateId(),
      title: '主动回忆',
      content: `主动回忆（Active Recall）是指通过自我测试来加强记忆的学习策略。

## 研究证据
多项研究表明，主动回忆比被动阅读效率高3倍以上。

## 实施方法
- 使用闪卡
- 闭合书本自问自答
- 尝试教授他人

[[间隔重复]] 系统通常结合主动回忆原则。
[[测试效应]] 解释了主动回忆为何有效。`,
      tags: ['学习方法', '记忆', '心理学'],
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      lastReviewedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      reviewInterval: 3,
      easeFactor: 2.6,
      reviewCount: 2,
    },
    {
      id: generateId(),
      title: '测试效应',
      content: `测试效应（Testing Effect）指的是从记忆中提取信息的过程本身会增强记忆。

## 神经机制
测试过程激活了海马体和前额叶皮层，促进记忆巩固。

[[主动回忆]] 是测试效应的实际应用。
[[认知科学基础]] 提供神经科学视角。`,
      tags: ['心理学', '记忆', '研究'],
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      lastReviewedAt: undefined,
      reviewInterval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
    },
    {
      id: generateId(),
      title: '知识迁移',
      content: `知识迁移是指将在一个情境中学到的知识应用到新情境的能力。

## 迁移类型
- **近迁移**：相似情境间的迁移
- **远迁移**：不同情境间的迁移

## 促进迁移的方法
1. 深度理解而非机械记忆
2. 建立广泛的知识关联
3. 多样化的练习场景

[[知识网络]] 的丰富连接有助于知识迁移。
[[学习科学]] 研究如何促进有效迁移。`,
      tags: ['学习科学', '认知', '能力'],
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      lastReviewedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      reviewInterval: 1,
      easeFactor: 2.5,
      reviewCount: 1,
    },
  ];

  const links: Link[] = [];

  const titleToId = new Map(cards.map((c) => [c.title, c.id]));

  const linkPairs: [string, string][] = [
    ['认知科学基础', '学习科学'],
    ['学习科学', '间隔重复'],
    ['间隔重复', '知识网络'],
    ['知识网络', '认知科学基础'],
    ['知识网络', '双链笔记'],
    ['双链笔记', 'Zettelkasten方法'],
    ['间隔重复', '艾宾浩斯遗忘曲线'],
    ['间隔重复', '主动回忆'],
    ['主动回忆', '测试效应'],
    ['测试效应', '认知科学基础'],
    ['知识迁移', '知识网络'],
    ['知识迁移', '学习科学'],
    ['学习科学', '认知科学基础'],
    ['双链笔记', '知识网络'],
    ['主动回忆', '间隔重复'],
  ];

  for (const [source, target] of linkPairs) {
    const sourceId = titleToId.get(source);
    const targetId = titleToId.get(target);
    if (sourceId && targetId) {
      links.push({
        id: generateId(),
        sourceCardId: sourceId,
        targetCardId: targetId,
        linkType: 'bidirectional',
        createdAt: new Date(now.getTime() - Math.random() * 20 * 24 * 60 * 60 * 1000),
      });
    }
  }

  return { cards, links };
}
