import React, { useContext } from 'react';
import { Home, User, PlusCircle } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const BottomNavBar = () => {
  const { currentRoute, navigate } = useContext(AppContext);

  const tabs = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'group-form', icon: PlusCircle, label: 'Novo Grupo' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center max-w-md mx-auto z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentRoute === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavBar;