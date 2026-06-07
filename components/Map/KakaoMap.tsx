"use client";

import Script from "next/script";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? "";

interface KakaoMapContextValue {
  map: kakao.maps.Map | null;
}

const KakaoMapContext = createContext<KakaoMapContextValue>({ map: null });

export function useKakaoMap(): KakaoMapContextValue {
  return useContext(KakaoMapContext);
}

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface KakaoMapProps {
  center: LatLngLiteral;
  level?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function KakaoMap({
  center,
  level = 4,
  className,
  children,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [scriptError, setScriptError] = useState(false);

  // 카카오맵 SDK는 최초 진입점의 center로만 지도를 생성한다.
  // 이후 중심 이동은 CurrentLocation 등에서 map.panTo()로 처리한다.
  useEffect(() => {
    if (!sdkReady || !containerRef.current) return;

    window.kakao.maps.load(() => {
      if (!containerRef.current) return;

      const instance = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level,
      });
      setMap(instance);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady]);

  if (!KAKAO_MAP_KEY) {
    return (
      <div
        className={
          className ??
          "flex h-full w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500"
        }
      >
        카카오맵 API 키(NEXT_PUBLIC_KAKAO_MAP_KEY)가 설정되지 않았습니다.
      </div>
    );
  }

  return (
    <div className={className ?? "relative h-full w-full"}>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
        onError={() => setScriptError(true)}
      />
      <div ref={containerRef} className="h-full w-full" />
      {scriptError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100/90 text-sm text-zinc-500">
          카카오맵 SDK를 불러오지 못했습니다.
        </div>
      )}
      {map && (
        <KakaoMapContext.Provider value={{ map }}>
          {children}
        </KakaoMapContext.Provider>
      )}
    </div>
  );
}
