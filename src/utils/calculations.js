export const getCommunityRating = (user) => {
  return user.communityRating !== null ? user.communityRating : user.manualRating;
};

export const calculateGameStats = (game, users) => {
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