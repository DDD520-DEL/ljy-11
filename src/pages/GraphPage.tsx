import { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { GraphNode } from '../types';

export default function GraphPage() {
  const navigate = useNavigate();
  const graphRef = useRef<ForceGraphMethods>();
  const { getGraphData, cards } = useStore();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  const graphData = getGraphData();

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
    if (selectedNode && node.id === selectedNode.id) {
      return '#f59e0b';
    }
    if (hoveredNode && node.id === hoveredNode.id) {
      return '#fbbf24';
    }
    return node.tagColor;
  }, [selectedNode, hoveredNode]);

  const handleNodeClick = useCallback(
    (node: any) => {
      const graphNode = node as GraphNode;
      setSelectedNode(graphNode);
    },
    []
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
  };

  const selectedCard = selectedNode
    ? cards.find((c) => c.id === selectedNode.id)
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
              graphData={graphData}
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

                if (isSelected || isHovered) {
                  const gradient = ctx.createRadialGradient(
                    graphNode.x!,
                    graphNode.y!,
                    0,
                    graphNode.x!,
                    graphNode.y!,
                    size * 2
                  );
                  gradient.addColorStop(0, `${graphNode.tagColor}60`);
                  gradient.addColorStop(1, 'transparent');
                  ctx.beginPath();
                  ctx.arc(graphNode.x!, graphNode.y!, size * 2, 0, 2 * Math.PI);
                  ctx.fillStyle = gradient;
                  ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(graphNode.x!, graphNode.y!, size, 0, 2 * Math.PI);
                ctx.fillStyle = graphNode.tagColor;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(graphNode.x!, graphNode.y!, size * 0.6, 0, 2 * Math.PI);
                ctx.fillStyle = '#0f172a';
                ctx.fill();

                if (isSelected || isHovered || globalScale > 2) {
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
            />

            <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                <span>{graphData.nodes.length} 节点</span>
              </div>
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                <span>{graphData.links.length} 关联</span>
              </div>
            </div>

            {hoveredNode && (
              <div className="absolute top-4 left-4 glass-card p-3 animate-fade-in">
                <p className="font-medium text-white">{hoveredNode.name}</p>
                <p className="text-xs text-white/60">
                  {hoveredNode.linkCount} 个关联
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
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
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              图例
            </h3>
            <div className="space-y-2">
              {Array.from(
                new Set(graphData.nodes.map((n) => n.tagColor))
              ).map((color, i) => {
                const nodesWithColor = graphData.nodes.filter(
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
