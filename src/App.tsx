import React, { useState, useEffect } from 'react';
import SpeedCalculator from './components/SpeedCalculator';
import TrainerTest from './components/TrainerTest';
import DamageCalculator from './components/DamageCalculator';
import TypeMatchup from './components/TypeMatchup';
import TeamCoverage from './components/TeamCoverage';
import SpeedTiers from './components/SpeedTiers';
import { Info, TrendingUp, Home, Search, Star, User } from 'lucide-react';

type View = 'home' | 'mbti' | 'speed' | 'damage' | 'matchup' | 'coverage' | 'tiers';

const tips = [
  "스피드 수치가 단 1 차이로도 선공권이 결정됩니다. 최속 보정은 필수!",
  "타입 상성에서 '무효'를 활용해 교체 플레이를 시도해보세요.",
  "도구 '구애스카프'는 스피드를 1.5배 올려주지만 기술이 하나로 고정됩니다.",
  "자속 보정(STAB)은 기술의 위력을 1.5배 강하게 만듭니다.",
  "날씨와 필드 효과는 배틀의 판도를 뒤집는 핵심 요소입니다.",
  "상대방의 남은 HP를 보고 데미지 계산기로 확정 타수를 확인하세요.",
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * tips.length));
    window.scrollTo(0, 0);
  }, [view]);

  // Haptic feedback simulation (for mobile)
  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const handleNav = (newView: View) => {
    triggerHaptic();
    setView(newView);
  };

  const renderView = () => {
    switch (view) {
      case 'speed': return <SpeedCalculator onBack={() => setView('home')} />;
      case 'mbti': return <TrainerTest onBack={() => setView('home')} />;
      case 'damage': return <DamageCalculator onBack={() => setView('home')} />;
      case 'matchup': return <TypeMatchup onBack={() => setView('home')} />;
      case 'coverage': return <TeamCoverage onBack={() => setView('home')} />;
      case 'tiers': return <SpeedTiers onBack={() => setView('home')} />;
      default:
        return (
          <div className="w-full max-w-7xl animate-in fade-in duration-500 pb-20 md:pb-0">
            {/* Dashboard Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="md:col-span-2 bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
                <div className="bg-poke-yellow p-3 rounded-2xl text-poke-dark shadow-lg shrink-0 animate-pulse"><Info size={24} /></div>
                <div>
                  <h3 className="text-sm font-black uppercase text-poke-yellow mb-1 tracking-tighter italic">오늘의 배틀 팁</h3>
                  <p className="text-lg font-bold text-gray-200 leading-snug">"{tips[tipIndex]}"</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-poke-red/20 to-poke-red/5 border-2 border-poke-red/20 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-xl">
                <TrendingUp className="text-poke-red mb-2" size={32} />
                <h3 className="text-xs font-black uppercase text-poke-red tracking-widest">실전 메타 분석</h3>
                <p className="font-bold text-white uppercase italic text-sm">Series 19 Active</p>
              </div>
            </div>

            {/* Main Tools Grid (3x2) */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              <MenuButton onClick={() => handleNav('mbti')} icon="🐾" title="성향 테스트" sub="MBTI 분석" borderColor="border-poke-yellow" bgColor="bg-poke-yellow" label="Trainer Test" />
              <MenuButton onClick={() => handleNav('speed')} icon="⚡" title="스피드 계산" sub="선공권 판별" borderColor="border-poke-red" bgColor="bg-poke-red" label="Speed Calc" />
              <MenuButton onClick={() => handleNav('damage')} icon="⚔️" title="데미지 계산" sub="위력 시뮬레이션" borderColor="border-poke-blue" bgColor="bg-poke-blue" label="Damage Calc" />
              <MenuButton onClick={() => handleNav('matchup')} icon="🛡️" title="타입 상성" sub="약점 체크" borderColor="border-green-500" bgColor="bg-green-500" label="Type Checker" />
              <MenuButton onClick={() => handleNav('coverage')} icon="📊" title="파티 분석" sub="팀 밸런스" borderColor="border-purple-500" bgColor="bg-purple-500" label="Team Analysis" />
              <MenuButton onClick={() => handleNav('tiers')} icon="🏁" title="스피드 티어" sub="속도 비교표" borderColor="border-orange-500" bgColor="bg-orange-500" label="Speed Tiers" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-poke-red p-6 shadow-lg border-b-8 border-poke-dark sticky top-0 z-50 transition-all active:py-5">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform" onClick={() => handleNav('home')}>
            <div className="w-12 h-12 bg-white rounded-full border-4 border-poke-dark flex items-center justify-center relative overflow-hidden shadow-inner">
               <div className="absolute top-0 w-full h-1/2 bg-poke-red border-b-2 border-poke-dark"></div>
               <div className="z-10 w-4 h-4 bg-white rounded-full border-2 border-poke-dark"></div>
            </div>
            <h1 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
              Pokémon Champions <span className="text-poke-yellow">Battle Helper</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center">
        {renderView()}

        {view === 'home' && (
          <div className="mt-16 bg-white/5 backdrop-blur-md p-8 rounded-2xl border-2 border-white/10 max-w-2xl text-center hidden md:block">
            <p className="text-lg font-medium text-gray-400 italic">"포켓몬 배틀의 승리를 위한 최고의 파트너!"</p>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-lg border-t-4 border-poke-dark flex justify-around items-center p-3 z-50 md:hidden shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <NavButton icon={<Home />} label="홈" active={view === 'home'} onClick={() => handleNav('home')} />
        <NavButton icon={<Search />} label="도구" active={view !== 'home' && view !== 'mbti'} onClick={() => handleNav('speed')} />
        <NavButton icon={<User />} label="성향" active={view === 'mbti'} onClick={() => handleNav('mbti')} />
        <NavButton icon={<Star />} label="파티" active={view === 'coverage'} onClick={() => handleNav('coverage')} />
      </nav>

      <footer className="bg-poke-dark p-6 text-center border-t-2 border-white/10 pb-24 md:pb-6">
        <p className="text-gray-500 font-bold text-sm">© 2026 Pokémon Champions Battle Helper.</p>
      </footer>
    </div>
  );
};

const MenuButton = ({ onClick, icon, title, sub, borderColor, bgColor, label }: any) => (
  <button 
    onClick={onClick}
    className={`group relative bg-white rounded-3xl p-5 md:p-6 border-4 md:border-8 ${borderColor} shadow-[0_6px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer overflow-hidden`}
  >
    <div className="flex flex-col items-center gap-2 md:gap-3 text-poke-dark">
      <div className="text-4xl md:text-5xl group-hover:scale-110 transition-transform drop-shadow-sm">{icon}</div>
      <h2 className="text-sm md:text-xl font-black uppercase tracking-tighter leading-none">{title}</h2>
      <p className="font-bold text-gray-400 text-[9px] md:text-xs text-center leading-tight">{sub}</p>
      <div className={`mt-1 md:mt-2 px-3 md:px-4 py-1 bg-poke-dark text-white font-black rounded-full text-[8px] md:text-[10px] uppercase italic`}>{label}</div>
    </div>
    {/* Inner glow effect */}
    <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-[0.03] transition-opacity`}></div>
  </button>
);

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-poke-red scale-110' : 'text-gray-400'}`}>
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 3 : 2 })}
    <span className={`text-[10px] font-black uppercase ${active ? 'text-poke-red' : 'text-gray-400'}`}>{label}</span>
  </button>
);

export default App;
