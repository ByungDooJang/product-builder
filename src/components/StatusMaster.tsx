import React, { useState } from 'react';
import { ChevronLeft, Thermometer, Zap, Skull, Moon, Snowflake, Info } from 'lucide-react';

interface StatusMasterProps {
  onBack: () => void;
}

const conditions = [
  { id: 'burn', name: '화상 (Burn)', icon: <Thermometer className="text-red-500" />, effect: '공격(Atk) 수치 0.5배 감소', detail: '매 턴 최대 HP의 1/16 데미지. 특성 [근성] 보유 시 공격 패널티 무시.' },
  { id: 'paralysis', name: '마비 (Paralysis)', icon: <Zap className="text-yellow-400" />, effect: '스피드(Spe) 수치 0.5배 감소', detail: '25% 확률로 행동 불능. 전기 타입 포켓몬은 마비되지 않음.' },
  { id: 'poison', name: '독/맹독 (Poison)', icon: <Skull className="text-purple-500" />, effect: '매 턴 HP 감소', detail: '일반 독은 1/8, 맹독은 1/16부터 시작해 매 턴 증가. 강철/독 타입은 면역.' },
  { id: 'sleep', name: '잠듦 (Sleep)', icon: <Moon className="text-indigo-400" />, effect: '행동 불능 (1~3턴)', detail: '교체해도 유지됨. [잠꼬대], [코골기] 기술만 사용 가능.' },
  { id: 'freeze', name: '얼음 (Freeze)', icon: <Snowflake className="text-blue-300" />, effect: '행동 불능', detail: '매 턴 20% 확률로 해제. 불꽃 타입 기술을 맞거나 사용하면 즉시 해제.' },
];

const StatusMaster: React.FC<StatusMasterProps> = ({ onBack }) => {
  const [testStat, setTestStat] = useState<number>(100);

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-red-400 shadow-[0_12px_0_0_rgba(248,113,113,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-red-400 p-3 rounded-2xl text-white shadow-lg"><Thermometer size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">상태 이상 마스터</h2>
            <p className="text-gray-500 font-bold">상태 이상이 능력치에 미치는 영향</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
           <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 shadow-inner">
              <label className="text-xs font-black uppercase text-gray-400 mb-2 block italic">능력치 변화 시뮬레이션</label>
              <input 
                type="number" 
                value={testStat} 
                onChange={e => setTestStat(Number(e.target.value))} 
                className="w-full bg-white p-4 rounded-2xl font-black text-2xl text-poke-dark outline-none border-4 border-transparent focus:border-red-400 shadow-sm transition-all"
              />
              <div className="grid grid-cols-2 gap-3 mt-4">
                 <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
                    <p className="text-[9px] font-black text-red-500 uppercase">Burn (Atk)</p>
                    <p className="text-xl font-black italic">{Math.floor(testStat * 0.5)}</p>
                 </div>
                 <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
                    <p className="text-[9px] font-black text-yellow-500 uppercase">Para (Spe)</p>
                    <p className="text-xl font-black italic">{Math.floor(testStat * 0.5)}</p>
                 </div>
              </div>
           </div>

           <div className="flex items-center p-6 bg-red-50 rounded-3xl border-2 border-dashed border-red-100">
              <p className="text-sm font-bold text-red-600 leading-relaxed italic">
                 "화상은 공격력을 절반으로, 마비는 스피드를 절반으로 만듭니다. 실전에서 이 보정치를 계산하는 것이 승패를 가르는 핵심 포인트입니다."
              </p>
           </div>
        </div>

        <div className="space-y-3">
           {conditions.map(c => (
              <div key={c.id} className="group p-5 rounded-2xl border-2 border-gray-50 bg-white hover:border-red-100 transition-all shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    {c.icon}
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                       <h3 className="font-black text-sm uppercase">{c.name}</h3>
                       <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[8px] font-black uppercase italic">{c.effect}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 leading-tight">{c.detail}</p>
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default StatusMaster;
