/**
 * Admin dashboard types.
 * Role-based access: only users with volunteers.role = 'admin' may access admin routes.
 * Enforced in layout (UI) and in each admin API route (backend).
 */

export interface AdminVolunteer {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  avatar_url?: string | null;
}

export interface AdminCampaign {
  id: string;
  name: string;
  neighborhood: string | null;
  campaign_date: string | null;
  status: string;
  flyers_count: number;
  organizer_id: string | null;
  organizer_name: string;
  volunteer_count: number;
  conversion_count: number;
  created_at?: string;
}

export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  fileCount?: number;
}

export interface AdminOverviewMetrics {
  totalUsers: number;
  totalEvents: number;
  totalResourcesNote: string;
  totalFlyers: number;
  recentSignupsCount: number;
  activeTodayPlaceholder: number;
}
