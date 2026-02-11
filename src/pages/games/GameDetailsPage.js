import React, { useContext, useState } from 'react';
import { Calendar, XCircle, Shirt, RotateCcw, Flag, Settings, Shuffle, UserPlus, Shield, Footprints } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { TEAMS_OPTIONS } from '../../constants/data';
import { getCommunityRating } from '../../utils/calculations';

import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import StarRating from '../../components/ui/StarRating';
import TeamFlag from '../../components/ui/TeamFlag';
import PositionBadge from '../../components/ui/PositionBadge';
import SoccerField from '../../components/SoccerField';
import Modal from '../../components/modals/Modal';

const GameDetailsPage = () => {
  const { games, users, groups, currentUser, updateGame, addGuestUser, finalizeGame, navigate, routeParams } = useContext(AppContext);
  const selectedGame = games.find(g => g.id === routeParams.gameId);
  const group = groups.find(g => g.id === selectedGame?.groupId);
  const isOrganizer = group?.adminId === currentUser.id;

  const [activeTeamTab, setActiveTeamTab] = useState('A'); 
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showDrawSettings, setShowDrawSettings] = useState(false);
  const [drawConfig, setDrawConfig] = useState({ mode: 'balanced_manual' });
  const [matchScore, setMatchScore] = useState({ teamA: 0, teamB: 0 });
  const [votingData, setVotingData] = useState({});
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [guestForm, setGuestForm] = useState({ name: '', position: 'Meia', manualRating: 3, heartTeam: 'Sem Time' });

  if (!selectedGame) return null;

  const handleTogglePresence = () => {
    const isConfirmed = selectedGame.confirmedIds.includes(currentUser.id);
    updateGame(selectedGame.id, { 
      confirmedIds: isConfirmed ? selectedGame.confirmedIds.filter(id => id !== currentUser.id) : [...selectedGame.confirmedIds, currentUser.id] 
    });
  };

  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!guestForm.name.trim()) return;
    const newGuest = addGuestUser({ ...guestForm, manualRating: parseFloat(guestForm.manualRating), communityRating: null });
    updateGame(selectedGame.id, { confirmedIds: [...selectedGame.confirmedIds, newGuest.id] });
    setGuestForm({ name: '', position: 'Meia', manualRating: 3, heartTeam: 'Sem Time' });
    setIsAddingGuest(false);
  };

  const handleDrawTeams = () => {
    const confirmedPlayers = users.filter(u => selectedGame.confirmedIds.includes(u.id));
    let teamA = [], teamB = [];

    const getSortingRating = (p) => drawConfig.mode === 'balanced_community' ? getCommunityRating(p) : p.manualRating;

    if (drawConfig.mode === 'random') {
      const shuffled = [...confirmedPlayers].sort(() => 0.5 - Math.random());
      shuffled.forEach((player, index) => (index % 2 === 0 ? teamA : teamB).push(player));
    } else if (drawConfig.mode === 'heartTeam') {
      const sortedByTeam = [...confirmedPlayers].sort((a, b) => (a.heartTeam || '').localeCompare(b.heartTeam || ''));
      const mid = Math.ceil(sortedByTeam.length / 2);
      teamA = sortedByTeam.slice(0, mid);
      teamB = sortedByTeam.slice(mid);
    } else {
      const sortedPlayers = [...confirmedPlayers].sort((a, b) => getSortingRating(b) - getSortingRating(a));
      sortedPlayers.forEach((player, index) => (index % 4 === 0 || index % 4 === 3) ? teamA.push(player) : teamB.push(player));
    }

    const sortPos = (a, b) => ({'Goleiro':0,'Defensor':1,'Meia':2,'Atacante':3}[a.position] || 9) - ({'Goleiro':0,'Defensor':1,'Meia':2,'Atacante':3}[b.position] || 9);
    teamA.sort(sortPos); teamB.sort(sortPos);
    updateGame(selectedGame.id, { teams: { teamA, teamB } });
    setShowDrawSettings(false);
  };

  const handleStartVoting = () => {
    updateGame(selectedGame.id, { status: 'voting', score: matchScore, votes: selectedGame.votes || {} });
    setShowFinishModal(false);
  };

  const handleSubmitVotes = () => {
    updateGame(selectedGame.id, { votes: { ...selectedGame.votes, [currentUser.id]: votingData } });
    setVotingData({});
  };

  const handleFinalize = () => {
    finalizeGame(selectedGame.id);
    navigate('home');
  };

  return (
    <>
      <Header showBack onBack={() => navigate('home')} />
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">{group.name}</h2>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar className="w-4 h-4" /><span>{new Date(selectedGame.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span><span>{selectedGame.time}</span>
              </div>
            </div>
            {selectedGame.status === 'scheduled' && <div className="text-right"><span className={`text-2xl font-bold ${selectedGame.confirmedIds.length >= selectedGame.maxPlayers ? 'text-red-500' : 'text-emerald-600'}`}>{selectedGame.confirmedIds.length}<span className="text-slate-300 text-lg font-normal">/{selectedGame.maxPlayers}</span></span></div>}
          </div>
        </div>

        {selectedGame.status === 'voting' && (
          <div className="p-6">
            <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg mb-6"><div className="flex justify-between items-center mb-2"><h2 className="text-xl font-bold">Fim de Jogo!</h2><span className="text-2xl font-mono">{selectedGame.score.teamA} x {selectedGame.score.teamB}</span></div><p className="text-indigo-100 text-sm">Avalie a galera para atualizar o nível dos jogadores.</p></div>
            {selectedGame.votes?.[currentUser.id] ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="text-2xl mb-3">🗳️</div><h3 className="font-bold text-slate-800">Votos Registrados!</h3>
                {isOrganizer && <div className="px-4 mt-4"><Button onClick={handleFinalize} className="w-full">Finalizar & Atualizar Níveis</Button></div>}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Avalie os Jogadores</h3>
                {selectedGame.confirmedIds.filter(id => id !== currentUser.id).map(pid => {
                  const p = users.find(u => u.id === pid);
                  return (
                    <div key={pid} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3"><div className="text-lg">{p.photo}</div><div className="text-sm font-bold text-slate-700">{p.name.split(' ')[0]}</div></div>
                        <StarRating rating={votingData[pid] || 0} setRating={(val) => setVotingData({...votingData, [pid]: val})} />
                    </div>
                  )
                })}
                <Button onClick={handleSubmitVotes} disabled={Object.keys(votingData).length === 0} className="w-full py-4 mt-4">Enviar Avaliações</Button>
              </div>
            )}
          </div>
        )}

        {selectedGame.status === 'scheduled' && (
          <div className="p-6">
            <div className="mb-8">
              {selectedGame.confirmedIds.includes(currentUser.id) ? (
                <Button variant="danger" className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 shadow-none py-4" onClick={handleTogglePresence}><XCircle className="w-5 h-5" /> Não vou mais</Button>
              ) : (
                <Button className="w-full py-4 text-lg shadow-emerald-200 shadow-lg" onClick={handleTogglePresence} disabled={selectedGame.confirmedIds.length >= selectedGame.maxPlayers}>{selectedGame.confirmedIds.length >= selectedGame.maxPlayers ? "Lista de Espera" : "Confirmar Presença"}</Button>
              )}
            </div>

            {selectedGame.teams ? (
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><Shirt className="w-5 h-5 text-indigo-500" /> Times em Campo</h3>
                  {isOrganizer && (
                    <div className="flex gap-2">
                      <button onClick={() => updateGame(selectedGame.id, { teams: null })} className="text-xs text-red-500 font-medium hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Desfazer</button>
                      <button onClick={() => setShowFinishModal(true)} className="text-xs text-white font-bold bg-emerald-600 px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm hover:bg-emerald-700"><Flag className="w-3 h-3" /> Finalizar</button>
                    </div>
                  )}
                </div>
                <div className="flex p-1 bg-slate-100 rounded-xl mb-4">{['A', 'B'].map(team => (<button key={team} onClick={() => setActiveTeamTab(team)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTeamTab === team ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Time {team}</button>))}</div>
                <SoccerField players={selectedGame.teams[`team${activeTeamTab}`]} playersPerTeam={selectedGame.playersPerTeam || 6} />
              </div>
            ) : (
              isOrganizer && selectedGame.confirmedIds.length > 1 && (
                <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-indigo-900 font-bold text-sm">Configuração</div>
                      <button onClick={() => setShowDrawSettings(!showDrawSettings)} className="p-1 hover:bg-indigo-100 rounded"><Settings className="w-4 h-4 text-indigo-600" /></button>
                    </div>
                    {showDrawSettings && (
                      <div className="mb-4 bg-white p-3 rounded-lg border border-indigo-100 text-sm space-y-2 animate-in slide-in-from-top-2">
                        <p className="font-bold text-slate-700 text-xs uppercase">Critério do Sorteio:</p>
                        {[
                          {id: 'balanced_manual', label: 'Equilibrado (Nível Manual)'},
                          {id: 'balanced_community', label: 'Equilibrado (Nível da Galera)'},
                          {id: 'heartTeam', label: 'Gre-Nal (Por Time Coração)'},
                          {id: 'random', label: 'Aleatório'}
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="drawMode" checked={drawConfig.mode === opt.id} onChange={() => setDrawConfig({mode: opt.id})} className="accent-indigo-600" />
                            <span className="text-slate-600">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-none text-xs" onClick={handleDrawTeams}><Shuffle className="w-3 h-3" /> Sortear Times Agora</Button>
                </div>
              )
            )}

            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">Lista de Jogadores</h3>
                {isOrganizer && <button onClick={() => setIsAddingGuest(!isAddingGuest)} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-100 transition-colors"><UserPlus className="w-3 h-3" /> Add Avulso</button>}
              </div>
              {isAddingGuest && (
                <form onSubmit={handleAddGuest} className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-3">
                    <input type="text" placeholder="Nome do convidado" className="w-full p-2 text-sm border border-slate-300 rounded-lg outline-none" value={guestForm.name} onChange={(e) => setGuestForm({...guestForm, name: e.target.value})} autoFocus />
                    <div className="flex gap-2">
                      <select className="flex-1 p-2 text-sm border border-slate-300 rounded-lg bg-white outline-none" value={guestForm.position} onChange={(e) => setGuestForm({...guestForm, position: e.target.value})}><option value="Goleiro">Goleiro</option><option value="Defensor">Defensor</option><option value="Meia">Meia</option><option value="Atacante">Atacante</option></select>
                      <select className="flex-1 p-2 text-sm border border-slate-300 rounded-lg bg-white outline-none" value={guestForm.heartTeam} onChange={(e) => setGuestForm({...guestForm, heartTeam: e.target.value})}>{TEAMS_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}</select>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-300">
                      <span className="text-xs text-slate-400">Nível Manual</span>
                      <StarRating rating={guestForm.manualRating} setRating={(v) => setGuestForm({...guestForm, manualRating: v})} size="w-4 h-4" />
                    </div>
                    <Button size="sm" type="submit" className="w-full">Adicionar</Button>
                </form>
              )}
              <div className="space-y-3">
                {selectedGame.confirmedIds.map((playerId, index) => {
                  const player = users.find(u => u.id === playerId);
                  const isWaitingList = index >= selectedGame.maxPlayers;
                  const effRating = getCommunityRating(player);
                  return (
                    <div key={playerId} className={`flex items-center justify-between p-3 rounded-xl border relative overflow-hidden ${isWaitingList ? 'bg-orange-50 border-orange-100' : 'bg-white border-slate-100'}`}>
                      {player?.isGuest && <div className="absolute right-0 top-0 text-[8px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-bl">AVULSO</div>}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg shadow-inner">{player?.photo}</div>
                        <div>
                          <div className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                            {player?.name}
                            {group.adminId === playerId && <Shield className="w-3 h-3 text-emerald-500" />}
                            {player?.heartTeam && <TeamFlag team={player.heartTeam} />}
                          </div>
                          <div className="flex items-center gap-2 mt-1"><PositionBadge position={player?.position} />
                            <span className="text-[10px] text-slate-400 font-medium">★ {effRating?.toFixed(1) || '3.0'}</span>
                            <div className="flex items-center text-[10px] text-slate-400 border-l border-slate-200 pl-2 ml-1 gap-1"><Footprints className="w-3 h-3" /> {player?.dominantFoot || 'Destro'}</div>
                          </div>
                        </div>
                      </div>
                        {isWaitingList && <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">Espera #{index - selectedGame.maxPlayers + 1}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title="Placar Final">
          <p className="text-sm text-slate-500 mb-6 text-center">Informe o resultado para iniciar a votação.</p>
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="text-center"><div className="text-sm font-bold text-slate-500 mb-2">Time A</div><input type="number" className="w-16 h-16 text-center text-3xl font-bold bg-slate-100 rounded-xl outline-emerald-500" value={matchScore.teamA} onChange={(e) => setMatchScore({...matchScore, teamA: parseInt(e.target.value) || 0})} /></div>
            <div className="text-2xl font-bold text-slate-300">X</div>
            <div className="text-center"><div className="text-sm font-bold text-slate-500 mb-2">Time B</div><input type="number" className="w-16 h-16 text-center text-3xl font-bold bg-slate-100 rounded-xl outline-emerald-500" value={matchScore.teamB} onChange={(e) => setMatchScore({...matchScore, teamB: parseInt(e.target.value) || 0})} /></div>
          </div>
          <div className="flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setShowFinishModal(false)}>Cancelar</Button><Button className="flex-1" onClick={handleStartVoting}>Iniciar Votação</Button></div>
        </Modal>
      </div>
    </>
  );
};

export default GameDetailsPage;