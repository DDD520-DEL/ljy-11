import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Network,
  Clock,
  TrendingUp,
  Plus,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { cards, links, getReviewQueue, getReadingHeatmap, readingRecords } = useStore();

  const reviewQueue = getReviewQueue();
  const heatmap = getReadingHeatmap();
  const totalReadingTime = readingRecords.reduce((sum, r) => sum + r.duration, 0);

  const recentCards = cards.slice(0, 5);

  const stats = [
    {
      icon: FileText,
      label: '知识卡片',
      value: cards.length,
      color: 'from-amber-gold to-amber-gold-light',
      change: '+12%',
    },
    {
      icon: Network,
      label: '知识关联',
      value: links.length,
      color: 'from-blue-500 to-cyan-500',
      change: '+8%',
    },
    {
      icon: Clock,
      label: '阅读时长',
      value: `${Math.floor(totalReadingTime / 60)}分钟`,
      color: 'from-emerald-mastered to-teal-500',
      change: '+25%',
    },
    {
      icon: TrendingUp,
      label: '待复习',
      value: reviewQueue.length,
      color: 'from-rose-review to-pink-500',
      change: reviewQueue.length > 5 ? '急需复习' : '良好',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            欢迎回来，探索者
          </h1>
          <p className="text-white/60">
            你的知识网络正在生长，每一个链接都是智慧的桥梁。
          </p>
        </div>
        <button
          onClick={() => navigate('/cards/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          创建新卡片
        </button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={item} className="stat-card group">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-emerald-mastered font-medium">
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-white/50">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-white">
              最近更新
            </h2>
            <button
              onClick={() => navigate('/cards')}
              className="text-sm text-amber-gold hover:text-amber-gold-light flex items-center gap-1 transition-colors"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/cards/${card.id}`)}
                className="glass-card-hover p-4 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-gold/20 to-amber-gold-light/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{card.title}</h3>
                    <p className="text-xs text-white/50">
                      {formatDistanceToNow(card.updatedAt, {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {card.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-review/20 to-pink-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-rose-review-light" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  今日复习
                </h3>
                <p className="text-xs text-white/50">间隔重复学习</p>
              </div>
            </div>
            {reviewQueue.length > 0 ? (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">待复习卡片</span>
                    <span className="text-rose-review-light font-medium">
                      {reviewQueue.length} 张
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-review to-rose-review-light rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(reviewQueue.length * 10, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => navigate('/review')}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  开始复习
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-mastered/20 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-emerald-mastered" />
                </div>
                <p className="text-white/80 font-medium">太棒了！</p>
                <p className="text-sm text-white/50">今日复习已完成</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              阅读活跃度
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (27 - i));
                const dateStr = date.toISOString().split('T')[0];
                const minutes = Math.floor((heatmap.get(dateStr) || 0) / 60);
                const intensity = Math.min(minutes / 60, 1);
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm transition-all duration-300 hover:scale-125`}
                    style={{
                      backgroundColor:
                        intensity > 0
                          ? `rgba(245, 158, 11, ${0.2 + intensity * 0.8})`
                          : 'rgba(255, 255, 255, 0.05)',
                    }}
                    title={`${dateStr}: ${minutes}分钟`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-white/40">
              <span>4周前</span>
              <div className="flex gap-1 items-center">
                <span>少</span>
                <div className="w-3 h-3 rounded-sm bg-white/10" />
                <div className="w-3 h-3 rounded-sm bg-amber-gold/30" />
                <div className="w-3 h-3 rounded-sm bg-amber-gold/60" />
                <div className="w-3 h-3 rounded-sm bg-amber-gold" />
                <span>多</span>
              </div>
              <span>今天</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
