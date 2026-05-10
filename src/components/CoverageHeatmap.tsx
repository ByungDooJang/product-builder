import React, { useState } from 'react';
import { ChevronLeft, Grid3X3, Swords, ShieldCheck, Flame, Zap, Droplets, Leaf } from 'lucide-react';

interface CoverageHeatmapProps {
  onBack: () => void;
}

const types = [
  { name: 'Normal', ko: '노말', color: '#A8A77A' }, { name: 'Fire', ko: '불꽃', color: '#EE8130' },
  { name: 'Water', ko: '물', color: '#6390F0' }, { name: 'Electric', ko: '전기', color: '#F7D02C' },
  { name: 'Grass', ko: '풀', color: '#7AC74C' }, { name: 'Ice', ko: '얼음', color: '#96D9D6' },
  { name: 'Fighting', ko: '격투', color: '#C22E28' }, { name: 'Poison', ko: '독', color: '#A33EA1' },
  { name: 'Ground', ko: '땅', color: '#E2BF65' }, { name: 'Flying', ko: '비행', color: '#A98FF3' },
  { name: 'Psychic', ko: '에스퍼', color: '#F95587' }, { name: 'Bug', ko: '벌레', color: '#A6B91A' },
  { name: 'Rock', ko: '바위', color: '#B6A136' }, { name: 'Ghost', ko: '고스트', color: '#735797' },
  { name: 'Dragon', ko: '드래곤', color: '#6F35FC' }, { name: 'Steel', ko: '강철', color: '#B7B7CE' },
  { name: 'Fairy', ko: '페어리', color: '#D685AD' }, { name: 'Dark', ko: '악', color: '#705746' },
];

const offensiveMatchups: Record<string, string[]> = {
  'Normal': [],
  'Fire': ['Grass', 'Ice', 'Bug', 'Steel'],
  'Water': ['Fire', 'Ground', 'Rock'],
  'Electric': ['Water', 'Flying'],
  'Grass': ['Water', 'Ground', 'Rock'],
  'Ice': ['Grass', 'Ground', 'Flying', 'Dragon'],
  'Fighting': ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
  'Poison': ['Grass', 'Fairy'],
  'Ground': ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
  'Flying': ['Grass', 'Fighting', 'Bug'],
  'Psychic': ['Fighting', 'Poison'],
  'Bug': ['Grass', 'Psychic', 'Dark'],
  'Rock': ['Fire', 'Ice', 'Flying', 'Bug'],
  'Ghost': ['Psychic', 'Ghost'],
  'Dragon': ['Dragon'],
  'Steel': ['Ice', 'Rock', 'Fairy'],
  'Fairy': ['Fighting', 'Dragon', 'Dark'],
  'Dark': ['Psychic', 'Ghost'],
};

const CoverageHeatmap: React.FC<CoverageHeatmapProps> = ({ onBack }) => {
  const [selectedMoveTypes, setSelectedMoveTypes] = useState<string[]>([]);

  const toggleMoveType = (typeName: string) => {
    if (selectedMoveTypes.includes(typeName)) {
      setSelectedMoveTypes(selectedMoveTypes.filter(t => t !== typeName));
    } else if (selectedMoveTypes.length < 4) {
      setSelectedMoveTypes([...selectedMoveTypes, typeName]);
    }
  };

  const calculateCoverage = () => {
    const coverage: Record<string, boolean> = {};
    types.forEach(t => coverage[t.name] = false);

    selectedMoveTypes.forEach(moveType => {
      offensiveMatchups[moveType].forEach(targetType => {
        coverage[targetType] = true;
      });
    });

    return coverage;
  };

  const results = calculateCoverage();
  const coveredCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-orange-500 shadow-[0_12px_0_0_rgba(249,115,22,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg"><Grid3X3 size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">타입 견제 분석기</h2>
            <p className="text-gray-500 font-bold">어떤 타입을 효과적으로 찌를 수 있을까요?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="text-sm font-black uppercase mb-4 text-gray-400 tracking-widest italic">보유 기술 타입 (최대 4개)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2">
              {types.map(type => {
                const isSelected = selectedMoveTypes.includes(type.name);
                return (
                  <button
                    key={type.name}
                    onClick={() => toggleMoveType(type.name)}
                    style={{ 
                      backgroundColor: isSelected ? type.color : '#f3f4f6',
                      color: isSelected ? 'white' : '#6b7280',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                    }}
                    className={`p-3 rounded-xl font-black text-xs uppercase transition-all shadow-sm border-b-4 ${isSelected ? 'border-black/10' : 'border-transparent active:border-b-0 active:translate-y-1'}`}
                  >
                    {type.ko}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 shadow-inner">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest">분석 결과</h4>
                  <span className="text-[10px] font-black bg-poke-dark text-white px-2 py-0.5 rounded-full">COVERAGE: {coveredCount}/18</span>
               </div>
               
               <div className="grid grid-cols-3 gap-2">
                  {types.map(type => (
                     <div 
                        key={type.name} 
                        className={`p-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-500 ${results[type.name] ? 'bg-white shadow-sm scale-100 opacity-100' : 'bg-gray-200/50 grayscale opacity-30 scale-95'}`}
                     >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: type.color }}></span>
                        <span className="text-[10px] font-black uppercase">{type.ko}</span>
                        {results[type.name] && <Swords size={8} className="text-poke-red" />}
                     </div>
                  ))}
               </div>

               {selectedMoveTypes.length > 0 && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-2xl border-2 border-dashed border-orange-200 animate-in fade-in">
                     <p className="text-xs font-bold text-gray-600 leading-relaxed italic text-center">
                        "{selectedMoveTypes.length}개의 기술 타입으로 총 {coveredCount}개의 타입을 효과적으로(x2.0 이상) 견제할 수 있습니다."
                     </p>
                  </div>
               )}
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
           <p className="text-[10px] font-bold text-gray-500">
              💡 팁: '스텔스록'이나 '독압정' 등 장판 기술을 쓰기 전에, 우리 팀이 상대의 어떤 타입을 주로 견제할 수 있는지 미리 파악하는 것이 중요합니다.
           </p>
        </div>
      </div>
    </div>
  );
};

export default CoverageHeatmap;
