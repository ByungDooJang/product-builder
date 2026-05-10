import React, { useState, useEffect } from 'react';
import SpeedCalculator from './components/SpeedCalculator';
import TrainerTest from './components/TrainerTest';
import DamageCalculator from './components/DamageCalculator';
import TypeMatchup from './components/TypeMatchup';
import { Info, TrendingUp } from 'lucide-react';

type View = 'home' | 'mbti' | 'speed' | 'damage' | 'matchup';

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
  }, [view]);

  const renderView = () => {
    switch (view) {
      case 'speed':
        return <SpeedCalculator onBack={() => setView('home')} />;
      case 'mbti':
        return <TrainerTest onBack={() => setView('home')} />;
      case 'damage':
        return <DamageCalculator onBack={() => setView('home')} />;
      case 'matchup':
        return <TypeMatchup onBack={() => setView('home')} />;
      default:
        return (
          <div className="w-full max-w-7xl">
            {/* Dashboard Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="md:col-span-2 bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-3xl p-6 flex items-start gap-4">
                <div className="bg-poke-yellow p-3 rounded-2xl text-poke-dark shadow-lg shrink-0">
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-poke-yellow mb-1 tracking-tighter italic">오늘의 배틀 팁</h3>
                  <p className="text-lg font-bold text-gray-200 leading-snug">"{tips[tipIndex]}"</p>
                </div>
              </div>
              <div className="bg-poke-red/10 border-2 border-poke-red/20 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                <TrendingUp className="text-poke-red mb-2" size={32} />
                <h3 className="text-xs font-black uppercase text-poke-red tracking-widest">실전 메타 분석</h3>
                <p className="font-bold text-white uppercase italic">Series 19 Active</p>
              </div>
            </div>

            {/* Main Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => setView('mbti')}
                className="group relative bg-white rounded-3xl p-6 border-8 border-poke-yellow shadow-[0_8px_0_0_rgba(255,203,5,1)] hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-3 text-poke-dark">
                  <div className="text-5xl group-hover:scale-110 transition-transform">🐾</div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">성향 테스트</h2>
                  <p className="font-bold text-gray-500 text-xs text-center leading-tight">나와 닮은 포켓몬은?</p>
                  <div className="mt-2 px-4 py-1.5 bg-poke-yellow text-poke-dark font-black rounded-full text-[10px] uppercase italic">MBTI Test</div>
                </div>
              </button>

              <button 
                onClick={() => setView('speed')}
                className="group relative bg-white rounded-3xl p-6 border-8 border-poke-red shadow-[0_8px_0_0_rgba(238,21,21,1)] hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-3 text-poke-dark">
                  <div className="text-5xl group-hover:scale-110 transition-transform">⚡</div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">스피드 계산</h2>
                  <p className="font-bold text-gray-500 text-xs text-center leading-tight">누가 먼저 공격할까?</p>
                  <div className="mt-2 px-4 py-1.5 bg-poke-red text-white font-black rounded-full text-[10px] uppercase italic">Speed Calc</div>
                </div>
              </button>

              <button 
                onClick={() => setView('damage')}
                className="group relative bg-white rounded-3xl p-6 border-8 border-poke-blue shadow-[0_8px_0_0_rgba(59,76,202,1)] hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-3 text-poke-dark">
                  <div className="text-5xl group-hover:scale-110 transition-transform">⚔️</div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">데미지 계산</h2>
                  <p className="font-bold text-gray-500 text-xs text-center leading-tight">얼마나 아프게 때릴까?</p>
                  <div className="mt-2 px-4 py-1.5 bg-poke-blue text-white font-black rounded-full text-[10px] uppercase italic">Damage Calc</div>
                </div>
              </button>

              <button 
                onClick={() => setView('matchup')}
                className="group relative bg-white rounded-3xl p-6 border-8 border-green-500 shadow-[0_8px_0_0_rgba(34,197,94,1)] hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-3 text-poke-dark">
                  <div className="text-5xl group-hover:scale-110 transition-transform">🛡️</div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">타입 상성</h2>
                  <p className="font-bold text-gray-500 text-xs text-center leading-tight">이 포켓몬의 약점은?</p>
                  <div className="mt-2 px-4 py-1.5 bg-green-500 text-white font-black rounded-full text-[10px] uppercase italic">Type Checker</div>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-poke-red p-6 shadow-lg border-b-8 border-poke-dark sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
            onClick={() => setView('home')}
          >
            <div className="w-12 h-12 bg-white rounded-full border-4 border-poke-dark flex items-center justify-center relative overflow-hidden shadow-inner">
               <div className="absolute top-0 w-full h-1/2 bg-poke-red border-b-2 border-poke-dark"></div>
               <div className="z-10 w-4 h-4 bg-white rounded-full border-2 border-poke-dark"></div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
              Pokémon Champions <span className="text-poke-yellow text-stroke-sm">Battle Helper</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        {renderView()}

        {view === 'home' && (
          <div className="mt-16 bg-white/10 backdrop-blur-md p-8 rounded-2xl border-2 border-white/20 max-w-2xl text-center">
            <p className="text-lg font-medium text-gray-300 italic">
              "포켓몬 배틀의 승리를 위한 최고의 파트너! 지금 바로 시작하세요."
            </p>
          </div>
        )}
      </main>

      <footer className="bg-poke-dark p-6 text-center border-t-2 border-white/10">
        <p className="text-gray-500 font-bold text-sm">© 2026 Pokémon Champions Battle Helper. No rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
