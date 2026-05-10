import React, { useState, useEffect } from 'react';
import { Swords, ChevronLeft, Shield, Target, Search, Loader2, History, CloudSun, Zap as TerrainIcon, HelpCircle, X } from 'lucide-react';
import axios from 'axios';
import { pokemonNameMap } from '../data/pokemonNames';

interface DamageCalculatorProps {
  onBack: () => void;
}

interface PokemonData {
  name: string;
  koName?: string;
  sprite?: string;
}

const DamageCalculator: React.FC<DamageCalculatorProps> = ({ onBack }) => {
  const [level, setLevel] = useState<number>(50);
  const [attack, setAttack] = useState<number>(100);
  const [defense, setDefense] = useState<number>(100);
  const [maxHp, setMaxHp] = useState<number>(150); 
  const [power, setPower] = useState<number>(80);
  const [typeEffectiveness, setTypeEffectiveness] = useState<number>(1.0);
  const [isStab, setIsStab] = useState<boolean>(true);
  const [isCritical, setIsCritical] = useState<boolean>(false);
  const [atkRank, setAtkRank] = useState<number>(0);
  const [defRank, setDefRank] = useState<number>(0);

  // Weather & Terrain
  const [weather, setWeather] = useState<'none' | 'sun' | 'rain' | 'sand' | 'snow'>('none');
  const [terrain, setTerrain] = useState<'none' | 'electric' | 'grassy' | 'psychic' | 'misty'>('none');
  const [moveType, setMoveType] = useState<string>('Normal');

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

  const calculateDamage = (random: number) => {
    const getRankMult = (r: number) => r >= 0 ? (2 + r) / 2 : 2 / (2 - r);
    const finalAtk = attack * getRankMult(atkRank);
    const finalDef = defense * getRankMult(defRank);

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
  const minPercent = Math.min(100, Math.floor((minDamage / maxHp) * 100));
  const maxPercent = Math.min(100, Math.floor((maxDamage / maxHp) * 100));

  const getKOTurns = () => {
    if (minDamage >= maxHp) return "확정 1타 (Guaranteed 1HKO)";
    if (maxDamage >= maxHp) return "난수 1타 (Chance to 1HKO)";
    if (minDamage * 2 >= maxHp) return "확정 2타 (Guaranteed 2HKO)";
    if (maxDamage * 2 >= maxHp) return "난수 2타 (Chance to 2HKO)";
    return "3타 이상 (3HKO or more)";
  };

  const fetchSuggestions = async (term: string) => {
    if (term.length < 1) { setSuggestions([]); return; }
    if (activeSearch === 'move') {
       try {
          const res = await axios.get('https://pokeapi.co/api/v2/move?limit=1000');
          const matches = res.data.results.filter((m: any) => m.name.toLowerCase().includes(term.toLowerCase())).slice(0, 5);
          setSuggestions(matches);
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

  const selectMove = async (name: string) => {
    setIsSearching('move');
    setActiveSearch(null);
    setMoveSearch(name);
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/move/${name}`);
      if (res.data.power) setPower(res.data.power);
      const type = res.data.type.name.charAt(0).toUpperCase() + res.data.type.name.slice(1);
      setMoveType(type);
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
        setAttack(Math.max(atk, spAtk));
        setAttackerSprite(spriteUrl);
      } else {
        const def = stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 100;
        const spDef = stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat || 100;
        const hp = stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 100;
        setDefense(Math.max(def, spDef));
        setMaxHp(Math.floor((hp * 2 + 31 + 252/4) * 50 / 100 + 50 + 10));
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
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg border-8 border-poke-red">
               <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-poke-dark uppercase italic">성격표</h3><button onClick={() => setShowNatureRef(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button></div>
               <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100"><p className="font-black text-blue-600 mb-2">스피드 +</p><p>겁쟁이, 명랑, 성급, 천진난만</p></div>
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100"><p className="font-black text-red-600 mb-2">화력 +</p><p>고집, 조심, 용감, 냉정</p></div>
               </div>
            </div>
         </div>
      )}

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-blue shadow-[0_12px_0_0_rgba(59,76,202,1)] text-poke-dark">
        <div className="flex items-center justify-between mb-8 border-b-4 border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-poke-blue p-3 rounded-2xl text-white shadow-lg"><Swords size={32} /></div>
            <div><h2 className="text-3xl font-black uppercase tracking-tighter">데미지 시뮬레이터</h2><p className="text-gray-500 font-bold italic">Elite Battle Simulator Active!</p></div>
          </div>
          <button onClick={() => setShowNatureRef(true)} className="p-2 bg-gray-100 text-gray-400 hover:text-poke-blue rounded-full transition-colors"><HelpCircle size={24} /></button>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-6 mb-8 border-2 border-gray-100 shadow-inner relative overflow-hidden">
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-poke-blue/20 flex items-center justify-center overflow-hidden">{attackerSprite ? <img src={attackerSprite} className="w-20 h-20 object-contain scale-x-[-1]" /> : <Target className="text-gray-200" size={40} />}</div>
            <span className="text-[10px] font-black uppercase text-poke-blue">Attacker</span>
            {atkRank !== 0 && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${atkRank > 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>Rank {atkRank > 0 ? `+${atkRank}` : atkRank}</span>}
          </div>
          <div className="z-10 text-poke-red font-black italic text-2xl animate-pulse">VS</div>
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-poke-red/20 flex items-center justify-center overflow-hidden relative">
               {defenderSprite ? <img src={defenderSprite} className="w-20 h-20 object-contain" /> : <Shield className="text-gray-200" size={40} />}
               <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-200"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${100 - maxPercent}%` }}></div><div className="h-full bg-yellow-400 absolute top-0 right-0 opacity-50" style={{ width: `${maxPercent - minPercent}%` }}></div></div>
            </div>
            <span className="text-[10px] font-black uppercase text-poke-red">Defender</span>
            {defRank !== 0 && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${defRank > 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>Rank {defRank > 0 ? `+${defRank}` : defRank}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="relative">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block italic underline">기술 검색 (EN)</label>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                 <input type="text" placeholder="예: Thunderbolt..." value={moveSearch} onFocus={() => setActiveSearch('move')} onChange={(e) => setMoveSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 pl-9 rounded-xl font-bold text-xs focus:border-poke-blue outline-none" />
                 {isSearching === 'move' && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-poke-blue" size={14} />}
              </div>
              {activeSearch === 'move' && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map(m => (<button key={m.name} onClick={() => selectMove(m.name)} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px] border-b border-gray-50">{m.name}</button>))}
                </div>
              )}
           </div>
           <div className="relative"><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block italic underline">공격 포켓몬</label><div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} /><input type="text" placeholder="검색..." value={attackerSearch} onFocus={() => setActiveSearch('attacker')} onChange={(e) => setAttackerSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 pl-9 rounded-xl font-bold text-xs focus:border-poke-blue outline-none" />
              {isSearching === 'attacker' && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-poke-blue" size={14} />}
           </div>
           {activeSearch === 'attacker' && suggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">
                {suggestions.map(p => (<button key={p.name} onClick={() => selectPokemon(p, 'attacker')} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px] flex justify-between"><span>{p.koName || p.name}</span><span className="text-gray-300">{p.name}</span></button>))}
              </div>
           )}</div>
           <div className="relative"><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block italic underline">방어 포켓몬</label><div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} /><input type="text" placeholder="검색..." value={defenderSearch} onFocus={() => setActiveSearch('defender')} onChange={(e) => setDefenderSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 pl-9 rounded-xl font-bold text-xs focus:border-poke-blue outline-none" />
              {isSearching === 'defender' && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-poke-blue" size={14} />}
           </div>
           {activeSearch === 'defender' && suggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">
                {suggestions.map(p => (<button key={p.name} onClick={() => selectPokemon(p, 'defender')} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-[10px] flex justify-between"><span>{p.koName || p.name}</span><span className="text-gray-300">{p.name}</span></button>))}
              </div>
           )}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black uppercase mb-1">레벨</label><input type="number" value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full bg-gray-100 p-2 rounded-xl font-bold text-xs" /></div>
                <div><label className="block text-[10px] font-black uppercase mb-1 text-red-500 underline italic">방어 HP</label><input type="number" value={maxHp} onChange={(e) => setMaxHp(Number(e.target.value))} className="w-full bg-red-50 p-2 rounded-xl font-bold text-xs border border-red-100" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-[10px] font-black uppercase mb-1">공격 수치</label><input type="number" value={attack} onChange={(e) => setAttack(Number(e.target.value))} className="w-full bg-gray-100 p-2 rounded-xl font-bold text-xs" /></div>
                 <div><label className="block text-[10px] font-black uppercase mb-1">방어 수치</label><input type="number" value={defense} onChange={(e) => setDefense(Number(e.target.value))} className="w-full bg-gray-100 p-2 rounded-xl font-bold text-xs" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-[10px] font-black uppercase mb-1 text-blue-500">공격 랭크</label><select value={atkRank} onChange={(e) => setAtkRank(Number(e.target.value))} className="w-full bg-blue-50 p-2 rounded-xl font-bold text-xs">{[6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6].map(r => <option key={r} value={r}>{r > 0 ? `+${r}` : r}</option>)}</select></div>
                 <div><label className="block text-[10px] font-black uppercase mb-1 text-red-500">방어 랭크</label><select value={defRank} onChange={(e) => setDefRank(Number(e.target.value))} className="w-full bg-red-50 p-2 rounded-xl font-bold text-xs">{[6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6].map(r => <option key={r} value={r}>{r > 0 ? `+${r}` : r}</option>)}</select></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-[10px] font-black uppercase mb-1 flex items-center gap-1"><CloudSun size={10} /> 날씨</label><select value={weather} onChange={(e) => setWeather(e.target.value as any)} className="w-full bg-gray-100 p-2 rounded-xl font-bold text-xs"><option value="none">없음</option><option value="sun">쾌청</option><option value="rain">비</option><option value="sand">모래바람</option><option value="snow">설경</option></select></div>
                 <div><label className="block text-[10px] font-black uppercase mb-1 flex items-center gap-1"><TerrainIcon size={10} /> 필드</label><select value={terrain} onChange={(e) => setTerrain(e.target.value as any)} className="w-full bg-gray-100 p-2 rounded-xl font-bold text-xs"><option value="none">없음</option><option value="electric">일렉트릭</option><option value="grassy">그래스</option><option value="psychic">사이코</option><option value="misty">미스트</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-[10px] font-black uppercase mb-1">위력</label><input type="number" value={power} onChange={(e) => setPower(Number(e.target.value))} className="w-full bg-gray-100 p-2 rounded-xl font-bold text-xs" /></div>
                 <div><label className="block text-[10px] font-black uppercase mb-1 text-poke-blue">기술 타입</label><select value={moveType} onChange={(e) => setMoveType(e.target.value)} className="w-full bg-blue-50 p-2 rounded-xl font-bold text-xs border border-blue-100">{['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Steel', 'Fairy', 'Dark'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div className="flex gap-2"><label className="flex-1 flex items-center gap-1 p-2 bg-gray-50 rounded-lg cursor-pointer"><input type="checkbox" checked={isStab} onChange={(e) => setIsStab(e.target.checked)} className="accent-poke-blue" /><span className="font-black text-[9px] uppercase">자속</span></label><label className="flex-1 flex items-center gap-1 p-2 bg-gray-50 rounded-lg cursor-pointer"><input type="checkbox" checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} className="accent-poke-blue" /><span className="font-black text-[9px] uppercase">급소</span></label></div>
              <button onClick={saveToHistory} className="w-full py-2 bg-poke-blue text-white font-black rounded-xl text-xs uppercase italic hover:bg-blue-700 transition-colors">결과 저장</button>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-poke-dark rounded-2xl p-6 text-white text-center shadow-inner relative overflow-hidden">
              <p className="text-[10px] font-black uppercase text-poke-yellow mb-2 tracking-widest italic underline decoration-poke-red">Damage Simulator</p>
              <div className="text-3xl font-black italic mb-1 z-10 relative">{minDamage} ~ {maxDamage}</div>
              <p className="text-[10px] font-black text-poke-red mb-3 animate-pulse">{getKOTurns()}</p>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative z-10"><div className="h-full bg-gradient-to-r from-red-500 to-green-500" style={{ width: `${maxPercent}%` }}></div></div>
              <p className="text-[9px] font-bold text-gray-400 mt-2 italic">{minPercent}% ~ {maxPercent}%</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-200 overflow-y-auto max-h-[140px]"><h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-2"><History size={12} /> Recent</h3>
              <div className="space-y-1">{history.map(item => (<div key={item.id} className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"><div className="text-[8px] font-bold capitalize"><span className="text-poke-blue">{item.attacker}</span> vs <span className="text-poke-red">{item.defender}</span></div><div className="text-[8px] font-black">{item.min}-{item.max}</div></div>))}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamageCalculator;
