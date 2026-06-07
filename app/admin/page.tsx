"use client";

import { useEffect, useState } from "react";
import { fetchAdminAlerts, updateReportStatus } from "@/lib/api";
import { AdminAlert, ReportStatus } from "@/types";

const NEXT_STATUS: Partial<Record<ReportStatus, ReportStatus>> = {
  OPEN: "IN_PROGRESS",
  IN_PROGRESS: "RESOLVED",
};

const STATUS_LABEL: Record<ReportStatus, string> = {
  OPEN: "접수",
  IN_PROGRESS: "조치중",
  RESOLVED: "조치 완료",
};

export default function AdminPage() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadAlerts() {
    try {
      const data = await fetchAdminAlerts();
      setAlerts(data);
      setError(null);
    } catch {
      setError("알림 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetchAdminAlerts()
      .then((data) => {
        if (cancelled) return;
        setAlerts(data);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError("알림 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAdvanceStatus(alert: AdminAlert) {
    const nextStatus = NEXT_STATUS[alert.status];
    if (!nextStatus) return;

    setUpdatingId(alert.id);
    try {
      await updateReportStatus(alert.id, nextStatus);
      await loadAlerts();
    } catch {
      setError("상태 변경에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-6 p-8">
      <h1 className="text-2xl font-semibold">관리자 알림</h1>

      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-300">
            <th className="py-2 pr-4">위치 (lat, lng)</th>
            <th className="py-2 pr-4">유형</th>
            <th className="py-2 pr-4">누적 건수</th>
            <th className="py-2 pr-4">상태</th>
            <th className="py-2 pr-4">접수일</th>
            <th className="py-2 pr-4">조치</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-zinc-500">
                불러오는 중...
              </td>
            </tr>
          ) : alerts.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-zinc-500">
                표시할 알림이 없습니다.
              </td>
            </tr>
          ) : (
            alerts.map((alert) => {
              const nextStatus = NEXT_STATUS[alert.status];
              return (
                <tr key={alert.id} className="border-b border-zinc-200">
                  <td className="py-2 pr-4">
                    {alert.lat.toFixed(5)}, {alert.lng.toFixed(5)}
                  </td>
                  <td className="py-2 pr-4">{alert.hazard_type}</td>
                  <td className="py-2 pr-4">{alert.report_count}</td>
                  <td className="py-2 pr-4">{STATUS_LABEL[alert.status]}</td>
                  <td className="py-2 pr-4">
                    {new Date(alert.created_at).toLocaleString("ko-KR")}
                  </td>
                  <td className="py-2 pr-4">
                    {nextStatus ? (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(alert)}
                        disabled={updatingId === alert.id}
                        className="rounded-full bg-foreground px-4 py-1 text-background disabled:opacity-50"
                      >
                        {updatingId === alert.id
                          ? "처리 중..."
                          : `${STATUS_LABEL[nextStatus]}(으)로 변경`}
                      </button>
                    ) : (
                      <span className="text-zinc-400">조치 완료</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
