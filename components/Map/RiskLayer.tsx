"use client";

import { useEffect, useRef, useState } from "react";
import { useKakaoMap } from "./KakaoMap";
import MarkerPopup from "./MarkerPopup";
import { fetchRiskLayers } from "@/lib/api";
import type { RiskLayerItem } from "@/types";

interface RiskLayerProps {
  visible: boolean;
  radius?: number;
}

interface CircleStyle {
  color: string;
  opacity: number;
  radius: number;
}

// docs/ARCHITECTURE.md "위험 레벨별 사용자 경험" 기준 색상/투명도.
// SAFE는 표시하지 않고, reportCount로 같은 등급 내에서 투명도를 미세 조정한다.
function getCircleStyle(item: RiskLayerItem): CircleStyle | null {
  if (item.hazardType === "IMMEDIATE") {
    // IMMEDIATE 트랙은 OPEN 상태면 항상 CRITICAL(빨강), reportCount는 1 고정
    return { color: "#ef4444", opacity: 0.8, radius: 15 };
  }

  switch (item.riskLevel) {
    case "NEAR_MISS":
      return { color: "#22c55e", opacity: scaleOpacity(item.reportCount, 1, 5, 0.12, 0.28), radius: 50 };
    case "MINOR":
      return { color: "#eab308", opacity: scaleOpacity(item.reportCount, 6, 29, 0.4, 0.6), radius: 50 };
    case "CRITICAL":
      return { color: "#f97316", opacity: scaleOpacity(item.reportCount, 30, 80, 0.7, 0.9), radius: 50 };
    default:
      return null; // SAFE
  }
}

function scaleOpacity(count: number, min: number, max: number, low: number, high: number): number {
  const ratio = Math.min(Math.max((count - min) / (max - min), 0), 1);
  return low + (high - low) * ratio;
}

export default function RiskLayer({ visible, radius = 2000 }: RiskLayerProps) {
  const { map } = useKakaoMap();
  const circlesRef = useRef<Record<string, kakao.maps.Circle>>({});
  const [items, setItems] = useState<RiskLayerItem[]>([]);
  const [selected, setSelected] = useState<RiskLayerItem | null>(null);

  // 뷰포트(지도 중심) 기준으로 레이어를 다시 불러온다.
  useEffect(() => {
    if (!map) return;

    let cancelled = false;
    const loadLayers = () => {
      const center = map.getCenter();
      fetchRiskLayers(center.getLat(), center.getLng(), radius)
        .then((data) => {
          if (!cancelled) setItems(data);
        })
        .catch(() => {
          if (!cancelled) setItems([]);
        });
    };

    loadLayers();
    window.kakao.maps.event.addListener(map, "idle", loadLayers);

    return () => {
      cancelled = true;
      window.kakao.maps.event.removeListener(map, "idle", loadLayers);
    };
  }, [map, radius]);

  // items가 바뀔 때마다 circle을 새로 그린다 (단순하고 안전한 갱신 방식).
  useEffect(() => {
    if (!map) return;

    Object.values(circlesRef.current).forEach((circle) => circle.setMap(null));
    circlesRef.current = {};

    items.forEach((item) => {
      const style = getCircleStyle(item);
      if (!style) return;

      const circle = new window.kakao.maps.Circle({
        center: new window.kakao.maps.LatLng(item.lat, item.lng),
        radius: style.radius,
        strokeWeight: 1,
        strokeColor: style.color,
        strokeOpacity: 0.6,
        fillColor: style.color,
        fillOpacity: style.opacity,
        map: visible ? map : null,
      });
      window.kakao.maps.event.addListener(circle, "click", () => setSelected(item));
      circlesRef.current[item.id] = circle;
    });

    return () => {
      Object.values(circlesRef.current).forEach((circle) => circle.setMap(null));
      circlesRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, map]);

  // 토글 on/off — circle을 다시 그리지 않고 setMap으로만 표시/해제한다.
  useEffect(() => {
    Object.values(circlesRef.current).forEach((circle) =>
      circle.setMap(visible ? map : null),
    );
  }, [visible, map]);

  return <MarkerPopup item={selected} onClose={() => setSelected(null)} />;
}
