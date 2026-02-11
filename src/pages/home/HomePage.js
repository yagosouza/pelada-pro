import React, { useContext } from 'react';
import { Plus, Pencil, Shield, Calendar, CheckCircle, History } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';

const HomePage = () => {
  const { groups, games, users, currentUser, navigate } = useContext(AppContext);

  return (
    <>
      <Header />
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Seus Grupos</h2>
          <Button size="sm" variant="ghost" className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100" onClick={() => navigate('group-form')}><Plus className="w-4 h-4" /> Novo</Button>
        </div>
        
        {groups.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚽</div>
            <h3 className="text-lg font-bold text-slate-700">Comece a Jogar!</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-[200px] mx-auto">Você não participa de nenhum grupo.</p>
            <Button onClick={() => navigate('group-form')}>Criar Grupo</Button>
          </div>
        ) : (
          groups.map(group => {
            const nextGame = games.find(g => g.id === group.nextGameId);
            const isAdmin = group.adminId === currentUser.id;
            return (
              <div key={group.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden mb-4">
                <div className="p-5 cursor-pointer" onClick={() => nextGame && navigate('game', { gameId: nextGame.id })}>
                  {isAdmin && <div className="absolute top-3 right-3 z-10 flex gap-2"><button onClick={(e) => { e.stopPropagation(); navigate('group-form', { groupId: group.id }); }} className="p-1.5 bg-white/80 hover:bg-white text-slate-400 hover:text-emerald-600 rounded-full backdrop-blur-sm"><Pencil className="w-3 h-3" /></button><span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1.5 rounded-full flex items-center gap-1"><Shield className="w-3 h-3" /> ADMIN</span></div>}
                  <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded mb-2 uppercase tracking-wide">{group.sport}</span>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{group.name}</h3>
                  {nextGame ? (
                    <>
                      <p className="text-slate-500 text-sm flex items-center gap-2 mb-4"><Calendar className="w-4 h-4" /> {new Date(nextGame.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} • {nextGame.time}</p>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        <div className="flex -space-x-2">
                          {nextGame.confirmedIds.slice(0, 4).map((id, i) => (<div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px]">{users.find(u => u.id === id)?.photo || '👤'}</div>))}
                          {nextGame.confirmedIds.length > 4 && <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">+{nextGame.confirmedIds.length - 4}</div>}
                        </div>
                        {nextGame.confirmedIds.includes(currentUser.id) ? <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg"><CheckCircle className="w-3 h-3" /> Confirmado</span> : <span className="text-slate-400 text-xs font-medium">Toque p/ ver</span>}
                      </div>
                    </>
                  ) : <p className="text-slate-400 text-sm py-4 italic">Nenhum jogo agendado.</p>}
                </div>
                <div onClick={() => navigate('history', { groupId: group.id })} className="bg-slate-50 p-2 text-center border-t border-slate-100 text-xs text-slate-500 font-medium hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-1"><History className="w-3 h-3" /> Histórico</div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default HomePage;