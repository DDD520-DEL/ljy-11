import { useMemo } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Code,
  Eye,
  Edit3,
  Columns,
} from 'lucide-react';
import { useI18n } from '../i18n';

export type ViewMode = 'edit' | 'preview' | 'split';

interface MarkdownToolbarProps {
  onInsert: (type: MarkdownAction, data?: { text?: string; url?: string }) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export type MarkdownAction =
  | 'bold'
  | 'italic'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'ul'
  | 'ol'
  | 'quote'
  | 'link'
  | 'code'
  | 'codeblock';

export function MarkdownToolbar({ onInsert, viewMode, onViewModeChange }: MarkdownToolbarProps) {
  const { language, t } = useI18n();

  const handleLink = () => {
    const url = prompt(t('toolbar.linkPrompt'), 'https://');
    if (url) {
      onInsert('link', { url });
    }
  };

  const toolbarButtons = useMemo(() => [
    { action: 'bold' as const, icon: Bold, label: t('toolbar.bold') },
    { action: 'italic' as const, icon: Italic, label: t('toolbar.italic') },
    { action: 'h1' as const, icon: Heading1, label: t('toolbar.h1') },
    { action: 'h2' as const, icon: Heading2, label: t('toolbar.h2') },
    { action: 'h3' as const, icon: Heading3, label: t('toolbar.h3') },
    { action: 'ul' as const, icon: List, label: t('toolbar.ul') },
    { action: 'ol' as const, icon: ListOrdered, label: t('toolbar.ol') },
    { action: 'quote' as const, icon: Quote, label: t('toolbar.quote') },
    { action: 'link' as const, icon: Link, label: t('toolbar.link'), onClick: handleLink },
    { action: 'code' as const, icon: Code, label: t('toolbar.inlineCode') },
    { action: 'codeblock' as const, icon: Code, label: t('toolbar.codeBlock'), variant: 'block' as const },
  ], [t]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-white/10 bg-white/[0.02]">
      <div className="flex flex-wrap items-center gap-1">
        {toolbarButtons.map(({ action, icon: Icon, label, onClick, variant }) => (
          <button
            key={action}
            type="button"
            onClick={onClick || (() => onInsert(action))}
            title={label}
            className={`p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ${
              variant === 'block' ? 'relative' : ''
            }`}
          >
            <Icon className="w-4 h-4" />
            {variant === 'block' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 text-[8px] font-bold bg-white/20 rounded flex items-center justify-center">
                ≡
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
        <button
          type="button"
          onClick={() => onViewModeChange('edit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            viewMode === 'edit'
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title={t('toolbar.editOnly')}
        >
          <Edit3 className="w-3.5 h-3.5" />
          {t('toolbar.edit')}
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            viewMode === 'split'
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title={t('toolbar.splitView')}
        >
          <Columns className="w-3.5 h-3.5" />
          {t('toolbar.split')}
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            viewMode === 'preview'
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title={t('toolbar.previewOnly')}
        >
          <Eye className="w-3.5 h-3.5" />
          {t('toolbar.preview')}
        </button>
      </div>
    </div>
  );
}
