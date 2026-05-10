import React, { useState, useEffect } from 'react';
import { Swords, ChevronLeft, Shield, Target, Search, Loader2, History, FileDown } from 'lucide-react';
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
  const [power, setPower] = useState<number>(80);
  const [typeEffectiveness, setTypeEffectiveness] = useState<number>(1.0);
  const [isStab, setIsStab] = useState<boolean>(true);
  const [isCritical, setIsCritical] = useState<boolean>(false);

  // Ranks
  const [atkRank, setAtkRank] = useState<number>(0);
  const [defRank, setDefRank] = useState<number>(0);

  // Sprite state
  const [attackerSprite, setAttackerSprite] = useState<string | null>(null);
  const [defenderSprite, setDefenderSprite] = useState<string | null>(null);

  // Search state
  const [attackerSearch, setAttackerSearch] = useState('');
  const [defenderSearch, setDefenderSearch] = useState('');
  const [isSearching, setIsSearching] = useState<'attacker' | 'defender' | null>(null);
  const [suggestions, setSuggestions] = useState<PokemonData[]>([]);
  const [activeSearch, setActiveSearch] = useState<'attacker' | 'defender' | null>(null);

  // History
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('damage_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const calculateDamage = (random: number) => {
    const getRankMult = (r: number) => r >= 0 ? (2 + r) / 2 : 2 / (2 - r);
    const finalAtk = attack * getRankMult(atkRank);
    const finalDef = defense * getRankMult(defRank);

    const baseDamage = (((2 * level / 5 + 2) * power * finalAtk / finalDef) / 50 + 2);
    const stabMult = isStab ? 1.5 : 1.0;
    const critMult = isCritical ? 1.5 : 1.0;
    return Math.floor(baseDamage * stabMult * typeEffectiveness * critMult * random);
  };

  const minDamage = calculateDamage(0.85);
  const maxDamage = calculateDamage(1.0);

  const fetchSuggestions = async (term: string) => {
    if (term.length < 1) { setSuggestions([]); return; }
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
    const term = activeSearch === 'attacker' ? attackerSearch : defenderSearch;
    if (!term) return;
    const timer = setTimeout(() => fetchSuggestions(term), 300);
    return () => clearTimeout(timer);
  }, [attackerSearch, defenderSearch, activeSearch]);

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
        setDefense(Math.max(def, spDef));
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
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-blue shadow-[0_12px_0_0_rgba(59,76,202,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-poke-blue p-3 rounded-2xl text-white shadow-lg"><Swords size={32} /></div>
          <div><h2 className="text-3xl font-black uppercase tracking-tighter">데미지 계산기</h2><p className="text-gray-500 font-bold italic">Stat Ranks & Battle Visualization</p></div>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-6 mb-8 border-2 border-gray-100 shadow-inner relative overflow-hidden">
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-poke-blue/20 flex items-center justify-center overflow-hidden">
              {attackerSprite ? <img src={attackerSprite} className="w-20 h-20 object-contain scale-x-[-1]" /> : <Target className="text-gray-200" size={40} />}
            </div>
            <span className="text-[10px] font-black uppercase text-poke-blue">Attacker</span>
            {atkRank !== 0 && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${atkRank > 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>Rank {atkRank > 0 ? `+${atkRank}` : atkRank}</span>}
          </div>
          <div className="z-10 text-poke-red font-black italic text-2xl animate-pulse">VS</div>
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-poke-red/20 flex items-center justify-center overflow-hidden">
              {defenderSprite ? <img src={defenderSprite} className="w-20 h-20 object-contain" /> : <Shield className="text-gray-200" size={40} />}
            </div>
            <span className="text-[10px] font-black uppercase text-poke-red">Defender</span>
            {defRank !== 0 && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${defRank > 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>Rank {defRank > 0 ? `+${defRank}` : defRank}</span>}
          </div>
        </div>

        {/* Search Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
           {/* ... Same search inputs as before ... */}
           <div className="relative">
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block italic">공격 포켓몬</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input type="text" placeholder="검색..." value={attackerSearch} onFocus={() => setActiveSearch('attacker')} onChange={(e) => setAttackerSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 pl-10 rounded-xl font-bold focus:border-poke-blue outline-none" />
              {isSearching === 'attacker' && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-poke-blue" size={16} />}
            </div>
            {activeSearch === 'attacker' && suggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">
                {suggestions.map(p => (
                  <button key={p.name} onClick={() => selectPokemon(p, 'attacker')} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-sm flex justify-between">
                    <span>{p.koName || p.name}</span><span className="text-gray-300 text-[10px]">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block italic">방어 포켓몬</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input type="text" placeholder="검색..." value={defenderSearch} onFocus={() => setActiveSearch('defender')} onChange={(e) => setDefenderSearch(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 pl-10 rounded-xl font-bold focus:border-poke-blue outline-none" />
              {isSearching === 'defender' && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-poke-blue" size={16} />}
            </div>
            {activeSearch === 'defender' && suggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border-2 border-poke-blue rounded-xl shadow-lg overflow-hidden">
                {suggestions.map(p => (
                  <button key={p.name} onClick={() => selectPokemon(p, 'defender')} className="w-full p-2 text-left hover:bg-gray-50 font-bold capitalize text-sm flex justify-between">
                    <span>{p.koName || p.name}</span><span className="text-gray-300 text-[10px]">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black uppercase italic mb-1">레벨</label><input type="number" value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full bg-gray-100 p-2 rounded-xl font-bold text-sm" /></div>
                <div><label className="block text-[10px] font-black uppercase italic mb-1">기술 위력</label><input type="number" value={power} onChange={(e) => setPower(Number(e.target.value))} className="w-full bg-gray-100 p-2 rounded-xl font-bold text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-[10px] font-black uppercase italic mb-1">공격측 수치</label><input type="number" value={attack} onChange={(e) => setAttack(Number(e.target.value))} className="w-full bg-gray-100 p-2 rounded-xl font-bold text-sm" /></div>
                 <div><label className="block text-[10px] font-black uppercase italic mb-1">방어측 수치</label><input type="number" value={defense} onChange={(e) => setDefense(Number(e.target.value))} className="w-full bg-gray-100 p-2 rounded-xl font-bold text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase italic mb-1 text-blue-500">공격 랭크</label>
                    <select value={atkRank} onChange={(e) => setAtkRank(Number(e.target.value))} className="w-full bg-blue-50 p-2 rounded-xl font-bold text-xs appearance-none border border-blue-100">
                       {[6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6].map(r => <option key={r} value={r}>{r > 0 ? `+${r}` : r}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase italic mb-1 text-red-500">방어 랭크</label>
                    <select value={defRank} onChange={(e) => setDefRank(Number(e.target.value))} className="w-full bg-red-50 p-2 rounded-xl font-bold text-xs appearance-none border border-red-100">
                       {[6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6].map(r => <option key={r} value={r}>{r > 0 ? `+${r}` : r}</option>)}
                    </select>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1 italic">상성 효과</label>
                <select value={typeEffectiveness} onChange={(e) => setTypeEffectiveness(Number(e.target.value))} className="w-full bg-gray-100 p-3 rounded-xl font-bold appearance-none">
                  <option value={4.0}>굉장했다! (x4.0)</option><option value={2.0}>굉장했다! (x2.0)</option><option value={1.0}>보통 (x1.0)</option><option value={0.5}>별로인 듯... (x0.5)</option><option value={0.25}>별로인 듯... (x0.25)</option><option value={0}>효과 없음 (x0)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer"><input type="checkbox" checked={isStab} onChange={(e) => setIsStab(e.target.checked)} className="accent-poke-blue" /><span className="font-bold text-xs uppercase italic">자속 보정(x1.5)</span></label>
                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer"><input type="checkbox" checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} className="accent-poke-blue" /><span className="font-bold text-xs uppercase italic">급소 타격(x1.5)</span></label>
              </div>
              <button onClick={saveToHistory} className="w-full py-2 bg-poke-blue text-white font-black rounded-xl text-xs uppercase italic hover:bg-blue-700 transition-colors">기록 저장</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-poke-dark rounded-2xl p-6 text-white text-center shadow-inner relative overflow-hidden">
              <p className="text-[10px] font-black uppercase text-poke-yellow mb-2 tracking-widest italic">Damage Range</p>
              <div className="text-4xl font-black italic mb-1 z-10 relative">{minDamage} ~ {maxDamage}</div>
              <div className="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden relative z-10"><div className="h-full bg-gradient-to-r from-poke-yellow to-poke-red" style={{ width: '100%' }}></div></div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-200">
              <h3 className="text-[10px] font-black uppercase text-gray-400 mb-3 flex items-center gap-2"><History size={12} /> Recent History</h3>
              <div className="space-y-2">
                {history.length === 0 && <p className="text-[10px] text-gray-300 italic text-center py-4">No records.</p>}
                {history.map(item => (
                  <div key={item.id} className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center animate-in slide-in-from-left-2">
                    <div className="text-[9px] font-bold"><span className="text-poke-blue capitalize">{item.attacker}</span> vs <span className="text-poke-red capitalize">{item.defender}</span></div>
                    <div className="text-[9px] font-black text-poke-dark">{item.min}-{item.max}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamageCalculator;
