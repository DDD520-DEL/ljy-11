import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Tag, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useI18n } from '../i18n';
import { CardTemplate } from '../types';

interface TemplateSelectorProps {
  onSelect: (template: CardTemplate) => void;
  onClose: () => void;
}

export function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const { cardTemplates } = useStore();
  const { language, t } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = cardTemplates.filter((template) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(q) ||
      template.description.toLowerCase().includes(q) ||
      template.defaultTags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const handleConfirm = () => {
    const template = cardTemplates.find((tmpl) => tmpl.id === selectedId);
    if (template) {
      onSelect(template);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl font-bold text-white">
            {t('templateSelector.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <p className="text-sm text-white/50 mb-4">
          {t('templateSelector.description')}
        </p>

        <div className="mb-4">
          <input
            type="text"
            placeholder={t('templateSelector.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template) => {
              const isSelected = selectedId === template.id;
              return (
                <motion.button
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setSelectedId(template.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-amber-gold/10 border-amber-gold/40 shadow-lg shadow-amber-gold/5'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                        isSelected
                          ? 'bg-amber-gold/20 scale-110'
                          : 'bg-white/5'
                      } transition-all`}
                    >
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-white">
                          {template.name}
                        </h4>
                        {isSelected && (
                          <Check className="w-4 h-4 text-amber-gold" />
                        )}
                      </div>
                      <p className="text-xs text-white/50 truncate">
                        {template.description || t('templateSelector.noDescription')}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2"
                    >
                      {template.titleFormat && (
                        <div className="px-3 py-2 rounded-lg bg-white/5">
                          <span className="text-xs text-white/40">{t('templateSelector.titleLabel')}</span>
                          <span className="text-sm text-amber-gold">
                            {template.titleFormat}
                          </span>
                        </div>
                      )}
                      {template.contentSkeleton && (
                        <div className="px-3 py-2 rounded-lg bg-white/5">
                          <span className="text-xs text-white/40 block mb-1">
                            {t('templateSelector.bodyPreview')}
                          </span>
                          <pre className="text-xs text-white/60 whitespace-pre-wrap font-mono leading-relaxed line-clamp-3">
                            {template.contentSkeleton}
                          </pre>
                        </div>
                      )}
                      {template.defaultTags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          <Tag className="w-3 h-3 text-white/40 mt-0.5" />
                          {template.defaultTags.map((tag) => (
                            <span key={tag} className="tag-chip text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <FileText className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-sm text-white/40">
                {searchQuery ? t('templateSelector.noMatch') : t('templateSelector.noTemplates')}
              </p>
              {!searchQuery && (
                <p className="text-xs text-white/30 mt-1">
                  {t('templateSelector.goCreate')}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button onClick={onClose} className="flex-1 btn-secondary">
            {t('templateSelector.blankCard')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('templateSelector.useTemplate')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
