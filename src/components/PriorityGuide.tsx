import React from 'react';
import { ChevronLeft, Zap, Info } from 'lucide-react';

interface PriorityGuideProps {
  onBack: () => void;
}

const priorities = [
  { level: '+5', moves: '도움말 (Helping Hand)', desc: '항상 가장 먼저 발동' },
  { level: '+4', moves: '방어, 판별, 매직코트', desc: '방어 기술 계열' },
  { level: '+3', moves: '속이다, 와이드가드', desc: '우선도 높은 공격/보조' },
  { level: '+2', moves: '신속, 페인트, 팔로미', desc: '강력한 선공기' },
  { level: '+1', moves: '전광석화, 야습, 마하펀치', desc: '일반적인 선공기' },
  { level: '0', moves: '대부분의 일반 기술', desc: '스피드 수치에 따라 결정' },
  { level: '-1', moves: '당하기 (Vital Throw)', desc: '후공기' },
  { level: '-6', moves: '날려버리기, 울부짖기', desc: '강제 교체 기술' },
  { level: '-7', moves: '트릭룸 (Trick Room)', desc: '항상 가장 마지막에 발동' },
];

const PriorityGuide: React.FC<PriorityGuideProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-yellow shadow-[0_12px_0_0_rgba(255,203,5,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-poke-yellow p-3 rounded-2xl text-poke-dark shadow-lg"><Zap size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">기술 우선도 가이드</h2>
            <p className="text-gray-500 font-bold">스피드보다 빠른 기술들의 순서</p>
          </div>
        </div>

        <div className="space-y-3">
          {priorities.map((p, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
               <div className="w-12 h-12 bg-poke-dark text-white rounded-xl flex items-center justify-center font-black text-lg shadow-inner">{p.level}</div>
               <div className="flex-1">
                  <p className="font-black text-sm">{p.moves}</p>
                  <p className="text-[10px] text-gray-400 font-bold italic">{p.desc}</p>
               </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-2xl border-2 border-dashed border-poke-blue/20">
           <div className="flex items-start gap-3">
              <Info className="text-poke-blue shrink-0" size={18} />
              <p className="text-xs font-bold text-gray-600 leading-relaxed">
                 💡 팁: 우선도가 같은 기술끼리는 스피드가 높은 포켓몬이 먼저 공격합니다. '트릭룸' 상태에서는 우선도가 0인 기술들만 순서가 뒤바뀝니다.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityGuide;
