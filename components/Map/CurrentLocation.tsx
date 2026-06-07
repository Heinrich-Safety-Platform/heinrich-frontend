"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useKakaoMap } from "./KakaoMap";
import type { LatLngLiteral } from "./KakaoMap";

interface CurrentLocationProps {
  onLocate?: (coords: LatLngLiteral) => void;
  className?: string;
}

export default function CurrentLocation({
  onLocate,
  className,
}: CurrentLocationProps) {
  const { map } = useKakaoMap();
  const markerRef = useRef<kakao.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setError(null);

        const coords: LatLngLiteral = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocate?.(coords);

        if (!map) return;

        const latLng = new window.kakao.maps.LatLng(coords.lat, coords.lng);
        if (markerRef.current) {
          markerRef.current.setPosition(latLng);
        } else {
          markerRef.current = new window.kakao.maps.Marker({
            position: latLng,
            map,
            title: "현재 위치",
            zIndex: 5,
          });
        }
        map.panTo(latLng);
      },
      () => {
        setLocating(false);
        setError("위치 권한이 거부되었거나 위치를 가져올 수 없습니다.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [map, onLocate]);

  // 지도가 준비되면 자동으로 한 번 현재 위치를 조회한다.
  // (setState를 effect 본문에서 직접 호출하지 않도록 콜백으로 한 단계 분리)
  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => locate(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    return () => {
      markerRef.current?.setMap(null);
    };
  }, []);

  return (
    <div
      className={
        className ?? "absolute bottom-6 right-4 z-10 flex flex-col items-end gap-2"
      }
    >
      {error && (
        <p className="max-w-[220px] rounded-lg bg-white/90 px-3 py-2 text-xs text-red-600 shadow">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={locate}
        disabled={locating}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-md disabled:opacity-50"
        aria-label="현재 위치로 이동"
        title="현재 위치로 이동"
      >
        {locating ? "…" : "📍"}
      </button>
    </div>
  );
}
