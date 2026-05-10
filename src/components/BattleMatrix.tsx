import React, { useState, useEffect } from 'react';
import { ChevronLeft, Grid, Swords, Search, Loader2, Zap, X, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { pokemonNameMap } from '../data/pokemonNames';

interface BattleMatrixProps {
  onBack: () => void;
}

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

const BattleMatrix: React.FC<BattleMatrixProps> = ({ onBack }) => {
  const [myTeam, setMyTeam] = useState<any[]>([]);
  const [oppTeam, setOppTeam] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSide, setActiveSide] = useState<'my' | 'opp'>('my');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('poke_team');
    if (saved) setMyTeam(JSON.parse(saved).slice(0, 4)); // Default to current team
  }, []);

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

  const addPokemon = async (p: any) => {
    const target = activeSide === 'my' ? myTeam : oppTeam;
    if (target.length >= 4) return;
    setIsSearching(true);
    setSearchTerm('');
    setSuggestions([]);
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${p.name.toLowerCase()}`);
      const newMember = {
        name: p.name,
        koName: p.koName,
        sprite: res.data.sprites.front_default,
        types: res.data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
        speed: res.data.stats.find((s: any) => s.stat.name === 'speed').base_stat
      };
      if (activeSide === 'my') setMyTeam([...myTeam, newMember]);
      else setOppTeam([...oppTeam, newMember]);
    } catch (e) {}
    finally { setIsSearching(false); }
  };

  const getMatchupScore = (my: any, opp: any) => {
    let score = 0; // Negative means My wins, Positive means Opp wins
    
    // Type checking
    my.types.forEach((myType: string) => {
       opp.types.forEach((oppType: string) => {
          if (typeMatchups[myType].double.includes(oppType)) score += 1;
          if (typeMatchups[oppType].double.includes(myType)) score -= 1;
       });
    });

    // Speed checking
    if (my.speed > opp.speed) score -= 0.5;
    else if (opp.speed > my.speed) score += 0.5;

    return score;
  };

  return (
    <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-red-500 shadow-[0_12px_0_0_rgba(239,68,68,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg"><Grid size={32} /></div>
          <div><h2 className="text-3xl font-black uppercase tracking-tighter">배틀 매트릭스</h2><p className="text-gray-500 font-bold">1:1 상성 우위 비교 분석</p></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
           {/* Team Selection */}
           <div className="lg:col-span-4 space-y-6">
              <div className="flex gap-2">
                 <button onClick={() => setActiveSide('my')} className={`flex-1 py-2 rounded-xl font-black text-xs uppercase transition-all ${activeSide === 'my' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>MY TEAM ({myTeam.length}/4)</button>
                 <button onClick={() => setActiveSide('opp')} className={`flex-1 py-2 rounded-xl font-black text-xs uppercase transition-all ${activeSide === 'opp' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>OPP TEAM ({oppTeam.length}/4)</button>
              </div>
              <div className="relative">
                 <input type="text" placeholder="포켓몬 검색..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-red-500 font-bold outline-none" />
                 {suggestions.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-white border-4 border-red-500 rounded-xl shadow-xl overflow-hidden">
                       {suggestions.map(p => (<button key={p.name} onClick={() => addPokemon(p)} className="w-full p-2 text-left hover:bg-red-50 font-bold border-b border-gray-100 flex justify-between"><span>{p.koName || p.name}</span><Plus size={16}/></button>))}
                    </div>
                 )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                 {myTeam.map((m, i) => (<div key={i} className="bg-blue-50 p-2 rounded-xl border border-blue-100 flex items-center gap-2 relative group"><img src={m.sprite} className="w-8 h-8" /><span className="text-[8px] font-black truncate">{m.koName || m.name}</span><button onClick={() => setMyTeam(myTeam.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={10}/></button></div>))}
                 {oppTeam.map((m, i) => (<div key={i} className="bg-red-50 p-2 rounded-xl border border-red-100 flex items-center gap-2 relative group"><img src={m.sprite} className="w-8 h-8" /><span className="text-[8px] font-black truncate">{m.koName || m.name}</span><button onClick={() => setOppTeam(oppTeam.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={10}/></button></div>))}
              </div>
           </div>

           {/* Matrix View */}
           <div className="lg:col-span-8 overflow-x-auto">
              <div className="min-w-[400px]">
                 <div className="flex">
                    <div className="w-20 h-20 border-b-2 border-r-2 border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-300 italic">MY \ OPP</div>
                    {oppTeam.map((m, i) => (<div key={i} className="w-20 h-20 border-b-2 border-gray-100 flex flex-col items-center justify-center bg-red-50/20"><img src={m.sprite} className="w-12 h-12" /><span className="text-[8px] font-black uppercase text-red-400">{m.koName || m.name}</span></div>))}
                 </div>
                 {myTeam.map((my, row) => (
                    <div key={row} className="flex">
                       <div className="w-20 h-20 border-r-2 border-gray-100 flex flex-col items-center justify-center bg-blue-50/20"><img src={my.sprite} className="w-12 h-12" /><span className="text-[8px] font-black uppercase text-blue-400">{my.koName || my.name}</span></div>
                       {oppTeam.map((opp, col) => {
                          const score = getMatchupScore(my, opp);
                          return (
                             <div key={col} className={`w-20 h-20 border border-gray-50 flex items-center justify-center font-black text-xl italic ${score < 0 ? 'text-blue-500 bg-blue-50/10' : score > 0 ? 'text-red-500 bg-red-50/10' : 'text-gray-200'}`}>
                                {score < 0 ? 'WIN' : score > 0 ? 'LOSE' : 'EVEN'}
                             </div>
                          );
                       })}
                    </div>
                 ))}
                 {myTeam.length === 0 && <div className="py-20 text-center text-gray-300 font-bold italic border-2 border-dashed border-gray-100 rounded-3xl mt-4">양측 팀에 포켓몬을 추가하면 배틀 매트릭스가 생성됩니다.</div>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BattleMatrix;
