import React from 'react';

const TeamFlag = ({ team }) => {
  if (team === 'Grêmio') return (
    <div className="flex -space-x-1 items-center" title="Grêmio">
      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-black border border-white"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-200"></div>
    </div>
  );
  if (team === 'Internacional') return (
    <div className="flex -space-x-1 items-center" title="Internacional">
      <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-200"></div>
    </div>
  );
  return null;
};

export default TeamFlag;