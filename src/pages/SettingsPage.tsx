import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  SortAsc,
  Network,
  Globe,
  Clock,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { CardSortBy, Language } from '../types';

export default function SettingsPage() {
  const { settings, getDefaultSettings, updateSettings } = useStore();
  const currentSettings = settings || getDefaultSettings();

  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(currentSettings.dailyReviewReminder.enabled);
  const [dailyReminderTime, setDailyReminderTime] = useState(currentSettings.dailyReviewReminder.time);
  const [defaultSortBy, setDefaultSortBy] = useState<CardSortBy>(currentSettings.defaultCardSortBy);
  const [graphNodeLimit, setGraphNodeLimit] = useState(currentSettings.graphNodeLimit);
  const [language, setLanguage] = useState<Language>(currentSettings.language);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setDailyReminderEnabled(currentSettings.dailyReviewReminder.enabled);
    setDailyReminderTime(currentSettings.dailyReviewReminder.time);
    setDefaultSortBy(currentSettings.defaultCardSortBy);
    setGraphNodeLimit(currentSettings.graphNodeLimit);
    setLanguage(currentSettings.language);
  }, [settings, currentSettings.dailyReviewReminder.enabled, currentSettings.dailyReviewReminder.time, currentSettings.defaultCardSortBy, currentSettings.graphNodeLimit, currentSettings.language]);

  const handleSave = async () => {
    await updateSettings({
      dailyReviewReminder: {
        enabled: dailyReminderEnabled,
        time: dailyReminderTime,
      },
      defaultCardSortBy: defaultSortBy,
      graphNodeLimit: graphNodeLimit,
      language: language,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const sortOptions: { value: CardSortBy; label: string }[] = [
    { value: 'updatedAt', label: '更新时间' },
    { value: 'createdAt', label: '创建时间' },
    { value: 'title', label: '标题' },
  ];

  const languageOptions: { value: Language; label: string }[] = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' },
  ];

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
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-9 h-9 text-amber-gold" />
            系统设置
          </h1>
          <p className="text-white/60">
            个性化配置您的知识管理体验
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-mastered/20 border border-emerald-mastered/40 text-emerald-mastered"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">已保存</span>
            </motion.div>
          )}
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            保存设置
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-gold/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-gold" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">每日复习提醒</h3>
              <p className="text-sm text-white/50">设置每日复习提醒时间</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/80">启用复习提醒</span>
              <button
                onClick={() => setDailyReminderEnabled(!dailyReminderEnabled)}
                className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                  dailyReminderEnabled
                    ? 'bg-amber-gold'
                    : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                    dailyReminderEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className={`space-y-2 transition-opacity duration-300 ${dailyReminderEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="text-sm text-white/70 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                提醒时间
              </label>
              <input
                type="time"
                value={dailyReminderTime}
                onChange={(e) => setDailyReminderTime(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-mastered/20 flex items-center justify-center">
              <SortAsc className="w-5 h-5 text-emerald-mastered" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">卡片排序</h3>
              <p className="text-sm text-white/50">设置卡片列表的默认排序方式</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">默认排序方式</label>
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="input-field w-full flex items-center justify-between text-left"
              >
                <span>{sortOptions.find(o => o.value === defaultSortBy)?.label}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-10"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDefaultSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        defaultSortBy === option.value
                          ? 'bg-amber-gold/20 text-amber-gold'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{option.label}</span>
                      {defaultSortBy === option.value && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <Network className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">知识图谱</h3>
              <p className="text-sm text-white/50">配置知识图谱的显示参数</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/70">节点数量上限</label>
                <span className="text-sm text-amber-gold font-medium">{graphNodeLimit}</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={graphNodeLimit}
                onChange={(e) => setGraphNodeLimit(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-gold"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>20</span>
                <span>500</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">界面语言</h3>
              <p className="text-sm text-white/50">选择您偏好的界面语言</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">语言选择</label>
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="input-field w-full flex items-center justify-between text-left"
              >
                <span>{languageOptions.find(o => o.value === language)?.label}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showLanguageDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-10"
                >
                  {languageOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setLanguage(option.value);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        language === option.value
                          ? 'bg-amber-gold/20 text-amber-gold'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{option.label}</span>
                      {language === option.value && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-white/60" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-white mb-2">关于设置</h3>
            <p className="text-sm text-white/60 mb-4">
              所有设置都会自动保存到本地存储中，刷新页面后仍然有效。
              设置更改会实时生效，无需手动刷新。
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-white/40">
              <span>最后更新: {new Date(currentSettings.updatedAt).toLocaleString('zh-CN')}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
