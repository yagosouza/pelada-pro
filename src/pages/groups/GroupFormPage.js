import React, { useContext } from 'react';
import { Save } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';

const GroupFormPage = () => {
  const { groups, addGroup, updateGroup, navigate, routeParams } = useContext(AppContext);
  const editingGroup = routeParams.groupId ? groups.find(g => g.id === routeParams.groupId) : null;
  
  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (editingGroup) {
      updateGroup(editingGroup.id, data);
    } else {
      addGroup(data);
    }
    navigate('home');
  };

  return (
    <>
      <Header showBack onBack={() => navigate('home')} />
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{editingGroup ? 'Editar Grupo' : 'Criar Nova Pelada'}</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input name="name" defaultValue={editingGroup?.name} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Esporte</label>
            <select name="sport" defaultValue={editingGroup?.sport || 'Futebol Society'} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
              <option>Futebol Society</option>
              <option>Futsal</option>
              <option>Futebol de Campo</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dia Inicial</label>
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
              <input type="time" name="time" required defaultValue={editingGroup?.defaultTime || "20:00"} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
              <input type="number" name="price" required defaultValue={editingGroup?.defaultPrice || 20} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Máx Jogadores</label>
              <input type="number" name="maxPlayers" required defaultValue={editingGroup?.defaultMaxPlayers || 14} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>
          <Button type="submit" className="w-full mt-4"><Save className="w-4 h-4" /> Salvar</Button>
        </form>
      </div>
    </>
  );
};

export default GroupFormPage;