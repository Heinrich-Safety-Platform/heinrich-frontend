"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { submitReport } from "@/lib/api";
import type { HazardType } from "@/types";

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface ReportFormProps {
  initialLocation?: LatLngLiteral | null;
}

const HAZARD_OPTIONS: Array<{
  value: HazardType;
  label: string;
  description: string;
  examples: string;
}> = [
  {
    value: "IMMEDIATE",
    label: "즉시 위험",
    description: "지금 당장 다칠 수 있는 것",
    examples: "맨홀 뚜껑 열림 · 전선 노출 · 보도블럭 돌출",
  },
  {
    value: "LATENT",
    label: "잠재 위험",
    description: "방치하면 나중에 위험해지는 것",
    examples: "시설물 균열 · 도로 침하 · 벽면 박리",
  },
];

export default function ReportForm({ initialLocation = null }: ReportFormProps) {
  const router = useRouter();

  const [location, setLocation] = useState<LatLngLiteral | null>(initialLocation);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const [hazardType, setHazardType] = useState<HazardType>("IMMEDIATE");
  const [photo, setPhoto] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [locationDetail, setLocationDetail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setLocationError(null);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        setLocationError(
          "위치 권한이 거부되었습니다. 위치 정보 없이는 제보할 수 없습니다.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // QR 스캔으로 위치를 전달받지 못한 경우 GPS를 자동 수집한다.
  // (setState를 effect 본문에서 직접 호출하지 않도록 콜백으로 한 단계 분리)
  useEffect(() => {
    if (location) return;
    const timer = setTimeout(() => requestLocation(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (!location) {
      setSubmitError("위치 정보가 필요합니다. 위치 권한을 허용한 뒤 다시 시도해주세요.");
      return;
    }
    if (!photo) {
      setSubmitError("현장 사진을 첨부해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("latitude", String(location.lat));
    formData.append("longitude", String(location.lng));
    formData.append("hazard_type", hazardType);
    if (content.trim()) formData.append("content", content.trim());
    if (locationDetail.trim()) formData.append("location_detail", locationDetail.trim());
    formData.append("image", photo);

    setSubmitting(true);
    try {
      await submitReport(formData);
      setToast("제보가 접수됐습니다 ✓");
      setTimeout(() => router.push("/map"), 1200);
    } catch {
      setSubmitError("제보 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="rounded-xl border border-zinc-200 p-4">
        <h2 className="text-sm font-semibold text-zinc-700">현장 위치 (필수)</h2>
        {location ? (
          <p className="mt-1 text-sm text-zinc-600">
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">
            {locating ? "위치를 확인하는 중..." : "위치 정보가 없습니다."}
          </p>
        )}
        {locationError && <p className="mt-1 text-sm text-red-600">{locationError}</p>}
        <button
          type="button"
          onClick={requestLocation}
          disabled={locating}
          className="mt-2 rounded-full border border-zinc-300 px-4 py-1.5 text-sm text-zinc-700 disabled:opacity-50"
        >
          {locating ? "확인 중..." : "현재 위치 다시 확인"}
        </button>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-700">위험 유형</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {HAZARD_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border p-3 text-sm transition-colors ${
                hazardType === option.value
                  ? "border-foreground bg-zinc-50"
                  : "border-zinc-200"
              }`}
            >
              <input
                type="radio"
                name="hazardType"
                value={option.value}
                checked={hazardType === option.value}
                onChange={() => setHazardType(option.value)}
                className="sr-only"
              />
              <p className="font-semibold text-zinc-900">{option.label}</p>
              <p className="mt-1 text-zinc-600">{option.description}</p>
              <p className="mt-1 text-xs text-zinc-400">{option.examples}</p>
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label htmlFor="photo" className="text-sm font-semibold text-zinc-700">
          현장 사진 (필수)
        </label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
          className="text-sm text-zinc-600"
        />
        {photo && <p className="text-xs text-zinc-500">{photo.name}</p>}
      </section>

      <section className="flex flex-col gap-2">
        <label htmlFor="locationDetail" className="text-sm font-semibold text-zinc-700">
          세부 위치 <span className="font-normal text-zinc-400">(선택)</span>
        </label>
        <input
          id="locationDetail"
          type="text"
          value={locationDetail}
          onChange={(event) => setLocationDetail(event.target.value)}
          placeholder="예: 2층 출구 앞, 정류장 5번 옆"
          maxLength={200}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </section>

      <section className="flex flex-col gap-2">
        <label htmlFor="content" className="text-sm font-semibold text-zinc-700">
          상황 설명 <span className="font-normal text-zinc-400">(선택)</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="어떤 위험을 발견하셨는지 알려주세요."
          rows={3}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </section>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-foreground px-4 py-3 text-center font-medium text-background disabled:opacity-50"
      >
        {submitting ? "제출 중..." : "제보하기"}
      </button>

      {toast && (
        <p className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </p>
      )}
    </form>
  );
}
