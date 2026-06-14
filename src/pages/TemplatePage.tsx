import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  BookOpen,
  Users,
  GraduationCap,
  Lightbulb,
  ClipboardList,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { CardTemplate } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const PRESET_ICONS = [
  { icon: '📖', label: '读书' },
  { icon: '📝', label: '会议' },
  { icon: '🎓', label: '学习' },
  { icon: '💡', label: '灵感' },
  { icon: '📋', label: '清单' },
  { icon: '🔬', label: '研究' },
  { icon: '💼', label: '工作' },
  { icon: '🎯', label: '目标' },
  { icon: '📊', label: '数据' },
  { icon: '🧠', label: '思维' },
];

const PRESET_TEMPLATES: Partial<CardTemplate>[] = [
  {
    name: '读书笔记',
    description: '记录书籍阅读的核心观点和个人感悟',
    titleFormat: '《书名》读书笔记',
    contentSkeleton: `## 基本信息
- 书名：
- 作者：
- 阅读日期：

## 核心观点
1. 
2. 
3. 

## 精彩摘录
> 

## 个人感悟


## 行动清单
- [ ] `,
    defaultTags: ['读书笔记', '阅读'],
    icon: '📖',
  },
  {
    name: '会议纪要',
    description: '记录会议讨论内容和决策事项',
    titleFormat: '会议纪要 - 主题',
    contentSkeleton: `## 会议信息
- 日期：
- 参会人：
- 主题：

## 讨论要点
1. 
2. 
3. 

## 决议事项
- [ ] 
- [ ] 

## 待跟进
- 负责人：
- 截止日期：

## 下次会议
- 时间：
- 议题：`,
    defaultTags: ['会议纪要', '工作'],
    icon: '📝',
  },
  {
    name: '学习摘要',
    description: '整理学习内容的关键知识点',
    titleFormat: '学习摘要 - 主题',
    contentSkeleton: `## 学习主题


## 关键概念
1. 
2. 
3. 

## 知识要点
### 
### 

## 疑问与思考
- 

## 参考资料
- `,
    defaultTags: ['学习', '笔记'],
    icon: '🎓',
  },
];

interface TemplateFormData {
  name: string;
  description: string;
  titleFormat: string;
  contentSkeleton: string;
  defaultTags: string[];
  icon: string;
}

const emptyForm: TemplateFormData = {
  name: '',
  description: '',
  titleFormat: '',
  contentSkeleton: '',
  defaultTags: [],
  icon: '📄',
};

export default function TemplatePage() {
  const { cardTemplates, createTemplate, updateTemplate, deleteTemplate } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (template: CardTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      titleFormat: template.titleFormat,
      contentSkeleton: template.contentSkeleton,
      defaultTags: [...template.defaultTags],
      icon: template.icon,
    });
    setEditingId(template.id);
    setShowForm(true);
  };

  const handleAddPreset = async (preset: Partial<CardTemplate>) => {
    await createTemplate(preset);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    if (editingId) {
      await updateTemplate(editingId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        titleFormat: formData.titleFormat.trim(),
        contentSkeleton: formData.contentSkeleton,
        defaultTags: formData.defaultTags,
        icon: formData.icon,
      });
    } else {
      await createTemplate({
        name: formData.name.trim(),
        description: formData.description.trim(),
        titleFormat: formData.titleFormat.trim(),
        contentSkeleton: formData.contentSkeleton,
        defaultTags: formData.defaultTags,
        icon: formData.icon,
      });
    }
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
    setShowDeleteConfirm(null);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.defaultTags.includes(trimmed)) {
      setFormData({ ...formData, defaultTags: [...formData.defaultTags, trimmed] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      defaultTags: formData.defaultTags.filter((t) => t !== tag),
    });
  };

  const existingPresetNames = new Set(cardTemplates.map((t) => t.name));
  const availablePresets = PRESET_TEMPLATES.filter(
    (p) => !existingPresetNames.has(p.name!)
  );

  const getIconComponent = (icon: string) => {
    const iconMap: Record<string, typeof FileText> = {
      '📖': BookOpen,
      '📝': ClipboardList,
      '🎓': GraduationCap,
      '💡': Lightbulb,
      '📋': FileText,
    };
    return iconMap[icon] || FileText;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            卡片模板
          </h1>
          <p className="text-white/60">
            创建可复用的卡片模板，快速生成结构化内容
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新建模板
        </button>
      </div>

      {availablePresets.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-bold text-white mb-4">
            推荐模板
          </h2>
          <p className="text-sm text-white/60 mb-4">
            快速添加预设模板，也可以自定义修改
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availablePresets.map((preset) => (
              <motion.button
                key={preset.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddPreset(preset)}
                className="glass-card-hover p-5 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{preset.icon}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      {preset.name}
                    </h3>
                    <p className="text-xs text-white/50">
                      {preset.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {preset.defaultTags?.map((tag) => (
                    <span key={tag} className="tag-chip text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 text-amber-gold text-sm">
                  <Plus className="w-4 h-4" />
                  <span>点击添加</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {cardTemplates.map((template, index) => {
            const IconComp = getIconComponent(template.icon);
            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card-hover p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-gold/20 to-amber-gold-light/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-white group-hover:text-amber-gold transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-white/50">
                        {template.description || '暂无描述'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(template)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="编辑模板"
                    >
                      <Pencil className="w-4 h-4 text-white/60 hover:text-amber-gold" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(template.id)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="删除模板"
                    >
                      <Trash2 className="w-4 h-4 text-white/60 hover:text-rose-review" />
                    </button>
                  </div>
                </div>

                {template.titleFormat && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs text-white/40">标题格式：</span>
                    <span className="text-sm text-amber-gold">
                      {template.titleFormat}
                    </span>
                  </div>
                )}

                {template.contentSkeleton && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 max-h-32 overflow-hidden">
                    <span className="text-xs text-white/40 block mb-1">正文骨架：</span>
                    <pre className="text-xs text-white/60 whitespace-pre-wrap font-mono leading-relaxed line-clamp-4">
                      {template.contentSkeleton}
                    </pre>
                  </div>
                )}

                {template.defaultTags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {template.defaultTags.map((tag) => (
                      <span key={tag} className="tag-chip text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-white/30 pt-2 border-t border-white/10">
                  更新于 {formatDistanceToNow(template.updatedAt, { addSuffix: true, locale: zhCN })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {cardTemplates.length === 0 && availablePresets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <FileText className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2">
            还没有模板
          </h3>
          <p className="text-white/50 mb-6">
            创建模板来快速生成结构化的知识卡片
          </p>
          <button
            onClick={handleOpenCreate}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            创建第一个模板
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl font-bold text-white">
                  {editingId ? '编辑模板' : '创建模板'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-white/70 mb-2">图标</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_ICONS.map(({ icon, label }) => (
                      <button
                        key={icon}
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                          formData.icon === icon
                            ? 'bg-amber-gold/20 border-2 border-amber-gold/50 scale-110'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                        title={label}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">模板名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：读书笔记、会议纪要"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">描述</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="简短描述模板用途"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">标题格式</label>
                  <input
                    type="text"
                    value={formData.titleFormat}
                    onChange={(e) =>
                      setFormData({ ...formData, titleFormat: e.target.value })
                    }
                    placeholder="例如：《书名》读书笔记"
                    className="input-field"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    新建卡片时会自动填入标题，用户可修改
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">正文骨架</label>
                  <textarea
                    value={formData.contentSkeleton}
                    onChange={(e) =>
                      setFormData({ ...formData, contentSkeleton: e.target.value })
                    }
                    placeholder={`输入正文模板，例如：

## 基本信息
- 日期：
- 主题：

## 核心内容
1. 
2. 

## 总结`}
                    className="w-full h-64 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-gold/50 focus:ring-2 focus:ring-amber-gold/20 transition-all duration-300 font-mono text-sm resize-none"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    支持 Markdown 语法，新建卡片时会自动填入正文
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">默认标签</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.defaultTags.map((tag) => (
                      <span key={tag} className="tag-chip group">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-rose-review-light transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="输入标签后按回车添加"
                      className="input-field flex-1"
                    />
                    <button
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                      className="btn-secondary disabled:opacity-50"
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? '保存修改' : '创建模板'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-review/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-rose-review" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    确认删除
                  </h3>
                  <p className="text-sm text-white/60">
                    此操作不可撤销
                  </p>
                </div>
              </div>
              <p className="text-white/70 mb-6">
                确定要删除这个模板吗？已使用该模板创建的卡片不受影响。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-rose-review text-white font-medium rounded-xl px-6 py-2.5 hover:bg-rose-review/80 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
