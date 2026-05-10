import React, { useState } from 'react';
import { ChevronLeft, Wind, MoveDown, Timer, Zap, Info } from 'lucide-react';

interface SpeedControlMasterProps {
  onBack: () => void;
}

const SpeedControlMaster: React.FC<SpeedControlMasterProps> = ({ onBack }) => {
  const [baseSpeed, setBaseSpeed] = useState<number>(100);
  const [isTailwind, setIsTailwind] = useState(false);
  const [icyWindCount, setIcyWindCount] = useState(0);
  const [isParalyzed, setIsParalyzed] = useState(false);
  const [isTrickRoom, setIsTrickRoom] = useState(false);

  const calculateModifiedSpeed = () => {
    let speed = baseSpeed;
    
    // Tailwind (x2)
    if (isTailwind) speed *= 2;
    
    // Icy Wind / Electroweb (-1 Rank each)
    const rankMult = icyWindCount > 0 ? 2 / (2 + icyWindCount) : 1;
    speed = Math.floor(speed * rankMult);
    
    // Paralysis (0.5x)
    if (isParalyzed) speed = Math.floor(speed * 0.5);
    
    return speed;
  };

  const modifiedSpeed = calculateModifiedSpeed();

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-cyan-400 shadow-[0_12px_0_0_rgba(34,211,238,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-cyan-400 p-3 rounded-2xl text-white shadow-lg"><Wind size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">스피드 컨트롤 마스터</h2>
            <p className="text-gray-500 font-bold">순풍, 트릭룸 하에서의 행동 순서 분석</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
           <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 shadow-inner">
              <label className="text-xs font-black uppercase text-gray-400 mb-2 block italic">현재 스피드 실수치 입력</label>
              <div className="relative">
                 <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={24} />
                 <input 
                    type="number" 
                    value={baseSpeed} 
                    onChange={e => setBaseSpeed(Number(e.target.value))} 
                    className="w-full bg-white p-4 pl-14 rounded-2xl font-black text-3xl text-poke-dark outline-none border-4 border-transparent focus:border-cyan-400 shadow-sm"
                 />
              </div>
              
              <div className="mt-8 space-y-4">
                 <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <span className="font-black text-xs flex items-center gap-2"><Wind size={14} className="text-blue-400"/> 순풍 (Tailwind)</span>
                    <input type="checkbox" checked={isTailwind} onChange={e => setIsTailwind(e.target.checked)} className="w-6 h-6 accent-blue-500" />
                 </div>
                 <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <span className="font-black text-xs flex items-center gap-2"><MoveDown size={14} className="text-red-400"/> 얼음뭉치/일렉트릭네트 (-1)</span>
                    <select value={icyWindCount} onChange={e => setIcyWindCount(Number(e.target.value))} className="font-black text-xs p-1 rounded bg-gray-100 outline-none">
                       {[0, 1, 2, 3, 4, 5, 6].map(v => <option key={v} value={v}>{v}회 중첩</option>)}
                    </select>
                 </div>
                 <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <span className="font-black text-xs flex items-center gap-2"><Zap size={14} className="text-yellow-400"/> 마비 상태 (Paralysis)</span>
                    <input type="checkbox" checked={isParalyzed} onChange={e => setIsParalyzed(e.target.checked)} className="w-6 h-6 accent-yellow-500" />
                 </div>
              </div>
           </div>

           <div className="flex flex-col justify-center">
              <div className="bg-poke-dark rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden mb-4">
                 <p className="text-[10px] font-black uppercase text-cyan-400 mb-2 tracking-widest italic">보정 후 최종 스피드</p>
                 <div className="text-7xl font-black italic animate-in zoom-in duration-500" key={modifiedSpeed}>{modifiedSpeed}</div>
                 <div className="mt-6 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                       <Timer size={14} className={isTrickRoom ? "text-purple-400" : "text-gray-500"} />
                       <span className="text-[10px] font-black uppercase">{isTrickRoom ? "Trick Room Active" : "Normal Flow"}</span>
                    </div>
                    <button onClick={() => setIsTrickRoom(!isTrickRoom)} className={`px-4 py-1 rounded-full text-[10px] font-black uppercase italic transition-all ${isTrickRoom ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-700 text-gray-400'}`}>트릭룸 전환</button>
                 </div>
              </div>
              <div className="bg-cyan-50 p-4 rounded-2xl border-2 border-dashed border-cyan-200">
                 <p className="text-[11px] font-bold text-gray-600 leading-relaxed text-center">
                    {isTrickRoom ? "💡 트릭룸 상태에서는 이 수치가 낮을수록 먼저 행동합니다." : "💡 순풍이 깔리면 대부분의 스카프 형태보다 빨라질 수 있습니다."}
                 </p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">최속 날개치는머리 (200)</p>
              <p className={`font-black text-sm italic ${modifiedSpeed > 200 ? 'text-green-500' : 'text-red-500'}`}>{modifiedSpeed > 200 ? '추월!' : '미달'}</p>
           </div>
           <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">최속 스카프 한카리아스 (267)</p>
              <p className={`font-black text-sm italic ${modifiedSpeed > 267 ? 'text-green-500' : 'text-red-500'}`}>{modifiedSpeed > 267 ? '추월!' : '미달'}</p>
           </div>
           <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">최속 스카프 드래펄트 (337)</p>
              <p className={`font-black text-sm italic ${modifiedSpeed > 337 ? 'text-green-500' : 'text-red-500'}`}>{modifiedSpeed > 337 ? '추월!' : '미달'}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedControlMaster;
