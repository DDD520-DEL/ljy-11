import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  BookOpen,
  Check,
  X,
  Plus,
  Sparkles,
  Link,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ImportSource } from '../types';

export default function ImportPage() {
  const { importBookmarks, importAnnotations, processImport, importSources, cards } = useStore();
  const [activeTab, setActiveTab] = useState<'bookmark' | 'annotation'>('bookmark');
  const [annotationText, setAnnotationText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingImports = importSources.filter((s) => !s.processed);
  const processedImports = importSources.filter((s) => s.processed);

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
          导入网页书签和电子书标注，自动建议与现有知识卡片建立关联
        </p>
      </motion.div>

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
                    正在分析书签并建议关联...
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

          {pendingImports.length > 0 && (
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
                <p>导出浏览器书签为 HTML 文件</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  2
                </span>
                <p>上传书签文件或粘贴标注内容</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  3
                </span>
                <p>系统自动分析并建议关联卡片</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  4
                </span>
                <p>确认创建卡片并自动建立关联</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
