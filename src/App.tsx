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
import { useStore } from './store/useStore';
import { Loader2 } from 'lucide-react';

export default function App() {
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
          <p className="text-white/60">正在初始化知识库...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cards" element={<CardListPage />} />
          <Route path="/cards/new" element={<CardEditorPage />} />
          <Route path="/cards/:id" element={<CardEditorPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/trajectory" element={<TrajectoryPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
