# Heinrich Safety Frontend

위험도 레이어 시각화 및 시민 제보 웹 모듈.

> 💡 **System Architecture 핵심 요약**
>
> - **현재 (과제 데모)**: 카카오 지도 SDK 인프라 위에 백엔드(FastAPI)가 연산한 하인리히 분석 레이어를 토글 스위치로 On/Off 하는 독자적 웹앱 구현 (PWA 전환은 후속 과제 — 아래 "알려진 제약 및 후속 과제" 참고).
> - **최종 (B2G 비즈니스 모델)**: 본 프론트엔드는 백엔드 OpenAPI 엔진의 이식성과 레이어 구동 메커니즘을 검증하기 위한 **'프로토타입 시연 및 시민 제보(Ingestion) 인터페이스'** 역할을 수행.

### 🏃‍♂️ 데이터 순환 시나리오 (User Flow)

1. **[제보 창구]** 오프라인 현장에 부착된 QR 코드를 통해 시민이 별도 앱 설치 없이 모바일 웹 제보 화면(`/report`)으로 즉시 진입하여 데이터 전송.
2. **[데모 시연]** 본 프론트엔드의 위험도 지도(`/map`)에서 우상단 토글 스위치를 통해 백엔드 OpenAPI 엔진에서 받아온 위험도 레이어를 실시간 On/Off 시연 가능.

## 기술 스택

- Next.js + TypeScript + Tailwind CSS + Kakao Maps SDK

## 배포

- 위험도 지도(/map): https://heinrich-frontend.vercel.app/map
- 시민 제보(/report): https://heinrich-frontend.vercel.app/report
- 관리자(/admin): https://heinrich-frontend.vercel.app/admin

## 로컬 실행

```bash
npm install
npm run dev
```

## 알려진 제약 및 후속 과제

- **PWA 미구현**: `manifest.json`과 Service Worker가 없어 오프라인 지원, 홈 화면 추가 등 PWA 핵심 기능은 동작하지 않습니다. 초기 설계 체크리스트에는 포함되어 있었으나, Next.js 최신 버전(16.x)·React 19 환경에서 Service Worker 캐싱이 카카오맵 SDK 로딩·동적 API(`/api/layers`)·이미지 업로드 흐름에 미칠 영향을 충분히 검증할 시간이 부족해, 배포 안정성을 우선하여 후속 과제로 분리했습니다.
- **향후 방향**: `manifest.json` 작성 → Service Worker(또는 `next-pwa`) 도입 → 오프라인 캐싱 전략 수립 순으로 진행 예정입니다.
