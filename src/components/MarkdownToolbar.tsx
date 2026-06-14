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
  const handleLink = () => {
    const url = prompt('请输入链接地址:', 'https://');
    if (url) {
      onInsert('link', { url });
    }
  };

  const toolbarButtons = [
    { action: 'bold' as const, icon: Bold, label: '加粗 (Ctrl+B)' },
    { action: 'italic' as const, icon: Italic, label: '斜体 (Ctrl+I)' },
    { action: 'h1' as const, icon: Heading1, label: '一级标题' },
    { action: 'h2' as const, icon: Heading2, label: '二级标题' },
    { action: 'h3' as const, icon: Heading3, label: '三级标题' },
    { action: 'ul' as const, icon: List, label: '无序列表' },
    { action: 'ol' as const, icon: ListOrdered, label: '有序列表' },
    { action: 'quote' as const, icon: Quote, label: '引用' },
    { action: 'link' as const, icon: Link, label: '链接', onClick: handleLink },
    { action: 'code' as const, icon: Code, label: '行内代码' },
    { action: 'codeblock' as const, icon: Code, label: '代码块', variant: 'block' as const },
  ];

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
          title="仅编辑"
        >
          <Edit3 className="w-3.5 h-3.5" />
          编辑
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            viewMode === 'split'
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="左右分栏"
        >
          <Columns className="w-3.5 h-3.5" />
          分栏
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            viewMode === 'preview'
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="仅预览"
        >
          <Eye className="w-3.5 h-3.5" />
          预览
        </button>
      </div>
    </div>
  );
}
