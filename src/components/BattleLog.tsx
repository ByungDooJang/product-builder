import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Trash2, Plus, Swords, Save, ShieldAlert } from 'lucide-react';

interface BattleRecord {
  id: string;
  date: number;
  result: 'win' | 'loss';
  opponent: string;
  memo: string;
}

interface BattleLogProps {
  onBack: () => void;
}

const BattleLog: React.FC<BattleLogProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<BattleRecord[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newOpponent, setNewOpponent] = useState('');
  const [newResult, setNewResult] = useState<'win' | 'loss'>('win');
  const [newMemo, setNewMemo] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('poke_battle_logs');
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('poke_battle_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = () => {
    const record: BattleRecord = {
      id: Date.now().toString(),
      date: Date.now(),
      result: newResult,
      opponent: newOpponent,
      memo: newMemo
    };
    setLogs([record, ...logs]);
    setShowAdd(false);
    setNewOpponent('');
    setNewMemo('');
  };

  const deleteLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  const stats = {
    wins: logs.filter(l => l.result === 'win').length,
    losses: logs.filter(l => l.result === 'loss').length,
  };
  const winRate = logs.length > 0 ? Math.round((stats.wins / logs.length) * 100) : 0;

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-blue shadow-[0_12px_0_0_rgba(59,76,202,1)] text-poke-dark">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-poke-blue p-3 rounded-2xl text-white shadow-lg"><Trophy size={32} /></div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">배틀 로그</h2>
              <p className="text-gray-500 font-bold italic">Championship Victory Tracker</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="bg-poke-red text-white px-6 py-2 rounded-xl font-black text-xs uppercase italic flex items-center gap-2 hover:scale-105 transition-transform"><Plus size={16} /> 기록 추가</button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-4 mb-8">
           <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 text-center">
              <p className="text-[10px] font-black text-blue-400 uppercase">Wins</p>
              <p className="text-3xl font-black text-blue-600">{stats.wins}</p>
           </div>
           <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100 text-center">
              <p className="text-[10px] font-black text-red-400 uppercase">Losses</p>
              <p className="text-3xl font-black text-red-600">{stats.losses}</p>
           </div>
           <div className="bg-poke-dark p-4 rounded-2xl border-2 border-gray-800 text-center text-white">
              <p className="text-[10px] font-black text-poke-yellow uppercase">Win Rate</p>
              <p className="text-3xl font-black italic">{winRate}%</p>
           </div>
        </div>

        {showAdd && (
           <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 mb-8 animate-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">상대방 주요 포켓몬</label>
                    <input type="text" value={newOpponent} onChange={e => setNewOpponent(e.target.value)} placeholder="예: 날개치는머리, 어흥염..." className="w-full p-3 rounded-xl bg-white border-2 border-gray-200 font-bold text-sm outline-none focus:border-poke-blue" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">배틀 결과</label>
                    <div className="flex gap-2 h-[48px]">
                       <button onClick={() => setNewResult('win')} className={`flex-1 rounded-xl font-black italic text-sm ${newResult === 'win' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-400 border-2 border-gray-100'}`}>WIN</button>
                       <button onClick={() => setNewResult('loss')} className={`flex-1 rounded-xl font-black italic text-sm ${newResult === 'loss' ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-400 border-2 border-gray-100'}`}>LOSS</button>
                    </div>
                 </div>
              </div>
              <div className="mb-6">
                 <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">메모 / 피드백</label>
                 <textarea value={newMemo} onChange={e => setNewMemo(e.target.value)} placeholder="특이사항이나 패인을 기록하세요..." className="w-full p-3 h-24 rounded-xl bg-white border-2 border-gray-200 font-bold text-sm outline-none focus:border-poke-blue resize-none" />
              </div>
              <div className="flex gap-2">
                 <button onClick={addLog} className="flex-1 py-3 bg-poke-blue text-white font-black rounded-xl uppercase italic shadow-lg">저장하기</button>
                 <button onClick={() => setShowAdd(false)} className="px-6 py-3 bg-gray-200 text-gray-500 font-black rounded-xl uppercase italic">취소</button>
              </div>
           </div>
        )}

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
           {logs.length === 0 && <div className="py-20 text-center text-gray-300 font-bold italic">기록된 배틀이 없습니다. 첫 배틀을 기록해 보세요!</div>}
           {logs.map(log => (
              <div key={log.id} className={`p-5 rounded-3xl border-2 transition-all hover:scale-[1.01] ${log.result === 'win' ? 'bg-blue-50/30 border-blue-100' : 'bg-red-50/30 border-red-100'}`}>
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                       <span className={`px-3 py-1 rounded-full font-black italic text-[10px] uppercase shadow-sm ${log.result === 'win' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>{log.result}</span>
                       <span className="text-[10px] font-black text-gray-400">{new Date(log.date).toLocaleString()}</span>
                    </div>
                    <button onClick={() => deleteLog(log.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                 </div>
                 <div className="flex gap-2 mb-2">
                    <Swords size={16} className="text-gray-400 shrink-0" />
                    <p className="font-black text-sm text-poke-dark capitalize">{log.opponent}</p>
                 </div>
                 {log.memo && (
                    <div className="bg-white/50 p-3 rounded-xl border border-gray-100">
                       <p className="text-xs font-bold text-gray-600 leading-relaxed italic">"{log.memo}"</p>
                    </div>
                 )}
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default BattleLog;
