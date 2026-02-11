import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { calculateGameStats } from '../../utils/calculations';
import Header from '../../components/layout/Header';

const HistoryPage = () => {
  const { games, groups, users, navigate, routeParams } = useContext(AppContext);
  const group = groups.find(g => g.id === routeParams.groupId);
  const groupGames = games.filter(g => g.groupId === group.id && g.status === 'finished').sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <Header showBack onBack={() => navigate('home')} />
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Histórico</h2><p className="text-sm text-slate-500 mb-6">{group.name}</p>
        <div className="space-y-4">
          {groupGames.length === 0 ? (
             <div className="text-center text-slate-400 py-10">Nenhum jogo finalizado.</div>
          ) : (
            groupGames.map(game => { 
              const stats = calculateGameStats(game, users); 
              return (
                <div key={game.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 flex justify-between items-center border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase">{new Date(game.date).toLocaleDateString('pt-BR')}</div>
                    <div className="flex items-center gap-2 font-bold text-slate-800"><span className="text-indigo-600">A {game.score?.teamA}</span><span className="text-slate-300">-</span><span className="text-orange-600">{game.score?.teamB} B</span></div>
                  </div>
                  {stats.mvp && (
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2"><span className="text-2xl">🏆</span><div><div className="text-[10px] uppercase font-bold text-amber-500">Craque</div><div className="font-bold text-sm text-slate-800">{stats.mvp.user?.name.split(' ')[0]}</div></div></div>
                        <div className="font-bold text-emerald-600 text-lg">{stats.mvp.avg.toFixed(1)}</div>
                      </div>
                      <div className="space-y-1 bg-slate-50 p-3 rounded-lg"><div className="text-xs font-bold text-slate-400 mb-2 uppercase">Notas da Galera</div>{stats.sortedPlayers.slice(0, 5).map((p, i) => (<div key={p.id} className="flex justify-between text-xs"><span className="text-slate-600">{i+1}. {p.user?.name}</span><span className="font-bold text-slate-700">★ {p.avg.toFixed(1)}</span></div>))}</div>
                    </div>
                  )}
                </div>
              ); 
            })
          )}
        </div>
      </div>
    </>
  );
};

export default HistoryPage;