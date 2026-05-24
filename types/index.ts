export type HazardType = "IMMEDIATE" | "LATENT";
export type RiskLevel = "SAFE" | "NEAR_MISS" | "MINOR" | "CRITICAL";
export type ReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface RiskLayerItem {
  lat: number;
  lng: number;
  riskScore: number;
  riskLevel: RiskLevel;
  hazardType: HazardType;
  reportCount: number;
  status: ReportStatus;
  content?: string;
  locationDetail?: string;
  latestReportAt?: string;
}

export interface AdminAlert {
  id: string;
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  hazardType: HazardType;
  status: ReportStatus;
  reportCount: number;
  content?: string;
  locationDetail?: string;
  createdAt: string;
}
