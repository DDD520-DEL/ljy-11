import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import CardListPage from './pages/CardListPage';
import CardEditorPage from './pages/CardEditorPage';
import GraphPage from './pages/GraphPage';
import ImportPage from './pages/ImportPage';
import ExportPage from './pages/ExportPage';
import TrajectoryPage from './pages/TrajectoryPage';
import ReviewPage from './pages/ReviewPage';
import TagsPage from './pages/TagsPage';
import TemplatePage from './pages/TemplatePage';
import FavoritesPage from './pages/FavoritesPage';
import SettingsPage from './pages/SettingsPage';
import { useStore } from './store/useStore';
import { Loader2 } from 'lucide-react';
import { I18nProvider, useI18n } from './i18n';

function AppContent() {
  const { t } = useI18n();
  const { initializeData, isLoading } = useStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeData();
      setInitialized(true);
    };
    init();
  }, [initializeData]);

  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-gold to-amber-gold-light flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-deep-space animate-spin" />
          </div>
          <p className="text-white/60">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/cards" element={<CardListPage />} />
      <Route path="/cards/new" element={<CardEditorPage />} />
      <Route path="/cards/:id" element={<CardEditorPage />} />
      <Route path="/graph" element={<GraphPage />} />
      <Route path="/import" element={<ImportPage />} />
      <Route path="/export" element={<ExportPage />} />
      <Route path="/trajectory" element={<TrajectoryPage />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/tags" element={<TagsPage />} />
      <Route path="/templates" element={<TemplatePage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <I18nProvider>
        <Layout>
          <AppContent />
        </Layout>
      </I18nProvider>
    </Router>
  );
}
