import React, { useState, createContext, useEffect } from 'react';
import { INITIAL_USERS, INITIAL_GROUPS, INITIAL_GAMES } from '../constants/data';
import { calculateGameStats } from '../utils/calculations';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Tenta carregar do localStorage (Persistência de dados igual app PRO)
  const loadState = (key, initial) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  };

  const [users, setUsers] = useState(() => loadState('pelada_users', INITIAL_USERS));
  const [groups, setGroups] = useState(() => loadState('pelada_groups', INITIAL_GROUPS));
  const [games, setGames] = useState(() => loadState('pelada_games', INITIAL_GAMES));
  const [currentUser, setCurrentUser] = useState(() => loadState('pelada_currentUser', null));
  
  // Salvar no localStorage sempre que mudar
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
      users, groups, games, currentUser,
      currentRoute, routeParams, navigate,
      login, register, logout,
      addGroup, updateGroup, updateGame, updateUser, addGuestUser, finalizeGame
    }}>
      {children}
    </AppContext.Provider>
  );
};