import React, { useState } from 'react';
import { Swords, ChevronLeft, Shield, Target } from 'lucide-react';

interface DamageCalculatorProps {
  onBack: () => void;
}

const DamageCalculator: React.FC<DamageCalculatorProps> = ({ onBack }) => {
  const [level, setLevel] = useState<number>(50);
  const [attack, setAttack] = useState<number>(100);
  const [defense, setDefense] = useState<number>(100);
  const [power, setPower] = useState<number>(80);
  const [typeEffectiveness, setTypeEffectiveness] = useState<number>(1.0);
  const [isStab, setIsStab] = useState<boolean>(true);
  const [isCritical, setIsCritical] = useState<boolean>(false);

  // Simplified Damage Formula:
  // Damage = (((2 * Level / 5 + 2) * Power * A/D) / 50 + 2) * STAB * Type * Critical * Random(0.85~1.0)
  const calculateDamage = (random: number) => {
    const baseDamage = (((2 * level / 5 + 2) * power * attack / defense) / 50 + 2);
    const stabMult = isStab ? 1.5 : 1.0;
    const critMult = isCritical ? 1.5 : 1.0;
    return Math.floor(baseDamage * stabMult * typeEffectiveness * critMult * random);
  };

  const minDamage = calculateDamage(0.85);
  const maxDamage = calculateDamage(1.0);

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight"
      >
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-blue shadow-[0_12px_0_0_rgba(59,76,202,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-poke-blue p-3 rounded-2xl text-white shadow-lg">
            <Swords size={32} fill="white" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">데미지 계산기</h2>
            <p className="text-gray-500 font-bold">공격의 위력을 예측해보세요!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black uppercase mb-1 italic">레벨</label>
                <input type="number" value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-blue outline-none p-3 rounded-xl font-bold" />
              </div>
              <div>
                <label className="block text-sm font-black uppercase mb-1 italic">기술 위력</label>
                <input type="number" value={power} onChange={(e) => setPower(Number(e.target.value))} className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-blue outline-none p-3 rounded-xl font-bold" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black uppercase mb-1 italic flex items-center gap-2">
                <Target size={14} /> 공격측 능력치 (공격/특공)
              </label>
              <input type="number" value={attack} onChange={(e) => setAttack(Number(e.target.value))} className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-blue outline-none p-3 rounded-xl font-bold" />
            </div>

            <div>
              <label className="block text-sm font-black uppercase mb-1 italic flex items-center gap-2">
                <Shield size={14} /> 방어측 능력치 (방어/특방)
              </label>
              <input type="number" value={defense} onChange={(e) => setDefense(Number(e.target.value))} className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-blue outline-none p-3 rounded-xl font-bold" />
            </div>
          </div>

          {/* Modifiers */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black uppercase mb-1 italic">상성 효과</label>
              <select value={typeEffectiveness} onChange={(e) => setTypeEffectiveness(Number(e.target.value))} className="w-full bg-gray-100 border-4 border-transparent focus:border-poke-blue outline-none p-3 rounded-xl font-bold appearance-none cursor-pointer">
                <option value={4.0}>효과가 매우 굉장했다! (x4.0)</option>
                <option value={2.0}>효과가 굉장했다! (x2.0)</option>
                <option value={1.0}>보통 (x1.0)</option>
                <option value={0.5}>효과가 별로인 듯하다... (x0.5)</option>
                <option value={0.25}>효과가 매우 별로인 듯하다... (x0.25)</option>
                <option value={0}>효과가 없는 듯하다... (x0)</option>
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-poke-blue/20">
                <input type="checkbox" checked={isStab} onChange={(e) => setIsStab(e.target.checked)} className="w-5 h-5 accent-poke-blue" />
                <span className="font-bold text-sm uppercase">자속 보정 (STAB x1.5)</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-poke-blue/20">
                <input type="checkbox" checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} className="w-5 h-5 accent-poke-blue" />
                <span className="font-bold text-sm uppercase">급소 타격 (Crit x1.5)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Result Area */}
        <div className="mt-8 bg-poke-dark rounded-2xl p-6 text-white overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-4 text-center">
            <div>
              <p className="text-xs font-black uppercase text-poke-yellow mb-1 tracking-widest">최소 데미지</p>
              <div className="text-4xl font-black italic">{minDamage}</div>
            </div>
            <div className="h-10 w-1 bg-white/10 hidden md:block"></div>
            <div>
              <p className="text-xs font-black uppercase text-poke-red mb-1 tracking-widest">최대 데미지</p>
              <div className="text-5xl font-black italic text-poke-yellow">{maxDamage}</div>
            </div>
          </div>
          {/* Decoration */}
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-poke-blue/20 rounded-full"></div>
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-poke-red/10 rounded-full"></div>
        </div>

        <p className="mt-6 text-center text-xs font-bold text-gray-400 italic">
          * 난수에 따라 {minDamage}에서 {maxDamage} 사이의 데미지가 결정됩니다.
        </p>
      </div>
    </div>
  );
};

export default DamageCalculator;
