import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, readOnly = false, size = "w-5 h-5" }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button 
        key={star} 
        type="button" 
        disabled={readOnly} 
        onClick={() => !readOnly && setRating(star)} 
        className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
      >
        <Star className={`${size} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
      </button>
    ))}
  </div>
);

export default StarRating;