import React, { useState, useEffect } from 'react';
import { ShieldAlert, ChevronLeft, Swords, ShieldCheck, Search, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { pokemonNameMap } from '../data/pokemonNames';

interface TypeMatchupProps {
  onBack: () => void;
}

interface PokemonData {
  name: string;
  koName?: string;
}

const types = [
  { name: 'Normal', ko: '노말', color: '#A8A77A' },
  { name: 'Fire', ko: '불꽃', color: '#EE8130' },
  { name: 'Water', ko: '물', color: '#6390F0' },
  { name: 'Electric', ko: '전기', color: '#F7D02C' },
  { name: 'Grass', ko: '풀', color: '#7AC74C' },
  { name: 'Ice', ko: '얼음', color: '#96D9D6' },
  { name: 'Fighting', ko: '격투', color: '#C22E28' },
  { name: 'Poison', ko: '독', color: '#A33EA1' },
  { name: 'Ground', ko: '땅', color: '#E2BF65' },
  { name: 'Flying', ko: '비행', color: '#A98FF3' },
  { name: 'Psychic', ko: '에스퍼', color: '#F95587' },
  { name: 'Bug', ko: '벌레', color: '#A6B91A' },
  { name: 'Rock', ko: '바위', color: '#B6A136' },
  { name: 'Ghost', ko: '고스트', color: '#735797' },
  { name: 'Dragon', ko: '드래곤', color: '#6F35FC' },
  { name: 'Steel', ko: '강철', color: '#B7B7CE' },
  { name: 'Fairy', ko: '페어리', color: '#D685AD' },
  { name: 'Dark', ko: '악', color: '#705746' },
];

const matchupData: Record<string, { double: string[], half: string[], zero: string[] }> = {
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

const TypeMatchup: React.FC<TypeMatchupProps> = ({ onBack }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sprite, setSprite] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<PokemonData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const toggleType = (typeName: string) => {
    setSprite(null);
    if (selectedTypes.includes(typeName)) {
      setSelectedTypes(selectedTypes.filter(t => t !== typeName));
    } else if (selectedTypes.length < 2) {
      setSelectedTypes([...selectedTypes, typeName]);
    }
  };

  const fetchSuggestions = async () => {
    if (searchTerm.length < 1) {
      setSuggestions([]);
      return;
    }
    const koMatches = Object.entries(pokemonNameMap)
      .filter(([ko]) => ko.includes(searchTerm))
      .map(([ko, en]) => ({ name: en, koName: ko }));

    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const enMatches = response.data.results
        .filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((p: any) => ({ name: p.name }));
      
      const combinedMap = new Map();
      [...koMatches, ...enMatches].forEach(p => {
        if (!combinedMap.has(p.name)) combinedMap.set(p.name, p);
        else if (p.koName) combinedMap.set(p.name, p);
      });
      setSuggestions(Array.from(combinedMap.values()).slice(0, 5));
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const selectPokemon = async (p: PokemonData) => {
    setIsSearching(true);
    setSearchTerm(p.koName || p.name);
    setShowSuggestions(false);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${p.name}`);
      const typesData = response.data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
      const spriteUrl = response.data.sprites.other['official-artwork'].front_default || response.data.sprites.front_default;
      setSelectedTypes(typesData);
      setSprite(spriteUrl);
    } catch (error) { alert('실패'); }
    finally { setIsSearching(false); }
  };

  const calculateMatchups = () => {
    const scores: Record<string, number> = {};
    types.forEach(t => scores[t.name] = 1);

    selectedTypes.forEach(typeName => {
      const data = matchupData[typeName];
      if (!data) return;
      data.double.forEach(t => scores[t] *= 2);
      data.half.forEach(t => scores[t] *= 0.5);
      data.zero.forEach(t => scores[t] *= 0);
    });

    return scores;
  };

  const results = calculateMatchups();
  const weaknesses = Object.entries(results).filter(([_, score]) => score > 1).sort((a, b) => b[1] - a[1]);
  const resistances = Object.entries(results).filter(([_, score]) => score < 1 && score > 0).sort((a, b) => a[1] - b[1]);
  const immunities = Object.entries(results).filter(([_, score]) => score === 0);

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight"
      >
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-yellow shadow-[0_12px_0_0_rgba(255,203,5,1)] text-poke-dark">
        <div className="flex items-center justify-between border-b-4 border-gray-100 pb-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-poke-yellow p-3 rounded-2xl text-poke-dark shadow-lg">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">타입 상성 체크</h2>
              <p className="text-gray-500 font-bold">포켓몬의 약점과 강점을 분석하세요!</p>
            </div>
          </div>
          {selectedTypes.length > 0 && (
            <button onClick={() => {setSelectedTypes([]); setSearchTerm(''); setSprite(null);}} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          )}
        </div>

        <div className="mb-8 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="포켓몬 검색하여 타입 자동 선택..." 
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setShowSuggestions(true);}}
              className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-yellow outline-none p-3 pl-12 rounded-xl font-bold transition-all"
            />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-poke-yellow" size={20} />}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-2 bg-white border-4 border-poke-yellow rounded-xl shadow-xl overflow-hidden">
              {suggestions.map(p => (
                <button key={p.name} onClick={() => selectPokemon(p)} className="w-full p-3 text-left hover:bg-yellow-50 font-bold capitalize flex justify-between border-b last:border-none border-gray-100">
                  <span>{p.koName || p.name}</span>
                  {p.koName && <span className="text-gray-300 text-xs">{p.name}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="text-sm font-black uppercase mb-4 text-gray-400 tracking-widest italic">타입 선택 (최대 2개)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2">
              {types.map(type => {
                const isSelected = selectedTypes.includes(type.name);
                return (
                  <button
                    key={type.name}
                    onClick={() => toggleType(type.name)}
                    style={{ 
                      backgroundColor: isSelected ? type.color : '#f3f4f6',
                      color: isSelected ? 'white' : '#6b7280',
                      borderColor: isSelected ? 'rgba(0,0,0,0.1)' : 'transparent'
                    }}
                    className={`p-3 rounded-xl font-black text-xs uppercase transition-all border-b-4 active:border-b-0 active:translate-y-1 shadow-sm`}
                  >
                    {type.ko}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {selectedTypes.length > 0 && (
              <>
                {sprite && (
                  <div className="flex justify-center mb-6 bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 animate-in zoom-in duration-300">
                    <img src={sprite} alt="Pokemon" className="w-40 h-40 object-contain drop-shadow-lg" />
                  </div>
                )}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black uppercase mb-3 text-poke-red">
                    <Swords size={16} /> 약점 (데미지 많이 받음)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {weaknesses.map(([name, score]) => {
                      const type = types.find(t => t.name === name);
                      return (
                        <div key={name} style={{ backgroundColor: type?.color }} className="px-3 py-1 rounded-full text-white text-xs font-black shadow-sm flex items-center gap-2">
                          {type?.ko} <span className="bg-white/20 px-1.5 rounded">x{score}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black uppercase mb-3 text-green-600">
                    <ShieldCheck size={16} /> 반감 (데미지 적게 받음)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resistances.map(([name, score]) => {
                      const type = types.find(t => t.name === name);
                      return (
                        <div key={name} style={{ backgroundColor: type?.color }} className="px-3 py-1 rounded-full text-white text-xs font-black shadow-sm flex items-center gap-2">
                          {type?.ko} <span className="bg-white/20 px-1.5 rounded">x{score}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {immunities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase mb-3 text-gray-400 italic">무효 (데미지 없음)</h3>
                    <div className="flex flex-wrap gap-2">
                      {immunities.map(([name]) => {
                        const type = types.find(t => t.name === name);
                        return (
                          <div key={name} style={{ backgroundColor: type?.color }} className="px-3 py-1 rounded-full text-white text-xs font-black shadow-sm flex items-center gap-2">
                            {type?.ko} <span className="bg-white/20 px-1.5 rounded">x0</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeMatchup;
