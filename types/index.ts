export type HazardType = "IMMEDIATE" | "LATENT";
export type RiskLevel = "SAFE" | "NEAR_MISS" | "MINOR" | "CRITICAL";
export type ReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

// GET /api/layers — app/main.py LayerResponse (camelCase로 직렬화됨)
export interface RiskLayerItem {
  id: string;
  lat: number;
  lng: number;
  hazardType: HazardType;
  riskLevel: RiskLevel;
  reportCount: number;
  status: ReportStatus;
  content?: string | null;
  locationDetail?: string | null;
  latestReportAt?: string | null;
}

// GET /api/admin/alerts — app/schemas/report.py AdminAlertResponse (snake_case로 직렬화됨)
export interface AdminAlert {
  id: string;
  lat: number;
  lng: number;
  hazard_type: HazardType;
  status: ReportStatus;
  created_at: string;
  report_count: number;
}

// POST /api/reports 응답 — app/schemas/report.py ReportCreateResponse
export interface ReportCreateResponse {
  id: string;
  status: ReportStatus;
  hazard_type: HazardType;
  trust_score: number;
  message: string;
}

// PATCH /api/admin/reports/{id}/status 응답 — app/schemas/report.py StatusUpdateResponse
export interface StatusUpdateResponse {
  id: string;
  previous_status: ReportStatus;
  new_status: ReportStatus;
}
