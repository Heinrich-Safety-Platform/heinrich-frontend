"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import CurrentLocation from "@/components/Map/CurrentLocation";
import RiskLayer from "@/components/Map/RiskLayer";

// 카카오맵 SDK는 window 전역에 의존하므로 클라이언트 전용으로 동적 로드한다.
const KakaoMap = dynamic(() => import("@/components/Map/KakaoMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
      지도를 불러오는 중...
    </div>
  ),
});

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.978 };

export default function MapPage() {
  const [layersOn, setLayersOn] = useState(true);

  return (
    <div className="relative flex flex-1 flex-col">
      <KakaoMap center={SEOUL_CITY_HALL} level={4} className="relative h-full w-full flex-1">
        <RiskLayer visible={layersOn} />
        <CurrentLocation />
      </KakaoMap>

      <label className="absolute left-4 top-4 z-10 flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm shadow-md">
        <span className="text-zinc-700">하인리히 안전 레이어</span>
        <button
          type="button"
          role="switch"
          aria-checked={layersOn}
          onClick={() => setLayersOn((prev) => !prev)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            layersOn ? "bg-foreground" : "bg-zinc-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              layersOn ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>
    </div>
  );
}
