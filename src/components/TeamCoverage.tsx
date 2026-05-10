import React, { useState, useEffect } from 'react';
import { Users, ChevronLeft, Search, Loader2, Plus, X, AlertTriangle, Share2, FileDown } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'defense' | 'offense'>('defense');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  // Unicode safe Base64
  const toBase64 = (str: string) => btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
  const fromBase64 = (str: string) => decodeURIComponent(Array.prototype.map.call(atob(str), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#team=')) {
      try { 
        const encoded = hash.split('#team=')[1];
        setTeam(JSON.parse(fromBase64(encoded))); 
        window.history.replaceState(null, '', window.location.pathname); 
      } catch (e) {
        console.error("Link parse error", e);
      }
    } else {
      const saved = localStorage.getItem('poke_team');
      if (saved) setTeam(JSON.parse(saved));
    }
  }, []);

  useEffect(() => { localStorage.setItem('poke_team', JSON.stringify(team)); }, [team]);

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
    if (team.length >= 6) { alert('최대 6마리!'); return; }
    setIsSearching(true);
    setSearchTerm('');
    setSuggestions([]);
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${p.name.toLowerCase()}`);
      const newMember: TeamMember = {
        id: Date.now().toString() + Math.random(),
        name: p.name,
        koName: p.koName || Object.keys(pokemonNameMap).find(key => pokemonNameMap[key] === p.name.toLowerCase()),
        types: res.data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
        sprite: res.data.sprites.front_default
      };
      setTeam(prev => [...prev, newMember].slice(0, 6));
    } catch (e) { console.error(e); }
    finally { setIsSearching(false); }
  };

  const handleImport = async () => {
    const names = importText.split('\n').filter(line => line.includes('@') || line.trim()).map(line => line.split(' ')[0].split('(')[0].trim());
    const uniqueNames = Array.from(new Set(names)).slice(0, 6);
    setTeam([]);
    setShowImport(false);
    for (const name of uniqueNames) {
       await addPokemon({ name });
    }
    setImportText('');
  };

  const removePokemon = (id: string) => setTeam(team.filter(m => m.id !== id));

  const calculateDefense = () => {
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

  const calculateOffense = () => {
    const coverage: Record<string, number> = {};
    types.forEach(t => coverage[t.name] = 0);
    team.forEach(member => {
      member.types.forEach(mType => {
        const data = typeMatchups[mType];
        if (!data) return;
        data.double.forEach(targetType => coverage[targetType]++);
      });
    });
    return coverage;
  };

  const shareTeam = () => {
    const encoded = toBase64(JSON.stringify(team));
    const url = `${window.location.origin}${window.location.pathname}#team=${encoded}`;
    if (navigator.share) navigator.share({ title: '나의 파티', url });
    else { navigator.clipboard.writeText(url); alert('링크 복사 완료!'); }
  };

  const defResults = calculateDefense();
  const offResults = calculateOffense();

  return (
    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase"><ChevronLeft size={20} /> 메뉴</button>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="bg-gray-700 text-white px-4 py-2 rounded-full font-black text-xs uppercase italic flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-lg"><FileDown size={16} /> Import</button>
          {team.length > 0 && <button onClick={shareTeam} className="bg-poke-blue text-white px-4 py-2 rounded-full font-black text-xs uppercase italic flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"><Share2 size={16} /> 공유</button>}
        </div>
      </div>

      {showImport && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md border-8 border-poke-red">
               <h3 className="text-xl font-black text-poke-dark uppercase italic mb-4">Showdown Import</h3>
               <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Showdown 텍스트를 붙여넣으세요..." className="w-full h-40 bg-gray-100 p-4 rounded-xl font-bold text-sm outline-none border-2 border-transparent focus:border-poke-red transition-all mb-4" />
               <div className="flex gap-2">
                  <button onClick={handleImport} className="flex-1 py-3 bg-poke-red text-white font-black rounded-xl uppercase italic shadow-lg">가져오기</button>
                  <button onClick={() => setShowImport(false)} className="px-6 py-3 bg-gray-200 text-gray-500 font-black rounded-xl uppercase italic">취소</button>
               </div>
            </div>
         </div>
      )}

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-red shadow-[0_12px_0_0_rgba(238,21,21,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-poke-red p-3 rounded-2xl text-white shadow-lg"><Users size={32} /></div>
          <div><h2 className="text-3xl font-black uppercase tracking-tighter">파티 분석기</h2><p className="text-gray-500 font-bold italic">Persistence & Showdown Import Active!</p></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8">
             <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="포켓몬 검색 (자동 저장)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border-4 border-transparent focus:border-poke-red outline-none p-4 pl-12 rounded-2xl font-bold transition-all shadow-inner" />
                {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-poke-red" size={20} />}
                {suggestions.length > 0 && (
                  <div className="absolute z-30 w-full mt-2 bg-white border-4 border-poke-red rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
                    {suggestions.map(p => (
                      <button key={p.name} onClick={() => addPokemon(p)} className="w-full p-4 text-left hover:bg-yellow-50 font-bold capitalize flex justify-between border-b border-gray-100">
                        <span>{p.koName || p.name}</span><Plus size={20} className="text-poke-red" />
                      </button>
                    ))}
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {team.map(m => (
                   <div key={m.id} className="relative bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 flex flex-col items-center group animate-in zoom-in">
                      <button onClick={() => removePokemon(m.id)} className="absolute -top-2 -right-2 bg-white text-gray-400 rounded-full p-1 shadow-md border border-gray-100 transition-colors z-10"><X size={16} /></button>
                      <img src={m.sprite} className="w-20 h-20 object-contain mb-2" />
                      <span className="font-black text-[10px] text-center capitalize">{m.koName || m.name}</span>
                   </div>
                ))}
                {[...Array(6 - team.length)].map((_, i) => (
                   <div key={i} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl min-h-[140px] flex items-center justify-center opacity-40 font-bold text-gray-400 italic text-xs">Empty</div>
                ))}
             </div>
          </div>

          <div className="lg:col-span-4 bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
             <div className="flex gap-2 mb-6">
                <button onClick={() => setActiveTab('defense')} className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'defense' ? 'bg-poke-red text-white shadow-md scale-105' : 'bg-white text-gray-400 border border-gray-200'}`}>방어</button>
                <button onClick={() => setActiveTab('offense')} className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'offense' ? 'bg-poke-blue text-white shadow-md scale-105' : 'bg-white text-gray-400 border border-gray-200'}`}>공격</button>
             </div>
             <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {types.map(t => {
                   const val = activeTab === 'defense' ? defResults.weaknesses[t.name] : offResults[t.name];
                   const resVal = activeTab === 'defense' ? defResults.resistances[t.name] : 0;
                   if (val === 0 && resVal === 0) return null;
                   return (
                      <div key={t.name} className="bg-white p-2 rounded-xl border border-gray-100 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></span>
                            <span className="font-black text-[10px] uppercase">{t.ko}</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className={`text-[9px] font-black ${activeTab === 'defense' ? (val >= 3 ? 'text-red-500 animate-pulse' : 'text-gray-400') : (val > 0 ? 'text-blue-500' : 'text-gray-300')}`}>{activeTab === 'defense' ? `약점: ${val}` : `견제: ${val}`}</span>
                            {activeTab === 'defense' && <span className="text-[9px] font-black text-green-500">반감: {resVal}</span>}
                         </div>
                      </div>
                   );
                })}
                {team.length === 0 && <p className="text-center py-10 text-xs text-gray-400 italic">파티를 구성하세요.</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCoverage;
