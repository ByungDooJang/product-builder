import React from 'react';
import { Zap, ChevronLeft } from 'lucide-react';

interface SpeedCalculatorProps {
  onBack: () => void;
}

const SpeedCalculator: React.FC<SpeedCalculatorProps> = ({ onBack }) => {
  const [baseSpeed, setBaseSpeed] = React.useState<number>(100);
  const [level, setLevel] = React.useState<number>(50);
  const [iv, setIv] = React.useState<number>(31);
  const [ev, setEv] = React.useState<number>(0);
  const [nature, setNature] = React.useState<number>(1.0);
  const [modifier, setModifier] = React.useState<number>(1.0);

  // Speed Formula: ((Base * 2 + IV + (EV/4)) * Level / 100 + 5) * Nature * Modifiers
  const calculateSpeed = () => {
    const stats = Math.floor((baseSpeed * 2 + iv + Math.floor(ev / 4)) * level / 100 + 5);
    return Math.floor(stats * nature * modifier);
  };

  const finalSpeed = calculateSpeed();

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
