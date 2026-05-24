import { RiskLayerItem, AdminAlert, ReportStatus } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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

export async function submitReport(data: FormData): Promise<void> {
  await fetch(`${BASE_URL}/api/reports`, {
    method: "POST",
    body: data,
  });
}

export async function fetchAdminAlerts(): Promise<AdminAlert[]> {
  const res = await fetch(`${BASE_URL}/api/admin/alerts`, {
    headers: { token: process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "" },
  });
  return res.json();
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
): Promise<void> {
  await fetch(`${BASE_URL}/api/admin/reports/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      token: process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "",
    },
    body: JSON.stringify({ status }),
  });
}
