import React, { useState, useEffect } from 'react';
import { Swords, ChevronLeft, Shield, Target, Search, Loader2, History, CloudSun, Zap as TerrainIcon, HelpCircle, X, ShoppingBag, Wand2, Star } from 'lucide-react';
import axios from 'axios';
import { pokemonNameMap, moveNameMap } from '../data/pokemonNames';

interface DamageCalculatorProps {
  onBack: () => void;
}

interface PokemonData {
  name: string;
  koName?: string;
  sprite?: string;
  types: string[];
}

const types = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Steel', 'Fairy', 'Dark'];

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

const DamageCalculator: React.FC<DamageCalculatorProps> = ({ onBack }) => {
  const [level, setLevel] = useState<number>(50);
  const [moveType, setMoveType] = useState<string>('Normal');
  const [moveCategory, setMoveCategory] = useState<'physical' | 'special'>('physical');
  const [power, setPower] = useState<number>(80);
  
  // Tera System
  const [attackerTera, setAttackerTera] = useState<string>('None');
  const [defenderTera, setDefenderTera] = useState<string>('None');
  const [attackerBaseTypes, setAttackerBaseTypes] = useState<string[]>([]);
  const [defenderBaseTypes, setDefenderBaseTypes] = useState<string[]>([]);

  // Attacker Stats
  const [atkBase, setAtkBase] = useState<number>(100);
  const [atkIv, setAtkIv] = useState<number>(31);
  const [atkEv, setAtkEv] = useState<number>(252);
  const [atkNature, setAtkNature] = useState<number>(1.1);
  const [atkRank, setAtkRank] = useState<number>(0);

  // Defender Stats
  const [defBase, setDefBase] = useState<number>(100);
  const [defIv, setDefIv] = useState<number>(31);
  const [defEv, setDefEv] = useState<number>(0);
  const [defNature, setDefNature] = useState<number>(1.0);
  const [defRank, setDefRank] = useState<number>(0);
  const [hpBase, setHpBase] = useState<number>(100);
  const [hpIv, setHpIv] = useState<number>(31);
  const [hpEv, setHpEv] = useState<number>(0);

  // Modifiers
  const [item, setItem] = useState<string>('none');
  const [ability, setAbility] = useState<string>('none');
  const [weather, setWeather] = useState<'none' | 'sun' | 'rain' | 'sand' | 'snow'>('none');
  const [terrain, setTerrain] = useState<'none' | 'electric' | 'grassy' | 'psychic' | 'misty'>('none');

  const [attackerSprite, setAttackerSprite] = useState<string | null>(null);
  const [defenderSprite, setDefenderSprite] = useState<string | null>(null);
  const [attackerSearch, setAttackerSearch] = useState('');
  const [defenderSearch, setDefenderSearch] = useState('');
  const [moveSearch, setMoveSearch] = useState('');
  const [isSearching, setIsSearching] = useState<'attacker' | 'defender' | 'move' | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSearch, setActiveSearch] = useState<'attacker' | 'defender' | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showNatureRef, setShowNatureRef] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('damage_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const calcStat = (base: number, iv: number, ev: number, nature: number) => Math.floor((Math.floor((base * 2 + iv + Math.floor(ev / 4)) * level / 100) + 5) * nature);
  const calcHp = (base: number, iv: number, ev: number) => base === 1 ? 1 : Math.floor((base * 2 + iv + Math.floor(ev / 4)) * level / 100) + level + 10;

  const finalAtkValue = calcStat(atkBase, atkIv, atkEv, atkNature);
  const finalDefValue = calcStat(defBase, defIv, defEv, defNature);
  const finalHpValue = calcHp(hpBase, hpIv, hpEv);

  const calculateDamage = (random: number) => {
    const getRankMult = (r: number) => r >= 0 ? (2 + r) / 2 : 2 / (2 - r);
    let finalAtk = finalAtkValue * getRankMult(atkRank);
    let finalDef = finalDefValue * getRankMult(defRank);

    if (item === 'life-orb') finalAtk *= 1.3;
    if (item === 'choice-band' && moveCategory === 'physical') finalAtk *= 1.5;
    if (item === 'choice-specs' && moveCategory === 'special') finalAtk *= 1.5;
    if (item === 'expert-belt' && typeEffectiveness > 1) finalAtk *= 1.2;
    if (item === 'assault-vest' && moveCategory === 'special') finalDef *= 1.5;
    if (ability === 'guts') finalAtk *= 1.5;
    if (ability === 'huge-power') finalAtk *= 2.0;

    let baseDamage = (((2 * level / 5 + 2) * power * finalAtk / finalDef) / 50 + 2);
    if ((weather === 'sun' && moveType === 'Fire') || (weather === 'rain' && moveType === 'Water')) baseDamage *= 1.5;
    if ((weather === 'sun' && moveType === 'Water') || (weather === 'rain' && moveType === 'Fire')) baseDamage *= 0.5;
    if (terrain !== 'none') {
       if ((terrain === 'electric' && moveType === 'Electric') || (terrain === 'grassy' && moveType === 'Grass') || (terrain === 'psychic' && moveType === 'Psychic')) baseDamage *= 1.3;
       if (terrain === 'misty' && moveType === 'Dragon') baseDamage *= 0.5;
    }

    // STAB with Tera
    let stab = 1.0;
    const isBaseSTAB = attackerBaseTypes.includes(moveType);
    const isTeraSTAB = attackerTera === moveType;
    
    if (attackerTera === 'None') {
       if (isBaseSTAB) stab = 1.5;
    } else {
       if (isBaseSTAB && isTeraSTAB) stab = 2.0;
       else if (isBaseSTAB || isTeraSTAB) stab = 1.5;
    }

    // Type Effectiveness with Tera
    let effectiveness = 1.0;
    const currentDefTypes = defenderTera === 'None' ? defenderBaseTypes : [defenderTera];
    currentDefTypes.forEach(defType => {
       const data = typeMatchups[defType];
       if (!data) return;
       if (data.double.includes(moveType)) effectiveness *= 2;
       if (data.half.includes(moveType)) effectiveness *= 0.5;
       if (data.zero.includes(moveType)) effectiveness *= 0;
    });

    const critMult = isCritical ? 1.5 : 1.0;
    return Math.floor(baseDamage * stab * effectiveness * critMult * random);
  };

  const minDamage = calculateDamage(0.85);
  const maxDamage = calculateDamage(1.0);
  const minPercent = Math.min(100, Math.floor((minDamage / finalHpValue) * 100));
  const maxPercent = Math.min(100, Math.floor((maxDamage / finalHpValue) * 100));

  const getKOTurns = () => {
    if (minDamage >= finalHpValue) return "확정 1타 (Guaranteed 1HKO)";
    if (maxDamage >= finalHpValue) return "난수 1타 (Chance to 1HKO)";
    if (minDamage * 2 >= finalHpValue) return "확정 2타 (Guaranteed 2HKO)";
    if (maxDamage * 2 >= finalHpValue) return "난수 2타 (Chance to 2HKO)";
    return "3타 이상 (3HKO or more)";
  };

  const fetchSuggestions = async (term: string) => {
    if (term.length < 1) { setSuggestions([]); return; }
    if (activeSearch === 'move') {
       const koMoveMatches = Object.entries(moveNameMap).filter(([ko]) => ko.includes(term)).map(([ko, en]) => ({ name: en, koName: ko }));
       try {
          const res = await axios.get('https://pokeapi.co/api/v2/move?limit=1000');
          const enMatches = res.data.results.filter((m: any) => m.name.toLowerCase().includes(term.toLowerCase())).map((m: any) => ({ name: m.name }));
          setSuggestions([...koMoveMatches, ...enMatches].slice(0, 5));
       } catch (e) {}
       return;
    }
    const koMatches = Object.entries(pokemonNameMap).filter(([ko]) => ko.includes(term)).map(([ko, en]) => ({ name: en, koName: ko }));
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const enMatches = response.data.results.filter((p: any) => p.name.toLowerCase().includes(term.toLowerCase())).map((p: any) => ({ name: p.name }));
      const combinedMap = new Map();
      [...koMatches, ...enMatches].forEach(p => { if (!combinedMap.has(p.name)) combinedMap.set(p.name, p); else if (p.koName) combinedMap.set(p.name, p); });
      setSuggestions(Array.from(combinedMap.values()).slice(0, 5));
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const term = activeSearch === 'attacker' ? attackerSearch : (activeSearch === 'move' ? moveSearch : defenderSearch);
    if (!term) return;
    const timer = setTimeout(() => fetchSuggestions(term), 300);
    return () => clearTimeout(timer);
  }, [attackerSearch, defenderSearch, moveSearch, activeSearch]);

  const selectMove = async (p: any) => {
    setIsSearching('move');
    setActiveSearch(null);
    setMoveSearch(p.koName || p.name);
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/move/${p.name.toLowerCase().replace(/ /g, '-')}`);
      if (res.data.power) setPower(res.data.power);
      const type = res.data.type.name.charAt(0).toUpperCase() + res.data.type.name.slice(1);
      setMoveType(type);
      setMoveCategory(res.data.damage_class.name);
    } catch (e) { alert('실패'); }
    finally { setIsSearching(null); }
  };

  const selectPokemon = async (p: PokemonData, target: 'attacker' | 'defender') => {
    setIsSearching(target);
    setActiveSearch(null);
    if (target === 'attacker') setAttackerSearch(p.koName || p.name);
    else setDefenderSearch(p.koName || p.name);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${p.name}`);
      const stats = response.data.stats;
      const typeList = response.data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
      const spriteUrl = response.data.sprites.front_default;
      if (target === 'attacker') {
        const atk = stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 100;
        const spAtk = stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat || 100;
        setAtkBase(moveCategory === 'physical' ? atk : spAtk);
        setAttackerBaseTypes(typeList);
        setAttackerSprite(spriteUrl);
      } else {
        const def = stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 100;
        const spDef = stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat || 100;
        const hp = stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 100;
        setDefBase(moveCategory === 'physical' ? def : spDef);
        setHpBase(hp);
        setDefenderBaseTypes(typeList);
        setDefenderSprite(spriteUrl);
      }
    } catch (error) { alert('실패'); }
    finally { setIsSearching(null); }
  };

  const saveToHistory = () => {
    const entry = { id: Date.now(), attacker: attackerSearch || '?', defender: defenderSearch || '?', min: minDamage, max: maxDamage };
    const newHistory = [entry, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('damage_history', JSON.stringify(newHistory));
  };

  return (
    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase"><ChevronLeft size={20} /> 메뉴</button>

      {showNatureRef && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg border-8 border-poke-red shadow-2xl">
               <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-poke-dark uppercase italic">성격표</h3><button onClick={() => setShowNatureRef(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button></div>
               <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-100"><p className="font-black text-blue-600 mb-2">스피드 +</p><p>겁쟁이, 명랑, 성급, 천진난만</p></div>
                  <div className="bg-red-50 p-3 rounded-xl border-2 border-red-100"><p className="font-black text-red-600 mb-2">화력 +</p><p>고집, 조심, 용감, 냉정</p></div>
               </div>
            </div>
         </div>
      )}

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-blue shadow-[0_12px_0_0_rgba(59,76,202,1)] text-poke-dark">
        <div className="flex items-center justify-between mb-8 border-b-4 border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-poke-blue p-3 rounded-2xl text-white shadow-lg animate-pulse"><Swords size={32} /></div>
            <div><h2 className="text-3xl font-black uppercase tracking-tighter">데미지 시뮬레이터</h2><p className="text-gray-500 font-bold italic">Terastal Mechanic Supported!</p></div>
          </div>
          <button onClick={() => setShowNatureRef(true)} className="p-2 bg-gray-100 text-gray-400 hover:text-poke-blue rounded-full transition-all hover:rotate-12"><HelpCircle size={24} /></button>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-6 mb-8 border-2 border-gray-100 shadow-inner relative overflow-hidden">
          <div className="z-10 flex flex-col items-center gap-2">
            <div className={`w-24 h-24 bg-white rounded-full border-4 ${attackerTera !== 'None' ? 'border-poke-yellow shadow-[0_0_15px_rgba(255,203,5,0.5)]' : 'border-poke-blue/20'} flex items-center justify-center overflow-hidden`}>
              {attackerSprite ? <img src={attackerSprite} className="w-20 h-20 object-contain scale-x-[-1]" /> : <Target className="text-gray-200" size={40} />}
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase text-poke-blue italic">Attacker</span>
               <select value={attackerTera} onChange={e => setAttackerTera(e.target.value)} className={`text-[9px] font-black p-1 rounded border-2 ${attackerTera !== 'None' ? 'bg-poke-yellow border-poke-yellow text-poke-dark' : 'bg-gray-100 border-gray-200'}`}>
                  <option value="None">테라스탈 OFF</option>{types.map(t => <option key={t} value={t}>Tera: {t}</option>)}
               </select>
            </div>
          </div>
          <div className="z-10 text-poke-red font-black italic text-2xl animate-pulse">VS</div>
          <div className="z-10 flex flex-col items-center gap-2">
            <div className={`w-24 h-24 bg-white rounded-full border-4 ${defenderTera !== 'None' ? 'border-poke-yellow shadow-[0_0_15px_rgba(255,203,5,0.5)]' : 'border-poke-red/20'} flex items-center justify-center overflow-hidden relative`}>
               {defenderSprite ? <img src={defenderSprite} className="w-20 h-20 object-contain" /> : <Shield className="text-gray-200" size={40} />}
               <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-200"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${100 - maxPercent}%` }}></div><div className="h-full bg-yellow-400 absolute top-0 right-0 opacity-50" style={{ width: `${maxPercent - minPercent}%` }}></div></div>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase text-poke-red italic">Defender</span>
               <select value={defenderTera} onChange={e => setDefenderTera(e.target.value)} className={`text-[9px] font-black p-1 rounded border-2 ${defenderTera !== 'None' ? 'bg-poke-yellow border-poke-yellow text-poke-dark' : 'bg-gray-100 border-gray-200'}`}>
                  <option value="None">테라스탈 OFF</option>{types.map(t => <option key={t} value={t}>Tera: {t}</option>)}
               </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <div className="relative"><input type="text" placeholder="기술 검색..." value={moveSearch} onFocus={() => setActiveSearch('move')} onChange={(e) => setMoveSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 rounded-xl font-bold text-xs" />
                   {activeSearch === 'move' && suggestions.length > 0 && (<div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">{suggestions.map(p => (<button key={p.name} onClick={() => selectMove(p)} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px]"><span>{p.koName || p.name}</span></button>))}</div>)}
                 </div>
                 <div className="relative"><input type="text" placeholder="공격자 검색..." value={attackerSearch} onFocus={() => setActiveSearch('attacker')} onChange={(e) => setAttackerSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 rounded-xl font-bold text-xs" />
                   {activeSearch === 'attacker' && suggestions.length > 0 && (<div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">{suggestions.map(p => (<button key={p.name} onClick={() => selectPokemon(p, 'attacker')} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px]"><span>{p.koName || p.name}</span></button>))}</div>)}
                 </div>
                 <div className="relative"><input type="text" placeholder="방어자 검색..." value={defenderSearch} onFocus={() => setActiveSearch('defender')} onChange={(e) => setDefenderSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 rounded-xl font-bold text-xs" />
                   {activeSearch === 'defender' && suggestions.length > 0 && (<div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">{suggestions.map(p => (<button key={p.name} onClick={() => selectPokemon(p, 'defender')} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px]"><span>{p.koName || p.name}</span></button>))}</div>)}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                 <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-poke-blue uppercase italic underline underline-offset-4">Attacker Stats</h3>
                    <div className="grid grid-cols-3 gap-1">
                       <div><label className="text-[8px] font-black text-gray-400 uppercase">Base</label><input type="number" value={atkBase} onChange={e => setAtkBase(Number(e.target.value))} className="w-full p-1 bg-white rounded font-bold text-[10px]" /></div>
                       <div><label className="text-[8px] font-black text-gray-400 uppercase">IV</label><input type="number" value={atkIv} onChange={e => setAtkIv(Number(e.target.value))} className="w-full p-1 bg-white rounded font-bold text-[10px]" /></div>
                       <div><label className="text-[8px] font-black text-gray-400 uppercase">EV</label><input type="number" value={atkEv} onChange={e => setAtkEv(Number(e.target.value))} className="w-full p-1 bg-white rounded font-bold text-[10px]" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <select value={atkNature} onChange={e => setAtkNature(Number(e.target.value))} className="p-1 bg-white rounded font-bold text-[10px] shadow-sm border border-gray-100"><option value={1.1}>상승(+10%)</option><option value={1.0}>보통</option><option value={0.9}>하락(-10%)</option></select>
                       <select value={atkRank} onChange={e => setAtkRank(Number(e.target.value))} className="p-1 bg-white rounded font-bold text-[10px] shadow-sm border border-gray-100">{[6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6].map(r => <option key={r} value={r}>랭크: {r > 0 ? `+${r}` : r}</option>)}</select>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-poke-red uppercase italic underline underline-offset-4">Defender Stats</h3>
                    <div className="grid grid-cols-3 gap-1">
                       <div><label className="text-[8px] font-black text-gray-400 uppercase">Def B</label><input type="number" value={defBase} onChange={e => setDefBase(Number(e.target.value))} className="w-full p-1 bg-white rounded font-bold text-[10px]" /></div>
                       <div><label className="text-[8px] font-black text-gray-400 uppercase">HP B</label><input type="number" value={hpBase} onChange={e => setHpBase(Number(e.target.value))} className="w-full p-1 bg-white rounded font-bold text-[10px]" /></div>
                       <div><label className="text-[8px] font-black text-gray-400 uppercase">EV</label><input type="number" value={defEv} onChange={e => setDefEv(Number(e.target.value))} className="w-full p-1 bg-white rounded font-bold text-[10px]" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <select value={defNature} onChange={e => setDefNature(Number(e.target.value))} className="p-1 bg-white rounded font-bold text-[10px] shadow-sm border border-gray-100"><option value={1.1}>상승(+10%)</option><option value={1.0}>보통</option><option value={0.9}>하락(-10%)</option></select>
                       <select value={defRank} onChange={e => setDefRank(Number(e.target.value))} className="p-1 bg-white rounded font-bold text-[10px] shadow-sm border border-gray-100">{[6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6].map(r => <option key={r} value={r}>랭크: {r > 0 ? `+${r}` : r}</option>)}</select>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-4">
              <div className="bg-poke-dark rounded-2xl p-5 text-white text-center shadow-xl border border-white/5">
                 <p className="text-[9px] font-black uppercase text-poke-yellow mb-1 tracking-widest italic">Simulation Result</p>
                 <div className="text-3xl font-black italic mb-0.5">{minDamage} ~ {maxDamage}</div>
                 <p className="text-[9px] font-black text-poke-red mb-2 uppercase animate-pulse">{getKOTurns()}</p>
                 <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2"><div className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 shadow-[0_0_10px_rgba(255,203,5,0.3)]" style={{ width: `${maxPercent}%` }}></div></div>
                 <p className="text-[9px] font-bold text-gray-400 italic">{minPercent}% ~ {maxPercent}% Deals</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                 <div className="flex gap-2">
                    <select value={weather} onChange={e => setWeather(e.target.value as any)} className="flex-1 bg-gray-100 p-2 rounded-xl font-bold text-[9px] uppercase">
                       <option value="none">날씨: 없음</option><option value="sun">쾌청</option><option value="rain">비</option>
                    </select>
                    <select value={terrain} onChange={e => setTerrain(e.target.value as any)} className="flex-1 bg-gray-100 p-2 rounded-xl font-bold text-[9px] uppercase">
                       <option value="none">필드: 없음</option><option value="electric">일렉트릭</option><option value="grassy">그래스</option>
                    </select>
                 </div>
                 <div className="flex gap-2">
                    <select value={item} onChange={e => setItem(e.target.value)} className="flex-1 bg-gray-100 p-2 rounded-xl font-bold text-[9px] uppercase">
                       <option value="none">도구: 없음</option><option value="life-orb">생구</option><option value="choice-band">머리띠</option><option value="assault-vest">돌조</option>
                    </select>
                    <select value={ability} onChange={e => setAbility(e.target.value)} className="flex-1 bg-gray-100 p-2 rounded-xl font-bold text-[9px] uppercase">
                       <option value="none">특성: 없음</option><option value="huge-power">천하장사</option><option value="guts">근성</option>
                    </select>
                 </div>
              </div>
              <button onClick={saveToHistory} className="w-full py-2 bg-poke-blue text-white font-black rounded-xl text-xs uppercase italic hover:bg-blue-700 shadow-md">기록 저장 (Save)</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DamageCalculator;
