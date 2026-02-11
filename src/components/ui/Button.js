import React from 'react';

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

export default Button;