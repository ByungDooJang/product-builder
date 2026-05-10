import React, { useState } from 'react';
import { ShieldAlert, ChevronLeft, Swords, ShieldCheck } from 'lucide-react';

interface TypeMatchupProps {
  onBack: () => void;
}

const types = [
  { name: 'Normal', ko: '노말', color: '#A8A77A' },
  { name: 'Fire', ko: '불꽃', color: '#EE8130' },
  { name: 'Water', ko: '물', color: '#6390F0' },
  { name: 'Electric', ko: '전기', color: '#F7D02C' },
  { name: 'Grass', ko: '풀', color: '#7AC74C' },
  { name: 'Ice', ko: '얼음', color: '#96D9D6' },
  { name: 'Fighting', ko: '격투', color: '#C22E28' },
  { name: 'Poison', ko: '독', color: '#A33EA1' },
  { name: 'Ground', ko: '땅', color: '#E2BF65' },
  { name: 'Flying', ko: '비행', color: '#A98FF3' },
  { name: 'Psychic', ko: '에스퍼', color: '#F95587' },
  { name: 'Bug', ko: '벌레', color: '#A6B91A' },
  { name: 'Rock', ko: '바위', color: '#B6A136' },
  { name: 'Ghost', ko: '고스트', color: '#735797' },
  { name: 'Dragon', ko: '드래곤', color: '#6F35FC' },
  { name: 'Steel', ko: '강철', color: '#B7B7CE' },
  { name: 'Fairy', ko: '페어리', color: '#D685AD' },
  { name: 'Dark', ko: '악', color: '#705746' },
];

const matchupData: Record<string, { double: string[], half: string[], zero: string[] }> = {
  'Normal': { double: ['Fighting'], half: [], zero: ['Ghost'] },
  'Fire': { double: ['Water', 'Ground', 'Rock'], half: ['Fire', 'Grass', 'Ice', 'Bug', 'Steel', 'Fairy'], zero: [] },
  'Water': { double: ['Electric', 'Grass'], half: ['Fire', 'Water', 'Ice', 'Steel'], zero: [] },
  'Electric': { double: ['Ground'], half: ['Electric', 'Flying', 'Steel'], zero: [] },
  'Grass': { double: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'], half: ['Water', 'Electric', 'Grass', 'Ground'], zero: [] },
  'Ice': { double: ['Fire', 'Fighting', 'Rock', 'Steel'], half: ['Ice'], zero: [] },
  'Fighting': { double: ['Flying', 'Psychic', 'Fairy'], half: ['Bug', 'Rock', 'Dark'], zero: [] },
  'Poison': { double: ['Ground', 'Psychic'], half: ['Grass', 'Fighting', 'Poison', 'Bug', 'Fairy'], zero: [] },
  'Ground': { double: ['Water', 'Grass', 'Ice'], half: ['Poison', 'Rock'], zero: ['Electric'] },
  'Flying': { double: ['Electric', 'Ice', 'Rock'], half: ['Grass', 'Fighting', 'Bug'], zero: ['Ground'] },
  'Psychic': { double: ['Bug', 'Ghost', 'Dark'], half: ['Fighting', 'Psychic'], zero: [] },
  'Bug': { double: ['Fire', 'Flying', 'Rock'], half: ['Grass', 'Fighting', 'Ground'], zero: [] },
  'Rock': { double: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'], half: ['Normal', 'Fire', 'Poison', 'Flying'], zero: [] },
  'Ghost': { double: ['Ghost', 'Dark'], half: ['Poison', 'Bug'], zero: ['Normal', 'Fighting'] },
  'Dragon': { double: ['Ice', 'Dragon', 'Fairy'], half: ['Fire', 'Water', 'Electric', 'Grass'], zero: [] },
  'Steel': { double: ['Fire', 'Fighting', 'Ground'], half: ['Normal', 'Grass', 'Ice', 'Flying', 'Psychic', 'Bug', 'Rock', 'Dragon', 'Steel', 'Fairy'], zero: ['Poison'] },
  'Fairy': { double: ['Poison', 'Steel'], half: ['Fighting', 'Bug', 'Dark'], zero: ['Dragon'] },
  'Dark': { double: ['Fighting', 'Bug', 'Fairy'], half: ['Ghost', 'Dark'], zero: ['Psychic'] },
};

const TypeMatchup: React.FC<TypeMatchupProps> = ({ onBack }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleType = (typeName: string) => {
    if (selectedTypes.includes(typeName)) {
      setSelectedTypes(selectedTypes.filter(t => t !== typeName));
    } else if (selectedTypes.length < 2) {
      setSelectedTypes([...selectedTypes, typeName]);
    }
  };

  const calculateMatchups = () => {
    const scores: Record<string, number> = {};
    types.forEach(t => scores[t.name] = 1);

    selectedTypes.forEach(typeName => {
      const data = matchupData[typeName];
      data.double.forEach(t => scores[t] *= 2);
      data.half.forEach(t => scores[t] *= 0.5);
      data.zero.forEach(t => scores[t] *= 0);
    });

    return scores;
  };

  const results = calculateMatchups();
  const weaknesses = Object.entries(results).filter(([_, score]) => score > 1).sort((a, b) => b[1] - a[1]);
  const resistances = Object.entries(results).filter(([_, score]) => score < 1 && score > 0).sort((a, b) => a[1] - b[1]);
  const immunities = Object.entries(results).filter(([_, score]) => score === 0);

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight"
      >
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-yellow shadow-[0_12px_0_0_rgba(255,203,5,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-poke-yellow p-3 rounded-2xl text-poke-dark shadow-lg">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">타입 상성 체크</h2>
            <p className="text-gray-500 font-bold">포켓몬의 약점과 강점을 분석하세요!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Type Selection */}
          <div>
            <h3 className="text-sm font-black uppercase mb-4 text-gray-400 tracking-widest italic">타입 선택 (최대 2개)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2">
              {types.map(type => {
                const isSelected = selectedTypes.includes(type.name);
                return (
                  <button
                    key={type.name}
                    onClick={() => toggleType(type.name)}
                    style={{ 
                      backgroundColor: isSelected ? type.color : '#f3f4f6',
                      color: isSelected ? 'white' : '#6b7280',
                      borderColor: isSelected ? 'rgba(0,0,0,0.1)' : 'transparent'
                    }}
                    className={`p-3 rounded-xl font-black text-xs uppercase transition-all border-b-4 active:border-b-0 active:translate-y-1 shadow-sm`}
                  >
                    {type.ko}
                  </button>
                );
              })}
            </div>
            {selectedTypes.length === 0 && (
              <p className="mt-6 text-center text-gray-400 font-bold italic animate-pulse">
                타입을 선택하여 분석을 시작하세요.
              </p>
            )}
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {selectedTypes.length > 0 && (
              <>
                {/* Weaknesses */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black uppercase mb-3 text-poke-red">
                    <Swords size={16} /> 약점 (데미지 많이 받음)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {weaknesses.map(([name, score]) => {
                      const type = types.find(t => t.name === name);
                      return (
                        <div key={name} style={{ backgroundColor: type?.color }} className="px-3 py-1 rounded-full text-white text-xs font-black shadow-sm flex items-center gap-2">
                          {type?.ko} <span className="bg-white/20 px-1.5 rounded">x{score}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resistances */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black uppercase mb-3 text-green-600">
                    <ShieldCheck size={16} /> 반감 (데미지 적게 받음)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resistances.map(([name, score]) => {
                      const type = types.find(t => t.name === name);
                      return (
                        <div key={name} style={{ backgroundColor: type?.color }} className="px-3 py-1 rounded-full text-white text-xs font-black shadow-sm flex items-center gap-2">
                          {type?.ko} <span className="bg-white/20 px-1.5 rounded">x{score}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Immunities */}
                {immunities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase mb-3 text-gray-400 italic">무효 (데미지 없음)</h3>
                    <div className="flex flex-wrap gap-2">
                      {immunities.map(([name]) => {
                        const type = types.find(t => t.name === name);
                        return (
                          <div key={name} style={{ backgroundColor: type?.color }} className="px-3 py-1 rounded-full text-white text-xs font-black shadow-sm flex items-center gap-2">
                            {type?.ko} <span className="bg-white/20 px-1.5 rounded">x0</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeMatchup;
