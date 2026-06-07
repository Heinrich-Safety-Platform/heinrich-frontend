"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useKakaoMap } from "./KakaoMap";
import type { HazardType, RiskLayerItem, RiskLevel } from "@/types";

const HAZARD_LABEL: Record<HazardType, string> = {
  IMMEDIATE: "즉시 위험",
  LATENT: "잠재 위험",
};

const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  SAFE: "안전",
  NEAR_MISS: "잠재 징후 감지",
  MINOR: "반복 위험 주의",
  CRITICAL: "위험 구역 접근 주의",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "접수",
  IN_PROGRESS: "조치중",
  RESOLVED: "조치 완료",
};

interface MarkerPopupProps {
  item: RiskLayerItem | null;
  onClose: () => void;
}

export default function MarkerPopup({ item, onClose }: MarkerPopupProps) {
  const { map } = useKakaoMap();
  const [container] = useState(() => document.createElement("div"));
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  useEffect(() => {
    if (!map) return;

    const overlay = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(0, 0),
      content: container,
      xAnchor: 0.5,
      yAnchor: 1.15,
      zIndex: 10,
    });
    overlayRef.current = overlay;

    return () => {
      overlay.setMap(null);
      overlayRef.current = null;
    };
  }, [map, container]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (item) {
      overlay.setPosition(new window.kakao.maps.LatLng(item.lat, item.lng));
      overlay.setMap(map);
    } else {
      overlay.setMap(null);
    }
  }, [item, map]);

  if (!item) return null;

  return createPortal(
    <div className="w-60 rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-zinc-900">{HAZARD_LABEL[item.hazardType]}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="팝업 닫기"
          className="text-zinc-400 hover:text-zinc-600"
        >
          ✕
        </button>
      </div>
      <dl className="mt-2 space-y-1 text-zinc-600">
        <div className="flex justify-between">
          <dt>위험 레벨</dt>
          <dd className="font-medium text-zinc-900">{RISK_LEVEL_LABEL[item.riskLevel]}</dd>
        </div>
        <div className="flex justify-between">
          <dt>상태</dt>
          <dd>{STATUS_LABEL[item.status] ?? item.status}</dd>
        </div>
        <div className="flex justify-between">
          <dt>누적 제보 건수</dt>
          <dd>{item.reportCount}건</dd>
        </div>
        {item.locationDetail && (
          <div className="flex justify-between gap-2">
            <dt className="shrink-0">상세 위치</dt>
            <dd className="text-right">{item.locationDetail}</dd>
          </div>
        )}
        {item.latestReportAt && (
          <div className="flex justify-between">
            <dt>최근 제보 시각</dt>
            <dd>{new Date(item.latestReportAt).toLocaleString("ko-KR")}</dd>
          </div>
        )}
      </dl>
      {item.content && (
        <p className="mt-2 whitespace-pre-wrap text-zinc-700">{item.content}</p>
      )}
      <Link
        href={`/report?lat=${item.lat}&lng=${item.lng}`}
        className="mt-3 block rounded-full bg-foreground px-4 py-2 text-center text-background"
      >
        이 위치 추가 제보하기
      </Link>
    </div>,
    container,
  );
}
