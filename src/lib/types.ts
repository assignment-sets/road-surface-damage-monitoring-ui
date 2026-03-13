export interface DamageSummary {
  type: string;
  raw_code: string;
  count: number;
  avg_confidence: string;
  max_confidence: string;
}

export interface DashboardUrls {
  original: string | null;
  processed: string | null;
}

export interface DashboardRecord {
  job_id: string;
  image_id: string;
  coordinates: [number, number]; // [lat, lng]
  rdi_score: number;
  priority_status: "CRITICAL" | "HOLD" | "IGNORED";
  is_resolved: boolean;
  urls: DashboardUrls;
  damage_summary: DamageSummary[];
}

export interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  data: DashboardRecord[];
}
