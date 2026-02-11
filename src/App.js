// src/App.js
import React, { useContext } from 'react';
import { AppContext, AppProvider } from './context/AppContext';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/home/HomePage';
import GroupFormPage from './pages/groups/GroupFormPage';
import GameDetailsPage from './pages/games/GameDetailsPage';
import HistoryPage from './pages/history/HistoryPage';
import ProfilePage from './pages/profile/ProfilePage';
import LoadingOverlay from './components/ui/LoadingOverlay'; 
import BottomNavBar from './components/layout/BottomNavBar';

const AppContent = () => {
  const { currentRoute, loading, currentUser } = useContext(AppContext);
  // Sistema de roteamento dinâmico baseado no padrão do GymApp
  const renderRoute = () => {
    switch (currentRoute) {
      case 'login': return <LoginPage />;
      case 'home': return <HomePage />;
      case 'group-form': return <GroupFormPage />;
      case 'game': return <GameDetailsPage />;
      case 'history': return <HistoryPage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  return (
    // "pb-20" serve para dar espaço embaixo para o menu não cobrir o conteúdo
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl pb-20">
      
      {renderRoute()}

      {/* Só mostra o menu se o usuário estiver logado */}
      {currentUser && <BottomNavBar />}

      {/* Mostra o carregamento por cima de tudo quando necessário */}
      {loading && <LoadingOverlay />}
      
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;