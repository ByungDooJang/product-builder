import React, { useState, useEffect } from 'react';
import { Settings, ChevronLeft, Trash2, Download, Upload, Palette, RefreshCcw } from 'lucide-react';

interface SettingsToolProps {
  onBack: () => void;
  onThemeChange: (theme: string) => void;
  currentTheme: string;
}

const themes = [
  { id: 'pikachu', name: '피카츄 옐로우 (Default)', primary: 'bg-poke-yellow', border: 'border-poke-yellow', text: 'text-poke-dark' },
  { id: 'gengar', name: '팬텀 퍼플 (Dark)', primary: 'bg-purple-700', border: 'border-purple-700', text: 'text-white' },
  { id: 'mewtwo', name: '뮤츠 사이킥 (Psychic)', primary: 'bg-pink-600', border: 'border-pink-600', text: 'text-white' },
  { id: 'lucario', name: '루카리오 블루 (Steel)', primary: 'bg-blue-800', border: 'border-blue-800', text: 'text-white' },
];

const SettingsTool: React.FC<SettingsToolProps> = ({ onBack, onThemeChange, currentTheme }) => {
  const clearData = () => {
    if (confirm('모든 파티 정보와 히스토리가 초기화됩니다. 계속하시겠습니까?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      teams: localStorage.getItem('all_poke_teams'),
      history: localStorage.getItem('damage_history'),
      settings: localStorage.getItem('poke_settings'),
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `poke_helper_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-gray-700 shadow-[0_12px_0_0_rgba(55,65,81,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-gray-700 p-3 rounded-2xl text-white shadow-lg"><Settings size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">설정 및 테마</h2>
            <p className="text-gray-500 font-bold">앱 커스터마이징 및 데이터 관리</p>
          </div>
        </div>

        <div className="space-y-8">
           {/* Theme Selection */}
           <section>
              <h3 className="text-xs font-black uppercase text-gray-400 mb-4 flex items-center gap-2 italic"><Palette size={14}/> UI 테마 선택</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {themes.map(t => (
                    <button 
                       key={t.id} 
                       onClick={() => onThemeChange(t.id)}
                       className={`p-4 rounded-2xl border-4 transition-all flex items-center justify-between ${currentTheme === t.id ? `${t.border} ${t.primary} text-white shadow-md scale-[1.02]` : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                    >
                       <span className="font-black text-xs uppercase">{t.name}</span>
                       {currentTheme === t.id && <RefreshCcw size={14} className="animate-spin" />}
                    </button>
                 ))}
              </div>
           </section>

           {/* Data Management */}
           <section>
              <h3 className="text-xs font-black uppercase text-gray-400 mb-4 flex items-center gap-2 italic"><Download size={14}/> 데이터 백업 및 관리</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <button onClick={exportData} className="p-4 bg-blue-50 text-blue-700 border-2 border-blue-100 rounded-2xl font-black text-xs uppercase italic flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                    <Download size={16} /> 데이터 백업 (Export)
                 </button>
                 <button onClick={clearData} className="p-4 bg-red-50 text-red-700 border-2 border-red-100 rounded-2xl font-black text-xs uppercase italic flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                    <Trash2 size={16} /> 전체 데이터 초기화
                 </button>
              </div>
           </section>
        </div>

        <div className="mt-12 pt-6 border-t-2 border-gray-50 text-center">
           <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-widest">Pokémon Champions v6.0 Master Edition</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTool;
