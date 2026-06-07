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

export async function fetchRiskLayers(
  lat: number,
  lng: number,
  radius = 2000,
): Promise<RiskLayerItem[]> {
  const res = await fetch(
    `${BASE_URL}/api/layers?lat=${lat}&lng=${lng}&radius=${radius}`,
  );
  return res.json();
}

export async function submitReport(
  data: FormData,
): Promise<ReportCreateResponse> {
  const res = await fetch(`${BASE_URL}/api/reports`, {
    method: "POST",
    body: data,
  });
  return res.json();
}

export async function fetchAdminAlerts(): Promise<AdminAlert[]> {
  const res = await fetch(`${BASE_URL}/api/admin/alerts`, {
    headers: adminHeaders(),
  });
  return res.json();
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
  return res.json();
}
