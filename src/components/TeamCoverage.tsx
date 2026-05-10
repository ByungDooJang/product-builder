import React, { useState, useEffect } from 'react';
import { Users, ChevronLeft, Search, Loader2, Plus, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { pokemonNameMap } from '../data/pokemonNames';

interface TeamCoverageProps {
  onBack: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  koName?: string;
  types: string[];
  sprite: string;
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

const TeamCoverage: React.FC<TeamCoverageProps> = ({ onBack }) => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchSuggestions = async () => {
    if (searchTerm.length < 1) { setSuggestions([]); return; }
    const koMatches = Object.entries(pokemonNameMap).filter(([ko]) => ko.includes(searchTerm)).map(([ko, en]) => ({ name: en, koName: ko }));
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const enMatches = response.data.results.filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p: any) => ({ name: p.name }));
      const combinedMap = new Map();
      [...koMatches, ...enMatches].forEach(p => { if (!combinedMap.has(p.name)) combinedMap.set(p.name, p); else if (p.koName) combinedMap.set(p.name, p); });
      setSuggestions(Array.from(combinedMap.values()).slice(0, 5));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const addPokemon = async (p: any) => {
    if (team.length >= 6) { alert('최대 6마리까지 등록 가능합니다.'); return; }
    setIsSearching(true);
    setSearchTerm('');
    setSuggestions([]);
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${p.name}`);
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: p.name,
        koName: p.koName,
        types: res.data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
        sprite: res.data.sprites.front_default
      };
      setTeam([...team, newMember]);
    } catch (e) { alert('데이터 로딩 실패'); }
    finally { setIsSearching(false); }
  };

  const removePokemon = (id: string) => setTeam(team.filter(m => m.id !== id));

  const calculateCoverage = () => {
    const weaknesses: Record<string, number> = {};
    const resistances: Record<string, number> = {};
    types.forEach(t => { weaknesses[t.name] = 0; resistances[t.name] = 0; });

    team.forEach(member => {
      types.forEach(type => {
        let score = 1;
        member.types.forEach(mType => {
          const data = typeMatchups[mType];
          if (data.double.includes(type.name)) score *= 2;
          if (data.half.includes(type.name)) score *= 0.5;
          if (data.zero.includes(type.name)) score *= 0;
        });
        if (score > 1) weaknesses[type.name]++;
        if (score < 1) resistances[type.name]++;
      });
    });

    return { weaknesses, resistances };
  };

  const coverage = calculateCoverage();

  return (
    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-red shadow-[0_12px_0_0_rgba(238,21,21,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-poke-red p-3 rounded-2xl text-white shadow-lg"><Users size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">파티 상성 분석기</h2>
            <p className="text-gray-500 font-bold">우리 파티의 약점은 무엇일까요?</p>
          </div>
        </div>

        {/* Team List & Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
             <div className="relative mb-6">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                   <input type="text" placeholder="포켓몬을 검색하여 파티에 추가하세요..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border-4 border-transparent focus:border-poke-red outline-none p-4 pl-12 rounded-2xl font-bold transition-all shadow-inner" />
                   {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-poke-red" size={20} />}
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute z-30 w-full mt-2 bg-white border-4 border-poke-red rounded-xl shadow-2xl overflow-hidden">
                    {suggestions.map(p => (
                      <button key={p.name} onClick={() => addPokemon(p)} className="w-full p-4 text-left hover:bg-gray-50 font-bold capitalize flex justify-between border-b last:border-none border-gray-100">
                         <span>{p.koName || p.name}</span>
                         <Plus size={20} className="text-poke-red" />
                      </button>
                    ))}
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {team.map(member => (
                   <div key={member.id} className="relative bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 flex flex-col items-center group animate-in zoom-in duration-300">
                      <button onClick={() => removePokemon(member.id)} className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-poke-red rounded-full p-1 shadow-md border border-gray-100 transition-colors z-10"><X size={16} /></button>
                      <img src={member.sprite} alt={member.name} className="w-20 h-20 object-contain mb-2" />
                      <span className="font-black text-xs text-center capitalize">{member.koName || member.name}</span>
                      <div className="flex gap-1 mt-1">
                         {member.types.map(t => (
                            <span key={t} className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: types.find(type => type.name === t)?.color }}>{t}</span>
                         ))}
                      </div>
                   </div>
                ))}
                {[...Array(6 - team.length)].map((_, i) => (
                   <div key={i} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center min-h-[140px] opacity-40 italic font-bold text-gray-400">Empty</div>
                ))}
             </div>
          </div>

          {/* Aggregate Analysis */}
          <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
             <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2 tracking-widest text-poke-red">
                <AlertTriangle size={18} /> 타입별 취약도 (약점 수)
             </h3>
             <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {types.map(type => {
                   const count = coverage.weaknesses[type.name];
                   const resCount = coverage.resistances[type.name];
                   if (count === 0 && resCount === 0) return null;
                   return (
                      <div key={type.name} className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                         <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></span>
                            <span className="font-black text-xs uppercase italic">{type.ko}</span>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                               <span className={`text-[10px] font-black ${count >= 3 ? 'text-red-500' : 'text-gray-400'}`}>Weak: {count}</span>
                               <span className="text-[10px] font-black text-green-500">Res: {resCount}</span>
                            </div>
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-red-400" style={{ width: `${(count / 6) * 100}%` }}></div>
                            </div>
                         </div>
                      </div>
                   );
                })}
                {team.length === 0 && <p className="text-xs text-gray-400 italic text-center py-10">포켓몬을 추가하면 파티의 <br/>총평이 나타납니다.</p>}
             </div>
          </div>
        </div>

        {/* Strategy Tip */}
        <div className="p-4 bg-red-50 rounded-2xl border-2 border-dashed border-poke-red/20">
           <p className="text-xs font-bold text-gray-600 leading-relaxed">
             💡 팁: 동일한 타입에 대한 약점이 3마리 이상일 경우 위험합니다! 반감(Resist) 타입을 보충하여 밸런스를 맞추세요.
           </p>
        </div>
      </div>
    </div>
  );
};

export default TeamCoverage;
