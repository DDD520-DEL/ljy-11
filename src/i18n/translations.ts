import { Language } from '../types';

export type TranslationKey = string;

export interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

export const translations: Translations = {
  'app.title': {
    zh: '智识',
    en: 'Intellect',
  },
  'app.subtitle': {
    zh: '知识网络平台',
    en: 'Knowledge Network Platform',
  },
  'nav.dashboard': {
    zh: '仪表盘',
    en: 'Dashboard',
  },
  'nav.favorites': {
    zh: '我的收藏',
    en: 'Favorites',
  },
  'nav.cards': {
    zh: '知识卡片',
    en: 'Cards',
  },
  'nav.templates': {
    zh: '模板管理',
    en: 'Templates',
  },
  'nav.tags': {
    zh: '标签管理',
    en: 'Tags',
  },
  'nav.graph': {
    zh: '知识图谱',
    en: 'Graph',
  },
  'nav.import': {
    zh: '数据导入',
    en: 'Import',
  },
  'nav.export': {
    zh: '数据导出',
    en: 'Export',
  },
  'nav.reading': {
    zh: '阅读轨迹',
    en: 'Reading Path',
  },
  'nav.review': {
    zh: '复习中心',
    en: 'Review Center',
  },
  'nav.settings': {
    zh: '系统设置',
    en: 'Settings',
  },
  'nav.all': {
    zh: '全部',
    en: 'All',
  },
  'nav.search': {
    zh: '全局搜索...',
    en: 'Global Search...',
  },
  'nav.space': {
    zh: '知识空间',
    en: 'Knowledge Space',
  },
  'nav.createSpace': {
    zh: '创建知识空间',
    en: 'Create Space',
  },
  'sidebar.totalCards': {
    zh: '全部卡片',
    en: 'All Cards',
  },
  'settings.title': {
    zh: '系统设置',
    en: 'Settings',
  },
  'settings.subtitle': {
    zh: '个性化配置您的知识管理体验',
    en: 'Personalize your knowledge management experience',
  },
  'settings.save': {
    zh: '保存设置',
    en: 'Save Settings',
  },
  'settings.saved': {
    zh: '已保存',
    en: 'Saved',
  },
  'settings.dailyReview.title': {
    zh: '每日复习提醒',
    en: 'Daily Review Reminder',
  },
  'settings.dailyReview.subtitle': {
    zh: '设置每日复习提醒时间',
    en: 'Set daily review reminder time',
  },
  'settings.dailyReview.enabled': {
    zh: '启用复习提醒',
    en: 'Enable Review Reminder',
  },
  'settings.dailyReview.time': {
    zh: '提醒时间',
    en: 'Reminder Time',
  },
  'settings.sort.title': {
    zh: '卡片排序',
    en: 'Card Sorting',
  },
  'settings.sort.subtitle': {
    zh: '设置卡片列表的默认排序方式',
    en: 'Set default sorting method for card list',
  },
  'settings.sort.default': {
    zh: '默认排序方式',
    en: 'Default Sorting',
  },
  'settings.sort.updatedAt': {
    zh: '更新时间',
    en: 'Updated At',
  },
  'settings.sort.createdAt': {
    zh: '创建时间',
    en: 'Created At',
  },
  'settings.sort.sortTitle': {
    zh: '标题',
    en: 'Title',
  },
  'settings.graph.title': {
    zh: '知识图谱',
    en: 'Knowledge Graph',
  },
  'settings.graph.subtitle': {
    zh: '配置知识图谱的显示参数',
    en: 'Configure knowledge graph display parameters',
  },
  'settings.graph.nodeLimit': {
    zh: '节点数量上限',
    en: 'Node Limit',
  },
  'settings.language.title': {
    zh: '界面语言',
    en: 'Interface Language',
  },
  'settings.language.subtitle': {
    zh: '选择您偏好的界面语言',
    en: 'Select your preferred interface language',
  },
  'settings.language.select': {
    zh: '语言选择',
    en: 'Language',
  },
  'settings.language.zh': {
    zh: '简体中文',
    en: '简体中文',
  },
  'settings.language.en': {
    zh: 'English',
    en: 'English',
  },
  'settings.about.title': {
    zh: '关于设置',
    en: 'About Settings',
  },
  'settings.about.description': {
    zh: '所有设置都会自动保存到本地存储中，刷新页面后仍然有效。设置更改会实时生效，无需手动刷新。',
    en: 'All settings are automatically saved to local storage and persist after page refresh. Changes take effect immediately without manual refresh.',
  },
  'settings.about.lastUpdated': {
    zh: '最后更新',
    en: 'Last Updated',
  },
  'cards.title': {
    zh: '知识卡片',
    en: 'Cards',
  },
  'cards.subtitle': {
    zh: '共',
    en: 'Total',
  },
  'cards.subtitle2': {
    zh: '张卡片',
    en: 'cards',
  },
  'cards.results': {
    zh: '个结果',
    en: 'results',
  },
  'cards.search': {
    zh: '搜索卡片标题、内容或标签...',
    en: 'Search card title, content or tags...',
  },
  'cards.new': {
    zh: '新卡片',
    en: 'New Card',
  },
  'cards.batch': {
    zh: '批量操作',
    en: 'Batch Actions',
  },
  'cards.sort.recent': {
    zh: '最近更新',
    en: 'Recent Updated',
  },
  'cards.sort.created': {
    zh: '创建时间',
    en: 'Created Time',
  },
  'cards.sort.title': {
    zh: '标题排序',
    en: 'Sort by Title',
  },
  'cards.sort.links': {
    zh: '关联数量',
    en: 'Link Count',
  },
  'cards.addFavorite': {
    zh: '添加收藏',
    en: 'Add to Favorites',
  },
  'cards.removeFavorite': {
    zh: '取消收藏',
    en: 'Remove from Favorites',
  },
  'graph.title': {
    zh: '知识图谱',
    en: 'Knowledge Graph',
  },
  'graph.subtitle': {
    zh: '可视化展示知识网络结构，发现知识间的隐藏关联',
    en: 'Visualize knowledge network structure and discover hidden connections',
  },
  'graph.back': {
    zh: '返回',
    en: 'Back',
  },
  'graph.filterByTag': {
    zh: '按标签筛选',
    en: 'Filter by Tags',
  },
  'graph.nodeCount': {
    zh: '节点数',
    en: 'Nodes',
  },
  'graph.linkCount': {
    zh: '连接数',
    en: 'Links',
  },
  'graph.openCard': {
    zh: '打开卡片',
    en: 'Open Card',
  },
  'graph.filterAll': {
    zh: '全部',
    en: 'All',
  },
  'graph.focus': {
    zh: '聚焦此节点',
    en: 'Focus This Node',
  },
  'graph.clearFocus': {
    zh: '清除聚焦',
    en: 'Clear Focus',
  },
  'loading': {
    zh: '正在初始化知识库...',
    en: 'Initializing knowledge base...',
  },
};

export const translate = (key: string, lang: Language): string => {
  const translation = translations[key];
  if (!translation) return key;
  return lang === 'zh-CN' ? translation.zh : translation.en;
};
