export type Report = {
  id: number;
  title: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  evidence_filename: string | null;
  evidence_sha256: string | null;
  created_at: string;
};

export type Summary = {
  total_reports: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  note: string;
};
