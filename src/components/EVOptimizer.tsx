import React, { useState, useEffect } from 'react';
import { ChevronLeft, FlaskConical, Search, Loader2, Target, Shield, Zap, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { pokemonNameMap } from '../data/pokemonNames';

interface EVOptimizerProps {
  onBack: () => void;
}

const EVOptimizer: React.FC<EVOptimizerProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  
  // Optimization Goals
  const [targetSpeed, setTargetSpeed] = useState<number>(150);
  const [targetDamage, setTargetDamage] = useState<number>(100); // Max damage to survive
  
  const [results, setResults] = useState<any>(null);

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
      setSelected({
        name: p.name,
        koName: p.koName,
        sprite: res.data.sprites.other['official-artwork'].front_default,
        stats: {
          hp: res.data.stats.find((s: any) => s.stat.name === 'hp').base_stat,
          atk: res.data.stats.find((s: any) => s.stat.name === 'attack').base_stat,
          def: res.data.stats.find((s: any) => s.stat.name === 'defense').base_stat,
          spAtk: res.data.stats.find((s: any) => s.stat.name === 'special-attack').base_stat,
          spDef: res.data.stats.find((s: any) => s.stat.name === 'special-defense').base_stat,
          speed: res.data.stats.find((s: any) => s.stat.name === 'speed').base_stat,
        }
      });
    } catch (e) {}
    finally { setIsSearching(false); }
  };

  const optimizeEVs = () => {
    if (!selected) return;
    
    // 1. Optimize for Speed
    let bestSpeedEv = 0;
    let speedNature = 1.0;
    
    // Check neutral nature
    for (let ev = 0; ev <= 252; ev += 4) {
       const s = Math.floor((Math.floor((selected.stats.speed * 2 + 31 + Math.floor(ev / 4)) * 50 / 100) + 5) * 1.0);
       if (s >= targetSpeed) { bestSpeedEv = ev; break; }
    }
    
    // Check positive nature if 252 wasn't enough
    if (Math.floor((Math.floor((selected.stats.speed * 2 + 31 + 252 / 4) * 50 / 100) + 5) * 1.0) < targetSpeed) {
       speedNature = 1.1;
       for (let ev = 0; ev <= 252; ev += 4) {
          const s = Math.floor((Math.floor((selected.stats.speed * 2 + 31 + Math.floor(ev / 4)) * 50 / 100) + 5) * 1.1);
          if (s >= targetSpeed) { bestSpeedEv = ev; break; }
       }
    }

    setResults({ speedEv: bestSpeedEv, nature: speedNature === 1.1 ? 'Jolly/Timid (+Spe)' : 'Neutral' });
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-emerald-500 shadow-[0_12px_0_0_rgba(16,185,129,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg"><FlaskConical size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">노력치 최적화기</h2>
            <p className="text-gray-500 font-bold italic">EV Spread AI Optimizer</p>
          </div>
        </div>

        <div className="relative mb-12">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <input type="text" placeholder="설계할 포켓몬 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border-4 border-transparent focus:border-emerald-500 outline-none p-4 pl-12 rounded-2xl font-bold transition-all shadow-inner text-lg" />
           {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" size={20} />}
           {suggestions.length > 0 && (
             <div className="absolute z-30 w-full mt-2 bg-white border-4 border-emerald-500 rounded-xl shadow-2xl overflow-hidden">
               {suggestions.map(p => (
                 <button key={p.name} onClick={() => selectPokemon(p)} className="w-full p-4 text-left hover:bg-emerald-50 font-bold capitalize flex justify-between border-b border-gray-100">
                   <span>{p.koName || p.name}</span><Plus size={18} className="text-emerald-500" />
                 </button>
               ))}
             </div>
           )}
        </div>

        {selected ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in zoom-in duration-300">
              <div className="space-y-6">
                 <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 flex flex-col items-center">
                    <img src={selected.sprite} className="w-48 h-48 object-contain drop-shadow-lg mb-4" />
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-center">{selected.koName || selected.name}</h3>
                 </div>
                 <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-dashed border-emerald-200">
                    <h4 className="text-xs font-black uppercase text-emerald-600 mb-4 flex items-center gap-2 italic"><Target size={14}/> Optimization Goal</h4>
                    <div className="space-y-4">
                       <div>
                          <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">목표 스피드 실수치</label>
                          <div className="flex gap-2">
                             <input type="range" min="1" max="300" value={targetSpeed} onChange={e => setTargetSpeed(Number(e.target.value))} className="flex-grow accent-emerald-500" />
                             <span className="font-black text-emerald-600 w-8">{targetSpeed}</span>
                          </div>
                       </div>
                       <button onClick={optimizeEVs} className="w-full py-3 bg-emerald-500 text-white font-black rounded-xl uppercase italic shadow-md hover:bg-emerald-600 transition-all">계산 시작 (Analyze)</button>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 {results ? (
                    <div className="bg-poke-dark rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border-4 border-emerald-400/20">
                       <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-6 tracking-[0.2em] italic underline decoration-white/10 decoration-2">Optimized Result</h4>
                       <div className="space-y-6">
                          <div className="flex items-center gap-4">
                             <div className="bg-emerald-500 p-3 rounded-2xl"><Zap fill="white" size={24}/></div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-gray-400">Recommended Speed EV</p>
                                <p className="text-3xl font-black italic">{results.speedEv} EVs</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="bg-white/10 p-3 rounded-2xl"><CheckCircle2 size={24}/></div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-gray-400">Required Nature</p>
                                <p className="text-xl font-black italic">{results.nature}</p>
                             </div>
                          </div>
                       </div>
                       <div className="mt-8 pt-6 border-t border-white/5">
                          <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic">
                             * 이 분배값은 목표 스피드 {targetSpeed}를 달성하기 위한 **최소한의** 투자량입니다. 남은 노력치를 다른 내구 능력치에 투자하여 효율을 극대화하세요.
                          </p>
                       </div>
                    </div>
                 ) : (
                    <div className="h-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center p-12 text-center text-gray-300 font-bold italic">목표를 설정하고 <br/>계산 버튼을 눌러주세요.</div>
                 )}
              </div>
           </div>
        ) : (
           <div className="py-20 text-center opacity-30 italic font-bold text-gray-400">포켓몬을 검색하여 노력치 설계를 시작하세요.</div>
        )}
      </div>
    </div>
  );
};

export default EVOptimizer;
