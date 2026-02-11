import React from 'react';
import { LayoutGrid } from 'lucide-react';

const SoccerField = ({ players, playersPerTeam }) => {
  const starters = players.slice(0, playersPerTeam);
  const bench = players.slice(playersPerTeam);
  const byPos = { 'Goleiro': [], 'Defensor': [], 'Meia': [], 'Atacante': [] };
  
  starters.forEach(p => {
    if (byPos[p.position]) byPos[p.position].push(p);
    else byPos['Meia'].push(p);
  });

  const PlayerDot = ({ player }) => (
    <div className="flex flex-col items-center gap-1 animate-in zoom-in duration-300">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white ${player.position === 'Goleiro' ? 'bg-yellow-400 text-yellow-900' : 'bg-white text-slate-800'}`}>
        {player.photo}
      </div>
      <div className="bg-black/50 text-white text-[9px] px-1.5 rounded-sm backdrop-blur-sm truncate max-w-[60px]">
        {player.name.split(' ')[0]}
      </div>
    </div>
  );

  return (
    <div className="mt-4">
      <div className="bg-emerald-600 rounded-xl p-4 relative shadow-inner overflow-hidden border-2 border-emerald-700 aspect-[3/4] flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/30 top-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/30 rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t border-x border-white/30"></div>
        
        <div className="relative z-10 flex justify-center pb-2">
          {byPos['Goleiro'].length > 0 ? byPos['Goleiro'].map(p => <PlayerDot key={p.id} player={p} />) : <div className="w-8 h-8 rounded-full border-2 border-white/20 border-dashed flex items-center justify-center text-white/40 text-[9px]">GOL</div>}
        </div>
        <div className="relative z-10 flex justify-around px-4">{byPos['Defensor'].map(p => <PlayerDot key={p.id} player={p} />)}</div>
        <div className="relative z-10 flex justify-around px-2">{byPos['Meia'].map(p => <PlayerDot key={p.id} player={p} />)}</div>
        <div className="relative z-10 flex justify-around px-6 pt-4">{byPos['Atacante'].map(p => <PlayerDot key={p.id} player={p} />)}</div>
      </div>
      
      {bench.length > 0 && (
        <div className="mt-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
            <LayoutGrid className="w-3 h-3" /> Banco de Reservas
          </div>
          <div className="flex flex-wrap gap-2">
            {bench.map(p => (
              <div key={p.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 text-xs">
                <span>{p.photo}</span>
                <span className="text-slate-700 font-medium">{p.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoccerField;