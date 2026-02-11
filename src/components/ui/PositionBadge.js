import React from 'react';

const PositionBadge = ({ position }) => {
  const colors = { 
    'Goleiro': 'bg-yellow-100 text-yellow-700 border-yellow-200', 
    'Defensor': 'bg-blue-100 text-blue-700 border-blue-200', 
    'Meia': 'bg-emerald-100 text-emerald-700 border-emerald-200', 
    'Atacante': 'bg-rose-100 text-rose-700 border-rose-200' 
  };
  
  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${colors[position] || 'bg-gray-100 text-gray-600'}`}>
      {position ? position.substring(0, 3) : '???'}
    </span>
  );
};

export default PositionBadge;