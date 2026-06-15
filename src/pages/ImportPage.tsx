import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  BookOpen,
  Check,
  X,
  Plus,
  Sparkles,
  Link,
  AlertTriangle,
  CheckCircle2,
  SkipForward,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ImportSource, ImportPreviewItem, DuplicateAction } from '../types';

export default function ImportPage() {
  const {
    importBookmarks,
    importAnnotations,
    processImport,
    importSources,
    cards,
    getImportPreview,
    batchProcessImports,
  } = useStore();
  const [activeTab, setActiveTab] = useState<'bookmark' | 'annotation'>('bookmark');
  const [annotationText, setAnnotationText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'bookmark' | 'annotation'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [importResult, setImportResult] = useState<{
    created: number;
    skipped: number;
    overwritten: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingImports = useMemo(
    () => importSources.filter((s) => !s.processed),
    [importSources]
  );
  const processedImports = useMemo(
    () => importSources.filter((s) => s.processed),
    [importSources]
  );

  useEffect(() => {
    if (pendingImports.length > 0) {
      const preview = getImportPreview();
      setPreviewItems(preview.items);
    } else {
      setPreviewItems([]);
    }
    setImportResult(null);
  }, [pendingImports.length, getImportPreview]);

  const filteredPreviewItems = useMemo(() => {
    let items = previewItems;
    if (showDuplicatesOnly) {
      items = items.filter((i) => i.duplicates.length > 0);
    }
    if (filterType !== 'all') {
      items = items.filter((i) => i.importSource.type === filterType);
    }
    return items;
  }, [previewItems, showDuplicatesOnly, filterType]);

  const selectedCount = previewItems.filter((i) => i.selected).length;
  const duplicateCount = previewItems.filter((i) => i.duplicates.length > 0).length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await importBookmarks(file);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportAnnotations = async () => {
    if (!annotationText.trim()) return;

    setIsImporting(true);
    try {
      await importAnnotations(annotationText);
      setAnnotationText('');
    } finally {
      setIsImporting(false);
    }
  };

  const handleProcess = async (item: ImportSource, createCard: boolean) => {
    await processImport(item.id, createCard);
  };

  const toggleItemSelection = (importId: string) => {
    setPreviewItems((prev) =>
      prev.map((item) =>
        item.importSource.id === importId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const toggleAllSelection = () => {
    const allSelected = filteredPreviewItems.every((i) => i.selected);
    setPreviewItems((prev) => {
      const filteredIds = new Set(filteredPreviewItems.map((i) => i.importSource.id));
      return prev.map((item) =>
        filteredIds.has(item.importSource.id)
          ? { ...item, selected: !allSelected }
          : item
      );
    });
  };

  const updateItemAction = (importId: string, action: DuplicateAction) => {
    setPreviewItems((prev) =>
      prev.map((item) =>
        item.importSource.id === importId ? { ...item, action } : item
      )
    );
  };

  const applyBulkAction = (action: DuplicateAction) => {
    setPreviewItems((prev) =>
      prev.map((item) =>
        item.selected ? { ...item, action } : item
      )
    );
  };

  const toggleExpand = (importId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(importId)) {
        next.delete(importId);
      } else {
        next.add(importId);
      }
      return next;
    });
  };

  const handleBatchProcess = async () => {
    if (selectedCount === 0) return;

    setIsProcessing(true);
    try {
      const itemsToProcess = previewItems.filter((i) => i.selected);
      const result = await batchProcessImports(itemsToProcess);
      setImportResult(result);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDuplicateLevel = (similarity: number): 'high' | 'medium' | 'low' => {
    if (similarity >= 0.85) return 'high';
    if (similarity >= 0.7) return 'medium';
    return 'low';
  };

  const getDuplicateColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'text-rose-review bg-rose-review/20 border-rose-review/50';
      case 'medium':
        return 'text-amber-gold bg-amber-gold/20 border-amber-gold/50';
      case 'low':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/50';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const allFilteredSelected =
    filteredPreviewItems.length > 0 && filteredPreviewItems.every((i) => i.selected);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="font-display text-4xl font-bold text-white mb-2">
          数据导入
        </h1>
        <p className="text-white/60">
          导入网页书签和电子书标注，自动检测重复内容，预览后选择性导入
        </p>
      </motion.div>

      <AnimatePresence>
        {importResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-5 border-emerald-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">导入完成</h4>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>
                      <span className="text-emerald-400 font-medium">
                        {importResult.created}
                      </span>{' '}
                      张新建
                    </span>
                    <span>
                      <span className="text-amber-gold font-medium">
                        {importResult.overwritten}
                      </span>{' '}
                      张覆盖
                    </span>
                    <span>
                      <span className="text-white/50 font-medium">
                        {importResult.skipped}
                      </span>{' '}
                      张跳过
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setImportResult(null)}
                className="btn-secondary text-sm py-2 px-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('bookmark')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'bookmark'
                    ? 'bg-amber-gold text-deep-space'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  书签导入
                </div>
              </button>
              <button
                onClick={() => setActiveTab('annotation')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'annotation'
                    ? 'bg-amber-gold text-deep-space'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  标注导入
                </div>
              </button>
            </div>

            {activeTab === 'bookmark' ? (
              <div className="text-center py-12">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-gold/50 hover:bg-amber-gold/5 transition-all"
                >
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-amber-gold/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-amber-gold" />
                  </div>
                  <p className="text-lg font-medium text-white mb-1">
                    点击或拖放书签文件
                  </p>
                  <p className="text-sm text-white/50">
                    支持 Chrome、Edge、Firefox 导出的 HTML 书签文件
                  </p>
                </div>
                {isImporting && (
                  <div className="mt-4 text-amber-gold">
                    <Sparkles className="w-5 h-5 inline mr-2 animate-spin" />
                    正在分析书签并检测重复...
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder="粘贴电子书标注内容，每行一条标注...

例如：
间隔重复是基于记忆遗忘曲线的学习方法
艾宾浩斯遗忘曲线描述了记忆衰减的规律
主动回忆比被动阅读更有效"
                  className="w-full h-48 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-amber-gold/50 focus:ring-2 focus:ring-amber-gold/20"
                />
                <button
                  onClick={handleImportAnnotations}
                  disabled={!annotationText.trim() || isImporting}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      导入标注
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {previewItems.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-gold" />
                  导入预览 ({filteredPreviewItems.length}/{previewItems.length})
                </h3>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        filterType === 'all'
                          ? 'bg-amber-gold text-deep-space'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      全部
                    </button>
                    <button
                      onClick={() => setFilterType('bookmark')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        filterType === 'bookmark'
                          ? 'bg-amber-gold text-deep-space'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      书签
                    </button>
                    <button
                      onClick={() => setFilterType('annotation')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        filterType === 'annotation'
                          ? 'bg-amber-gold text-deep-space'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      标注
                    </button>
                  </div>

                  <button
                    onClick={() => setShowDuplicatesOnly(!showDuplicatesOnly)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      showDuplicatesOnly
                        ? 'bg-rose-review/30 text-rose-review border border-rose-review/50'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    仅重复 ({duplicateCount})
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAllSelection}
                      className="w-4 h-4 rounded bg-white/10 border-white/30 text-amber-gold focus:ring-amber-gold/50"
                    />
                    <span className="text-sm text-white/70">
                      {allFilteredSelected ? '取消全选' : '全选'} (
                      {selectedCount}/{filteredPreviewItems.length})
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/50">批量设置：</span>
                  <button
                    onClick={() => applyBulkAction('import')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    新建
                  </button>
                  <button
                    onClick={() => applyBulkAction('overwrite')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-amber-gold/20 text-amber-gold border border-amber-gold/30 hover:bg-amber-gold/30 transition-all flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    覆盖
                  </button>
                  <button
                    onClick={() => applyBulkAction('skip')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-white/10 text-white/60 border border-white/20 hover:bg-white/20 hover:text-white transition-all flex items-center gap-1"
                  >
                    <SkipForward className="w-3 h-3" />
                    跳过
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredPreviewItems.map((previewItem) => {
                  const source = previewItem.importSource;
                  const isExpanded = expandedItems.has(source.id);
                  const hasDuplicates = previewItem.duplicates.length > 0;

                  return (
                    <motion.div
                      key={source.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl border transition-all ${
                        previewItem.selected
                          ? hasDuplicates
                            ? 'bg-rose-review/5 border-rose-review/30'
                            : 'bg-white/10 border-amber-gold/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={previewItem.selected}
                          onChange={() => toggleItemSelection(source.id)}
                          className="mt-1 w-4 h-4 rounded bg-white/10 border-white/30 text-amber-gold focus:ring-amber-gold/50"
                        />

                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                          {source.type === 'bookmark' ? (
                            <BookOpen className="w-5 h-5 text-blue-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white mb-1 truncate">
                                {source.title}
                              </h4>
                              {source.url && (
                                <p className="text-xs text-white/40 truncate">
                                  {source.url}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => toggleExpand(source.id)}
                              className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all flex-shrink-0"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <p className="text-sm text-white/60 mt-2 line-clamp-3">
                                  {source.content}
                                </p>

                                {source.suggestedLinks.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs text-white/50 mb-2 flex items-center gap-1">
                                      <Link className="w-3 h-3" />
                                      建议关联：
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {source.suggestedLinks.map((cardId) => {
                                        const card = cards.find(
                                          (c) => c.id === cardId
                                        );
                                        return card ? (
                                          <span
                                            key={cardId}
                                            className="tag-chip text-xs bg-amber-gold/10 border-amber-gold/30 text-amber-gold"
                                          >
                                            {card.title}
                                          </span>
                                        ) : null;
                                      })}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {hasDuplicates && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center gap-2 text-sm text-rose-review-light">
                                <AlertTriangle className="w-4 h-4" />
                                <span>
                                  检测到 {previewItem.duplicates.length} 个疑似重复项
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {previewItem.duplicates.map((dup) => {
                                  const level = getDuplicateLevel(dup.similarity);
                                  const color = getDuplicateColor(level);
                                  return (
                                    <div
                                      key={dup.cardId}
                                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5"
                                    >
                                      <span className="text-sm text-white/80 truncate">
                                        {dup.cardTitle}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${color}`}
                                      >
                                        {(dup.similarity * 100).toFixed(0)}% 相似
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-white/40 mr-1">操作：</span>
                            <button
                              onClick={() => updateItemAction(source.id, 'import')}
                              className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1 ${
                                previewItem.action === 'import'
                                  ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              新建卡片
                            </button>
                            {hasDuplicates && (
                              <>
                                <button
                                  onClick={() =>
                                    updateItemAction(source.id, 'overwrite')
                                  }
                                  className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1 ${
                                    previewItem.action === 'overwrite'
                                      ? 'bg-amber-gold/30 text-amber-gold border border-amber-gold/50'
                                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  覆盖合并
                                </button>
                                <button
                                  onClick={() =>
                                    updateItemAction(source.id, 'skip')
                                  }
                                  className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1 ${
                                    previewItem.action === 'skip'
                                      ? 'bg-white/20 text-white border border-white/40'
                                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <SkipForward className="w-3 h-3" />
                                  跳过
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredPreviewItems.length === 0 && (
                <div className="py-12 text-center text-white/40">
                  {showDuplicatesOnly
                    ? '没有检测到重复项'
                    : '暂无待导入数据'}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-sm text-white/50">
                  已选择{' '}
                  <span className="text-amber-gold font-medium">
                    {selectedCount}
                  </span>{' '}
                  项
                </div>
                <div className="flex gap-3">
                  {pendingImports.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span className="text-rose-review-light">
                        ⚠ {duplicateCount} 项疑似重复
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleBatchProcess}
                    disabled={selectedCount === 0 || isProcessing}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        确认导入 ({selectedCount})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {pendingImports.length > 0 && previewItems.length === 0 && (
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-gold" />
                待处理 ({pendingImports.length})
              </h3>
              <div className="space-y-3">
                {pendingImports.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-gold/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          {item.type === 'bookmark' ? (
                            <BookOpen className="w-5 h-5 text-blue-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white mb-1">
                            {item.title}
                          </h4>
                          {item.url && (
                            <p className="text-xs text-white/40 truncate max-w-md">
                              {item.url}
                            </p>
                          )}
                          <p className="text-sm text-white/60 mt-1 line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </div>

                    {item.suggestedLinks.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-white/50 mb-2 flex items-center gap-1">
                          <Link className="w-3 h-3" />
                          建议关联：
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.suggestedLinks.map((cardId) => {
                            const card = cards.find((c) => c.id === cardId);
                            return card ? (
                              <span
                                key={cardId}
                                className="tag-chip text-xs bg-amber-gold/10 border-amber-gold/30 text-amber-gold"
                              >
                                {card.title}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProcess(item, true)}
                        className="flex-1 btn-primary text-sm py-2"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Plus className="w-4 h-4" />
                          创建卡片并关联
                        </div>
                      </button>
                      <button
                        onClick={() => handleProcess(item, false)}
                        className="btn-secondary text-sm py-2 px-4"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              导入统计
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">待处理</span>
                <span className="text-amber-gold font-medium">
                  {pendingImports.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">疑似重复</span>
                <span className="text-rose-review-light font-medium">
                  {duplicateCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">已创建卡片</span>
                <span className="text-emerald-mastered font-medium">
                  {processedImports.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">总计导入</span>
                <span className="text-white font-medium">
                  {importSources.length}
                </span>
              </div>
            </div>
          </div>

          {processedImports.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-mastered" />
                已处理
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {processedImports.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-white/5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-mastered flex-shrink-0" />
                      <span className="text-white/80 truncate">
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              导入指南
            </h3>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  1
                </span>
                <p>导出浏览器书签为 HTML 文件或复制标注文本</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  2
                </span>
                <p>上传书签文件或粘贴标注内容</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-review/20 text-rose-review flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  3
                </span>
                <p>系统自动检测与现有卡片的重复情况</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  4
                </span>
                <p>逐条勾选并选择「新建 / 覆盖 / 跳过」</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  5
                </span>
                <p>确认后批量导入并自动建立关联</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-amber-gold/20">
            <h3 className="font-display text-lg font-bold text-amber-gold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              相似度说明
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-review" />
                <span className="text-white/70">
                  <span className="text-rose-review-light font-medium">高重复</span>{' '}
                  (≥85%) - 极可能为同一内容
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-gold" />
                <span className="text-white/70">
                  <span className="text-amber-gold font-medium">中重复</span>{' '}
                  (70%-85%) - 建议覆盖合并
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-white/70">
                  <span className="text-blue-400 font-medium">低重复</span>{' '}
                  (60%-70%) - 可能相关但不同
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
