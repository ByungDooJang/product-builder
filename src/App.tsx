import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Info, TrendingUp, Home, Search, Star, User, Loader2 } from 'lucide-react';

const SpeedCalculator = lazy(() => import('./components/SpeedCalculator'));
const TrainerTest = lazy(() => import('./components/TrainerTest'));
const DamageCalculator = lazy(() => import('./components/DamageCalculator'));
const TypeMatchup = lazy(() => import('./components/TypeMatchup'));
const TeamCoverage = lazy(() => import('./components/TeamCoverage'));
const SpeedTiers = lazy(() => import('./components/SpeedTiers'));
const PriorityGuide = lazy(() => import('./components/PriorityGuide'));
const CounterChecker = lazy(() => import('./components/CounterChecker'));
const SettingsTool = lazy(() => import('./components/SettingsTool'));

type View = 'home' | 'mbti' | 'speed' | 'damage' | 'matchup' | 'coverage' | 'tiers' | 'priority' | 'counter' | 'settings';

const themes: Record<string, any> = {
  pikachu: { primary: '#FFCB05', secondary: '#EE1515', bg: '#222222', accent: '#3B4CCA' },
  gengar: { primary: '#735797', secondary: '#483D8B', bg: '#1A1A1A', accent: '#FF4500' },
  mewtwo: { primary: '#F95587', secondary: '#D685AD', bg: '#1C1C1C', accent: '#6F35FC' },
  lucario: { primary: '#0072BB', secondary: '#B7B7CE', bg: '#0A192F', accent: '#C22E28' },
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

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const handleNav = (newView: View) => {
    triggerHaptic();
    setView(newView);
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
            default:
              return (
                <div className="w-full max-w-7xl animate-in fade-in duration-500 pb-20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="md:col-span-2 bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
                      <div className="bg-poke-yellow p-3 rounded-2xl text-poke-dark shadow-lg shrink-0"><Info size={24} /></div>
                      <div>
                        <h3 className="text-sm font-black uppercase text-poke-yellow mb-1 italic">Master's Battle Tip</h3>
                        <p className="text-lg font-bold text-gray-200 leading-snug">"{tips[tipIndex]}"</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-poke-red/20 to-poke-red/5 border-2 border-poke-red/20 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-xl">
                      <TrendingUp className="text-poke-red mb-2" size={32} />
                      <h3 className="text-xs font-black uppercase text-poke-red tracking-widest">VGC Season 19</h3>
                      <p className="font-bold text-white uppercase italic text-sm">Master Mode Active</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8">
                    <MenuButton onClick={() => handleNav('mbti')} icon="🐾" title="성향 테스트" sub="트레이너 분석" color="border-poke-yellow" label="Trainer Test" />
                    <MenuButton onClick={() => handleNav('speed')} icon="⚡" title="스피드 계산" sub="선공권 판별" color="border-poke-red" label="Speed Calc" />
                    <MenuButton onClick={() => handleNav('damage')} icon="⚔️" title="데미지 계산" sub="VGC 시뮬레이션" color="border-poke-blue" label="Damage Calc" />
                    <MenuButton onClick={() => handleNav('matchup')} icon="🛡️" title="타입 상성" sub="약점 체크" color="border-green-500" label="Type Checker" />
                    <MenuButton onClick={() => handleNav('coverage')} icon="📊" title="파티 분석" sub="멀티 팀 관리" color="border-purple-500" label="Team Analysis" />
                    <MenuButton onClick={() => handleNav('tiers')} icon="🏁" title="스피드 티어" sub="실전 속도 비교" color="border-orange-500" label="Speed Tiers" />
                    <MenuButton onClick={() => handleNav('priority')} icon="🚀" title="우선도 가이드" sub="기술 선제권" color="border-cyan-500" label="Move Priority" />
                    <MenuButton onClick={() => handleNav('counter')} icon="🎯" title="카운터 분석" sub="전술 설계" color="border-pink-500" label="Counter Analysis" />
                    <MenuButton onClick={() => handleNav('settings')} icon="⚙️" title="설정 및 테마" sub="앱 커스터마이징" color="border-gray-500" label="Settings" />
                  </div>
                </div>
              );
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-500" style={{ backgroundColor: themes[themeId].bg }}>
      <header className="bg-poke-red p-6 shadow-lg border-b-8 border-poke-dark sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform" onClick={() => handleNav('home')}>
            <div className="w-12 h-12 bg-white rounded-full border-4 border-poke-dark flex items-center justify-center relative overflow-hidden shadow-inner">
               <div className="absolute top-0 w-full h-1/2 bg-poke-red border-b-2 border-poke-dark"></div>
               <div className="z-10 w-4 h-4 bg-white rounded-full border-2 border-poke-dark"></div>
            </div>
            <h1 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic">Pokémon Champions</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">{renderView()}</main>

      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-lg border-t-4 border-poke-dark flex justify-around items-center p-3 z-50 md:hidden">
        <NavButton icon={<Home />} label="홈" active={view === 'home'} onClick={() => handleNav('home')} />
        <NavButton icon={<Search />} label="도구" active={view !== 'home' && view !== 'settings'} onClick={() => handleNav('speed')} />
        <NavButton icon={<Star />} label="분석" active={view === 'coverage' || view === 'counter'} onClick={() => handleNav('coverage')} />
        <NavButton icon={<Settings />} label="설정" active={view === 'settings'} onClick={() => handleNav('settings')} />
      </nav>

      <footer className="bg-poke-dark p-6 text-center border-t-2 border-white/10 pb-24 md:pb-6">
        <p className="text-gray-500 font-bold text-sm">© 2026 Pokémon Champions v6.0 Master.</p>
      </footer>
    </div>
  );
};

const MenuButton = ({ onClick, icon, title, sub, color, label }: any) => (
  <button onClick={onClick} className={`group relative bg-white rounded-3xl p-5 border-4 md:border-8 ${color} shadow-[0_6px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer overflow-hidden`}>
    <div className="flex flex-col items-center gap-2 text-poke-dark">
      <div className="text-4xl md:text-5xl group-hover:scale-110 transition-transform">{icon}</div>
      <h2 className="text-[12px] md:text-xl font-black uppercase tracking-tighter">{title}</h2>
      <p className="font-bold text-gray-400 text-[8px] md:text-xs text-center">{sub}</p>
      <div className="mt-1 md:mt-2 px-3 py-1 bg-poke-dark text-white font-black rounded-full text-[8px] md:text-[10px] uppercase italic">{label}</div>
    </div>
  </button>
);

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-poke-red scale-110' : 'text-gray-400'}`}>
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 3 : 2 })}
    <span className={`text-[10px] font-black uppercase ${active ? 'text-poke-red' : 'text-gray-400'}`}>{label}</span>
  </button>
);

export default App;
