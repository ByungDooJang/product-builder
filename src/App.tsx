import React, { useState } from 'react';
import SpeedCalculator from './components/SpeedCalculator';
import TrainerTest from './components/TrainerTest';

type View = 'home' | 'mbti' | 'speed';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');

  const renderView = () => {
    switch (view) {
      case 'speed':
        return <SpeedCalculator onBack={() => setView('home')} />;
      case 'mbti':
        return <TrainerTest onBack={() => setView('home')} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Menu 1: MBTI Test */}
            <button 
              onClick={() => setView('mbti')}
              className="group relative bg-white rounded-3xl p-8 border-8 border-poke-yellow shadow-[0_10px_0_0_rgba(255,203,5,1)] hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer"
            >
              <div className="flex flex-col items-center gap-4 text-poke-dark">
                <div className="text-6xl mb-2">🐾</div>
                <h2 className="text-2xl font-black uppercase">트레이너 성향 테스트</h2>
                <p className="font-bold text-gray-600">나와 닮은 포켓몬은?</p>
                <div className="mt-4 px-6 py-2 bg-poke-yellow text-poke-dark font-black rounded-full text-sm uppercase italic">MBTI Test</div>
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full border-4 border-poke-yellow opacity-20 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Menu 2: Speed Calculator */}
            <button 
              onClick={() => setView('speed')}
              className="group relative bg-white rounded-3xl p-8 border-8 border-poke-red shadow-[0_10px_0_0_rgba(238,21,21,1)] hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer"
            >
              <div className="flex flex-col items-center gap-4 text-poke-dark">
                <div className="text-6xl mb-2">⚡</div>
                <h2 className="text-2xl font-black uppercase">실시간 스피드 계산기</h2>
                <p className="font-bold text-gray-600">누가 먼저 공격할까?</p>
                <div className="mt-4 px-6 py-2 bg-poke-red text-white font-black rounded-full text-sm uppercase italic">Speed Calc</div>
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full border-4 border-poke-red opacity-20 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-poke-red p-6 shadow-lg border-b-8 border-poke-dark sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => setView('home')}
          >
            <div className="w-12 h-12 bg-white rounded-full border-4 border-poke-dark flex items-center justify-center relative overflow-hidden shadow-inner">
               <div className="absolute top-0 w-full h-1/2 bg-poke-red border-b-2 border-poke-dark"></div>
               <div className="z-10 w-4 h-4 bg-white rounded-full border-2 border-poke-dark"></div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
              Pokémon Champions <span className="text-poke-yellow">Battle Helper</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
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

      {/* Footer */}
      <footer className="bg-poke-dark p-6 text-center border-t-2 border-white/10">
        <p className="text-gray-500 font-bold">© 2026 Pokémon Champions Battle Helper. No rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
