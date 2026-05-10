import React, { useState, useEffect } from 'react';
import { ChevronLeft, Library, Plus, X, Search, Globe, Save, Trash2 } from 'lucide-react';

interface RentalTeam {
  id: string;
  code: string;
  title: string;
  tags: string[];
  description: string;
}

interface RentalLibraryProps {
  onBack: () => void;
}

const initialRentals: RentalTeam[] = [
  { id: '1', code: 'W9S3Y1', title: 'World Finals Winner Team', tags: ['VGC', 'Series 19'], description: '강력한 날개치는머리 중심의 밸런스 파티' },
  { id: '2', code: 'PKM777', title: 'Trick Room Offense', tags: ['Trick Room', 'Double'], description: '뽀록나와 무쇠손을 활용한 트릭룸 파티' },
];

const RentalLibrary: React.FC<RentalLibraryProps> = ({ onBack }) => {
  const [rentals, setRentals] = useState<RentalTeam[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('poke_rentals');
    if (saved) setRentals(JSON.parse(saved));
    else setRentals(initialRentals);
  }, []);

  useEffect(() => {
    localStorage.setItem('poke_rentals', JSON.stringify(rentals));
  }, [rentals]);

  const addRental = () => {
    if (!newCode || !newTitle) return;
    const team: RentalTeam = { id: Date.now().toString(), code: newCode.toUpperCase(), title: newTitle, tags: ['User Saved'], description: '' };
    setRentals([team, ...rentals]);
    setShowAdd(false);
    setNewCode('');
    setNewTitle('');
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-violet-500 shadow-[0_12px_0_0_rgba(139,92,246,1)] text-poke-dark">
        <div className="flex items-center justify-between mb-8 border-b-4 border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-violet-500 p-3 rounded-2xl text-white shadow-lg"><Library size={32} /></div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">렌탈 파티 도서관</h2>
              <p className="text-gray-500 font-bold">강력한 팀 코드를 관리하고 공유하세요!</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="bg-poke-dark text-white px-4 py-2 rounded-xl font-black text-xs uppercase italic hover:bg-black transition-all flex items-center gap-2 shadow-md"><Plus size={16}/> 등록하기</button>
        </div>

        {showAdd && (
           <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 mb-8 animate-in zoom-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">렌탈 코드 (Rental ID)</label>
                    <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="ABCDEF..." className="w-full p-3 rounded-xl border-2 border-gray-200 font-black text-lg outline-none focus:border-violet-500 uppercase" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">파티 이름</label>
                    <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="파티 설명을 입력하세요..." className="w-full p-3 rounded-xl border-2 border-gray-200 font-bold text-sm outline-none focus:border-violet-500" />
                 </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={addRental} className="flex-1 py-3 bg-violet-500 text-white font-black rounded-xl uppercase italic shadow-lg">저장 (Save)</button>
                 <button onClick={() => setShowAdd(false)} className="px-6 py-3 bg-gray-200 text-gray-500 font-black rounded-xl uppercase italic">취소</button>
              </div>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
           {rentals.map(r => (
              <div key={r.id} className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 group relative hover:border-violet-200 transition-all">
                 <div className="flex justify-between items-start mb-2">
                    <span className="bg-white px-3 py-1 rounded-full border border-gray-200 text-[10px] font-black text-violet-600 shadow-sm uppercase italic">Rental Code</span>
                    <button onClick={() => setRentals(rentals.filter(x => x.id !== r.id))} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                 </div>
                 <h3 className="text-xl font-black text-poke-dark mb-1 leading-tight">{r.title}</h3>
                 <div className="bg-white p-4 rounded-2xl border-4 border-dashed border-violet-100 text-center mb-4">
                    <p className="text-2xl font-black tracking-widest text-violet-600 italic select-all">{r.code}</p>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {r.tags.map(t => <span key={t} className="text-[8px] font-black uppercase text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">{t}</span>)}
                 </div>
              </div>
           ))}
        </div>

        <div className="mt-8 p-4 bg-violet-50 rounded-2xl border-2 border-dashed border-violet-200 flex items-center gap-3">
           <Globe className="text-violet-500 shrink-0" />
           <p className="text-xs font-bold text-gray-600 leading-relaxed italic">
              "렌탈 파티 도서관을 통해 나만의 강력한 엔트리를 보관하고, 다른 트레이너들의 우승 파티 코드를 한곳에서 관리하세요."
           </p>
        </div>
      </div>
    </div>
  );
};

export default RentalLibrary;
