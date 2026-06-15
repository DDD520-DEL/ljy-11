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
import { useI18n } from '../i18n';

export default function ExportPage() {
  const { language, t } = useI18n();
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
          {t('export.title')}
        </h1>
        <p className="text-white/60">
          {t('export.subtitle')}
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
                  {t('export.jsonTab')}
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
                  {t('export.mdTab')}
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
                  title={t('export.copyClipboard')}
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
              {activeTab === 'json' ? t('export.downloadJson') : t('export.downloadMd')}
            </button>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-gold" />
              {t('export.contentTitle')}
            </h3>
            <div className="space-y-4 text-sm text-white/70">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium text-white mb-1">{t('export.cardBodyTitle')}</p>
                  <p>{t('export.cardBodyDesc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium text-white mb-1">{t('export.tagInfoTitle')}</p>
                  <p>{t('export.tagInfoDesc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium text-white mb-1">{t('export.timeInfoTitle')}</p>
                  <p>{t('export.timeInfoDesc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-gold/20 text-amber-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  4
                </span>
                <div>
                  <p className="font-medium text-white mb-1">{t('export.bidirectionalLinksTitle')}</p>
                  <p>{t('export.bidirectionalLinksDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              {t('export.statsTitle')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">{t('export.statsCardCount')}</span>
                <span className="text-amber-gold font-medium">{cards.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">{t('export.statsLinkCount')}</span>
                <span className="text-emerald-mastered font-medium">
                  {links.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">{t('export.statsJsonSize')}</span>
                <span className="text-white font-medium">
                  {(jsonContent.length / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">{t('export.statsMdSize')}</span>
                <span className="text-white font-medium">
                  {(markdownContent.length / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              {t('export.formatCompare')}
            </h3>
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FileJson className="w-4 h-4 text-amber-gold" />
                  <span className="font-medium text-white">{t('export.jsonTab')}</span>
                </div>
                <p className="text-white/60 text-xs">
                  {t('export.jsonDesc')}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-emerald-mastered" />
                  <span className="font-medium text-white">{t('export.mdTab')}</span>
                </div>
                <p className="text-white/60 text-xs">
                  {t('export.mdDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              {t('export.tipsTitle')}
            </h3>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex gap-3">
                <Download className="w-4 h-4 text-amber-gold flex-shrink-0 mt-0.5" />
                <p>{t('export.tip1')}</p>
              </div>
              <div className="flex gap-3">
                <Download className="w-4 h-4 text-amber-gold flex-shrink-0 mt-0.5" />
                <p>{t('export.tip2')}</p>
              </div>
              <div className="flex gap-3">
                <Download className="w-4 h-4 text-amber-gold flex-shrink-0 mt-0.5" />
                <p>{t('export.tip3')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
