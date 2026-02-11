import React, { useContext } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const Header = ({ showBack, onBack, rightAction }) => {
  const { currentUser, logout, navigate } = useContext(AppContext);
  
  if (!currentUser) return null;

  return (
    <header className="px-6 py-4 bg-white sticky top-0 z-20 border-b border-slate-100 flex justify-between items-center">
      {showBack ? (
         <button onClick={onBack} className="flex items-center text-slate-500 hover:text-emerald-600 p-2 -ml-2 rounded-lg"><ArrowLeft className="w-5 h-5 mr-1" /> Voltar</button>
      ) : (
        <div className="flex items-center gap-3">
          <div onClick={() => navigate('profile')} className="cursor-pointer hover:opacity-80">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm">{currentUser.photo}</div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Olá, {currentUser.name.split(' ')[0]}</h1>
            <p className="text-xs text-slate-400 cursor-pointer hover:text-emerald-500" onClick={() => navigate('profile')}>Editar perfil</p>
          </div>
        </div>
      )}
      
      {rightAction ? rightAction : (
        <button onClick={logout} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 ml-auto"><LogOut className="w-5 h-5" /></button>
      )}
    </header>
  );
};

export default Header;