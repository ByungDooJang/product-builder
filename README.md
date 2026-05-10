# 🐾 Pokémon Champions Battle Helper

포켓몬 트레이너들을 위한 올인원 배틀 지원 및 성향 분석 도구입니다.

## 🚀 주요 기능

### 1. 🐾 트레이너 성향 테스트 (MBTI)
*   6가지 질문을 통해 당신의 배틀 스타일과 성향을 분석합니다.
*   분석된 MBTI 유형에 가장 잘 어울리는 파트너 포켓몬을 추천해 드립니다.
*   결과를 친구들에게 즉시 공유할 수 있습니다.

### 2. ⚡ 실시간 스피드 계산기
*   **PokeAPI 연동**: 포켓몬 이름 검색 시 종족값 자동 입력.
*   레벨, 개체값(IV), 노력치(EV), 성격 보정을 반영한 정확한 수치 산출.
*   구애스카프, 특성 보정, 마비 상태 이상 등 실시간 변수 적용.

### 3. ⚔️ 데미지 계산기
*   공식 데미지 계산식을 기반으로 한 공격 위력 예측.
*   자속 보정(STAB), 급소 타격, 타입 상성 배율 완벽 지원.
*   난수에 따른 최소/최대 데미지 범위 표시.

## 🛠 Tech Stack
*   **Framework**: React (TypeScript)
*   **Bundler**: Vite
*   **Styling**: Tailwind CSS v4
*   **Icons**: Lucide React
*   **API**: PokeAPI (axios)
*   **Deployment**: Cloudflare Pages

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 🌐 Cloudflare Pages 배포 방법
1.  Cloudflare 대시보드 로그인.
2.  **Workers & Pages** -> **Create application** -> **Pages** 선택.
3.  GitHub 저장소(`product-builder`) 연결.
4.  빌드 설정:
    *   **Framework preset**: `Vite` (또는 None)
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`
5.  **Save and Deploy** 클릭.

---
© 2026 Pokémon Champions Battle Helper.
