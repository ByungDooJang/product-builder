import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Trophy, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    type: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  }[];
}

interface TrainerTestProps {
  onBack: () => void;
}

const questions: Question[] = [
  {
    id: 1,
    text: "새로운 마을에 도착했을 때 당신의 행동은?",
    options: [
      { text: "마을 사람들에게 말을 걸며 정보를 얻는다", type: 'E' },
      { text: "조용히 포켓몬 센터에 들러 정비를 한다", type: 'I' },
    ],
  },
  {
    id: 2,
    text: "배틀에서 승리하기 위해 가장 중요한 것은?",
    options: [
      { text: "치밀하게 계산된 수치와 상성 정보", type: 'S' },
      { text: "트레이너의 직감과 포켓몬과의 유대감", type: 'N' },
    ],
  },
  {
    id: 3,
    text: "상대방의 포켓몬이 쓰러졌을 때 드는 생각은?",
    options: [
      { text: "효과적인 공격이었다. 다음 차례를 계산하자.", type: 'T' },
      { text: "상대방 포켓몬도 최선을 다했어. 멋진 배틀이야.", type: 'F' },
    ],
  },
  {
    id: 4,
    text: "여행 가방을 쌀 때 당신의 스타일은?",
    options: [
      { text: "필요한 아이템 목록을 적어 꼼꼼히 챙긴다", type: 'J' },
      { text: "일단 떠나고 부족한 건 현지에서 조달한다", type: 'P' },
    ],
  },
  {
    id: 5,
    text: "숲에서 길을 잃은 어린 포켓몬을 발견했다면?",
    options: [
      { text: "주변 환경을 조사해 집으로 돌아갈 길을 찾는다", type: 'T' },
      { text: "포켓몬을 안심시키고 따뜻하게 안아준다", type: 'F' },
    ],
  },
  {
    id: 6,
    text: "포켓몬 콘테스트와 체육관 배틀 중 더 끌리는 것은?",
    options: [
      { text: "화려한 무대에서 주목받는 콘테스트", type: 'E' },
      { text: "조용히 실력을 쌓아 도전하는 체육관 배틀", type: 'I' },
    ],
  },
];

const results: Record<string, { name: string; desc: string; icon: string }> = {
  'ESTJ': { name: '윈디', desc: '강력한 리더십과 책임감을 가진 트레이너입니다.', icon: '🐕' },
  'ENTJ': { name: '엠페르트', desc: '단호한 결단력으로 승리를 이끄는 전략가입니다.', icon: '🐧' },
  'ESFJ': { name: '해피너스', desc: '동료들을 세심하게 보살피는 따뜻한 마음의 소유자입니다.', icon: '🥚' },
  'ENFJ': { name: '토게키스', desc: '긍정적인 에너지로 모두에게 행복을 전파합니다.', icon: '🕊️' },
  'ESTP': { name: '괴력몬', desc: '행동력이 넘치고 도전을 두려워하지 않는 모험가입니다.', icon: '💪' },
  'ENTP': { name: '팬텀', desc: '기발한 아이디어와 유머로 상대를 당황시키는 재주꾼입니다.', icon: '👻' },
  'ESFP': { name: '피카츄', desc: '어디서나 분위기 메이커! 즐거움을 찾는 열정가입니다.', icon: '⚡' },
  'ENFP': { name: '푸린', desc: '자유로운 영혼과 풍부한 상상력을 가진 예술가입니다.', icon: '🎤' },
  'ISTJ': { name: '메타그로스', desc: '논리적이고 신중하며 계획을 완벽히 수행합니다.', icon: '🦾' },
  'INTJ': { name: '뮤츠', desc: '독립적이고 통찰력이 뛰어나며 완벽을 추구합니다.', icon: '🧬' },
  'ISFJ': { name: '메가니움', desc: '조용히 뒤에서 묵묵히 도움을 주는 헌신적인 트레이너입니다.', icon: '🌸' },
  'INFJ': { name: '가디안', desc: '깊은 공감 능력과 신비로운 직관을 가진 평화주의자입니다.', icon: '👗' },
  'ISTP': { name: '루카리오', desc: '침착하게 상황을 분석하고 기술을 연마하는 장인입니다.', icon: '🐺' },
  'INTP': { name: '후딘', desc: '지적 호기심이 강하고 독창적인 방식으로 문제를 해결합니다.', icon: '🥄' },
  'ISFP': { name: '이브이', desc: '감수성이 풍부하고 다양한 가능성을 품은 모험가입니다.', icon: '🦊' },
  'INFP': { name: '님피아', desc: '자신의 신념과 가치를 소중히 여기는 이상주의자입니다.', icon: '🎀' },
};

const TrainerTest: React.FC<TrainerTestProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (type: string) => {
    const newAnswers = [...answers, type];
    if (currentStep < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: string[]) => {
    const counts: Record<string, number> = {};
    finalAnswers.forEach(a => counts[a] = (counts[a] || 0) + 1);

    const mbti = [
      (counts['E'] || 0) >= (counts['I'] || 0) ? 'E' : 'I',
      (counts['S'] || 0) >= (counts['N'] || 0) ? 'S' : 'N',
      (counts['T'] || 0) >= (counts['F'] || 0) ? 'T' : 'F',
      (counts['J'] || 0) >= (counts['P'] || 0) ? 'J' : 'P',
    ].join('');

    setResult(mbti);
  };

  const resetTest = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    const pokemon = results[result] || results['ENFP'];
    return (
      <div className="w-full max-w-2xl animate-in zoom-in duration-500">
        <div className="bg-white rounded-3xl p-10 border-8 border-poke-yellow shadow-[0_12px_0_0_rgba(255,203,5,1)] text-poke-dark text-center">
          <div className="inline-block bg-poke-yellow p-4 rounded-full mb-6 shadow-lg animate-bounce">
            <Trophy size={48} className="text-poke-dark" />
          </div>
          <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-2">당신은 어떤 트레이너?</h2>
          <div className="text-6xl mb-4">{pokemon.icon}</div>
          <h3 className="text-4xl font-black mb-4 text-poke-dark">
            <span className="text-poke-blue">{result}</span>형 트레이너, <br/>
            <span className="text-poke-red">[{pokemon.name}]</span> 입니다!
          </h3>
          <p className="text-lg font-bold text-gray-600 mb-8 leading-relaxed">
            {pokemon.desc}
          </p>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={resetTest}
              className="flex items-center justify-center gap-2 w-full py-4 bg-poke-dark text-white font-black rounded-2xl uppercase italic hover:scale-105 transition-transform"
            >
              <RotateCcw size={20} /> 다시 테스트하기
            </button>
            <button 
              onClick={onBack}
              className="w-full py-4 bg-gray-100 text-gray-500 font-black rounded-2xl uppercase italic hover:bg-gray-200 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentStep) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-tight"
      >
        <ChevronLeft size={20} /> 그만두기
      </button>

      <div className="bg-white rounded-3xl p-8 border-8 border-poke-yellow shadow-[0_12px_0_0_rgba(255,203,5,1)] text-poke-dark">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-poke-yellow p-2 rounded-xl text-poke-dark shadow-md">
              <Sparkles size={24} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">트레이너 성향 테스트</h2>
          </div>
          <span className="font-black text-poke-yellow bg-poke-dark px-3 py-1 rounded-full text-sm">
            {currentStep + 1} / {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-gray-100 rounded-full mb-10 overflow-hidden border-2 border-gray-200">
          <div 
            className="h-full bg-poke-yellow transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black text-center mb-10 min-h-[4rem]">
            "{questions[currentStep].text}"
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {questions[currentStep].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option.type)}
                className="group relative w-full p-6 text-left bg-gray-50 border-4 border-transparent hover:border-poke-yellow hover:bg-yellow-50 rounded-2xl transition-all duration-200"
              >
                <span className="font-bold text-lg group-hover:text-poke-dark transition-colors">
                  {option.text}
                </span>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  🐾
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerTest;
