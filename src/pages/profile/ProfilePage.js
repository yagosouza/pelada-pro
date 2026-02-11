import React, { useContext, useState } from 'react';
import { Users, Star } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { EMOJI_OPTIONS, TEAMS_OPTIONS } from '../../constants/data';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import StarRating from '../../components/ui/StarRating';

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

export default ProfilePage;