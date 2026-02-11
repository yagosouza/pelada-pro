import React, { useState, useContext, createContext, useEffect } from 'react';
import { 
  Users, Calendar, Clock, CheckCircle, Plus, LogOut, Shield, User, Trophy, 
  Shirt, XCircle, MoreHorizontal, Shuffle, Pencil, UserPlus, Save, ArrowLeft, 
  Settings, LayoutGrid, RotateCcw, Flag, History, Footprints, Star, AlertTriangle, Heart, Lock, Mail, X
} from 'lucide-react';

// ============================================================================
// 1. CONSTANTES E UTILITÁRIOS
// ============================================================================

const INITIAL_USERS = [];
const INITIAL_GROUPS = [];
const INITIAL_GAMES = [];
const EMOJI_OPTIONS = ['👨🏻', '👱🏻‍♂️', '🧑🏽', '🧔🏻‍♂️', '👨🏿', '👱🏼', '🦁', '🐯', '🦅', '🦈', '🧤', '⚽', '🏃🏻', '🥷', '🤖', '👽'];
const TEAMS_OPTIONS = ['Sem Time', 'Grêmio', 'Internacional'];

const getCommunityRating = (user) => {
  return user.communityRating !== null ? user.communityRating : user.manualRating;
};

const calculateGameStats = (game, users) => {
  if (!game.votes) return { sortedPlayers: [], mvp: null, pereba: null };
  const scores = {}; 
  const counts = {};
  
  Object.values(game.votes).forEach(voteSheet => {
    Object.entries(voteSheet).forEach(([tid, val]) => { 
      scores[tid] = (scores[tid]||0)+val; 
      counts[tid] = (counts[tid]||0)+1; 
    });
  });

  const results = Object.keys(scores).map(pid => ({ 
    id: pid, 
    avg: scores[pid]/counts[pid], 
    user: users.find(u => u.id === pid) 
  })).sort((a,b) => b.avg - a.avg);

  return { sortedPlayers: results, mvp: results[0], pereba: results[results.length-1] };
};

// ============================================================================
// 2. CONTEXTO (GERENCIAMENTO DE ESTADO)
// ============================================================================

const AppContext = createContext();

const AppProvider = ({ children }) => {
  // Persistência no LocalStorage
  const loadState = (key, initial) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  };

  const [users, setUsers] = useState(() => loadState('pelada_users', INITIAL_USERS));
  const [groups, setGroups] = useState(() => loadState('pelada_groups', INITIAL_GROUPS));
  const [games, setGames] = useState(() => loadState('pelada_games', INITIAL_GAMES));
  const [currentUser, setCurrentUser] = useState(() => loadState('pelada_currentUser', null));
  
  useEffect(() => localStorage.setItem('pelada_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('pelada_groups', JSON.stringify(groups)), [groups]);
  useEffect(() => localStorage.setItem('pelada_games', JSON.stringify(games)), [games]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('pelada_currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('pelada_currentUser');
  }, [currentUser]);

  // Roteamento Simples
  const [currentRoute, setCurrentRoute] = useState(currentUser ? 'home' : 'login'); 
  const [routeParams, setRouteParams] = useState({});

  const navigate = (route, params = {}) => {
    setRouteParams(params);
    setCurrentRoute(route);
  };

  const login = (email) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      navigate('home');
      return true;
    }
    return false;
  };

  const register = (userData) => {
    setUsers([...users, userData]);
    setCurrentUser(userData);
    navigate('home');
  };

  const logout = () => {
    setCurrentUser(null);
    navigate('login');
  };

  const addGroup = (groupData) => {
    const newGroupId = `group_${Date.now()}`;
    const newGameId = `game_${Date.now()}`;
    
    const newGame = { 
      id: newGameId, 
      groupId: newGroupId, 
      date: groupData.date, 
      time: groupData.time, 
      maxPlayers: parseInt(groupData.maxPlayers), 
      playersPerTeam: Math.floor(parseInt(groupData.maxPlayers)/2) - 1, 
      pricePerPerson: parseFloat(groupData.price), 
      confirmedIds: [currentUser.id], 
      teams: null, 
      status: 'scheduled', 
      score: { teamA: 0, teamB: 0 }, 
      votes: {} 
    };

    const newGroup = { 
      id: newGroupId, 
      ...groupData, 
      defaultTime: groupData.time, 
      defaultPrice: groupData.price,
      defaultMaxPlayers: groupData.maxPlayers,
      adminId: currentUser.id, 
      nextGameId: newGameId 
    };

    setGroups([...groups, newGroup]);
    setGames([...games, newGame]);
    return newGroup;
  };

  const updateGroup = (groupId, updates) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, ...updates } : g));
  };

  const updateGame = (gameId, updates) => {
    setGames(games.map(g => g.id === gameId ? { ...g, ...updates } : g));
  };

  const updateUser = (userId, updates) => {
    const updatedUser = { ...users.find(u => u.id === userId), ...updates };
    setUsers(users.map(u => u.id === userId ? updatedUser : u));
    if (currentUser.id === userId) setCurrentUser(updatedUser);
  };

  const addGuestUser = (guestData) => {
    const newGuest = { ...guestData, id: `guest_${Date.now()}`, isGuest: true };
    setUsers(prev => [...prev, newGuest]);
    return newGuest;
  };

  const finalizeGame = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const stats = calculateGameStats(game, users);
    const updatedUsers = users.map(user => {
      const playerStat = stats.sortedPlayers.find(p => p.id === user.id);
      if (playerStat) {
        const currentRating = user.communityRating !== null ? user.communityRating : playerStat.avg;
        const newRating = ((currentRating + playerStat.avg) / 2).toFixed(1);
        return { ...user, communityRating: parseFloat(newRating) };
      }
      return user;
    });
    setUsers(updatedUsers);

    const finalGame = { ...game, status: 'finished' };
    const nextDate = new Date(game.date);
    nextDate.setDate(nextDate.getDate() + 7);
    const nextGameId = `game_${Date.now()}`;
    const nextGame = { 
      ...game, 
      id: nextGameId, 
      date: nextDate.toISOString().split('T')[0], 
      confirmedIds: [currentUser.id], 
      teams: null, 
      status: 'scheduled', 
      score: { teamA: 0, teamB: 0 }, 
      votes: {} 
    };

    setGames(prev => prev.map(g => g.id === gameId ? finalGame : g).concat(nextGame));
    setGroups(prev => prev.map(g => g.id === game.groupId ? { ...g, nextGameId: nextGameId } : g));
  };

  return (
    <AppContext.Provider value={{
      users, groups, games, currentUser, currentRoute, routeParams, navigate,
      login, register, logout, addGroup, updateGroup, updateGame, updateUser, addGuestUser, finalizeGame
    }}>
      {children}
    </AppContext.Provider>
  );
};

// ============================================================================
// 3. COMPONENTES UI (GENÉRICOS)
// ============================================================================

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, size = 'md', type = 'button' }) => {
  const baseStyle = "font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-3' };
  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-100',
    ghost: 'text-slate-500 hover:bg-slate-100',
    outline: 'border-2 border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}>{children}</button>;
};

const PositionBadge = ({ position }) => {
  const colors = { 'Goleiro': 'bg-yellow-100 text-yellow-700 border-yellow-200', 'Defensor': 'bg-blue-100 text-blue-700 border-blue-200', 'Meia': 'bg-emerald-100 text-emerald-700 border-emerald-200', 'Atacante': 'bg-rose-100 text-rose-700 border-rose-200' };
  return <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${colors[position] || 'bg-gray-100 text-gray-600'}`}>{position ? position.substring(0, 3) : '???'}</span>;
};

const TeamFlag = ({ team }) => {
  if (team === 'Grêmio') return <div className="flex -space-x-1 items-center" title="Grêmio"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white"></div><div className="w-2.5 h-2.5 rounded-full bg-black border border-white"></div><div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-200"></div></div>;
  if (team === 'Internacional') return <div className="flex -space-x-1 items-center" title="Internacional"><div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></div><div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-200"></div></div>;
  return null;
};

const StarRating = ({ rating, setRating, readOnly = false, size = "w-5 h-5" }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" disabled={readOnly} onClick={() => !readOnly && setRating(star)} className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}>
        <Star className={`${size} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
      </button>
    ))}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl scale-100 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
        {title && <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">{title}</h3>}
        {children}
      </div>
    </div>
  );
};

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
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white ${player.position === 'Goleiro' ? 'bg-yellow-400 text-yellow-900' : 'bg-white text-slate-800'}`}>{player.photo}</div>
      <div className="bg-black/50 text-white text-[9px] px-1.5 rounded-sm backdrop-blur-sm truncate max-w-[60px]">{player.name.split(' ')[0]}</div>
    </div>
  );

  return (
    <div className="mt-4">
      <div className="bg-emerald-600 rounded-xl p-4 relative shadow-inner overflow-hidden border-2 border-emerald-700 aspect-[3/4] flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/30 top-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/30 rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t border-x border-white/30"></div>
        <div className="relative z-10 flex justify-center pb-2">{byPos['Goleiro'].length > 0 ? byPos['Goleiro'].map(p => <PlayerDot key={p.id} player={p} />) : <div className="w-8 h-8 rounded-full border-2 border-white/20 border-dashed flex items-center justify-center text-white/40 text-[9px]">GOL</div>}</div>
        <div className="relative z-10 flex justify-around px-4">{byPos['Defensor'].map(p => <PlayerDot key={p.id} player={p} />)}</div>
        <div className="relative z-10 flex justify-around px-2">{byPos['Meia'].map(p => <PlayerDot key={p.id} player={p} />)}</div>
        <div className="relative z-10 flex justify-around px-6 pt-4">{byPos['Atacante'].map(p => <PlayerDot key={p.id} player={p} />)}</div>
      </div>
      {bench.length > 0 && (
        <div className="mt-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><LayoutGrid className="w-3 h-3" /> Banco de Reservas</div>
          <div className="flex flex-wrap gap-2">{bench.map(p => (<div key={p.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 text-xs"><span>{p.photo}</span><span className="text-slate-700 font-medium">{p.name.split(' ')[0]}</span></div>))}</div>
        </div>
      )}
    </div>
  );
};

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

// ============================================================================
// 4. PÁGINAS DO APP
// ============================================================================

const LoginPage = () => {
  const { login, register } = useContext(AppContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', position: 'Meia', manualRating: 3, heartTeam: 'Sem Time', dominantFoot: 'Destro', photo: '👤' });
  const [loginEmail, setLoginEmail] = useState('');

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    const newUser = { id: `u_${Date.now()}`, ...formData, manualRating: parseFloat(formData.manualRating), communityRating: null };
    register(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 -rotate-6"><Trophy className="w-8 h-8 text-white" /></div>
      <h1 className="text-2xl font-bold text-white mb-8">PeladaPro</h1>
      
      <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-xl">
        {isRegistering ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
             <h2 className="text-lg font-bold text-slate-800 text-center">Criar Conta</h2>
             <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
             <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
             <div className="grid grid-cols-2 gap-3">
               <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}><option value="Goleiro">Goleiro</option><option value="Defensor">Defensor</option><option value="Meia">Meia</option><option value="Atacante">Atacante</option></select>
               <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.heartTeam} onChange={e => setFormData({...formData, heartTeam: e.target.value})}>{TEAMS_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}</select>
             </div>
             <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center">
               <label className="text-xs font-bold text-slate-500 mb-2">Seu Nível (Auto-avaliação)</label>
               <StarRating rating={formData.manualRating} setRating={v => setFormData({...formData, manualRating: v})} />
             </div>
             <div className="overflow-x-auto pb-2 flex gap-2">{EMOJI_OPTIONS.map(emoji => (<button key={emoji} type="button" onClick={() => setFormData({...formData, photo: emoji})} className={`min-w-[40px] h-10 rounded-lg text-lg ${formData.photo === emoji ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>{emoji}</button>))}</div>
             <Button type="submit" className="w-full">Cadastrar</Button>
             <div className="text-center"><button type="button" onClick={() => setIsRegistering(false)} className="text-sm text-slate-500 hover:text-emerald-600">Já tem conta? Entrar</button></div>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if(!login(loginEmail)) alert('Email não encontrado'); }} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 text-center">Login</h2>
            <div className="relative"><Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" /><input className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Seu email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required /></div>
            <Button type="submit" className="w-full">Entrar</Button>
            <div className="text-center"><button type="button" onClick={() => setIsRegistering(true)} className="text-sm text-slate-500 hover:text-emerald-600">Não tem conta? Cadastrar</button></div>
          </form>
        )}
      </div>
    </div>
  );
};

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

const GroupFormPage = () => {
  const { groups, addGroup, updateGroup, navigate, routeParams } = useContext(AppContext);
  const editingGroup = routeParams.groupId ? groups.find(g => g.id === routeParams.groupId) : null;
  
  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    if (editingGroup) updateGroup(editingGroup.id, data);
    else addGroup(data);
    navigate('home');
  };

  return (
    <>
      <Header showBack onBack={() => navigate('home')} />
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{editingGroup ? 'Editar Grupo' : 'Criar Nova Pelada'}</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Nome</label><input name="name" defaultValue={editingGroup?.name} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" required /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Esporte</label><select name="sport" defaultValue={editingGroup?.sport || 'Futebol Society'} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"><option>Futebol Society</option><option>Futsal</option><option>Futebol de Campo</option></select></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Dia Inicial</label><input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Horário</label><input type="time" name="time" required defaultValue={editingGroup?.defaultTime || "20:00"} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label><input type="number" name="price" required defaultValue={editingGroup?.defaultPrice || 20} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Máx Jogadores</label><input type="number" name="maxPlayers" required defaultValue={editingGroup?.defaultMaxPlayers || 14} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" /></div></div>
          <Button type="submit" className="w-full mt-4"><Save className="w-4 h-4" /> Salvar</Button>
        </form>
      </div>
    </>
  );
};

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

const ProfilePage = () => {
  const { currentUser, updateUser, navigate } = useContext(AppContext);
  const [manualRating, setManualRating] = useState(currentUser.manualRating);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = Object.fromEntries(formData.entries());
    updateUser(currentUser.id, { ...updates, manualRating: parseFloat(manualRating) });
    navigate('home');
  };

  return (
    <>
      <Header showBack onBack={() => navigate('home')} />
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Editar Perfil</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3 text-center">Avatar</label>
            <div className="flex flex-wrap gap-2 justify-center bg-slate-50 p-4 rounded-xl border border-slate-100">
              {EMOJI_OPTIONS.map(emoji => (
                <label key={emoji} className="cursor-pointer">
                  <input type="radio" name="photo" value={emoji} defaultChecked={currentUser.photo === emoji} className="peer sr-only" />
                  <div className="w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:bg-slate-200 peer-checked:bg-emerald-500 peer-checked:text-white transition-all">{emoji}</div>
                </label>
              ))}
            </div>
          </div>
          <input name="name" defaultValue={currentUser.name} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" required placeholder="Nome" />
          <div className="grid grid-cols-2 gap-4">
            <select name="position" defaultValue={currentUser.position} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"><option value="Goleiro">Goleiro</option><option value="Defensor">Defensor</option><option value="Meia">Meia</option><option value="Atacante">Atacante</option></select>
            <select name="heartTeam" defaultValue={currentUser.heartTeam || 'Sem Time'} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">{TEAMS_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}</select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select name="dominantFoot" defaultValue={currentUser.dominantFoot || 'Destro'} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"><option value="Destro">Destro</option><option value="Canhoto">Canhoto</option><option value="Ambidestro">Ambidestro</option></select>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center items-center">
              <label className="text-xs text-slate-500 font-bold mb-2">Auto-avaliação</label>
              <StarRating rating={manualRating} setRating={setManualRating} size="w-6 h-6" />
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="bg-emerald-200 p-1.5 rounded-full"><Users className="w-4 h-4 text-emerald-700" /></div>
                <div className="text-sm font-bold text-emerald-900">Nível da Galera</div>
            </div>
            <div className="flex items-center gap-1">
              {currentUser.communityRating ? (
                <span className="text-2xl font-bold text-emerald-600">{currentUser.communityRating}</span>
              ) : (
                <span className="text-sm text-emerald-400 italic">Sem votos</span>
              )}
              {currentUser.communityRating && <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />}
            </div>
          </div>
          <Button type="submit" className="w-full mt-4">Salvar</Button>
        </form>
      </div>
    </>
  );
};

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

const MainRouter = () => {
  const { currentRoute } = useContext(AppContext);
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans md:flex md:justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        {currentRoute === 'login' && <LoginPage />}
        {currentRoute === 'home' && <HomePage />}
        {currentRoute === 'group-form' && <GroupFormPage />}
        {currentRoute === 'game' && <GameDetailsPage />}
        {currentRoute === 'profile' && <ProfilePage />}
        {currentRoute === 'history' && <HistoryPage />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}