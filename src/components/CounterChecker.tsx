import React, { useState, useEffect } from 'react';
import { Search, Loader2, ChevronLeft, Swords, ShieldAlert, Zap, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { pokemonNameMap } from '../data/pokemonNames';

interface CounterCheckerProps {
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

const typeMatchups: Record<string, { double: string[], half: string[], zero: string[] }> = {
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

const CounterChecker: React.FC<CounterCheckerProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);

  const fetchSuggestions = async () => {
    if (searchTerm.length < 1) { setSuggestions([]); return; }
    const koMatches = Object.entries(pokemonNameMap).filter(([ko]) => ko.includes(searchTerm)).map(([ko, en]) => ({ name: en, koName: ko }));
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const enMatches = response.data.results.filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p: any) => ({ name: p.name }));
      const combinedMap = new Map();
      [...koMatches, ...enMatches].forEach(p => { if (!combinedMap.has(p.name)) combinedMap.set(p.name, p); else if (p.koName) combinedMap.set(p.name, p); });
      setSuggestions(Array.from(combinedMap.values()).slice(0, 5));
    } catch (e) {}
  };

  useEffect(() => {
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const selectPokemon = async (p: any) => {
    setIsSearching(true);
    setSearchTerm(p.koName || p.name);
    setSuggestions([]);
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${p.name.toLowerCase()}`);
      const data = {
        name: p.name,
        koName: p.koName,
        sprite: res.data.sprites.other['official-artwork'].front_default,
        types: res.data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
      };
      setSelectedPokemon(data);
    } catch (e) {}
    finally { setIsSearching(false); }
  };

  const getWeaknesses = () => {
    if (!selectedPokemon) return [];
    const scores: Record<string, number> = {};
    types.forEach(t => scores[t.name] = 1);
    selectedPokemon.types.forEach((typeName: string) => {
      const data = typeMatchups[typeName];
      data.double.forEach(t => scores[t] *= 2);
      data.half.forEach(t => scores[t] *= 0.5);
      data.zero.forEach(t => scores[t] *= 0);
    });
    return Object.entries(scores).filter(([_, s]) => s > 1).sort((a, b) => b[1] - a[1]);
  };

  const weaknesses = getWeaknesses();

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-cyan-500 shadow-[0_12px_0_0_rgba(6,182,212,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-cyan-500 p-3 rounded-2xl text-white shadow-lg"><ShieldAlert size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">카운터 분석기</h2>
            <p className="text-gray-500 font-bold">어떤 포켓몬으로 상대해야 할까요?</p>
          </div>
        </div>

        <div className="relative mb-12">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <input type="text" placeholder="분석할 포켓몬 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border-4 border-transparent focus:border-cyan-500 outline-none p-4 pl-12 rounded-2xl font-bold transition-all shadow-inner text-lg" />
           {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-cyan-500" size={20} />}
           {suggestions.length > 0 && (
             <div className="absolute z-30 w-full mt-2 bg-white border-4 border-cyan-500 rounded-xl shadow-2xl overflow-hidden">
               {suggestions.map(p => (
                 <button key={p.name} onClick={() => selectPokemon(p)} className="w-full p-4 text-left hover:bg-cyan-50 font-bold capitalize flex justify-between border-b border-gray-100">
                   <span>{p.koName || p.name}</span><Zap size={18} className="text-cyan-500" />
                 </button>
               ))}
             </div>
           )}
        </div>

        {selectedPokemon ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in zoom-in duration-300">
              <div className="flex flex-col items-center gap-4">
                 <div className="relative">
                    <div className="absolute inset-0 bg-cyan-100 rounded-full blur-2xl opacity-50"></div>
                    <img src={selectedPokemon.sprite} className="w-64 h-64 object-contain relative z-10 drop-shadow-xl" />
                 </div>
                 <div className="text-center">
                    <h3 className="text-3xl font-black uppercase italic">{selectedPokemon.koName || selectedPokemon.name}</h3>
                    <div className="flex gap-2 justify-center mt-2">
                       {selectedPokemon.types.map((t: string) => (
                          <span key={t} className="px-3 py-1 rounded-full text-white text-[10px] font-black uppercase" style={{ backgroundColor: types.find(x => x.name === t)?.color }}>{t}</span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <h4 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-widest flex items-center gap-2 italic"><Swords size={14}/> 공략 포인트 (약점 타입)</h4>
                    <div className="flex flex-wrap gap-2">
                       {weaknesses.map(([name, score]) => {
                          const type = types.find(x => x.name === name);
                          return (
                             <div key={name} style={{ backgroundColor: type?.color }} className="px-4 py-2 rounded-xl text-white font-black text-sm shadow-md flex items-center gap-2 hover:scale-105 transition-transform">
                                {type?.ko} <span className="bg-white/20 px-1.5 rounded">x{score}</span>
                             </div>
                          );
                       })}
                    </div>
                 </div>

                 <div className="bg-cyan-50 p-6 rounded-3xl border-2 border-dashed border-cyan-200">
                    <h4 className="text-xs font-black uppercase text-cyan-600 mb-3 flex items-center gap-2 italic"><TrendingUp size={14}/> 추천 전략</h4>
                    <p className="text-sm font-bold text-gray-600 leading-relaxed italic">
                       "{selectedPokemon.koName || selectedPokemon.name}은(는) {weaknesses[0]?.[0]} 타입에 특히 취약합니다. 해당 타입의 고위력 기술을 가진 포켓몬을 선봉으로 내보내는 전략을 추천합니다."
                    </p>
                 </div>
              </div>
           </div>
        ) : (
           <div className="py-20 text-center opacity-30 italic font-bold text-gray-400">포켓몬을 검색하여 카운터 분석을 시작하세요.</div>
        )}
      </div>
    </div>
  );
};

export default CounterChecker;
