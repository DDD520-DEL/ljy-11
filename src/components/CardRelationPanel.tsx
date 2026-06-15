import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  ArrowRight,
  ArrowLeft,
  List,
  Network,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  Shuffle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CardRelations, RelationNode } from '../types';
import { cn } from '../lib/utils';
import { useI18n } from '../i18n';

type ViewMode = 'tree' | 'list';

interface CardRelationPanelProps {
  cardId: string;
  className?: string;
}

export default function CardRelationPanel({ cardId, className }: CardRelationPanelProps) {
  const navigate = useNavigate();
  const { cards } = useStore();
  const { language, t } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const relations: CardRelations = useStore((state) => state.getCardRelations(cardId));
  const currentCard = cards.find((c) => c.id === cardId);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getCardTitleById = (id: string) => {
    return cards.find((c) => c.id === id)?.title || t('relation.unknownCard');
  };

  const handleNodeClick = (nodeCardId: string) => {
    navigate(`/cards/${nodeCardId}`);
  };

  const renderPath = (path: string[], currentCardId: string) => {
    return path.map((id, index) => {
      const isCurrent = id === currentCardId;
      const title = getCardTitleById(id);
      return (
        <span key={id} className="inline-flex items-center">
          {index > 0 && <ArrowRight className="w-3 h-3 mx-1 text-white/30" />}
          <span
            className={cn(
              'text-xs',
              isCurrent ? 'text-amber-gold font-medium' : 'text-white/60'
            )}
          >
            {title}
          </span>
        </span>
      );
    });
  };

  const secondOrderByFirst = useMemo(() => {
    const grouped = new Map<string, RelationNode[]>();
    relations.secondOrder.forEach((node) => {
      if (node.path.length >= 2) {
        const firstOrderId = node.path[1];
        if (!grouped.has(firstOrderId)) {
          grouped.set(firstOrderId, []);
        }
        grouped.get(firstOrderId)!.push(node);
      }
    });
    return grouped;
  }, [relations.secondOrder]);

  const renderTreeNode = (
    node: RelationNode,
    isRoot: boolean = false,
    showChildren: boolean = true
  ) => {
    const hasChildren = secondOrderByFirst.has(node.cardId);
    const isExpanded = expandedNodes.has(node.cardId);
    const children = secondOrderByFirst.get(node.cardId) || [];

    return (
      <div key={node.cardId} className="relative">
        <motion.div
          className={cn(
            'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all group',
            isRoot
              ? 'bg-amber-gold/10 border border-amber-gold/30'
              : 'hover:bg-white/5'
          )}
          onClick={() => handleNodeClick(node.cardId)}
        >
          {hasChildren && showChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.cardId);
              }}
              className="p-0.5 hover:bg-white/10 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-white/50" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/50" />
              )}
            </button>
          )}
          {!hasChildren && showChildren && <div className="w-5" />}

          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: node.tagColor }}
          />

          {node.relationType === 'outgoing' && (
            <ArrowRight className="w-4 h-4 text-amber-gold flex-shrink-0" />
          )}
          {node.relationType === 'incoming' && (
            <ArrowLeft className="w-4 h-4 text-emerald-mastered flex-shrink-0" />
          )}
          {node.relationType === 'second-order' && (
            <Shuffle className="w-4 h-4 text-blue-400 flex-shrink-0" />
          )}

          <FileText className="w-4 h-4 text-white/50 flex-shrink-0" />

          <span
            className={cn(
              'text-sm truncate flex-1',
              isRoot ? 'text-amber-gold font-medium' : 'text-white'
            )}
          >
            {node.cardTitle}
          </span>

          {node.tags.length > 0 && (
            <span className="text-xs text-white/40 flex-shrink-0">
              #{node.tags[0]}
            </span>
          )}
        </motion.div>

        {hasChildren && showChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-6 border-l border-white/10 pl-2 mt-1"
          >
            {children.map((child) => (
              <div key={child.cardId} className="py-1">
                {renderTreeNode(child, false, false)}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  const renderListItem = (node: RelationNode) => (
    <motion.div
      key={node.cardId}
      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-white/10"
      onClick={() => handleNodeClick(node.cardId)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: node.tagColor }}
        />
        <span className="text-sm font-medium text-white truncate flex-1">
          {node.cardTitle}
        </span>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            node.relationType === 'outgoing' &&
              'bg-amber-gold/15 text-amber-gold',
            node.relationType === 'incoming' &&
              'bg-emerald-mastered/15 text-emerald-mastered',
            node.relationType === 'second-order' &&
              'bg-blue-400/15 text-blue-400'
          )}
        >
          {node.relationType === 'outgoing' && t('relation.outgoing')}
          {node.relationType === 'incoming' && t('relation.incoming')}
          {node.relationType === 'second-order' && t('relation.secondOrder')}
        </span>
      </div>
      <div className="flex items-center text-xs text-white/50 mb-2">
        <Layers className="w-3 h-3 mr-1" />
        <span>{t('relation.path')} </span>
        <span className="ml-1">
          {renderPath(node.path, relations.currentCardId)}
        </span>
      </div>
      {node.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {node.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );

  const totalRelations =
    relations.firstOrder.outgoing.length +
    relations.firstOrder.incoming.length +
    relations.secondOrder.length;

  if (totalRelations === 0) {
    return (
      <div className={cn('glass-card p-6', className)}>
        <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-amber-gold" />
          {t('relation.panelTitle')}
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Network className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/60 text-sm">{t('relation.noRelations')}</p>
          <p className="text-white/40 text-xs mt-1">
            {t('relation.bidiHint')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('glass-card p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-amber-gold" />
          {t('relation.panelTitle')}
          <span className="text-xs font-normal text-white/40 ml-2">
            {t('relation.totalRelationsPrefix')} {totalRelations} {t('relation.totalRelationsSuffix')}
          </span>
        </h3>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode('tree')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'tree'
                ? 'bg-amber-gold/20 text-amber-gold'
                : 'text-white/50 hover:text-white'
            )}
            title={t('relation.treeView')}
          >
            <GitBranch className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'list'
                ? 'bg-amber-gold/20 text-amber-gold'
                : 'text-white/50 hover:text-white'
            )}
            title={t('relation.listView')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-gold/20 border border-amber-gold/40" />
          <span className="text-white/60">{t('relation.currentCard')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowRight className="w-3 h-3 text-amber-gold" />
          <span className="text-white/60">{t('relation.forwardLinks')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowLeft className="w-3 h-3 text-emerald-mastered" />
          <span className="text-white/60">{t('relation.backwardLinks')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shuffle className="w-3 h-3 text-blue-400" />
          <span className="text-white/60">{t('relation.secondOrderLinks')}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'tree' ? (
          <motion.div
            key="tree"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 max-h-96 overflow-y-auto"
          >
            {currentCard && (
              <div className="mb-4">
                {renderTreeNode(
                  {
                    cardId: currentCard.id,
                    cardTitle: currentCard.title,
                    relationType: 'outgoing',
                    path: [currentCard.id],
                    depth: 0,
                    tagColor: '#f59e0b',
                    tags: currentCard.tags,
                  },
                  true
                )}
              </div>
            )}

            {relations.firstOrder.outgoing.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-gold" />
                  {t('relation.outgoingCards')} ({relations.firstOrder.outgoing.length})
                </h4>
                <div className="space-y-1">
                  {relations.firstOrder.outgoing.map((node) =>
                    renderTreeNode(node)
                  )}
                </div>
              </div>
            )}

            {relations.firstOrder.incoming.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-mastered" />
                  {t('relation.incomingCards')} ({relations.firstOrder.incoming.length})
                </h4>
                <div className="space-y-1">
                  {relations.firstOrder.incoming.map((node) =>
                    renderTreeNode(node)
                  )}
                </div>
              </div>
            )}

            {relations.secondOrder.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                  <Shuffle className="w-3.5 h-3.5 text-blue-400" />
                  {t('relation.secondOrderCards')} ({relations.secondOrder.length})
                </h4>
                <div className="text-xs text-white/40 mb-2">
                  {t('relation.secondOrderHint')}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3 max-h-96 overflow-y-auto"
          >
            {relations.firstOrder.outgoing.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-gold" />
                  {t('relation.outgoingCards')} ({relations.firstOrder.outgoing.length})
                </h4>
                <div className="space-y-2">
                  {relations.firstOrder.outgoing.map((node) =>
                    renderListItem(node)
                  )}
                </div>
              </div>
            )}

            {relations.firstOrder.incoming.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-mastered" />
                  {t('relation.incomingCards')} ({relations.firstOrder.incoming.length})
                </h4>
                <div className="space-y-2">
                  {relations.firstOrder.incoming.map((node) =>
                    renderListItem(node)
                  )}
                </div>
              </div>
            )}

            {relations.secondOrder.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                  <Shuffle className="w-3.5 h-3.5 text-blue-400" />
                  {t('relation.secondOrderCards')} ({relations.secondOrder.length})
                </h4>
                <div className="space-y-2">
                  {relations.secondOrder.map((node) => renderListItem(node))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
