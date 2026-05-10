import React, { useState, useEffect, useRef } from 'react';
import { Swords, ChevronLeft, Shield, Target, Search, Loader2, History, CloudSun, Zap as TerrainIcon, HelpCircle, X, ShoppingBag, Wand2, Star } from 'lucide-react';
import axios from 'axios';
import { pokemonNameMap, moveNameMap } from '../data/pokemonNames';
import StatBars from './StatBars';

interface DamageCalculatorProps {
  onBack: () => void;
}

interface PokemonData {
  name: string;
  koName?: string;
  sprite?: string;
  baseStats?: any;
  moves?: string[];
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
  const [atkFullStats, setAtkFullStats] = useState<any>(null);
  const [attackerMoves, setAttackerMoves] = useState<string[]>([]);

  // Defender Stats
  const [defBase, setDefBase] = useState<number>(100);
  const [defIv, setDefIv] = useState<number>(31);
  const [defEv, setDefEv] = useState<number>(0);
  const [defNature, setDefNature] = useState<number>(1.0);
  const [defRank, setDefRank] = useState<number>(0);
  const [hpBase, setHpBase] = useState<number>(100);
  const [hpIv, setHpIv] = useState<number>(31);
  const [hpEv, setHpEv] = useState<number>(0);
  const [defFullStats, setDefFullStats] = useState<any>(null);

  // Modifiers
  const [item, setItem] = useState<string>('none');
  const [ability, setAbility] = useState<string>('none');
  const [weather, setWeather] = useState<'none' | 'sun' | 'rain' | 'sand' | 'snow'>('none');
  const [terrain, setTerrain] = useState<'none' | 'electric' | 'grassy' | 'psychic' | 'misty'>('none');
  const [isCritical, setIsCritical] = useState<boolean>(false);

  const [attackerSprite, setAttackerSprite] = useState<string | null>(null);
  const [defenderSprite, setDefenderSprite] = useState<string | null>(null);
  const [attackerSearch, setAttackerSearch] = useState('');
  const [defenderSearch, setDefenderSearch] = useState('');
  const [moveSearch, setMoveSearch] = useState('');
  const [isSearching, setIsSearching] = useState<'attacker' | 'defender' | 'move' | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSearch, setActiveSearch] = useState<'attacker' | 'defender' | 'move' | null>(null);
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
    if (item === 'expert-belt') finalAtk *= 1.2;
    if (item === 'assault-vest' && moveCategory === 'special') finalDef *= 1.5;
    if (ability === 'guts') finalAtk *= 1.5;
    if (ability === 'huge-power') finalAtk *= 2.0;

    let baseDamage = (((2 * level / 5 + 2) * power * finalAtk / finalDef) / 50 + 2);
    if ((weather === 'sun' && moveType === 'Fire') || (weather === 'rain' && moveType === 'Water')) baseDamage *= 1.5;
    if ((weather === 'sun' && moveType === 'Water') || (weather === 'rain' && moveType === 'Fire')) baseDamage *= 0.5;
    
    let stab = 1.0;
    const isBaseSTAB = attackerBaseTypes.includes(moveType);
    const isTeraSTAB = attackerTera === moveType;
    if (attackerTera === 'None') { if (isBaseSTAB) stab = 1.5; } 
    else { if (isBaseSTAB && isTeraSTAB) stab = 2.0; else if (isBaseSTAB || isTeraSTAB) stab = 1.5; }

    let effectiveness = 1.0;
    const currentDefTypes = defenderTera === 'None' ? defenderBaseTypes : [defenderTera];
    currentDefTypes.forEach(defType => {
       const data = typeMatchups[defType];
       if (data?.double.includes(moveType)) effectiveness *= 2;
       if (data?.half.includes(moveType)) effectiveness *= 0.5;
       if (data?.zero.includes(moveType)) effectiveness *= 0;
    });

    return Math.floor(baseDamage * stab * effectiveness * (isCritical ? 1.5 : 1.0) * random);
  };

  const minDamage = calculateDamage(0.85);
  const maxDamage = calculateDamage(1.0);
  const maxPercent = Math.min(100, Math.floor((maxDamage / finalHpValue) * 100));
  const minPercent = Math.min(100, Math.floor((minDamage / finalHpValue) * 100));

  const applyPreset = (type: 'AS' | 'CS' | 'HB' | 'HD') => {
    if (type === 'AS') { setAtkEv(252); setAtkNature(1.1); }
    if (type === 'CS') { setAtkEv(252); setAtkNature(1.1); }
    if (type === 'HB') { setHpEv(252); setDefEv(252); setDefNature(1.1); }
    if (type === 'HD') { setHpEv(252); setDefEv(252); setDefNature(1.1); }
  };

  const fetchSuggestions = async (term: string) => {
    if (term.length < 1) { setSuggestions([]); return; }
    if (activeSearch === 'move') {
       const koMoveMatches = Object.entries(moveNameMap).filter(([ko]) => ko.includes(term)).map(([ko, en]) => ({ name: en, koName: ko }));
       
       let combined: any[] = [...koMoveMatches];
       // If we have attacker moves, prioritize/filter them
       if (attackerMoves.length > 0) {
          const learnable = attackerMoves.filter(m => m.includes(term.toLowerCase().replace(/ /g, '-')));
          const learnableMatches = learnable.map(m => ({ name: m }));
          combined = [...combined, ...learnableMatches];
       } else {
          try {
             const res = await axios.get('https://pokeapi.co/api/v2/move?limit=1000');
             const enMatches = res.data.results.filter((m: any) => m.name.toLowerCase().includes(term.toLowerCase())).map((m: any) => ({ name: m.name }));
             combined = [...combined, ...enMatches];
          } catch (e) {}
       }
       setSuggestions(Array.from(new Map(combined.map(item => [item.name, item])).values()).slice(0, 5));
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
      const spriteUrl = response.data.sprites.other['official-artwork'].front_default || response.data.sprites.front_default;
      
      const s = {
        hp: stats.find((s: any) => s.stat.name === 'hp').base_stat,
        atk: stats.find((s: any) => s.stat.name === 'attack').base_stat,
        def: stats.find((s: any) => s.stat.name === 'defense').base_stat,
        spAtk: stats.find((s: any) => s.stat.name === 'special-attack').base_stat,
        spDef: stats.find((s: any) => s.stat.name === 'special-defense').base_stat,
        speed: stats.find((s: any) => s.stat.name === 'speed').base_stat
      };

      if (target === 'attacker') {
        setAtkBase(moveCategory === 'physical' ? s.atk : s.spAtk);
        setAttackerBaseTypes(typeList);
        setAttackerSprite(spriteUrl);
        setAtkFullStats(s);
        setAttackerMoves(response.data.moves.map((m: any) => m.move.name));
      } else {
        setDefBase(moveCategory === 'physical' ? s.def : s.spDef);
        setHpBase(s.hp);
        setDefenderBaseTypes(typeList);
        setDefenderSprite(spriteUrl);
        setDefFullStats(s);
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
    <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase"><ChevronLeft size={20} /> 메뉴</button>

      <div className="bg-white rounded-3xl p-6 md:p-8 border-8 border-poke-blue shadow-[0_12px_0_0_rgba(59,76,202,1)] text-poke-dark">
        <div className="flex items-center justify-between mb-8 border-b-4 border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-poke-blue p-3 rounded-2xl text-white shadow-lg animate-pulse"><Swords size={32} /></div>
            <div><h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-none">데미지 시뮬레이터</h2><p className="text-[10px] md:text-xs text-gray-500 font-bold italic">Smart Move Search Active!</p></div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => applyPreset('AS')} className="p-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-full transition-all" title="공격 프리셋"><Wand2 size={24} /></button>
             <button onClick={() => setShowNatureRef(true)} className="p-2 bg-gray-100 text-gray-400 hover:text-poke-blue rounded-full transition-all"><HelpCircle size={24} /></button>
          </div>
        </div>

        {/* Battle Scene */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
           <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 flex flex-col items-center">
              <div className={`w-32 h-32 bg-white rounded-full border-4 ${attackerTera !== 'None' ? 'border-poke-yellow shadow-lg' : 'border-poke-blue/20'} flex items-center justify-center overflow-hidden mb-2`}>{attackerSprite ? <img src={attackerSprite} className="w-28 h-28 object-contain scale-x-[-1]" /> : <Target className="text-gray-200" size={40} />}</div>
              <select value={attackerTera} onChange={e => setAttackerTera(e.target.value)} className="text-[9px] font-black p-1 bg-white border rounded mb-2"><option value="None">Tera OFF</option>{types.map(t => <option key={t} value={t}>Tera: {t}</option>)}</select>
              {atkFullStats && <StatBars stats={atkFullStats} />}
           </div>
           <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 flex flex-col items-center">
              <div className={`w-32 h-32 bg-white rounded-full border-4 ${defenderTera !== 'None' ? 'border-poke-yellow shadow-lg' : 'border-poke-red/20'} flex items-center justify-center overflow-hidden relative mb-2`}>
                 {defenderSprite ? <img src={defenderSprite} className="w-28 h-28 object-contain" /> : <Shield className="text-gray-200" size={40} />}
                 <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-200"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${100 - maxPercent}%` }}></div></div>
              </div>
              <select value={defenderTera} onChange={e => setDefenderTera(e.target.value)} className="text-[9px] font-black p-1 bg-white border rounded mb-2"><option value="None">Tera OFF</option>{types.map(t => <option key={t} value={t}>Tera: {t}</option>)}</select>
              {defFullStats && <StatBars stats={defFullStats} />}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <div className="relative"><input type="text" placeholder="기술 검색..." value={moveSearch} onFocus={() => setActiveSearch('move')} onChange={(e) => setMoveSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 rounded-xl font-bold text-xs" />
                   {activeSearch === 'move' && suggestions.length > 0 && (<div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">{suggestions.map(p => (<button key={p.name} onClick={() => selectMove(p)} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px] flex justify-between"><span>{p.koName || p.name}</span>{attackerMoves.includes(p.name) && <Star size={10} className="text-yellow-500 fill-yellow-500" />}</button>))}</div>)}
                 </div>
                 <div className="relative"><input type="text" placeholder="공격자..." value={attackerSearch} onFocus={() => setActiveSearch('attacker')} onChange={(e) => setAttackerSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 rounded-xl font-bold text-xs" />
                   {activeSearch === 'attacker' && suggestions.length > 0 && (<div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">{suggestions.map(p => (<button key={p.name} onClick={() => selectPokemon(p, 'attacker')} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px] flex justify-between"><span>{p.koName || p.name}</span></button>))}</div>)}
                 </div>
                 <div className="relative"><input type="text" placeholder="방어자..." value={defenderSearch} onFocus={() => setActiveSearch('defender')} onChange={(e) => setDefenderSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 rounded-xl font-bold text-xs" />
                   {activeSearch === 'defender' && suggestions.length > 0 && (<div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">{suggestions.map(p => (<button key={p.name} onClick={() => selectPokemon(p, 'defender')} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px] flex justify-between"><span>{p.koName || p.name}</span></button>))}</div>)}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-inner">
                 <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-poke-blue italic">Attacker Stats</h4>
                    <div className="grid grid-cols-3 gap-1">
                       <div><label className="text-[8px] font-black text-gray-400">Base</label><input type="number" value={atkBase} onChange={e => setAtkBase(Number(e.target.value))} className="w-full p-1 rounded font-bold text-[10px]" /></div>
                       <div><label className="text-[8px] font-black text-gray-400">IV</label><input type="number" value={atkIv} onChange={e => setAtkIv(Number(e.target.value))} className="w-full p-1 rounded font-bold text-[10px]" /></div>
                       <div><label className="text-[8px] font-black text-gray-400">EV</label><input type="number" value={atkEv} onChange={e => setAtkEv(Number(e.target.value))} className="w-full p-1 rounded font-bold text-[10px]" /></div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-poke-red italic">Defender Stats</h4>
                    <div className="grid grid-cols-3 gap-1">
                       <div><label className="text-[8px] font-black text-gray-400">Def B</label><input type="number" value={defBase} onChange={e => setDefBase(Number(e.target.value))} className="w-full p-1 rounded font-bold text-[10px]" /></div>
                       <div><label className="text-[8px] font-black text-gray-400">HP B</label><input type="number" value={hpBase} onChange={e => setHpBase(Number(e.target.value))} className="w-full p-1 rounded font-bold text-[10px]" /></div>
                       <div><label className="text-[8px] font-black text-gray-400">EV</label><input type="number" value={defEv} onChange={e => setDefEv(Number(e.target.value))} className="w-full p-1 rounded font-bold text-[10px]" /></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-4">
              <div className="bg-poke-dark rounded-3xl p-5 text-white text-center shadow-2xl border border-white/5 relative overflow-hidden">
                 <p className="text-[9px] font-black uppercase text-poke-yellow mb-1 tracking-widest italic underline decoration-poke-red decoration-2">Battle Insights</p>
                 <div className="text-3xl font-black italic mb-0.5">{minDamage} ~ {maxDamage}</div>
                 <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2 shadow-inner"><div className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 shadow-[0_0_10px_rgba(255,203,5,0.3)]" style={{ width: `${maxPercent}%` }}></div></div>
                 <p className="text-[9px] font-bold text-gray-400 italic leading-none">{minPercent}% ~ {maxPercent}% Deals</p>
                 <div className="mt-4 py-2 border-y border-white/5">
                    <span className="text-[10px] font-black text-poke-red animate-pulse uppercase italic">Estimated KO: {Math.ceil(finalHpValue/minDamage)} Turns</span>
                 </div>
              </div>
              <button onClick={saveToHistory} className="w-full py-3 bg-poke-blue text-white font-black rounded-2xl text-xs uppercase italic hover:bg-blue-700 shadow-lg transition-all active:scale-95">결과 저장 (Save Stats)</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DamageCalculator;
