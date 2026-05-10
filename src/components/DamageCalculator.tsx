import React, { useState, useEffect } from 'react';
import { Swords, ChevronLeft, Shield, Target, Search, Loader2, History, CloudSun, Zap as TerrainIcon, HelpCircle, X, ShoppingBag, Wand2 } from 'lucide-react';
import axios from 'axios';
import { pokemonNameMap, moveNameMap } from '../data/pokemonNames';

interface DamageCalculatorProps {
  onBack: () => void;
}

interface PokemonData {
  name: string;
  koName?: string;
  sprite?: string;
  baseStats?: any;
}

const DamageCalculator: React.FC<DamageCalculatorProps> = ({ onBack }) => {
  const [level, setLevel] = useState<number>(50);
  const [moveType, setMoveType] = useState<string>('Normal');
  const [moveCategory, setMoveCategory] = useState<'physical' | 'special'>('physical');
  const [power, setPower] = useState<number>(80);
  const [typeEffectiveness, setTypeEffectiveness] = useState<number>(1.0);
  const [isStab, setIsStab] = useState<boolean>(true);
  const [isCritical, setIsCritical] = useState<boolean>(false);

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

  // Advanced Modifiers
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
  const [activeSearch, setActiveSearch] = useState<'attacker' | 'defender' | 'move' | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showNatureRef, setShowNatureRef] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('damage_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Stat Calculators
  const calcStat = (base: number, iv: number, ev: number, nature: number) => {
    return Math.floor((Math.floor((base * 2 + iv + Math.floor(ev / 4)) * level / 100) + 5) * nature);
  };
  const calcHp = (base: number, iv: number, ev: number) => {
    if (base === 1) return 1; // Shedinja
    return Math.floor((base * 2 + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
  };

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
    const stabMult = isStab ? 1.5 : 1.0;
    const critMult = isCritical ? 1.5 : 1.0;
    return Math.floor(baseDamage * stabMult * typeEffectiveness * critMult * random);
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
      const spriteUrl = response.data.sprites.front_default;
      if (target === 'attacker') {
        const atk = stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 100;
        const spAtk = stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat || 100;
        setAtkBase(moveCategory === 'physical' ? atk : spAtk);
        setAttackerSprite(spriteUrl);
      } else {
        const def = stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 100;
        const spDef = stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat || 100;
        const hp = stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 100;
        setDefBase(moveCategory === 'physical' ? def : spDef);
        setHpBase(hp);
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
            <div><h2 className="text-3xl font-black uppercase tracking-tighter">데미지 계산기</h2><p className="text-gray-500 font-bold italic">Full Stat Calculation Active!</p></div>
          </div>
          <button onClick={() => setShowNatureRef(true)} className="p-2 bg-gray-100 text-gray-400 hover:text-poke-blue rounded-full transition-all hover:rotate-12"><HelpCircle size={24} /></button>
        </div>

        {/* Battle Scene */}
        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-6 mb-8 border-2 border-gray-100 shadow-inner relative overflow-hidden">
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-poke-blue/20 flex items-center justify-center overflow-hidden">{attackerSprite ? <img src={attackerSprite} className="w-20 h-20 object-contain scale-x-[-1]" /> : <Target className="text-gray-200" size={40} />}</div>
            <span className="text-[10px] font-black uppercase text-poke-blue">Attacker ({finalAtkValue})</span>
            {atkRank !== 0 && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${atkRank > 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>Rank {atkRank > 0 ? `+${atkRank}` : atkRank}</span>}
          </div>
          <div className="z-10 text-poke-red font-black italic text-2xl animate-pulse">VS</div>
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-poke-red/20 flex items-center justify-center overflow-hidden relative">
               {defenderSprite ? <img src={defenderSprite} className="w-20 h-20 object-contain" /> : <Shield className="text-gray-200" size={40} />}
               <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-200"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${100 - maxPercent}%` }}></div><div className="h-full bg-yellow-400 absolute top-0 right-0 opacity-50" style={{ width: `${maxPercent - minPercent}%` }}></div></div>
            </div>
            <span className="text-[10px] font-black uppercase text-poke-red">Defender ({finalDefValue})</span>
            {defRank !== 0 && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${defRank > 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>Rank {defRank > 0 ? `+${defRank}` : defRank}</span>}
          </div>
        </div>

        {/* Elite Input Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-8">
              {/* Search Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="relative"><label className="text-[10px] font-black text-gray-400 mb-1 block uppercase italic underline">Move Search</label>
                   <input type="text" placeholder="기술 검색..." value={moveSearch} onFocus={() => setActiveSearch('move')} onChange={(e) => setMoveSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 rounded-xl font-bold text-xs focus:border-poke-blue outline-none" />
                   {activeSearch === 'move' && suggestions.length > 0 && (<div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">{suggestions.map(p => (<button key={p.name} onClick={() => selectMove(p)} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px] border-b border-gray-50"><span>{p.koName || p.name}</span></button>))}</div>)}
                 </div>
                 <div className="relative"><label className="text-[10px] font-black text-gray-400 mb-1 block uppercase italic underline">Attacker</label>
                   <input type="text" placeholder="공격자 검색..." value={attackerSearch} onFocus={() => setActiveSearch('attacker')} onChange={(e) => setAttackerSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 rounded-xl font-bold text-xs focus:border-poke-blue outline-none" />
                   {activeSearch === 'attacker' && suggestions.length > 0 && (<div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">{suggestions.map(p => (<button key={p.name} onClick={() => selectPokemon(p, 'attacker')} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px] flex justify-between"><span>{p.koName || p.name}</span></button>))}</div>)}
                 </div>
                 <div className="relative"><label className="text-[10px] font-black text-gray-400 mb-1 block uppercase italic underline">Defender</label>
                   <input type="text" placeholder="방어자 검색..." value={defenderSearch} onFocus={() => setActiveSearch('defender')} onChange={(e) => setDefenderSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 rounded-xl font-bold text-xs focus:border-poke-blue outline-none" />
                   {activeSearch === 'defender' && suggestions.length > 0 && (<div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">{suggestions.map(p => (<button key={p.name} onClick={() => selectPokemon(p, 'defender')} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px] flex justify-between"><span>{p.koName || p.name}</span></button>))}</div>)}
                 </div>
              </div>

              {/* Stats Tuning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
                 <div className="space-y-4">
                    <h3 className="text-xs font-black text-poke-blue uppercase italic flex items-center gap-2"><Target size={14} /> Attacker Fine-tuning</h3>
                    <div className="grid grid-cols-3 gap-2">
                       <div><label className="block text-[9px] font-black text-gray-400">Base</label><input type="number" value={atkBase} onChange={e => setAtkBase(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm" /></div>
                       <div><label className="block text-[9px] font-black text-gray-400">IV</label><input type="number" value={atkIv} onChange={e => setAtkIv(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm" /></div>
                       <div><label className="block text-[9px] font-black text-gray-400">EV</label><input type="number" value={atkEv} onChange={e => setAtkEv(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div><label className="block text-[9px] font-black text-gray-400">Nature</label><select value={atkNature} onChange={e => setAtkNature(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm"><option value={1.1}>+10%</option><option value={1.0}>None</option><option value={0.9}>-10%</option></select></div>
                       <div><label className="block text-[9px] font-black text-gray-400">Rank</label><select value={atkRank} onChange={e => setAtkRank(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm">{[6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6].map(r => <option key={r} value={r}>{r > 0 ? `+${r}` : r}</option>)}</select></div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-xs font-black text-poke-red uppercase italic flex items-center gap-2"><Shield size={14} /> Defender Fine-tuning</h3>
                    <div className="grid grid-cols-3 gap-2">
                       <div><label className="block text-[9px] font-black text-gray-400">Base Def</label><input type="number" value={defBase} onChange={e => setDefBase(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm" /></div>
                       <div><label className="block text-[9px] font-black text-gray-400">IV</label><input type="number" value={defIv} onChange={e => setDefIv(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm" /></div>
                       <div><label className="block text-[9px] font-black text-gray-400">EV</label><input type="number" value={defEv} onChange={e => setDefEv(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       <div><label className="block text-[9px] font-black text-gray-400">Base HP</label><input type="number" value={hpBase} onChange={e => setHpBase(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm" /></div>
                       <div><label className="block text-[9px] font-black text-gray-400">Nature</label><select value={defNature} onChange={e => setDefNature(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm"><option value={1.1}>+10%</option><option value={1.0}>None</option><option value={0.9}>-10%</option></select></div>
                       <div><label className="block text-[9px] font-black text-gray-400">Rank</label><select value={defRank} onChange={e => setDefRank(Number(e.target.value))} className="w-full p-2 bg-white rounded-lg font-bold text-xs shadow-sm">{[6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6].map(r => <option key={r} value={r}>{r > 0 ? `+${r}` : r}</option>)}</select></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Environment & Summary */}
           <div className="lg:col-span-4 space-y-4">
              <div className="bg-poke-dark rounded-3xl p-6 text-white text-center shadow-2xl relative overflow-hidden border-4 border-white/5">
                 <p className="text-[10px] font-black uppercase text-poke-yellow mb-2 tracking-widest italic flex items-center justify-center gap-2"><Wand2 size={12}/> Analysis Result</p>
                 <div className="text-4xl font-black italic mb-1 text-white">{minDamage} ~ {maxDamage}</div>
                 <p className="text-[10px] font-black text-poke-red mb-3 uppercase tracking-tighter">{getKOTurns()}</p>
                 <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden relative border border-white/5">
                    <div className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" style={{ width: `${maxPercent}%` }}></div>
                 </div>
                 <p className="text-[10px] font-bold text-gray-400 mt-2 italic">{minPercent}% ~ {maxPercent}%</p>
                 <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <div className="bg-white/10 px-2 py-1 rounded text-[9px] font-black uppercase">LV {level}</div>
                    <div className="bg-white/10 px-2 py-1 rounded text-[9px] font-black uppercase">{moveType}</div>
                    <div className="bg-white/10 px-2 py-1 rounded text-[9px] font-black uppercase">STAB: {isStab ? 'Y' : 'N'}</div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <select value={weather} onChange={e => setWeather(e.target.value as any)} className="bg-gray-100 p-2 rounded-xl font-bold text-[10px]"><option value="none">날씨: 없음</option><option value="sun">쾌청</option><option value="rain">비</option></select>
                 <select value={terrain} onChange={e => setTerrain(e.target.value as any)} className="bg-gray-100 p-2 rounded-xl font-bold text-[10px]"><option value="none">필드: 없음</option><option value="electric">일렉트릭</option><option value="grassy">그래스</option></select>
              </div>
              <button onClick={saveToHistory} className="w-full py-3 bg-poke-blue text-white font-black rounded-2xl text-xs uppercase italic hover:bg-blue-700 transition-all shadow-lg">기록 저장 (Save)</button>
              
              <div className="bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-200 overflow-y-auto max-h-[140px]">
                <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-2"><History size={12} /> Recent Calculations</h3>
                <div className="space-y-1">{history.map(item => (<div key={item.id} className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"><div className="text-[8px] font-bold capitalize"><span className="text-poke-blue">{item.attacker}</span> vs <span className="text-poke-red">{item.defender}</span></div><div className="text-[8px] font-black">{item.min}-{item.max}</div></div>))}</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DamageCalculator;
