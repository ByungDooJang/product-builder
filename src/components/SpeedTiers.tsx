import React, { useState } from 'react';
import { ListOrdered, ChevronLeft, Search, Zap, Star } from 'lucide-react';

interface SpeedTiersProps {
  onBack: () => void;
}

interface TierEntry {
  speed: number;
  name: string;
  koName: string;
  condition: string;
}

const speedTiers: TierEntry[] = [
  { speed: 300, name: 'Regieleki', koName: '레지에레키', condition: '최속 보정' },
  { speed: 225, name: 'Dragapult', koName: '드래펄트', condition: '최속 + 구애스카프' },
  { speed: 201, name: 'Garchomp', koName: '한카리아스', condition: '최속 + 구애스카프' },
  { speed: 200, name: 'Flutter Mane', koName: '날개치는머리', condition: '최속 보정' },
  { speed: 200, name: 'Aerodactyl', koName: '프테라', condition: '최속 보정' },
  { speed: 178, name: 'Garchomp', koName: '한카리아스', condition: '최속 보정' },
  { speed: 167, name: 'Urshifu', koName: '우라오스', condition: '최속 보정' },
  { speed: 156, name: 'Gholdengo', koName: '타부자고', condition: '최속 보정' },
  { speed: 154, name: 'Dragonite', koName: '망나뇽', condition: '최속 보정' },
  { speed: 122, name: 'Incineroar', koName: '어흥염', condition: '준속 보정' },
  { speed: 100, name: 'Snorlax', koName: '잠만보', condition: '무보정' },
  { speed: 50, name: 'Amoonguss', koName: '뽀록나', condition: '최저속 (0 IV)' },
];

const SpeedTiers: React.FC<SpeedTiersProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userSpeed, setUserSpeed] = useState<number>(0);

  const filteredTiers = speedTiers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.koName.includes(searchTerm)
  ).sort((a, b) => b.speed - a.speed);

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-red shadow-[0_12px_0_0_rgba(238,21,21,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-poke-red p-3 rounded-2xl text-white shadow-lg"><ListOrdered size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">스피드 티어표</h2>
            <p className="text-gray-500 font-bold">누가 누구보다 빠를까요?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
           <div className="relative">
              <label className="text-xs font-black uppercase text-gray-400 mb-1 block italic">포켓몬 검색</label>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                 <input type="text" placeholder="검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 p-2 pl-10 rounded-xl font-bold focus:border-poke-red outline-none" />
              </div>
           </div>
           <div>
              <label className="text-xs font-black uppercase text-gray-400 mb-1 block italic">내 포켓몬 스피드 비교</label>
              <div className="relative">
                 <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-poke-yellow" size={16} />
                 <input type="number" placeholder="내 스피드 입력..." value={userSpeed || ''} onChange={(e) => setUserSpeed(Number(e.target.value))} className="w-full bg-gray-50 border-2 border-gray-100 p-2 pl-10 rounded-xl font-bold focus:border-poke-red outline-none" />
              </div>
           </div>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2">
           {filteredTiers.map((tier, idx) => {
              const isFaster = userSpeed > tier.speed;
              return (
                 <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isFaster ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${isFaster ? 'bg-green-500 text-white' : 'bg-poke-dark text-white'}`}>
                          {tier.speed}
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                             <span className="font-black text-sm">{tier.koName}</span>
                             <span className="text-[10px] text-gray-400 uppercase">{tier.name}</span>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 italic">{tier.condition}</p>
                       </div>
                    </div>
                    {userSpeed > 0 && (
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic ${isFaster ? 'bg-green-200 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {isFaster ? 'Outspeed!' : 'Slower'}
                       </div>
                    )}
                 </div>
              );
           })}
           {filteredTiers.length === 0 && <p className="text-center py-10 text-gray-400 font-bold italic">검색 결과가 없습니다.</p>}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border-2 border-dashed border-poke-yellow/20">
           <p className="text-[10px] font-bold text-gray-600">
             * 위 수치는 레벨 50 기준 실전 보정치를 반영한 통상적인 스피드 수치입니다.
           </p>
        </div>
      </div>
    </div>
  );
};

export default SpeedTiers;
