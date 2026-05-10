import React from 'react';

interface Stat {
  name: string;
  value: number;
  color: string;
}

interface StatBarsProps {
  stats: {
    hp: number;
    atk: number;
    def: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
}

const StatBars: React.FC<StatBarsProps> = ({ stats }) => {
  const statList: Stat[] = [
    { name: 'HP', value: stats.hp, color: '#FF0000' },
    { name: '공격', value: stats.atk, color: '#F08030' },
    { name: '방어', value: stats.def, color: '#F8D030' },
    { name: '특공', value: stats.spAtk, color: '#6890F0' },
    { name: '특방', value: stats.spDef, color: '#78C850' },
    { name: '스피드', value: stats.speed, color: '#F85888' },
  ];

  return (
    <div className="space-y-1.5 w-full bg-gray-50 p-3 rounded-xl border border-gray-100">
      {statList.map((s) => (
        <div key={s.name} className="flex items-center gap-2">
          <span className="text-[9px] font-black w-8 text-gray-500 uppercase">{s.name}</span>
          <span className="text-[9px] font-bold w-6 text-right">{s.value}</span>
          <div className="flex-grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 ease-out" 
              style={{ 
                width: `${Math.min(100, (s.value / 160) * 100)}%`,
                backgroundColor: s.color
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatBars;
