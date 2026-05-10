import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Info, TrendingUp, Home, Search, Star, User, Loader2, Trophy, Settings, X, Zap, Heart, List, Grid3X3 } from 'lucide-react';
import { usageStats } from './data/usageStats';
import { pokemonNameMap } from './data/pokemonNames';

const SpeedCalculator = lazy(() => import('./components/SpeedCalculator'));
const TrainerTest = lazy(() => import('./components/TrainerTest'));
const DamageCalculator = lazy(() => import('./components/DamageCalculator'));
const TypeMatchup = lazy(() => import('./components/TypeMatchup'));
const TeamCoverage = lazy(() => import('./components/TeamCoverage'));
const SpeedTiers = lazy(() => import('./components/SpeedTiers'));
const PriorityGuide = lazy(() => import('./components/PriorityGuide'));
const CounterChecker = lazy(() => import('./components/CounterChecker'));
const SettingsTool = lazy(() => import('./components/SettingsTool'));
const BattleLog = lazy(() => import('./components/BattleLog'));
const PartnershipSuggester = lazy(() => import('./components/PartnershipSuggester'));
const CoverageHeatmap = lazy(() => import('./components/CoverageHeatmap'));

type View = 'home' | 'mbti' | 'speed' | 'damage' | 'matchup' | 'coverage' | 'tiers' | 'priority' | 'counter' | 'settings' | 'log' | 'partnership' | 'heatmap';

const themes: Record<string, any> = {
  pikachu: { bg: '#222222' },
  gengar: { bg: '#1A1A1A' },
  mewtwo: { bg: '#1C1C1C' },
  lucario: { bg: '#0A192F' },
};

const tips = [
  "더블 배틀에서는 '도움말' 기술로 아군의 데미지를 1.5배 올릴 수 있습니다.",
  "랭크 변화(+1)는 해당 능력치를 1.5배로 만듭니다.",
  "테라스탈을 활용해 약점을 지우고 기습적인 카운터를 날려보세요.",
  "스피드 수치가 같은 경우 50%의 확률로 선공이 결정됩니다.",
  "필드 효과는 5턴간 유지되며, 다른 필드가 깔리면 덮어씌워집니다.",
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [tipIndex, setTipIndex] = useState(0);
  const [themeId, setThemeId] = useState('pikachu');
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [qsResults, setQsResults] = useState<any[]>([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('poke_theme_id');
    if (savedTheme) setThemeId(savedTheme);
  }, []);

  const handleThemeChange = (id: string) => {
    setThemeId(id);
    localStorage.setItem('poke_theme_id', id);
  };

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * tips.length));
    window.scrollTo(0, 0);
  }, [view]);

  const handleQuickSearch = async (term: string) => {
    setQuickSearchTerm(term);
    if (term.length < 1) { setQsResults([]); return; }
    const ko = Object.entries(pokemonNameMap).filter(([k]) => k.includes(term)).map(([k, e]) => ({ name: e, ko: k }));
    setQsResults(ko.slice(0, 5));
  };

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const handleNav = (newView: View) => {
    triggerHaptic();
    setView(newView);
    setShowQuickSearch(false);
  };

  const renderView = () => {
    return (
      <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-[400px]"><Loader2 size={48} className="animate-spin text-poke-yellow" /></div>}>
        {(() => {
          switch (view) {
            case 'speed': return <SpeedCalculator onBack={() => setView('home')} />;
            case 'mbti': return <TrainerTest onBack={() => setView('home')} />;
            case 'damage': return <DamageCalculator onBack={() => setView('home')} />;
            case 'matchup': return <TypeMatchup onBack={() => setView('home')} />;
            case 'coverage': return <TeamCoverage onBack={() => setView('home')} />;
            case 'tiers': return <SpeedTiers onBack={() => setView('home')} />;
            case 'priority': return <PriorityGuide onBack={() => setView('home')} />;
            case 'counter': return <CounterChecker onBack={() => setView('home')} />;
            case 'settings': return <SettingsTool onBack={() => setView('home')} onThemeChange={handleThemeChange} currentTheme={themeId} />;
            case 'log': return <BattleLog onBack={() => setView('home')} />;
            case 'partnership': return <PartnershipSuggester onBack={() => setView('home')} />;
            case 'heatmap': return <CoverageHeatmap onBack={() => setView('home')} />;
            default:
              return (
                <div className="w-full max-w-7xl animate-in fade-in duration-500 pb-20">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                    <div className="lg:col-span-8 space-y-6">
                       <div className="bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
                          <div className="bg-poke-yellow p-3 rounded-2xl text-poke-dark shadow-lg shrink-0"><Info size={24} /></div>
                          <div><h3 className="text-sm font-black uppercase text-poke-yellow mb-1 italic">VGC Master Tip</h3><p className="text-lg font-bold text-gray-200 leading-snug">"{tips[tipIndex]}"</p></div>
                       </div>
                       <div className="bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-3xl p-6 shadow-xl">
                          <h3 className="text-xs font-black uppercase text-poke-red mb-4 italic tracking-widest"><TrendingUp size={16}/> Usage Stats</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                             {usageStats.map(p => (<div key={p.rank} className="bg-poke-dark/50 p-2 rounded-xl border border-white/5 flex flex-col items-center"><span className="text-[8px] font-black text-poke-yellow uppercase tracking-tighter">Rank {p.rank}</span><span className="text-[10px] font-bold text-white truncate w-full text-center">{p.koName}</span></div>))}
                          </div>
                       </div>
                    </div>
                    <div className="lg:col-span-4 bg-gradient-to-br from-poke-red/20 to-poke-red/5 border-2 border-poke-red/20 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => handleNav('log')}>
                      <Trophy className="text-poke-red mb-2 group-hover:scale-110 transition-transform" size={48} /><h3 className="text-xs font-black uppercase text-poke-red tracking-widest">배틀 로그</h3><p className="font-black text-3xl text-white italic leading-none mt-1">MY RECORDS</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
                    <MenuButton onClick={() => handleNav('mbti')} icon="🐾" title="성향 테스트" color="border-poke-yellow" label="MBTI" />
                    <MenuButton onClick={() => handleNav('speed')} icon="⚡" title="스피드 계산" color="border-poke-red" label="SPEED" />
                    <MenuButton onClick={() => handleNav('damage')} icon="⚔️" title="데미지 시뮬" color="border-poke-blue" label="DAMAGE" />
                    <MenuButton onClick={() => handleNav('matchup')} icon="🛡️" title="타입 상성" color="border-green-500" label="TYPES" />
                    <MenuButton onClick={() => handleNav('coverage')} icon="📊" title="파티 분석" color="border-purple-500" label="TEAM" />
                    <MenuButton onClick={() => handleNav('tiers')} icon="🏁" title="스피드 티어" color="border-orange-500" label="TIERS" />
                    <MenuButton onClick={() => handleNav('heatmap')} icon="🗺️" title="견제 분석" color="border-orange-400" label="HEATMAP" />
                    <MenuButton onClick={() => handleNav('partnership')} icon="🤝" title="팀 빌딩" color="border-indigo-500" label="PARTNER" />
                    <MenuButton onClick={() => handleNav('priority')} icon="🚀" title="우선도 가이드" color="border-cyan-500" label="PRIORITY" />
                    <MenuButton onClick={() => handleNav('counter')} icon="🎯" title="카운터 분석" color="border-pink-500" label="COUNTER" />
                    <MenuButton onClick={() => handleNav('log')} icon="📝" title="배틀 로그" color="border-blue-400" label="LOGS" />
                    <MenuButton onClick={() => handleNav('settings')} icon="⚙️" title="설정 및 테마" color="border-gray-500" label="CONFIG" />
                  </div>
                </div>
              );
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500" style={{ backgroundColor: themes[themeId].bg }}>
      <header className="bg-poke-red p-6 shadow-lg border-b-8 border-poke-dark sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform" onClick={() => handleNav('home')}>
            <div className="w-10 h-10 bg-white rounded-full border-4 border-poke-dark flex items-center justify-center relative overflow-hidden shadow-inner">
               <div className="absolute top-0 w-full h-1/2 bg-poke-red border-b-2 border-poke-dark"></div>
               <div className="z-10 w-3 h-3 bg-white rounded-full border-2 border-poke-dark"></div>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic text-stroke-sm">Pokémon Champions</h1>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setShowQuickSearch(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><Search size={18} /></button>
             <button onClick={() => handleNav('settings')} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><Settings size={18} /></button>
          </div>
        </div>
      </header>

      {showQuickSearch && (
         <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-xl">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input autoFocus type="text" placeholder="포켓몬 퀵 검색 (한글)..." value={quickSearchTerm} onChange={e => handleQuickSearch(e.target.value)} className="w-full bg-white p-5 pl-12 rounded-3xl font-black text-lg text-poke-dark outline-none border-8 border-poke-yellow shadow-2xl" />
                  <button onClick={() => setShowQuickSearch(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
               </div>
               <div className="mt-3 space-y-1.5">
                  {qsResults.map(p => (<button key={p.name} onClick={() => handleNav('counter')} className="w-full p-3 bg-white rounded-xl font-black text-sm text-poke-dark flex justify-between items-center hover:bg-poke-yellow transition-colors group"><span>{p.ko}</span><span className="text-[10px] text-gray-300 group-hover:text-poke-dark italic uppercase">{p.name}</span></button>))}
               </div>
            </div>
         </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">{renderView()}</main>

      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-lg border-t-4 border-poke-dark flex justify-around items-center p-3 z-50 md:hidden shadow-2xl">
        <NavButton icon={<Home />} label="홈" active={view === 'home'} onClick={() => handleNav('home')} />
        <NavButton icon={<Zap />} label="도구" active={view === 'speed' || view === 'damage'} onClick={() => handleNav('speed')} />
        <NavButton icon={<Star />} label="분석" active={view === 'coverage' || view === 'partnership' || view === 'heatmap'} onClick={() => handleNav('coverage')} />
        <NavButton icon={<Trophy />} label="로그" active={view === 'log'} onClick={() => handleNav('log')} />
      </nav>

      <footer className="bg-poke-dark p-6 text-center border-t-2 border-white/10 pb-24 md:pb-6">
        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Pokémon Champions v9.0 Ultimate Master</p>
      </footer>
    </div>
  );
};

const MenuButton = ({ onClick, icon, title, color, label }: any) => (
  <button onClick={onClick} className={`group relative bg-white rounded-3xl p-4 md:p-6 border-4 md:border-8 ${color} shadow-[0_6px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer overflow-hidden`}>
    <div className="flex flex-col items-center gap-1.5 md:gap-3 text-poke-dark">
      <div className="text-3xl md:text-5xl group-hover:scale-110 transition-transform">{icon}</div>
      <h2 className="text-[10px] md:text-sm font-black uppercase tracking-tighter leading-tight text-center">{title}</h2>
      <div className="mt-1 px-2 py-0.5 bg-poke-dark text-white font-black rounded-full text-[7px] md:text-[8px] uppercase italic">{label}</div>
    </div>
  </button>
);

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-0.5 transition-all ${active ? 'text-poke-red scale-110' : 'text-gray-400'}`}>
    {React.cloneElement(icon, { size: 18, strokeWidth: active ? 3 : 2 })}
    <span className={`text-[8px] font-black uppercase ${active ? 'text-poke-red' : 'text-gray-400'}`}>{label}</span>
  </button>
);

export default App;
