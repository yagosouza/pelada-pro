import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-slate-600 font-bold">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;