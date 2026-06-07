import {
  RiskLayerItem,
  AdminAlert,
  ReportStatus,
  ReportCreateResponse,
  StatusUpdateResponse,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";

// 백엔드(app/api/reports.py _verify_admin)는 HTTPBearer를 사용하므로
// 커스텀 헤더가 아닌 Authorization: Bearer <token> 형식이어야 한다.
function adminHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    ...extra,
  };
}

// FastAPI는 HTTPException을 {detail: ...}, slowapi는 rate limit 초과를 {error: ...}로
// 직렬화하므로, 실패 응답도 유효한 JSON이라 res.json()만으로는 에러를 구분할 수 없다.
// res.ok를 직접 확인해 실패 시 메시지를 담아 throw한다.
async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.detail ?? data.error)) ||
      `요청이 실패했습니다 (HTTP ${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function fetchRiskLayers(
  lat: number,
  lng: number,
  radius = 2000,
): Promise<RiskLayerItem[]> {
  const res = await fetch(
    `${BASE_URL}/api/layers?lat=${lat}&lng=${lng}&radius=${radius}`,
  );
  return parseResponse<RiskLayerItem[]>(res);
}

export async function submitReport(
  data: FormData,
): Promise<ReportCreateResponse> {
  const res = await fetch(`${BASE_URL}/api/reports`, {
    method: "POST",
    body: data,
  });
  return parseResponse<ReportCreateResponse>(res);
}

export async function fetchAdminAlerts(): Promise<AdminAlert[]> {
  const res = await fetch(`${BASE_URL}/api/admin/alerts`, {
    headers: adminHeaders(),
  });
  return parseResponse<AdminAlert[]>(res);
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
): Promise<StatusUpdateResponse> {
  const res = await fetch(`${BASE_URL}/api/admin/reports/${id}/status`, {
    method: "PATCH",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });
  return parseResponse<StatusUpdateResponse>(res);
}
