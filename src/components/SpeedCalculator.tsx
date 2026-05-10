import React, { useState, useEffect } from 'react';
import { Zap, ChevronLeft, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

interface SpeedCalculatorProps {
  onBack: () => void;
}

interface PokemonData {
  name: string;
  url: string;
}

const SpeedCalculator: React.FC<SpeedCalculatorProps> = ({ onBack }) => {
  const [baseSpeed, setBaseSpeed] = useState<number>(100);
  const [level, setLevel] = useState<number>(50);
  const [iv, setIv] = useState<number>(31);
  const [ev, setEv] = useState<number>(0);
  const [nature, setNature] = useState<number>(1.0);
  const [modifier, setModifier] = useState<number>(1.0);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<PokemonData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Speed Formula: ((Base * 2 + IV + (EV/4)) * Level / 100 + 5) * Nature * Modifiers
  const calculateSpeed = () => {
    const stats = Math.floor((baseSpeed * 2 + iv + Math.floor(ev / 4)) * level / 100 + 5);
    return Math.floor(stats * nature * modifier);
  };

  const finalSpeed = calculateSpeed();

  // Search for Pokémon
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        // Fetch all pokemon names (cached or limited)
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const matches = response.data.results.filter((p: PokemonData) => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
        setSuggestions(matches);
      } catch (error) {
        console.error('Error fetching suggestions', error);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const selectPokemon = async (name: string) => {
    setIsSearching(true);
    setSearchTerm(name);
    setShowSuggestions(false);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const speedStat = response.data.stats.find((s: any) => s.stat.name === 'speed');
      if (speedStat) {
        setBaseSpeed(speedStat.base_stat);
      }
    } catch (error) {
      alert('포켓몬 정보를 가져오는데 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight"
      >
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-red shadow-[0_12px_0_0_rgba(238,21,21,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-poke-red p-3 rounded-2xl text-white shadow-lg">
            <Zap size={32} fill="white" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">실시간 스피드 계산기</h2>
            <p className="text-gray-500 font-bold">누가 먼저 선공을 가져갈까요?</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <label className="block text-sm font-black uppercase mb-1">포켓몬 검색 (English)</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="예: Pikachu, Garchomp..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-red outline-none p-3 pl-12 rounded-xl font-bold transition-all"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-poke-red" size={20} />
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-2 bg-white border-4 border-poke-red rounded-xl shadow-xl overflow-hidden">
              {suggestions.map((p) => (
                <button
                  key={p.name}
                  onClick={() => selectPokemon(p.name)}
                  className="w-full p-4 text-left hover:bg-gray-50 font-bold capitalize border-b last:border-none border-gray-100"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black uppercase mb-1">스피드 종족값 (Base)</label>
              <input 
                type="number" 
                value={baseSpeed} 
                onChange={(e) => setBaseSpeed(Number(e.target.value))}
                className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-red outline-none p-3 rounded-xl font-bold transition-all"
              />
            </div>
...
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black uppercase mb-1">레벨 (Level)</label>
                <input 
                  type="number" 
                  value={level} 
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-red outline-none p-3 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase mb-1">개체값 (IV)</label>
                <input 
                  type="number" 
                  value={iv} 
                  onChange={(e) => setIv(Number(e.target.value))}
                  className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-red outline-none p-3 rounded-xl font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black uppercase mb-1">노력치 (EV)</label>
              <input 
                type="number" 
                value={ev} 
                step={4}
                max={252}
                onChange={(e) => setEv(Number(e.target.value))}
                className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-red outline-none p-3 rounded-xl font-bold"
              />
            </div>
          </div>

          {/* Result & Modifiers */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase mb-1">성격 (Nature)</label>
                <select 
                  value={nature} 
                  onChange={(e) => setNature(Number(e.target.value))}
                  className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-red outline-none p-3 rounded-xl font-bold appearance-none cursor-pointer"
                >
                  <option value={1.1}>상승 (x1.1)</option>
                  <option value={1.0}>보통 (x1.0)</option>
                  <option value={0.9}>하락 (x0.9)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-1">도구/특성 (Modifier)</label>
                <select 
                  value={modifier} 
                  onChange={(e) => setModifier(Number(e.target.value))}
                  className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-red outline-none p-3 rounded-xl font-bold appearance-none cursor-pointer"
                >
                  <option value={1.0}>없음 (x1.0)</option>
                  <option value={1.5}>구애스카프 (x1.5)</option>
                  <option value={2.0}>쓱쓱/엽록소/곡예 (x2.0)</option>
                  <option value={0.5}>마비/철구 (x0.5)</option>
                </select>
              </div>
            </div>

            <div className="bg-poke-dark text-white p-6 rounded-2xl text-center shadow-inner relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-black uppercase text-poke-yellow mb-1 tracking-widest">실제 스피드 수치</p>
                <div className="text-6xl font-black italic">{finalSpeed}</div>
              </div>
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
            </div>
          </div>
        </div>

        {/* Speed Tiers Hint (Simple) */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-xl border-2 border-dashed border-poke-yellow">
          <p className="text-xs font-bold text-gray-600 leading-relaxed">
            💡 팁: 최속 130족(스피드 수치 200)을 추월하려면 이 수치가 201 이상이어야 합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeedCalculator;
