import React, { useState } from 'react';
import { ChevronLeft, ShoppingBag, ShieldCheck, Flame, Zap, Droplets, Leaf, Search } from 'lucide-react';

interface ItemGuideProps {
  onBack: () => void;
}

const items = [
  { id: 'life_orb', name: '생명의구슬 (Life Orb)', desc: '데미지 x1.3 상승 / 공격 시마다 최대 HP의 10% 감소.', color: 'text-red-500' },
  { id: 'choice_band', name: '구애머리띠 (Choice Band)', desc: '물리공격 x1.5 상승 / 한 가지 기술만 사용 가능.', color: 'text-blue-500' },
  { id: 'choice_specs', name: '구애안경 (Choice Specs)', desc: '특수공격 x1.5 상승 / 한 가지 기술만 사용 가능.', color: 'text-blue-400' },
  { id: 'choice_scarf', name: '구애스카프 (Choice Scarf)', desc: '스피드 x1.5 상승 / 한 가지 기술만 사용 가능.', color: 'text-yellow-500' },
  { id: 'assault_vest', name: '돌격조끼 (Assault Vest)', desc: '특수방어 x1.5 상승 / 변화기 사용 불가.', color: 'text-gray-500' },
  { id: 'focus_sash', name: '기합의띠 (Focus Sash)', desc: 'HP 가득일 때 일격사에 면역 (HP 1 남음).', color: 'text-indigo-400' },
  { id: 'leftovers', name: '먹다남은음식 (Leftovers)', desc: '매 턴 최대 HP의 1/16 회복.', color: 'text-green-500' },
  { id: 'clear_amulet', name: '클리어참 (Clear Amulet)', desc: '상대에 의한 능력치 하락 무시 (위협 면역).', color: 'text-cyan-400' },
  { id: 'expert_belt', name: '달인의띠 (Expert Belt)', desc: '효과가 굉장한 기술의 데미지 x1.2 상승.', color: 'text-orange-500' },
];

const berries = [
  { name: '오카열매 (Occa)', type: '불꽃', desc: '불꽃 타입 데미지를 1회 절반으로 감소.' },
  { name: '바리비열매 (Passho)', type: '물', desc: '물 타입 데미지를 1회 절반으로 감소.' },
  { name: '린드열매 (Rindo)', type: '풀', desc: '풀 타입 데미지를 1회 절반으로 감소.' },
  { name: '초나열매 (Yache)', type: '얼음', desc: '얼음 타입 데미지를 1회 절반으로 감소.' },
  { name: '플카열매 (Shuca)', type: '땅', desc: '땅 타입 데미지를 1회 절반으로 감소.' },
  { name: '캄라열매 (Salac)', type: '스피드', desc: 'HP가 1/4 이하일 때 스피드 1랭크 상승.' },
];

const ItemGuide: React.FC<ItemGuideProps> = ({ onBack }) => {
  const [search, setSearchTerm] = useState('');

  const filteredItems = items.filter(i => i.name.includes(search));

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight">
        <ChevronLeft size={20} /> 메뉴로 돌아가기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-indigo-400 shadow-[0_12px_0_0_rgba(129,140,248,1)] text-poke-dark">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-gray-100 pb-4">
          <div className="bg-indigo-400 p-3 rounded-2xl text-white shadow-lg"><ShoppingBag size={32} /></div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">실전 도구 백과</h2>
            <p className="text-gray-500 font-bold">배틀의 승패를 가르는 핵심 아이템 리스트</p>
          </div>
        </div>

        <div className="relative mb-8">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <input type="text" placeholder="도구 이름 검색..." value={search} onChange={e => setSearchTerm(e.target.value)} className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold text-sm" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <section>
              <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest italic flex items-center gap-2 underline decoration-indigo-400 decoration-2">⚔️ 핵심 실전 도구</h3>
              <div className="space-y-3">
                 {filteredItems.map(i => (
                    <div key={i.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:scale-[1.02] transition-transform shadow-sm">
                       <p className={`font-black text-xs uppercase mb-1 ${i.color}`}>{i.name}</p>
                       <p className="text-[10px] font-bold text-gray-500 leading-tight">{i.desc}</p>
                    </div>
                 ))}
              </div>
           </section>

           <section>
              <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest italic flex items-center gap-2 underline decoration-green-400 decoration-2">🍓 타입 반감 열매 & 보조</h3>
              <div className="grid grid-cols-1 gap-2">
                 {berries.map((b, idx) => (
                    <div key={idx} className="p-3 bg-green-50/50 rounded-xl border border-green-100 flex items-center justify-between group">
                       <div>
                          <p className="font-black text-[11px] text-poke-dark">{b.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold italic">{b.desc}</p>
                       </div>
                       <span className="text-[8px] font-black uppercase bg-white px-2 py-0.5 rounded-full border border-green-100 group-hover:bg-green-100 transition-colors">{b.type}</span>
                    </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default ItemGuide;
