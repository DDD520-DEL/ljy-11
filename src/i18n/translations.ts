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

  'space.spaceName': {
    zh: '空间名称',
    en: 'Space Name',
  },
  'space.description': {
    zh: '描述（可选）',
    en: 'Description (optional)',
  },
  'space.cancel': {
    zh: '取消',
    en: 'Cancel',
  },
  'space.create': {
    zh: '创建',
    en: 'Create',
  },
  'space.deleteConfirm': {
    zh: '确定要删除此知识空间吗？空间内的卡片将移至"未分类"。',
    en: 'Are you sure you want to delete this knowledge space? Cards in this space will be moved to "Uncategorized".',
  },
  'space.uncategorized': {
    zh: '未分类',
    en: 'Uncategorized',
  },

  'graph.subtitle2': {
    zh: '可视化展示知识节点间的关联网络',
    en: 'Visualize the connection network between knowledge nodes',
  },
  'graph.zoomIn': {
    zh: '放大',
    en: 'Zoom In',
  },
  'graph.zoomOut': {
    zh: '缩小',
    en: 'Zoom Out',
  },
  'graph.resetView': {
    zh: '重置视图',
    en: 'Reset View',
  },
  'graph.focusing': {
    zh: '聚焦:',
    en: 'Focusing:',
  },
  'graph.nodes': {
    zh: '节点',
    en: 'Nodes',
  },
  'graph.links': {
    zh: '关联',
    en: 'Links',
  },
  'graph.totalNodesPrefix': {
    zh: '(共',
    en: '(Total ',
  },
  'graph.totalNodesSuffix': {
    zh: '节点)',
    en: ' nodes)',
  },
  'graph.linkCountSuffix': {
    zh: '个关联',
    en: ' links',
  },
  'graph.doubleClickTip': {
    zh: '双击聚焦节点',
    en: 'Double-click to focus node',
  },
  'graph.tagFilter': {
    zh: '标签筛选',
    en: 'Tag Filter',
  },
  'graph.clearFilter': {
    zh: '清除筛选',
    en: 'Clear Filter',
  },
  'graph.nodeInfo': {
    zh: '节点信息',
    en: 'Node Info',
  },
  'graph.reviewPriority': {
    zh: '复习优先级',
    en: 'Review Priority',
  },
  'graph.reviewCount': {
    zh: '复习次数',
    en: 'Review Count',
  },
  'graph.reviewInterval': {
    zh: '复习间隔',
    en: 'Review Interval',
  },
  'graph.days': {
    zh: '天',
    en: ' days',
  },
  'graph.suggestReview': {
    zh: '建议复习',
    en: 'Suggested Review',
  },
  'graph.suggestReviewDesc': {
    zh: '该节点关联度高，建议优先复习巩固',
    en: 'This node has high connectivity, recommended for priority review',
  },
  'graph.exitFocus': {
    zh: '退出聚焦',
    en: 'Exit Focus',
  },
  'graph.viewCardDetail': {
    zh: '查看卡片详情',
    en: 'View Card Detail',
  },
  'graph.emptyTip1': {
    zh: '点击图谱节点查看详情',
    en: 'Click a graph node to view details',
  },
  'graph.emptyTip2': {
    zh: '双击节点进入聚焦模式',
    en: 'Double-click node to enter focus mode',
  },
  'graph.legend': {
    zh: '图例',
    en: 'Legend',
  },
  'graph.other': {
    zh: '其他',
    en: 'Other',
  },

  'dashboard.thisWeek': {
    zh: '本周',
    en: 'This Week',
  },
  'dashboard.thisMonth': {
    zh: '本月',
    en: 'This Month',
  },
  'dashboard.last30Days': {
    zh: '近30天',
    en: 'Last 30 Days',
  },
  'dashboard.comparedLastWeek': {
    zh: '较上周',
    en: 'vs Last Week',
  },
  'dashboard.comparedLastMonth': {
    zh: '较上月',
    en: 'vs Last Month',
  },
  'dashboard.comparedLast30': {
    zh: '较前30天',
    en: 'vs Prev 30 Days',
  },
  'dashboard.last7Days': {
    zh: '最近 7 天',
    en: 'Last 7 Days',
  },
  'dashboard.last30Days2': {
    zh: '最近 30 天',
    en: 'Last 30 Days',
  },
  'dashboard.welcome': {
    zh: '欢迎回来，探索者',
    en: 'Welcome back, Explorer',
  },
  'dashboard.welcomeDesc': {
    zh: '你的知识网络正在生长，每一个链接都是智慧的桥梁。',
    en: 'Your knowledge network is growing, every link is a bridge of wisdom.',
  },
  'dashboard.generateWeeklyReport': {
    zh: '生成周报',
    en: 'Weekly Report',
  },
  'dashboard.notificationSettings': {
    zh: '通知设置',
    en: 'Notifications',
  },
  'dashboard.createNewCard': {
    zh: '创建新卡片',
    en: 'Create New Card',
  },
  'dashboard.noReviewWarnPrefix': {
    zh: '⚠️ 连续',
    en: '⚠️ ',
  },
  'dashboard.noReviewWarnSuffix': {
    zh: '天未复习',
    en: ' days without review',
  },
  'dashboard.noReviewDesc1': {
    zh: '你已有',
    en: "It's been ",
  },
  'dashboard.noReviewDesc2': {
    zh: '天没有复习卡片了，坚持复习才能保持记忆效果。现在还有',
    en: ' days since your last review. Consistency is key to memory retention. There are still ',
  },
  'dashboard.noReviewDesc3': {
    zh: '张卡片等待复习，快开始吧！',
    en: ' cards waiting for review, let\'s get started!',
  },
  'dashboard.startReviewNow': {
    zh: '立即复习',
    en: 'Start Now',
  },
  'dashboard.achievementUnlocked': {
    zh: '🎉 成就解锁！',
    en: '🎉 Achievement Unlocked!',
  },
  'dashboard.newCards': {
    zh: '新增卡片',
    en: 'New Cards',
  },
  'dashboard.myFavorites': {
    zh: '我的收藏',
    en: 'Favorites',
  },
  'dashboard.clickToView': {
    zh: '点击查看',
    en: 'Click to view',
  },
  'dashboard.goFavorite': {
    zh: '快去收藏',
    en: 'Go favorite',
  },
  'dashboard.importantCards': {
    zh: '重要卡片',
    en: 'Important Cards',
  },
  'dashboard.newLinks': {
    zh: '新增关联',
    en: 'New Links',
  },
  'dashboard.reviewRate': {
    zh: '复习完成率',
    en: 'Review Completion',
  },
  'dashboard.excellent': {
    zh: '表现优秀',
    en: 'Excellent',
  },
  'dashboard.keepItUp': {
    zh: '继续加油',
    en: 'Keep It Up',
  },
  'dashboard.needsWork': {
    zh: '需加强',
    en: 'Needs Work',
  },
  'dashboard.currentStreak': {
    zh: '连续打卡',
    en: 'Current Streak',
  },
  'dashboard.dayUnit': {
    zh: '天',
    en: 'd',
  },
  'dashboard.longestPrefix': {
    zh: '最长',
    en: 'Longest ',
  },
  'dashboard.longestSuffix': {
    zh: '天',
    en: 'd',
  },
  'dashboard.allTimeBest': {
    zh: '历史最长',
    en: 'All-time Best',
  },
  'dashboard.studyTime': {
    zh: '期间学习',
    en: 'Study Time',
  },
  'dashboard.minuteUnit': {
    zh: '分钟',
    en: 'min',
  },
  'dashboard.daysActive': {
    zh: '天活跃',
    en: ' days active',
  },
  'dashboard.toReview': {
    zh: '待复习',
    en: 'To Review',
  },
  'dashboard.comparedYesterday': {
    zh: '较昨日',
    en: 'vs Yesterday',
  },
  'dashboard.thisWeekUpdates': {
    zh: '本周更新',
    en: 'This Week',
  },
  'dashboard.thisMonthUpdates': {
    zh: '本月更新',
    en: 'This Month',
  },
  'dashboard.recentUpdates': {
    zh: '近期更新',
    en: 'Recent Updates',
  },
  'dashboard.viewAll': {
    zh: '查看全部',
    en: 'View All',
  },
  'dashboard.todayReview': {
    zh: '今日复习',
    en: 'Today\'s Review',
  },
  'dashboard.spacedRepetition': {
    zh: '间隔重复学习法',
    en: 'Spaced Repetition',
  },
  'dashboard.cardsToReview': {
    zh: '张卡片待复习',
    en: ' cards to review',
  },
  'dashboard.todayCompleted': {
    zh: '今日已完成',
    en: 'Completed Today',
  },
  'dashboard.todayReviewedPrefix': {
    zh: '今日已复习',
    en: 'Reviewed today: ',
  },
  'dashboard.todayReviewedSuffix': {
    zh: '张',
    en: ' cards',
  },
  'dashboard.startReview': {
    zh: '开始复习',
    en: 'Start Review',
  },
  'dashboard.goodPace': {
    zh: '保持良好节奏！',
    en: 'Keep up the good pace!',
  },
  'dashboard.reviewTrend': {
    zh: '复习趋势',
    en: 'Review Trend',
  },
  'dashboard.trendTotalPrefix': {
    zh: '总计',
    en: 'Total ',
  },
  'dashboard.trendTotalSuffix': {
    zh: '次复习',
    en: ' reviews',
  },
  'dashboard.readingActivity': {
    zh: '阅读活跃度',
    en: 'Reading Activity',
  },
  'dashboard.activityLow': {
    zh: '少',
    en: 'Low',
  },
  'dashboard.activityHigh': {
    zh: '多',
    en: 'High',
  },
  'dashboard.achievementBadges': {
    zh: '成就徽章',
    en: 'Achievements',
  },
  'dashboard.unlockedPrefix': {
    zh: '已解锁',
    en: 'Unlocked ',
  },
  'dashboard.unlockedSuffix': {
    zh: '个成就',
    en: ' achievements',
  },
  'dashboard.notificationModalTitle': {
    zh: '通知设置',
    en: 'Notification Settings',
  },
  'dashboard.noNotificationSupport': {
    zh: '你的浏览器不支持通知功能',
    en: 'Your browser does not support notifications',
  },
  'dashboard.useModernBrowser': {
    zh: '请使用现代浏览器以获得完整体验',
    en: 'Please use a modern browser for full experience',
  },
  'dashboard.dailyReviewReminder': {
    zh: '每日复习提醒',
    en: 'Daily Review Reminder',
  },
  'dashboard.dailyReviewDesc': {
    zh: '在指定时间提醒你复习卡片',
    en: 'Remind you to review cards at the specified time',
  },
  'dashboard.notifPermissionDeniedTitle': {
    zh: '通知权限被拒绝',
    en: 'Notification Permission Denied',
  },
  'dashboard.notifPermissionDeniedDesc': {
    zh: '请在浏览器设置中允许本网站发送通知',
    en: 'Please allow notifications for this site in browser settings',
  },
  'dashboard.reminderTime': {
    zh: '提醒时间',
    en: 'Reminder Time',
  },
  'dashboard.hourUnit': {
    zh: '时',
    en: 'h',
  },
  'dashboard.sendTestNotif': {
    zh: '发送测试通知',
    en: 'Send Test Notification',
  },
  'dashboard.notifBottomTip': {
    zh: '提醒将在每天指定时间发送，仅当有待复习卡片时才会通知',
    en: 'Reminders will be sent daily at the specified time, only when there are cards to review',
  },

  'import.title': {
    zh: '数据导入',
    en: 'Import',
  },
  'import.subtitle': {
    zh: '导入网页书签和电子书标注，自动检测重复内容，预览后选择性导入',
    en: 'Import bookmarks and ebook annotations, auto-detect duplicates, preview before import',
  },
  'import.completed': {
    zh: '导入完成',
    en: 'Import Completed',
  },
  'import.created': {
    zh: '张新建',
    en: ' created',
  },
  'import.overwritten': {
    zh: '张覆盖',
    en: ' overwritten',
  },
  'import.skipped': {
    zh: '张跳过',
    en: ' skipped',
  },
  'import.bookmarkTab': {
    zh: '书签导入',
    en: 'Bookmarks',
  },
  'import.annotationTab': {
    zh: '标注导入',
    en: 'Annotations',
  },
  'import.uploadAreaTitle': {
    zh: '点击或拖放书签文件',
    en: 'Click or drop bookmark file',
  },
  'import.uploadAreaDesc': {
    zh: '支持 Chrome、Edge、Firefox 导出的 HTML 书签文件',
    en: 'Supports HTML bookmarks exported from Chrome, Edge, Firefox',
  },
  'import.analyzingBookmarks': {
    zh: '正在分析书签并检测重复...',
    en: 'Analyzing bookmarks and detecting duplicates...',
  },
  'import.annotationPlaceholder': {
    zh: '粘贴电子书标注内容，每行一条标注...\n\n例如：\n间隔重复是基于记忆遗忘曲线的学习方法\n艾宾浩斯遗忘曲线描述了记忆衰减的规律\n主动回忆比被动阅读更有效',
    en: 'Paste ebook annotations, one per line...\n\nExample:\nSpaced repetition is based on the memory forgetting curve\nThe Ebbinghaus curve describes memory decay\nActive recall is more effective than passive reading',
  },
  'import.analyzing': {
    zh: '分析中...',
    en: 'Analyzing...',
  },
  'import.importAnnotations': {
    zh: '导入标注',
    en: 'Import Annotations',
  },
  'import.previewPrefix': {
    zh: '导入预览 (',
    en: 'Import Preview (',
  },
  'import.filterAll': {
    zh: '全部',
    en: 'All',
  },
  'import.filterBookmarks': {
    zh: '书签',
    en: 'Bookmarks',
  },
  'import.filterAnnotations': {
    zh: '标注',
    en: 'Annotations',
  },
  'import.onlyDuplicatePrefix': {
    zh: '仅重复 (',
    en: 'Only Duplicates (',
  },
  'import.onlyDuplicateSuffix': {
    zh: ')',
    en: ')',
  },
  'import.deselectAll': {
    zh: '取消全选',
    en: 'Deselect All',
  },
  'import.selectAll': {
    zh: '全选',
    en: 'Select All',
  },
  'import.batchSetTag': {
    zh: '批量设置：',
    en: 'Batch: ',
  },
  'import.batchCreate': {
    zh: '新建',
    en: 'Create',
  },
  'import.batchOverwrite': {
    zh: '覆盖',
    en: 'Overwrite',
  },
  'import.batchSkip': {
    zh: '跳过',
    en: 'Skip',
  },
  'import.suggestLink': {
    zh: '建议关联：',
    en: 'Suggested Links: ',
  },
  'import.duplicatePrefix': {
    zh: '检测到',
    en: 'Detected ',
  },
  'import.duplicateSuffix': {
    zh: '个疑似重复项',
    en: ' potential duplicates',
  },
  'import.similaritySuffix': {
    zh: '% 相似',
    en: '% similar',
  },
  'import.actionLabel': {
    zh: '操作：',
    en: 'Action: ',
  },
  'import.actionCreate': {
    zh: '新建卡片',
    en: 'New Card',
  },
  'import.actionOverwrite': {
    zh: '覆盖合并',
    en: 'Overwrite & Merge',
  },
  'import.actionSkip': {
    zh: '跳过',
    en: 'Skip',
  },
  'import.noDuplicates': {
    zh: '没有检测到重复项',
    en: 'No duplicates detected',
  },
  'import.noData': {
    zh: '暂无待导入数据',
    en: 'No data to import',
  },
  'import.selectedPrefix': {
    zh: '已选择',
    en: 'Selected ',
  },
  'import.selectedSuffix': {
    zh: '项',
    en: ' items',
  },
  'import.duplicateWarnPrefix': {
    zh: '⚠ ',
    en: '⚠ ',
  },
  'import.duplicateWarnSuffix': {
    zh: '项疑似重复',
    en: ' potential duplicates',
  },
  'import.processing': {
    zh: '处理中...',
    en: 'Processing...',
  },
  'import.confirmPrefix': {
    zh: '确认导入 (',
    en: 'Confirm Import (',
  },
  'import.confirmSuffix': {
    zh: ')',
    en: ')',
  },
  'import.pendingPrefix': {
    zh: '待处理 (',
    en: 'Pending (',
  },
  'import.pendingSuffix': {
    zh: ')',
    en: ')',
  },
  'import.createAndLink': {
    zh: '创建卡片并关联',
    en: 'Create Card & Link',
  },
  'import.statsTitle': {
    zh: '导入统计',
    en: 'Import Statistics',
  },
  'import.statsPending': {
    zh: '待处理',
    en: 'Pending',
  },
  'import.statsDuplicates': {
    zh: '疑似重复',
    en: 'Duplicates',
  },
  'import.statsCreated': {
    zh: '已创建卡片',
    en: 'Cards Created',
  },
  'import.statsTotal': {
    zh: '总计导入',
    en: 'Total Imported',
  },
  'import.processed': {
    zh: '已处理',
    en: 'Processed',
  },
  'import.guideTitle': {
    zh: '导入指南',
    en: 'Import Guide',
  },
  'import.guideStep1': {
    zh: '导出浏览器书签为 HTML 文件或复制标注文本',
    en: 'Export browser bookmarks as HTML or copy annotation text',
  },
  'import.guideStep2': {
    zh: '上传书签文件或粘贴标注内容',
    en: 'Upload bookmark file or paste annotation content',
  },
  'import.guideStep3': {
    zh: '系统自动检测与现有卡片的重复情况',
    en: 'System auto-detects duplicates with existing cards',
  },
  'import.guideStep4': {
    zh: '逐条勾选并选择「新建 / 覆盖 / 跳过」',
    en: 'Select each item and choose Create / Overwrite / Skip',
  },
  'import.guideStep5': {
    zh: '确认后批量导入并自动建立关联',
    en: 'Confirm to batch import and auto-create links',
  },
  'import.similarityTitle': {
    zh: '相似度说明',
    en: 'Similarity Guide',
  },
  'import.highDup': {
    zh: '高重复',
    en: 'High',
  },
  'import.highDupDesc': {
    zh: '(≥85%) - 极可能为同一内容',
    en: '(≥85%) - Very likely identical',
  },
  'import.mediumDup': {
    zh: '中重复',
    en: 'Medium',
  },
  'import.mediumDupDesc': {
    zh: '(70%-85%) - 建议覆盖合并',
    en: '(70%-85%) - Recommend overwrite & merge',
  },
  'import.lowDup': {
    zh: '低重复',
    en: 'Low',
  },
  'import.lowDupDesc': {
    zh: '(60%-70%) - 可能相关但不同',
    en: '(60%-70%) - Possibly related but different',
  },

  'export.title': {
    zh: '数据导出',
    en: 'Export',
  },
  'export.subtitle': {
    zh: '将你的知识卡片和关联关系导出为本地文件，方便备份或迁移到其他工具',
    en: 'Export knowledge cards and links as local files for backup or migration',
  },
  'export.jsonTab': {
    zh: 'JSON 格式',
    en: 'JSON Format',
  },
  'export.mdTab': {
    zh: 'Markdown 格式',
    en: 'Markdown Format',
  },
  'export.copyClipboard': {
    zh: '复制到剪贴板',
    en: 'Copy to Clipboard',
  },
  'export.downloadJson': {
    zh: '下载 JSON 文件',
    en: 'Download JSON',
  },
  'export.downloadMd': {
    zh: '下载 Markdown 文件',
    en: 'Download Markdown',
  },
  'export.contentTitle': {
    zh: '导出内容说明',
    en: 'Export Contents',
  },
  'export.cardBodyTitle': {
    zh: '卡片正文',
    en: 'Card Content',
  },
  'export.cardBodyDesc': {
    zh: '包含卡片的标题和完整内容',
    en: 'Includes card title and full content',
  },
  'export.tagInfoTitle': {
    zh: '标签信息',
    en: 'Tags',
  },
  'export.tagInfoDesc': {
    zh: '卡片的所有分类标签',
    en: 'All category tags for the card',
  },
  'export.timeInfoTitle': {
    zh: '时间信息',
    en: 'Timestamps',
  },
  'export.timeInfoDesc': {
    zh: '创建时间和最后更新时间',
    en: 'Creation time and last update time',
  },
  'export.bidirectionalLinksTitle': {
    zh: '双向链接',
    en: 'Bidirectional Links',
  },
  'export.bidirectionalLinksDesc': {
    zh: '该卡片与其他卡片的出链和入链关系',
    en: 'Outgoing and incoming link relationships',
  },
  'export.statsTitle': {
    zh: '导出统计',
    en: 'Export Statistics',
  },
  'export.statsCardCount': {
    zh: '卡片数量',
    en: 'Card Count',
  },
  'export.statsLinkCount': {
    zh: '链接数量',
    en: 'Link Count',
  },
  'export.statsJsonSize': {
    zh: 'JSON 大小',
    en: 'JSON Size',
  },
  'export.statsMdSize': {
    zh: 'Markdown 大小',
    en: 'Markdown Size',
  },
  'export.formatCompare': {
    zh: '格式对比',
    en: 'Format Comparison',
  },
  'export.jsonDesc': {
    zh: '适合程序处理、数据迁移和备份，包含完整的结构化数据',
    en: 'Ideal for processing, migration and backup with full structured data',
  },
  'export.mdDesc': {
    zh: '适合人类阅读，可直接导入支持 Markdown 的笔记工具',
    en: 'Human-readable, importable to Markdown note-taking tools',
  },
  'export.tipsTitle': {
    zh: '导出提示',
    en: 'Tips',
  },
  'export.tip1': {
    zh: '建议定期导出备份，防止数据丢失',
    en: 'Regular export is recommended to prevent data loss',
  },
  'export.tip2': {
    zh: 'JSON 文件可用于后续导入恢复',
    en: 'JSON files can be imported for recovery',
  },
  'export.tip3': {
    zh: 'Markdown 兼容 Obsidian、Logseq 等工具',
    en: 'Markdown is compatible with Obsidian, Logseq, etc.',
  },

  'trajectory.title': {
    zh: '阅读轨迹',
    en: 'Reading Path',
  },
  'trajectory.subtitle': {
    zh: '记录和可视化你的知识探索路径',
    en: 'Record and visualize your knowledge exploration path',
  },
  'trajectory.7days': {
    zh: '7天',
    en: '7 Days',
  },
  'trajectory.30days': {
    zh: '30天',
    en: '30 Days',
  },
  'trajectory.90days': {
    zh: '90天',
    en: '90 Days',
  },
  'trajectory.totalReadingTime': {
    zh: '总阅读时长 (分钟)',
    en: 'Total Reading (min)',
  },
  'trajectory.currentStreak': {
    zh: '连续打卡 (天)',
    en: 'Current Streak',
  },
  'trajectory.activeDays': {
    zh: '活跃天数',
    en: 'Active Days',
  },
  'trajectory.visitedCards': {
    zh: '访问卡片数',
    en: 'Cards Visited',
  },
  'trajectory.heatmap': {
    zh: '打卡热力图',
    en: 'Activity Heatmap',
  },
  'trajectory.weekMon': {
    zh: '一',
    en: 'M',
  },
  'trajectory.weekWed': {
    zh: '三',
    en: 'W',
  },
  'trajectory.weekFri': {
    zh: '五',
    en: 'F',
  },
  'trajectory.weekSun': {
    zh: '日',
    en: 'S',
  },
  'trajectory.monthSuffix': {
    zh: '月',
    en: '',
  },
  'trajectory.notCheckedIn': {
    zh: '未打卡',
    en: 'Inactive',
  },
  'trajectory.checkedIn': {
    zh: '已打卡',
    en: 'Active',
  },
  'trajectory.deepLearning': {
    zh: '深度学习',
    en: 'Deep Learning',
  },
  'trajectory.checkInRate': {
    zh: '打卡率:',
    en: 'Check-in Rate: ',
  },
  'trajectory.dailyReadingTime': {
    zh: '每日阅读时长',
    en: 'Daily Reading Time',
  },
  'trajectory.mostVisited': {
    zh: '最常访问',
    en: 'Most Visited',
  },
  'trajectory.visitCountSuffix': {
    zh: '次',
    en: ' visits',
  },
  'trajectory.noRecords': {
    zh: '暂无阅读记录',
    en: 'No reading records',
  },
  'trajectory.timeline': {
    zh: '阅读时间线',
    en: 'Reading Timeline',
  },
  'trajectory.fromCardPrefix': {
    zh: '从「',
    en: 'From "',
  },
  'trajectory.fromCardSuffix': {
    zh: '」跳转而来',
    en: '" navigated here',
  },
  'trajectory.unknownCard': {
    zh: '未知卡片',
    en: 'Unknown Card',
  },
  'trajectory.secondUnit': {
    zh: '秒',
    en: 's',
  },
  'trajectory.emptyTimeline': {
    zh: '开始浏览知识卡片，你的阅读轨迹将在这里呈现',
    en: 'Start exploring cards, your reading path will appear here',
  },

  'review.score0Label': {
    zh: '完全忘记',
    en: 'Forgot',
  },
  'review.score0Desc': {
    zh: '完全无法回忆',
    en: 'Cannot recall at all',
  },
  'review.score1Label': {
    zh: '几乎忘记',
    en: 'Almost Forgot',
  },
  'review.score1Desc': {
    zh: '几乎无法回忆',
    en: 'Barely able to recall',
  },
  'review.score2Label': {
    zh: '困难回忆',
    en: 'Difficult',
  },
  'review.score2Desc': {
    zh: '回忆有困难',
    en: 'Struggled to recall',
  },
  'review.score3Label': {
    zh: '勉强回忆',
    en: 'Barely',
  },
  'review.score3Desc': {
    zh: '勉强能够回忆',
    en: 'Barely recalled',
  },
  'review.score4Label': {
    zh: '轻松回忆',
    en: 'Easy',
  },
  'review.score4Desc': {
    zh: '轻松回忆',
    en: 'Recalled easily',
  },
  'review.score5Label': {
    zh: '完美回忆',
    en: 'Perfect',
  },
  'review.score5Desc': {
    zh: '完美回忆',
    en: 'Perfect recall',
  },
  'review.highPriority': {
    zh: '高优先',
    en: 'High',
  },
  'review.mediumPriority': {
    zh: '中优先',
    en: 'Medium',
  },
  'review.lowPriority': {
    zh: '低优先',
    en: 'Low',
  },
  'review.completedTitle': {
    zh: '太棒了！',
    en: 'Excellent!',
  },
  'review.completedSubtitle': {
    zh: '今日复习已完成',
    en: 'Today\'s review completed',
  },
  'review.completedDescPrefix': {
    zh: '你已经完成了',
    en: 'You\'ve completed ',
  },
  'review.completedDescSuffix': {
    zh: '张卡片的复习',
    en: ' card reviews',
  },
  'review.statsTitle': {
    zh: '学习统计',
    en: 'Learning Stats',
  },
  'review.statsTotalCards': {
    zh: '总卡片数',
    en: 'Total Cards',
  },
  'review.statsKnowledgeLinks': {
    zh: '知识关联',
    en: 'Knowledge Links',
  },
  'review.title': {
    zh: '复习中心',
    en: 'Review Center',
  },
  'review.subtitle': {
    zh: '基于间隔重复算法，按优先级智能排序复习内容',
    en: 'Spaced repetition algorithm, priority-sorted review content',
  },
  'review.todayProgress': {
    zh: '今日进度',
    en: 'Today\'s Progress',
  },
  'review.toReview': {
    zh: '待复习',
    en: 'To Review',
  },
  'review.completed': {
    zh: '已完成',
    en: 'Completed',
  },
  'review.priority': {
    zh: '高/中/低优先',
    en: 'H/M/L Priority',
  },
  'review.intervalLabel': {
    zh: '复习间隔(天)',
    en: 'Interval (days)',
  },
  'review.lastReviewPrefix': {
    zh: '上次复习: ',
    en: 'Last Review: ',
  },
  'review.customDatePrefix': {
    zh: '自定义: ',
    en: 'Custom: ',
  },
  'review.relatedLinks': {
    zh: '相关链接',
    en: 'Related Links',
  },
  'review.recallHintTitle': {
    zh: '回忆这张卡片的内容...',
    en: 'Recall the content of this card...',
  },
  'review.recallHintDesc': {
    zh: '点击下方按钮查看答案，然后评估你的记忆程度',
    en: 'Click below to reveal the answer, then assess your memory',
  },
  'review.showAnswer': {
    zh: '显示答案',
    en: 'Show Answer',
  },
  'review.howWellRemembered': {
    zh: '你对这张卡片的记忆程度如何？',
    en: 'How well did you remember?',
  },
  'review.reviewLater': {
    zh: '稍后复习',
    en: 'Later',
  },
  'review.sm2Title': {
    zh: 'SM-2 算法说明',
    en: 'SM-2 Algorithm',
  },
  'review.sm2Score02Title': {
    zh: '评分 0-2',
    en: 'Score 0-2',
  },
  'review.sm2Score02Desc': {
    zh: '记忆困难，重置复习间隔为1天，重新开始学习',
    en: 'Difficult recall, reset interval to 1 day, restart learning',
  },
  'review.sm2Score34Title': {
    zh: '评分 3-4',
    en: 'Score 3-4',
  },
  'review.sm2Score34Desc': {
    zh: '记忆一般，按正常间隔递增，略微降低难度系数',
    en: 'Average recall, normal interval increment, slightly lower difficulty',
  },
  'review.sm2Score5Title': {
    zh: '评分 5',
    en: 'Score 5',
  },
  'review.sm2Score5Desc': {
    zh: '记忆完美，延长复习间隔，提高难度系数',
    en: 'Perfect recall, extended interval, higher difficulty factor',
  },

  'tags.title': {
    zh: '标签管理',
    en: 'Tags',
  },
  'tags.subtitlePrefix': {
    zh: '共',
    en: 'Total ',
  },
  'tags.subtitleMid': {
    zh: '个标签，关联',
    en: ' tags, linked to ',
  },
  'tags.subtitleSuffix': {
    zh: '张卡片',
    en: ' cards',
  },
  'tags.selectedPrefix': {
    zh: '已选择',
    en: 'Selected ',
  },
  'tags.selectedSuffix': {
    zh: '个标签',
    en: ' tags',
  },
  'tags.mergeTags': {
    zh: '合并标签',
    en: 'Merge Tags',
  },
  'tags.cancelSelection': {
    zh: '取消选择',
    en: 'Cancel Selection',
  },
  'tags.statsTotal': {
    zh: '标签总数',
    en: 'Total Tags',
  },
  'tags.statsLinked': {
    zh: '关联卡片',
    en: 'Linked Cards',
  },
  'tags.statsSelected': {
    zh: '已选择',
    en: 'Selected',
  },
  'tags.searchPlaceholder': {
    zh: '搜索标签...',
    en: 'Search tags...',
  },
  'tags.sortByCount': {
    zh: '按数量排序',
    en: 'Sort by Count',
  },
  'tags.sortByName': {
    zh: '按名称排序',
    en: 'Sort by Name',
  },
  'tags.sortByRecent': {
    zh: '最近使用',
    en: 'Recent Used',
  },
  'tags.deselectAll': {
    zh: '取消全选',
    en: 'Deselect All',
  },
  'tags.selectAll': {
    zh: '全选',
    en: 'Select All',
  },
  'tags.cardCountSuffix': {
    zh: '张卡片',
    en: ' cards',
  },
  'tags.recentUsedPrefix': {
    zh: '最近使用: ',
    en: 'Recent: ',
  },
  'tags.viewCardsTitle': {
    zh: '查看相关卡片',
    en: 'View Related Cards',
  },
  'tags.renameTitle': {
    zh: '重命名',
    en: 'Rename',
  },
  'tags.deleteTitle': {
    zh: '删除标签',
    en: 'Delete Tag',
  },
  'tags.expandCardsTitle': {
    zh: '展开卡片',
    en: 'Expand Cards',
  },
  'tags.collapseTitle': {
    zh: '收起',
    en: 'Collapse',
  },
  'tags.relatedCardsPrefix': {
    zh: '相关卡片 (',
    en: 'Related Cards (',
  },
  'tags.relatedCardsSuffix': {
    zh: ')',
    en: ')',
  },
  'tags.viewAllPrefix': {
    zh: '查看全部',
    en: 'View all ',
  },
  'tags.viewAllSuffix': {
    zh: '张卡片',
    en: ' cards',
  },
  'tags.deleteConfirmPrefix': {
    zh: '确定要删除标签「',
    en: 'Delete tag "',
  },
  'tags.deleteConfirmSuffix': {
    zh: '」吗？',
    en: '"?',
  },
  'tags.deleteConfirmDescPrefix': {
    zh: '此操作将从',
    en: 'This will remove the tag from ',
  },
  'tags.deleteConfirmDescMid': {
    zh: '张卡片中移除该标签，不会删除卡片本身。',
    en: ' cards. Cards themselves will not be deleted.',
  },
  'tags.confirmDelete': {
    zh: '确认删除',
    en: 'Confirm Delete',
  },
  'tags.cancel': {
    zh: '取消',
    en: 'Cancel',
  },
  'tags.emptyTitle': {
    zh: '没有找到标签',
    en: 'No tags found',
  },
  'tags.emptyDescSearch': {
    zh: '尝试调整搜索条件',
    en: 'Try adjusting search criteria',
  },
  'tags.emptyDescNoSearch': {
    zh: '在卡片中添加标签后会在这里显示',
    en: 'Tags added to cards will appear here',
  },
  'tags.mergeModalTitle': {
    zh: '合并标签',
    en: 'Merge Tags',
  },
  'tags.mergeModalDescPrefix': {
    zh: '将',
    en: 'Merge ',
  },
  'tags.mergeModalDescSuffix': {
    zh: '个标签合并为一个新标签',
    en: ' tags into one new tag',
  },
  'tags.tagsToMerge': {
    zh: '要合并的标签：',
    en: 'Tags to merge:',
  },
  'tags.targetTagName': {
    zh: '目标标签名称',
    en: 'Target Tag Name',
  },
  'tags.targetTagPlaceholder': {
    zh: '输入新的标签名称...',
    en: 'Enter new tag name...',
  },
  'tags.mergeNote': {
    zh: '所有选中标签将被替换为这个新标签',
    en: 'All selected tags will be replaced by this new tag',
  },
  'tags.mergeCancel': {
    zh: '取消',
    en: 'Cancel',
  },
  'tags.confirmMerge': {
    zh: '确认合并',
    en: 'Confirm Merge',
  },

  'template.presetIcons': {
    zh: '读书、会议、学习、灵感、清单、研究、工作、目标、数据、思维',
    en: 'Book, Meeting, Study, Idea, List, Research, Work, Goal, Data, Mind',
  },
  'template.preset1Name': {
    zh: '读书笔记',
    en: 'Reading Notes',
  },
  'template.preset1Desc': {
    zh: '记录书籍阅读的核心观点和个人感悟',
    en: 'Record key insights and personal reflections from reading',
  },
  'template.preset1TitleFormat': {
    zh: '《书名》读书笔记',
    en: '《Book Title》 Reading Notes',
  },
  'template.preset2Name': {
    zh: '会议纪要',
    en: 'Meeting Minutes',
  },
  'template.preset2Desc': {
    zh: '记录会议讨论内容和决策事项',
    en: 'Record meeting discussions and decisions',
  },
  'template.preset2TitleFormat': {
    zh: '会议纪要 - 主题',
    en: 'Meeting Minutes - Topic',
  },
  'template.preset3Name': {
    zh: '学习摘要',
    en: 'Study Summary',
  },
  'template.preset3Desc': {
    zh: '整理学习内容的关键知识点',
    en: 'Organize key knowledge points from study',
  },
  'template.preset3TitleFormat': {
    zh: '学习摘要 - 主题',
    en: 'Study Summary - Topic',
  },
  'template.title': {
    zh: '卡片模板',
    en: 'Card Templates',
  },
  'template.subtitle': {
    zh: '创建可复用的卡片模板，快速生成结构化内容',
    en: 'Create reusable card templates for quick structured content',
  },
  'template.newTemplate': {
    zh: '新建模板',
    en: 'New Template',
  },
  'template.recommendedTitle': {
    zh: '推荐模板',
    en: 'Recommended Templates',
  },
  'template.recommendedDesc': {
    zh: '快速添加预设模板，也可以自定义修改',
    en: 'Quickly add presets, or customize as you like',
  },
  'template.clickToAdd': {
    zh: '点击添加',
    en: 'Click to Add',
  },
  'template.noDescription': {
    zh: '暂无描述',
    en: 'No description',
  },
  'template.titleFormat': {
    zh: '标题格式：',
    en: 'Title Format: ',
  },
  'template.bodyOutline': {
    zh: '正文骨架：',
    en: 'Body Outline: ',
  },
  'template.updatedAtPrefix': {
    zh: '更新于',
    en: 'Updated ',
  },
  'template.emptyTitle': {
    zh: '还没有模板',
    en: 'No templates yet',
  },
  'template.emptyDesc': {
    zh: '创建模板来快速生成结构化的知识卡片',
    en: 'Create templates for quick structured knowledge cards',
  },
  'template.createFirstTemplate': {
    zh: '创建第一个模板',
    en: 'Create First Template',
  },
  'template.editTitle': {
    zh: '编辑模板',
    en: 'Edit Template',
  },
  'template.createTitle': {
    zh: '创建模板',
    en: 'Create Template',
  },
  'template.iconLabel': {
    zh: '图标',
    en: 'Icon',
  },
  'template.nameLabel': {
    zh: '模板名称 *',
    en: 'Template Name *',
  },
  'template.namePlaceholder': {
    zh: '例如：读书笔记、会议纪要',
    en: 'e.g. Reading Notes, Meeting Minutes',
  },
  'template.descLabel': {
    zh: '描述',
    en: 'Description',
  },
  'template.descPlaceholder': {
    zh: '简短描述模板用途',
    en: 'Brief description of template purpose',
  },
  'template.titleFormatLabel': {
    zh: '标题格式',
    en: 'Title Format',
  },
  'template.titleFormatPlaceholder': {
    zh: '例如：《书名》读书笔记',
    en: 'e.g. 《Book Title》 Reading Notes',
  },
  'template.titleFormatTip': {
    zh: '新建卡片时会自动填入标题，用户可修改',
    en: 'Auto-filled when creating new cards, editable by user',
  },
  'template.bodyOutlineLabel': {
    zh: '正文骨架',
    en: 'Body Outline',
  },
  'template.bodyOutlinePlaceholder': {
    zh: '输入正文模板，例如：\n\n## 基本信息\n- 日期：\n- 主题：\n\n## 核心内容\n1. \n2. \n\n## 总结',
    en: 'Enter body template, e.g.:\n\n## Basic Info\n- Date:\n- Topic:\n\n## Core Content\n1. \n2. \n\n## Summary',
  },
  'template.bodyOutlineTip': {
    zh: '支持 Markdown 语法，新建卡片时会自动填入正文',
    en: 'Supports Markdown, auto-filled when creating cards',
  },
  'template.defaultTagsLabel': {
    zh: '默认标签',
    en: 'Default Tags',
  },
  'template.addTagPlaceholder': {
    zh: '输入标签后按回车添加',
    en: 'Type and press Enter to add',
  },
  'template.addButton': {
    zh: '添加',
    en: 'Add',
  },
  'template.cancelButton': {
    zh: '取消',
    en: 'Cancel',
  },
  'template.saveButton': {
    zh: '保存修改',
    en: 'Save Changes',
  },
  'template.createButton': {
    zh: '创建模板',
    en: 'Create Template',
  },
  'template.deleteModalTitle': {
    zh: '确认删除',
    en: 'Confirm Delete',
  },
  'template.deleteModalDesc1': {
    zh: '此操作不可撤销',
    en: 'This action cannot be undone',
  },
  'template.deleteModalDesc2': {
    zh: '确定要删除这个模板吗？已使用该模板创建的卡片不受影响。',
    en: 'Delete this template? Cards created with this template are not affected.',
  },
  'template.deleteCancel': {
    zh: '取消',
    en: 'Cancel',
  },
  'template.deleteConfirm': {
    zh: '确认删除',
    en: 'Confirm Delete',
  },

  'favorites.title': {
    zh: '我的收藏',
    en: 'Favorites',
  },
  'favorites.subtitlePrefix': {
    zh: '共收藏',
    en: 'Total ',
  },
  'favorites.subtitleMid': {
    zh: '张卡片，',
    en: ' cards, ',
  },
  'favorites.subtitleSuffix': {
    zh: '个结果',
    en: ' results',
  },
  'favorites.searchPlaceholder': {
    zh: '搜索收藏的卡片...',
    en: 'Search favorite cards...',
  },
  'favorites.sortRecent': {
    zh: '最近更新',
    en: 'Recent Updated',
  },
  'favorites.sortCreated': {
    zh: '创建时间',
    en: 'Created Time',
  },
  'favorites.sortLinks': {
    zh: '关联数量',
    en: 'Link Count',
  },
  'favorites.clearFilter': {
    zh: '清除筛选',
    en: 'Clear Filter',
  },
  'favorites.empty1Title': {
    zh: '还没有收藏的卡片',
    en: 'No favorite cards yet',
  },
  'favorites.empty1Desc': {
    zh: '在浏览卡片时点击星标图标，将重要或常用的卡片添加到收藏夹',
    en: 'Click the star icon while browsing to add important cards to favorites',
  },
  'favorites.browseAll': {
    zh: '浏览所有卡片',
    en: 'Browse All Cards',
  },
  'favorites.empty2Title': {
    zh: '没有找到匹配的收藏卡片',
    en: 'No matching favorite cards found',
  },
  'favorites.empty2Desc': {
    zh: '尝试调整搜索条件或清除筛选',
    en: 'Try adjusting search criteria or clearing filters',
  },
  'favorites.reviewIntervalPrefix': {
    zh: '复习间隔: ',
    en: 'Interval: ',
  },
  'favorites.reviewIntervalSuffix': {
    zh: '天',
    en: ' days',
  },

  'editor.titleRequired': {
    zh: '请输入卡片标题',
    en: 'Please enter a card title',
  },
  'editor.deleteConfirm': {
    zh: '确定要删除这张卡片吗？此操作不可撤销。',
    en: 'Delete this card? This action cannot be undone.',
  },
  'editor.saveFirstHint': {
    zh: '请先保存卡片后再添加关联',
    en: 'Please save the card before adding links',
  },
  'editor.createTitle': {
    zh: '创建新卡片',
    en: 'Create New Card',
  },
  'editor.editTitle': {
    zh: '编辑卡片',
    en: 'Edit Card',
  },
  'editor.bidirectionalHint': {
    zh: '使用 [[卡片标题]] 语法创建双向链接',
    en: 'Use [[Card Title]] syntax for bidirectional links',
  },
  'editor.useTemplate': {
    zh: '使用模板',
    en: 'Use Template',
  },
  'editor.addFavoriteTitle': {
    zh: '添加收藏',
    en: 'Add to Favorites',
  },
  'editor.removeFavoriteTitle': {
    zh: '取消收藏',
    en: 'Remove from Favorites',
  },
  'editor.favorited': {
    zh: '已收藏',
    en: 'Favorited',
  },
  'editor.favorite': {
    zh: '收藏',
    en: 'Favorite',
  },
  'editor.deleteButton': {
    zh: '删除',
    en: 'Delete',
  },
  'editor.saving': {
    zh: '保存中...',
    en: 'Saving...',
  },
  'editor.saveButton': {
    zh: '保存',
    en: 'Save',
  },
  'editor.titlePlaceholder': {
    zh: '卡片标题...',
    en: 'Card title...',
  },
  'editor.noSpace': {
    zh: '未分配空间',
    en: 'No Space',
  },
  'editor.addTagPlaceholder': {
    zh: '添加标签...',
    en: 'Add tag...',
  },
  'editor.smartSuggest': {
    zh: '智能建议',
    en: 'Smart Suggest',
  },
  'editor.editModePlaceholder': {
    zh: '开始编写内容...\n\n使用 [[卡片标题]] 创建双向链接\n支持 Markdown 语法\n快捷键: Ctrl+B 加粗, Ctrl+I 斜体',
    en: 'Start writing...\n\nUse [[Card Title]] for bidirectional links\nMarkdown supported\nShortcuts: Ctrl+B Bold, Ctrl+I Italic',
  },
  'editor.previewNoContent': {
    zh: '*暂无内容*',
    en: '*No content*',
  },
  'editor.bidirectionalLinks': {
    zh: '双向链接',
    en: 'Bidirectional Links',
  },
  'editor.forwardLinks': {
    zh: '正向链接',
    en: 'Outgoing Links',
  },
  'editor.noForwardLinks': {
    zh: '暂无正向链接',
    en: 'No outgoing links',
  },
  'editor.backwardLinks': {
    zh: '反向链接',
    en: 'Incoming Links',
  },
  'editor.noBackwardLinks': {
    zh: '暂无反向链接',
    en: 'No incoming links',
  },
  'editor.relatedCards': {
    zh: '可能相关的卡片',
    en: 'Related Cards',
  },
  'editor.insertQuote': {
    zh: '插入引用',
    en: 'Insert Quote',
  },
  'editor.linkSuccess': {
    zh: '✅ 关联成功',
    en: '✅ Linked successfully',
  },
  'editor.createLink': {
    zh: '🔗 建立关联',
    en: '🔗 Create Link',
  },
  'editor.saveThenLink': {
    zh: '保存后关联',
    en: 'Link after Save',
  },
  'editor.analyzingContent': {
    zh: '正在分析内容...',
    en: 'Analyzing content...',
  },
  'editor.enterContentHint': {
    zh: '输入标题和正文后将自动推荐相关卡片',
    en: 'Enter title and content to get related card suggestions',
  },
  'editor.reviewSettings': {
    zh: '复习设置',
    en: 'Review Settings',
  },
  'editor.reviewPriority': {
    zh: '复习优先级',
    en: 'Review Priority',
  },
  'editor.priorityHigh': {
    zh: '高',
    en: 'High',
  },
  'editor.priorityMedium': {
    zh: '中',
    en: 'Medium',
  },
  'editor.priorityLow': {
    zh: '低',
    en: 'Low',
  },
  'editor.priorityTip': {
    zh: '高优先级卡片在复习队列中排在前面',
    en: 'High priority cards are placed first in the review queue',
  },
  'editor.customReviewDate': {
    zh: '自定义下次复习日期',
    en: 'Custom Next Review Date',
  },
  'editor.clearCustomDate': {
    zh: '清除自定义日期，恢复系统排期',
    en: 'Clear custom date, revert to system schedule',
  },
  'editor.customDateTip': {
    zh: '设置后，卡片将在指定日期出现在复习队列中',
    en: 'When set, the card will appear in the review queue on the specified date',
  },
  'editor.reviewStats': {
    zh: '复习统计',
    en: 'Review Stats',
  },
  'editor.reviewCount': {
    zh: '复习次数',
    en: 'Review Count',
  },
  'editor.reviewCountUnit': {
    zh: '次',
    en: '',
  },
  'editor.currentInterval': {
    zh: '当前间隔',
    en: 'Current Interval',
  },
  'editor.currentIntervalUnit': {
    zh: '天',
    en: ' days',
  },
  'editor.difficultyFactor': {
    zh: '难度系数',
    en: 'Difficulty Factor',
  },
  'editor.lastReview': {
    zh: '上次复习',
    en: 'Last Review',
  },
  'editor.neverReviewed': {
    zh: '从未复习',
    en: 'Never Reviewed',
  },

  'common.cancel': {
    zh: '取消',
    en: 'Cancel',
  },
  'common.confirm': {
    zh: '确认',
    en: 'Confirm',
  },
  'common.delete': {
    zh: '删除',
    en: 'Delete',
  },
  'common.save': {
    zh: '保存',
    en: 'Save',
  },
  'common.edit': {
    zh: '编辑',
    en: 'Edit',
  },
  'common.create': {
    zh: '创建',
    en: 'Create',
  },

  'discovery.title': {
    zh: '每日发现',
    en: 'Daily Discovery',
  },
  'discovery.subtitle': {
    zh: '温故知新，探索已有知识',
    en: 'Review old knowledge, discover new insights',
  },
  'discovery.noCards': {
    zh: '还没有知识卡片，快去创建第一张吧！',
    en: 'No cards yet, create your first one!',
  },
  'discovery.shuffle': {
    zh: '换一张',
    en: 'Shuffle',
  },
  'discovery.lastReviewPrefix': {
    zh: '· 上次复习 ',
    en: '· Last review ',
  },
  'discovery.noContent': {
    zh: '暂无内容',
    en: 'No content',
  },
  'discovery.linkedCardsPrefix': {
    zh: '关联卡片 (',
    en: 'Linked Cards (',
  },
  'discovery.linkedCardsSuffix': {
    zh: ')',
    en: ')',
  },
  'discovery.moreSuffix': {
    zh: ' 更多',
    en: ' more',
  },
  'discovery.viewDetail': {
    zh: '查看详情',
    en: 'View Details',
  },
  'discovery.intervalRepetition': {
    zh: '间隔重复',
    en: 'Spaced Repetition',
  },

  'achievement.7days': {
    zh: '连续 7 天每天至少阅读或复习一张卡片',
    en: 'Read or review at least one card per day for 7 consecutive days',
  },
  'achievement.30days': {
    zh: '连续 30 天每天至少阅读或复习一张卡片',
    en: 'Read or review at least one card per day for 30 consecutive days',
  },
  'achievement.100days': {
    zh: '连续 100 天每天至少阅读或复习一张卡片',
    en: 'Read or review at least one card per day for 100 consecutive days',
  },
  'achievement.streak7Name': {
    zh: '坚持一周',
    en: 'One Week Streak',
  },
  'achievement.streak30Name': {
    zh: '月度达人',
    en: 'Monthly Master',
  },
  'achievement.streak100Name': {
    zh: '百日修行',
    en: '100-Day Master',
  },
  'achievement.streak7Desc': {
    zh: '连续 7 天每天至少阅读或复习一张卡片',
    en: 'Read or review at least one card per day for 7 consecutive days',
  },
  'achievement.streak30Desc': {
    zh: '连续 30 天每天至少阅读或复习一张卡片',
    en: 'Read or review at least one card per day for 30 consecutive days',
  },
  'achievement.streak100Desc': {
    zh: '连续 100 天每天至少阅读或复习一张卡片',
    en: 'Read or review at least one card per day for 100 consecutive days',
  },

  'relation.unknownCard': {
    zh: '未知卡片',
    en: 'Unknown Card',
  },
  'relation.outgoing': {
    zh: '正向',
    en: 'Outgoing',
  },
  'relation.incoming': {
    zh: '反向',
    en: 'Incoming',
  },
  'relation.secondOrder': {
    zh: '二阶',
    en: '2nd Order',
  },
  'relation.path': {
    zh: '路径: ',
    en: 'Path: ',
  },
  'relation.panelTitle': {
    zh: '关系面板',
    en: 'Relation Panel',
  },
  'relation.noRelations': {
    zh: '暂无关联关系',
    en: 'No relations yet',
  },
  'relation.bidiHint': {
    zh: '使用 [[卡片标题]] 语法创建双向链接',
    en: 'Use [[Card Title]] syntax for bidirectional links',
  },
  'relation.totalRelationsPrefix': {
    zh: '共 ',
    en: 'Total ',
  },
  'relation.totalRelationsSuffix': {
    zh: ' 个关联',
    en: ' relations',
  },
  'relation.treeView': {
    zh: '树状视图',
    en: 'Tree View',
  },
  'relation.listView': {
    zh: '列表视图',
    en: 'List View',
  },
  'relation.currentCard': {
    zh: '当前卡片',
    en: 'Current Card',
  },
  'relation.forwardLinks': {
    zh: '正向链接',
    en: 'Outgoing Links',
  },
  'relation.backwardLinks': {
    zh: '反向链接',
    en: 'Incoming Links',
  },
  'relation.secondOrderLinks': {
    zh: '二阶关联',
    en: '2nd Order Links',
  },
  'relation.outgoingCards': {
    zh: '引用的卡片 (',
    en: 'Outgoing Cards (',
  },
  'relation.incomingCards': {
    zh: '被引用的卡片 (',
    en: 'Incoming Cards (',
  },
  'relation.secondOrderCards': {
    zh: '二阶间接关联 (',
    en: '2nd Order Links (',
  },
  'relation.secondOrderHint': {
    zh: '点击一阶关联节点的箭头展开/收起二阶关联',
    en: 'Click arrow on 1st-order nodes to expand/collapse 2nd-order links',
  },

  'toolbar.linkPrompt': {
    zh: '请输入链接地址:',
    en: 'Enter link URL:',
  },
  'toolbar.bold': {
    zh: '加粗 (Ctrl+B)',
    en: 'Bold (Ctrl+B)',
  },
  'toolbar.italic': {
    zh: '斜体 (Ctrl+I)',
    en: 'Italic (Ctrl+I)',
  },
  'toolbar.h1': {
    zh: '一级标题',
    en: 'Heading 1',
  },
  'toolbar.h2': {
    zh: '二级标题',
    en: 'Heading 2',
  },
  'toolbar.h3': {
    zh: '三级标题',
    en: 'Heading 3',
  },
  'toolbar.ul': {
    zh: '无序列表',
    en: 'Bullet List',
  },
  'toolbar.ol': {
    zh: '有序列表',
    en: 'Numbered List',
  },
  'toolbar.quote': {
    zh: '引用',
    en: 'Quote',
  },
  'toolbar.link': {
    zh: '链接',
    en: 'Link',
  },
  'toolbar.inlineCode': {
    zh: '行内代码',
    en: 'Inline Code',
  },
  'toolbar.codeBlock': {
    zh: '代码块',
    en: 'Code Block',
  },
  'toolbar.editOnly': {
    zh: '仅编辑',
    en: 'Edit Only',
  },
  'toolbar.edit': {
    zh: '编辑',
    en: 'Edit',
  },
  'toolbar.splitView': {
    zh: '左右分栏',
    en: 'Split View',
  },
  'toolbar.split': {
    zh: '分栏',
    en: 'Split',
  },
  'toolbar.previewOnly': {
    zh: '仅预览',
    en: 'Preview Only',
  },
  'toolbar.preview': {
    zh: '预览',
    en: 'Preview',
  },

  'templateSelector.title': {
    zh: '选择卡片模板',
    en: 'Select Template',
  },
  'templateSelector.description': {
    zh: '从模板快速填充标题、正文结构和标签，也可以创建后修改',
    en: 'Quick fill title, structure and tags from templates, editable after creation',
  },
  'templateSelector.searchPlaceholder': {
    zh: '搜索模板...',
    en: 'Search templates...',
  },
  'templateSelector.noDescription': {
    zh: '暂无描述',
    en: 'No description',
  },
  'templateSelector.titleLabel': {
    zh: '标题：',
    en: 'Title: ',
  },
  'templateSelector.bodyPreview': {
    zh: '正文预览：',
    en: 'Body Preview: ',
  },
  'templateSelector.noMatch': {
    zh: '没有匹配的模板',
    en: 'No matching templates',
  },
  'templateSelector.noTemplates': {
    zh: '还没有创建模板',
    en: 'No templates created yet',
  },
  'templateSelector.goCreate': {
    zh: '前往「模板管理」页面创建模板',
    en: 'Go to Templates page to create templates',
  },
  'templateSelector.blankCard': {
    zh: '空白卡片',
    en: 'Blank Card',
  },
  'templateSelector.useTemplate': {
    zh: '使用模板',
    en: 'Use Template',
  },

  'report.reviewCompletion': {
    zh: '复习完成率',
    en: 'Review Completion',
  },
  'report.newCards': {
    zh: '新增卡片',
    en: 'New Cards',
  },
  'report.newCardsUnit': {
    zh: ' 张',
    en: '',
  },
  'report.newLinks': {
    zh: '新增关联',
    en: 'New Links',
  },
  'report.newLinksUnit': {
    zh: ' 条',
    en: '',
  },
  'report.totalReading': {
    zh: '总阅读时长',
    en: 'Total Reading',
  },
  'report.currentStreak': {
    zh: '连续打卡',
    en: 'Current Streak',
  },
  'report.currentStreakUnit': {
    zh: ' 天',
    en: 'd',
  },
  'report.title': {
    zh: '学习周报',
    en: 'Weekly Report',
  },
  'report.preview': {
    zh: '预览',
    en: 'Preview',
  },
  'report.copied': {
    zh: '已复制',
    en: 'Copied',
  },
  'report.copyMarkdown': {
    zh: '复制 Markdown',
    en: 'Copy Markdown',
  },
  'report.exportMd': {
    zh: '导出 .md 文件',
    en: 'Export .md File',
  },
  'report.activityAndReview': {
    zh: '活跃与复习',
    en: 'Activity & Review',
  },
  'report.activeDays': {
    zh: '活跃天数 / 7',
    en: 'Active Days / 7',
  },
  'report.reviewCount': {
    zh: '复习次数',
    en: 'Review Count',
  },
  'report.reviewedCards': {
    zh: '复习卡片数',
    en: 'Cards Reviewed',
  },
  'report.topVisited': {
    zh: '最常访问卡片 Top ',
    en: 'Top Visited Cards ',
  },
  'report.visitCountSuffix': {
    zh: '次',
    en: ' visits',
  },
  'report.noRecords': {
    zh: '暂无阅读记录',
    en: 'No reading records',
  },
  'report.hourUnit': {
    zh: '小时',
    en: 'h',
  },
  'report.minuteUnit': {
    zh: '分钟',
    en: 'm',
  },
  'report.monthUnit': {
    zh: '月',
    en: '/',
  },
  'report.dayUnit': {
    zh: '日',
    en: '',
  },
  'report.statsPeriod': {
    zh: '统计周期',
    en: 'Period',
  },
  'report.overview': {
    zh: '总览',
    en: 'Overview',
  },
  'report.metric': {
    zh: '指标',
    en: 'Metric',
  },
  'report.value': {
    zh: '数值',
    en: 'Value',
  },
  'report.activeDaysLabel': {
    zh: '活跃天数',
    en: 'Active Days',
  },
  'report.weekDaysUnit': {
    zh: ' / 7 天',
    en: ' / 7d',
  },
  'report.rank': {
    zh: '排名',
    en: 'Rank',
  },
  'report.card': {
    zh: '卡片',
    en: 'Card',
  },
  'report.visitCount': {
    zh: '访问次数',
    en: 'Visits',
  },
  'report.autoGenerated': {
    zh: '由知识库应用自动生成',
    en: 'Auto-generated by Knowledge Base',
  },
  'report.fileNamePrefix': {
    zh: '学习周报_',
    en: 'WeeklyReport_',
  },

  'search.placeholder': {
    zh: '搜索卡片... 多关键词用空格分隔',
    en: 'Search cards... Separate keywords with space',
  },
  'search.clear': {
    zh: '清除',
    en: 'Clear',
  },
  'search.noResults': {
    zh: '未找到匹配的卡片',
    en: 'No matching cards found',
  },
  'search.noResultsHint': {
    zh: '尝试不同的关键词或调整标签筛选',
    en: 'Try different keywords or adjust tag filters',
  },
  'search.startTyping': {
    zh: '输入关键词开始搜索',
    en: 'Start typing to search',
  },
  'search.startTypingHint': {
    zh: '支持多关键词组合搜索，空格分隔',
    en: 'Supports multi-keyword search, separated by space',
  },
  'search.navigation': {
    zh: '导航',
    en: 'Navigation',
  },
  'search.open': {
    zh: '打开',
    en: 'Open',
  },
  'search.close': {
    zh: '关闭',
    en: 'Close',
  },
  'search.resultCountSuffix': {
    zh: ' 个结果',
    en: ' results',
  },

  'version.confirmRollback': {
    zh: '确定要回退到此版本吗？当前内容将保存为新版本。',
    en: 'Revert to this version? Current content will be saved as a new version.',
  },
  'version.title': {
    zh: '版本历史',
    en: 'Version History',
  },
  'version.totalPrefix': {
    zh: '共 ',
    en: 'Total ',
  },
  'version.totalSuffix': {
    zh: ' 个版本（最多保留 20 个）',
    en: ' versions (max 20 kept)',
  },
  'version.noVersions': {
    zh: '暂无历史版本',
    en: 'No previous versions',
  },
  'version.noVersionsHint': {
    zh: '保存卡片后将自动创建版本快照',
    en: 'Snapshots created automatically after saving',
  },
  'version.compareTo': {
    zh: ' 对比: ',
    en: ' Compare: ',
  },
  'version.compareToCurrent': {
    zh: ' → 当前版本',
    en: ' → Current',
  },
  'version.titleCompare': {
    zh: ' 标题',
    en: ' Title',
  },
  'version.contentCompare': {
    zh: ' 内容',
    en: ' Content',
  },
  'version.restore': {
    zh: ' 回退到此版本',
    en: ' Revert',
  },
  'version.currentVersion': {
    zh: '（当前版本）',
    en: ' (current)',
  },
  'version.restoreTooltip': {
    zh: '回退到此版本（当前内容会保存为新版本）',
    en: 'Revert (current saved as new version)',
  },
};

export const translate = (key: string, lang: Language): string => {
  const translation = translations[key];
  if (!translation) return key;
  return lang === 'zh-CN' ? translation.zh : translation.en;
};
