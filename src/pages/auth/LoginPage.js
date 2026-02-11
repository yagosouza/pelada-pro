import React, { useState, useContext } from 'react';
import { Trophy, Mail, Star } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import Button from '../../components/ui/Button';
import { EMOJI_OPTIONS, TEAMS_OPTIONS } from '../../constants/data';

// Componente simples de StarRating interno para não depender de importação externa por enquanto
const StarRating = ({ rating, setRating }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" onClick={() => setRating(star)} className="cursor-pointer">
        <Star className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
      </button>
    ))}
  </div>
);

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

             <div className="overflow-x-auto pb-2 flex gap-2">
                {EMOJI_OPTIONS.map(emoji => (
                  <button key={emoji} type="button" onClick={() => setFormData({...formData, photo: emoji})} className={`min-w-[40px] h-10 rounded-lg text-lg ${formData.photo === emoji ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>{emoji}</button>
                ))}
             </div>

             <Button type="submit" className="w-full">Cadastrar</Button>
             <div className="text-center"><button type="button" onClick={() => setIsRegistering(false)} className="text-sm text-slate-500 hover:text-emerald-600">Já tem conta? Entrar</button></div>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if(!login(loginEmail)) alert('Email não encontrado'); }} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 text-center">Login</h2>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Seu email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
            <div className="text-center"><button type="button" onClick={() => setIsRegistering(true)} className="text-sm text-slate-500 hover:text-emerald-600">Não tem conta? Cadastrar</button></div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;