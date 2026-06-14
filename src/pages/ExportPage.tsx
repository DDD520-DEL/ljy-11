import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileJson,
  FileText,
  Check,
  Copy,
  FileDown,
  Info,
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ExportPage() {
  const { cards, links, exportToJSON, exportToMarkdown } = useStore();
  const [activeTab, setActiveTab] = useState<'json' | 'markdown'>('json');
  const [copied, setCopied] = useState(false);

  const jsonContent = exportToJSON();
  const markdownContent = exportToMarkdown();
  const currentContent = activeTab === 'json' ? jsonContent : markdownContent;
  const fileExtension = activeTab === 'json' ? 'json' : 'md';
  const mimeType = activeTab === 'json' ? 'application/json' : 'text/markdown';

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `knowledge-cards-${dateStr}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="font-display text-4xl font-bold text-white mb-2">
          数据导出
        </h1>
        <p className="text-white/60">
          将你的知识卡片和关联关系导出为本地文件，方便备份或迁移到其他工具
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('json')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'json'
                    ? 'bg-amber-gold text-deep-space'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileJson className="w-5 h-5" />
                  JSON 格式
                </div>
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'markdown'
                    ? 'bg-amber-gold text-deep-space'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Markdown 格式
                </div>
              </button>
            </div>

            <div className="relative">
              <textarea
                readOnly
                value={currentContent}
                className="w-full h-96 p-4 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm font-mono resize-none focus:outline-none"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="复制到剪贴板"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-mastered" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/70" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
            >
              <FileDown className="w-5 h-5" />
              下载 {activeTab === 'json' ? 'JSON' : 'Markdown'} 文件
            </button>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-gold" />
              导出内容说明
            </h3>
            <div className="space-y-4 text-sm text-white/70">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium text-white mb-1">卡片正文</p>
                  <p>包含卡片的标题和完整内容</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium text-white mb-1">标签信息</p>
                  <p>卡片的所有分类标签</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium text-white mb-1">时间信息</p>
                  <p>创建时间和最后更新时间</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  4
                </span>
                <div>
                  <p className="font-medium text-white mb-1">双向链接</p>
                  <p>该卡片与其他卡片的出链和入链关系</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              导出统计
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">卡片数量</span>
                <span className="text-amber-gold font-medium">{cards.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">链接数量</span>
                <span className="text-emerald-mastered font-medium">
                  {links.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">JSON 大小</span>
                <span className="text-white font-medium">
                  {(jsonContent.length / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Markdown 大小</span>
                <span className="text-white font-medium">
                  {(markdownContent.length / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              格式对比
            </h3>
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FileJson className="w-4 h-4 text-amber-gold" />
                  <span className="font-medium text-white">JSON 格式</span>
                </div>
                <p className="text-white/60 text-xs">
                  适合程序处理、数据迁移和备份，包含完整的结构化数据
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-emerald-mastered" />
                  <span className="font-medium text-white">Markdown 格式</span>
                </div>
                <p className="text-white/60 text-xs">
                  适合人类阅读，可直接导入支持 Markdown 的笔记工具
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              导出提示
            </h3>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex gap-3">
                <Download className="w-4 h-4 text-amber-gold flex-shrink-0 mt-0.5" />
                <p>建议定期导出备份，防止数据丢失</p>
              </div>
              <div className="flex gap-3">
                <Download className="w-4 h-4 text-amber-gold flex-shrink-0 mt-0.5" />
                <p>JSON 文件可用于后续导入恢复</p>
              </div>
              <div className="flex gap-3">
                <Download className="w-4 h-4 text-amber-gold flex-shrink-0 mt-0.5" />
                <p>Markdown 兼容 Obsidian、Logseq 等工具</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
