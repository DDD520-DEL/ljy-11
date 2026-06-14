import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  FileText,
  Link,
  Sparkles,
  Filter,
  Crosshair,
  X,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { GraphData, GraphNode } from '../types';

export default function GraphPage() {
  const navigate = useNavigate();
  const graphRef = useRef<ForceGraphMethods>();
  const { getGraphData, cards } = useStore();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const lastClickRef = useRef<{ nodeId: string; time: number } | null>(null);

  const fullGraphData = getGraphData();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    fullGraphData.nodes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [fullGraphData.nodes]);

  const tagColorMap = useMemo(() => {
    const tagColors = [
      '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
      '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
    ];
    const map = new Map<string, string>();
    allTags.forEach((tag, i) => map.set(tag, tagColors[i % tagColors.length]));
    return map;
  }, [allTags]);

  const filteredGraphData: GraphData = useMemo(() => {
    if (selectedFilterTags.length === 0 && !focusedNodeId) {
      return fullGraphData;
    }

    const visibleNodeIds = new Set<string>();

    if (focusedNodeId) {
      visibleNodeIds.add(focusedNodeId);
      fullGraphData.links.forEach((link) => {
        const srcId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
        const tgtId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
        if (srcId === focusedNodeId) visibleNodeIds.add(tgtId);
        if (tgtId === focusedNodeId) visibleNodeIds.add(srcId);
      });
    }

    if (selectedFilterTags.length > 0) {
      const tagMatchedIds = new Set<string>();
      fullGraphData.nodes.forEach((node) => {
        if (node.tags.some((t) => selectedFilterTags.includes(t))) {
          tagMatchedIds.add(node.id);
        }
      });

      const tagNeighborIds = new Set<string>();
      fullGraphData.links.forEach((link) => {
        const srcId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
        const tgtId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
        if (tagMatchedIds.has(srcId)) tagNeighborIds.add(tgtId);
        if (tagMatchedIds.has(tgtId)) tagNeighborIds.add(srcId);
      });

      const tagVisibleIds = new Set([...tagMatchedIds, ...tagNeighborIds]);

      if (focusedNodeId) {
        const intersection = new Set<string>();
        tagVisibleIds.forEach((id) => {
          if (visibleNodeIds.has(id)) intersection.add(id);
        });
        intersection.forEach((id) => visibleNodeIds.add(id));
        const filteredTagMatched = new Set<string>();
        tagMatchedIds.forEach((id) => {
          if (visibleNodeIds.has(id)) filteredTagMatched.add(id);
        });
        const filteredNeighborIds = new Set<string>();
        fullGraphData.links.forEach((link) => {
          const srcId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
          const tgtId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
          if (filteredTagMatched.has(srcId) && visibleNodeIds.has(tgtId)) filteredNeighborIds.add(tgtId);
          if (filteredTagMatched.has(tgtId) && visibleNodeIds.has(srcId)) filteredNeighborIds.add(srcId);
        });
        visibleNodeIds.clear();
        [...filteredTagMatched, ...filteredNeighborIds].forEach((id) => visibleNodeIds.add(id));
      } else {
        visibleNodeIds.clear();
        tagVisibleIds.forEach((id) => visibleNodeIds.add(id));
      }
    }

    const nodes = fullGraphData.nodes.filter((n) => visibleNodeIds.has(n.id));
    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = fullGraphData.links.filter((link) => {
      const srcId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
      const tgtId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
      return nodeIds.has(srcId) && nodeIds.has(tgtId);
    });

    return { nodes, links };
  }, [fullGraphData, selectedFilterTags, focusedNodeId]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getNodeColor = useCallback((node: GraphNode) => {
    if (focusedNodeId && node.id === focusedNodeId) {
      return '#f59e0b';
    }
    if (selectedNode && node.id === selectedNode.id) {
      return '#f59e0b';
    }
    if (hoveredNode && node.id === hoveredNode.id) {
      return '#fbbf24';
    }
    return node.tagColor;
  }, [selectedNode, hoveredNode, focusedNodeId]);

  const handleNodeClick = useCallback(
    (node: any) => {
      const graphNode = node as GraphNode;
      const now = Date.now();
      const lastClick = lastClickRef.current;

      if (
        lastClick &&
        lastClick.nodeId === graphNode.id &&
        now - lastClick.time < 400
      ) {
        if (focusedNodeId === graphNode.id) {
          setFocusedNodeId(null);
        } else {
          setFocusedNodeId(graphNode.id);
          setSelectedNode(graphNode);
        }
        lastClickRef.current = null;
      } else {
        setSelectedNode(graphNode);
        lastClickRef.current = { nodeId: graphNode.id, time: now };
      }
    },
    [focusedNodeId]
  );

  const handleNodeHover = useCallback(
    (node: any) => {
      const graphNode = node as GraphNode | null;
      setHoveredNode(graphNode);
    },
    []
  );

  const handleNavigateToCard = () => {
    if (selectedNode) {
      navigate(`/cards/${selectedNode.id}`);
    }
  };

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.3, 300);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 0.7, 300);
    }
  };

  const handleResetView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
    setSelectedNode(null);
    setFocusedNodeId(null);
    setSelectedFilterTags([]);
  };

  const toggleFilterTag = (tag: string) => {
    setSelectedFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilterTags = () => {
    setSelectedFilterTags([]);
  };

  const exitFocusMode = () => {
    setFocusedNodeId(null);
  };

  const selectedCard = selectedNode
    ? cards.find((c) => c.id === selectedNode.id)
    : null;

  const focusedNode = focusedNodeId
    ? fullGraphData.nodes.find((n) => n.id === focusedNodeId)
    : null;

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
      className="h-[calc(100vh-8rem)] flex flex-col gap-6"
    >
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            知识图谱
          </h1>
          <p className="text-white/60">
            可视化展示知识节点间的关联网络
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            title="放大"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleResetView}
            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            title="重置视图"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        <div className="lg:col-span-3 glass-card p-4 relative overflow-hidden">
          <div ref={containerRef} className="w-full h-full relative">
            <ForceGraph2D
              ref={graphRef}
              graphData={filteredGraphData}
              width={dimensions.width - 32}
              height={dimensions.height - 32}
              nodeLabel={(node: any) => (node as GraphNode).name}
              nodeColor={(node: any) => getNodeColor(node as GraphNode)}
              nodeRelSize={5}
              nodeVal={(node: any) => (node as GraphNode).val}
              linkColor={() => 'rgba(245, 158, 11, 0.3)'}
              linkWidth={1.5}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              linkDirectionalParticleWidth={3}
              linkDirectionalParticleColor={() => '#f59e0b'}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              backgroundColor="transparent"
              cooldownTicks={100}
              enableNodeDrag={true}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const graphNode = node as GraphNode;
                const size = graphNode.val * (5 / globalScale);
                const isSelected =
                  selectedNode && graphNode.id === selectedNode.id;
                const isHovered =
                  hoveredNode && graphNode.id === hoveredNode.id;
                const isFocused =
                  focusedNodeId && graphNode.id === focusedNodeId;

                if (isSelected || isHovered || isFocused) {
                  const gradient = ctx.createRadialGradient(
                    graphNode.x!,
                    graphNode.y!,
                    0,
                    graphNode.x!,
                    graphNode.y!,
                    size * (isFocused ? 3 : 2)
                  );
                  gradient.addColorStop(0, `${graphNode.tagColor}60`);
                  gradient.addColorStop(1, 'transparent');
                  ctx.beginPath();
                  ctx.arc(graphNode.x!, graphNode.y!, size * (isFocused ? 3 : 2), 0, 2 * Math.PI);
                  ctx.fillStyle = gradient;
                  ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(graphNode.x!, graphNode.y!, size, 0, 2 * Math.PI);
                ctx.fillStyle = isFocused ? '#f59e0b' : graphNode.tagColor;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(graphNode.x!, graphNode.y!, size * 0.6, 0, 2 * Math.PI);
                ctx.fillStyle = '#0f172a';
                ctx.fill();

                if (isSelected || isHovered || isFocused || globalScale > 2) {
                  ctx.font = `${12 / globalScale}px "JetBrains Mono", monospace`;
                  ctx.textAlign = 'center';
                  ctx.fillStyle = '#ffffff';
                  ctx.fillText(
                    graphNode.name,
                    graphNode.x!,
                    graphNode.y! - size - 5 / globalScale
                  );
                }
              }}
              onNodeDragEnd={(node: any) => {
                node.fx = node.x;
                node.fy = node.y;
              }}
            />

            {(selectedFilterTags.length > 0 || focusedNodeId) && (
              <div className="absolute top-4 right-4 flex flex-wrap gap-2 items-center">
                {focusedNodeId && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-gold/20 border border-amber-gold/40 text-amber-gold text-xs">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>聚焦: {focusedNode?.name || focusedNodeId}</span>
                    <button
                      onClick={exitFocusMode}
                      className="hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {selectedFilterTags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                    style={{
                      backgroundColor: (tagColorMap.get(tag) || '#6b7280') + '20',
                      borderColor: (tagColorMap.get(tag) || '#6b7280') + '40',
                      borderWidth: '1px',
                      color: tagColorMap.get(tag) || '#6b7280',
                    }}
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => toggleFilterTag(tag)}
                      className="hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                <span>{filteredGraphData.nodes.length} 节点</span>
              </div>
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                <span>{filteredGraphData.links.length} 关联</span>
              </div>
              {(selectedFilterTags.length > 0 || focusedNodeId) && (
                <span className="text-white/40">
                  (共 {fullGraphData.nodes.length} 节点)
                </span>
              )}
            </div>

            {hoveredNode && (
              <div className="absolute top-4 left-4 glass-card p-3 animate-fade-in">
                <p className="font-medium text-white">{hoveredNode.name}</p>
                <p className="text-xs text-white/60">
                  {hoveredNode.linkCount} 个关联
                </p>
                <p className="text-xs text-white/40 mt-1">双击聚焦节点</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-amber-gold" />
              标签筛选
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isActive = selectedFilterTags.includes(tag);
                const color = tagColorMap.get(tag) || '#6b7280';
                const count = fullGraphData.nodes.filter((n) =>
                  n.tags.includes(tag)
                ).length;
                return (
                  <button
                    key={tag}
                    onClick={() => toggleFilterTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-white/70 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: color + '30',
                            borderColor: color,
                            boxShadow: `0 0 12px ${color}40`,
                          }
                        : undefined
                    }
                  >
                    <span>{tag}</span>
                    <span className="ml-1.5 opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
            {selectedFilterTags.length > 0 && (
              <button
                onClick={clearFilterTags}
                className="mt-3 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                清除筛选
              </button>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-gold" />
              节点信息
            </h3>
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: selectedNode.tagColor + '30' }}
                  >
                    <FileText
                      className="w-6 h-6"
                      style={{ color: selectedNode.tagColor }}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      {selectedNode.name}
                    </h4>
                    <p className="text-xs text-white/50">
                      {selectedCard?.tags[0] || '未分类'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">关联数量</span>
                    <span className="text-white font-medium">
                      {selectedNode.linkCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">复习优先级</span>
                    <span
                      className={`font-medium ${
                        selectedNode.reviewPriority > 2
                          ? 'text-rose-review-light'
                          : selectedNode.reviewPriority > 1
                          ? 'text-amber-gold'
                          : 'text-emerald-mastered'
                      }`}
                    >
                      {selectedNode.reviewPriority.toFixed(2)}
                    </span>
                  </div>
                  {selectedCard && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/60">复习次数</span>
                        <span className="text-white font-medium">
                          {selectedCard.reviewCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">复习间隔</span>
                        <span className="text-white font-medium">
                          {selectedCard.reviewInterval} 天
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {selectedNode.reviewPriority > 1 && (
                  <div className="p-3 rounded-xl bg-rose-review/10 border border-rose-review/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-rose-review-light" />
                      <span className="text-sm font-medium text-rose-review-light">
                        建议复习
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      该节点关联度高，建议优先复习巩固
                    </p>
                  </div>
                )}

                {focusedNodeId !== selectedNode.id && (
                  <button
                    onClick={() => setFocusedNodeId(selectedNode.id)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white/80 text-sm font-medium hover:bg-white/15 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Crosshair className="w-4 h-4" />
                    聚焦此节点
                  </button>
                )}

                {focusedNodeId === selectedNode.id && (
                  <button
                    onClick={exitFocusMode}
                    className="w-full px-4 py-2.5 rounded-xl bg-amber-gold/10 border border-amber-gold/30 text-amber-gold text-sm font-medium hover:bg-amber-gold/20 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    退出聚焦
                  </button>
                )}

                <button
                  onClick={handleNavigateToCard}
                  className="w-full btn-primary"
                >
                  查看卡片详情
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Network className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/60 text-sm">点击图谱节点查看详情</p>
                <p className="text-white/40 text-xs mt-1">双击节点进入聚焦模式</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              图例
            </h3>
            <div className="space-y-2">
              {Array.from(
                new Set(fullGraphData.nodes.map((n) => n.tagColor))
              ).map((color, i) => {
                const nodesWithColor = fullGraphData.nodes.filter(
                  (n) => n.tagColor === color
                );
                const sampleNode = nodesWithColor[0];
                const sampleCard = cards.find((c) => c.id === sampleNode.id);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-white/70">
                      {sampleCard?.tags[0] || '其他'}
                    </span>
                    <span className="text-xs text-white/40 ml-auto">
                      {nodesWithColor.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
