# Heinrich Safety Frontend

위험도 레이어 시각화 및 시민 제보 PWA 모듈.

> 💡 **System Architecture 핵심 요약**
>
> - **현재 (과제 데모)**: 카카오 지도 SDK 인프라 위에 백엔드(FastAPI)가 연산한 하인리히 분석 레이어를 토글 스위치로 On/Off 하는 독자적 PWA 웹앱 구현.
> - **최종 (B2G 비즈니스 모델)**: 본 프론트엔드는 백엔드 OpenAPI 엔진의 이식성과 레이어 구동 메커니즘을 검증하기 위한 **'프로토타입 시연 및 시민 제보(Ingestion) 인터페이스'** 역할을 수행.

## 기술 스택

- Next.js + TypeScript + Tailwind CSS + Kakao Maps SDK

## 로컬 실행

```bash
npm install
npm run dev
```
