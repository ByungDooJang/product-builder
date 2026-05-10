import React, { useState, useEffect } from 'react';
import { Users, ChevronLeft, Search, Loader2, Plus, X, AlertTriangle, Share2, Copy } from 'lucide-react';
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

  // Load from URL or localStorage on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#team=')) {
      try {
        const encoded = hash.split('#team=')[1];
        const decoded = JSON.parse(atob(encoded));
        setTeam(decoded);
        // Clean hash
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {
        console.error("Failed to parse shared team", e);
      }
    } else {
      const savedTeam = localStorage.getItem('poke_team');
      if (savedTeam) setTeam(JSON.parse(savedTeam));
    }
  }, []);

  // Save to localStorage when team changes
  useEffect(() => {
    localStorage.setItem('poke_team', JSON.stringify(team));
  }, [team]);

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

  const shareTeam = () => {
    if (team.length === 0) return;
    const names = team.map(m => m.koName || m.name).join(', ');
    const encodedData = btoa(JSON.stringify(team));
    const shareUrl = `${window.location.origin}${window.location.pathname}#team=${encodedData}`;
    const text = `나의 포켓몬 파티 분석 결과: [${names}] 파티의 상성을 확인해보세요!`;
    
    if (navigator.share) {
      navigator.share({ title: '나의 포켓몬 파티', text, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${text} ${shareUrl}`);
      alert('공유 링크가 클립보드에 복사되었습니다!');
    }
  };

  const calculateCoverage = () => {
    const weaknesses: Record<string, number> = {};
    const resistances: Record<string, number> = {};
    types.forEach(t => { weaknesses[t.name] = 0; resistances[t.name] = 0; });

    team.forEach(member => {
      types.forEach(type => {
        let score = 1;
        member.types.forEach(mType => {
          const data = typeMatchups[mType];
          if (!data) return;
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
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
          <ChevronLeft size={20} /> 메뉴로 돌아가기
        </button>
        {team.length > 0 && (
          <button onClick={shareTeam} className="flex items-center gap-2 bg-poke-blue text-white px-4 py-2 rounded-full font-black text-xs uppercase italic hover:scale-105 transition-transform shadow-lg">
            <Share2 size={16} /> 파티 공유하기
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-red shadow-[0_12px_0_0_rgba(238,21,21,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-poke-red p-3 rounded-2xl text-white shadow-lg"><Users size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">파티 상성 분석기</h2>
            <p className="text-gray-500 font-bold italic">Dynamic Link Sharing Enabled!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
             <div className="relative mb-6">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                   <input type="text" placeholder="포켓몬 검색하여 파티 구성 (자동 저장됨)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border-4 border-transparent focus:border-poke-red outline-none p-4 pl-12 rounded-2xl font-bold transition-all shadow-inner" />
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
                      <span className="font-black text-[10px] text-center capitalize">{member.koName || member.name}</span>
                      <div className="flex gap-1 mt-1">
                         {member.types.map(t => (
                            <span key={t} className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: types.find(type => type.name === t)?.color }}>{t}</span>
                         ))}
                      </div>
                   </div>
                ))}
                {[...Array(6 - team.length)].map((_, i) => (
                   <div key={i} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center min-h-[140px] opacity-40 italic font-bold text-gray-400">Empty Slot</div>
                ))}
             </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
             <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2 tracking-widest text-poke-red">
                <AlertTriangle size={18} /> 파티 약점 집계
             </h3>
             <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {types.map(type => {
                   const count = coverage.weaknesses[type.name];
                   const resCount = coverage.resistances[type.name];
                   if (count === 0 && resCount === 0) return null;
                   return (
                      <div key={type.name} className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }}></span>
                            <span className="font-black text-[10px] uppercase italic">{type.ko}</span>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                               <span className={`text-[9px] font-black ${count >= 3 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>Weak: {count}</span>
                               <span className="text-[9px] font-black text-green-500">Res: {resCount}</span>
                            </div>
                         </div>
                      </div>
                   );
                })}
                {team.length === 0 && <p className="text-xs text-gray-400 italic text-center py-10">포켓몬을 추가하면 <br/>파티 분석이 시작됩니다.</p>}
             </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-dashed border-poke-yellow/30">
           <p className="text-xs font-bold text-gray-600 leading-relaxed">
             💡 팁: 공유하기를 사용하면 현재 구성한 파티 링크를 생성합니다. 상대방도 내가 만든 파티 구성을 즉시 볼 수 있습니다.
           </p>
        </div>
      </div>
    </div>
  );
};

export default TeamCoverage;
