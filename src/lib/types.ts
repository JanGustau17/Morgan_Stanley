export interface Volunteer {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
  phone_verified: boolean;
  sms_opt_in: boolean;
  city: string | null;
  total_points: number;
  weekly_points: number;
  level: number;
  streak_days: number;
  last_active: string | null;
  role: string;
  created_at: string;
  banner_id: string | null;
  banner_image: string | null;
  greeting_id: string | null;
}

export interface Campaign {
  id: string;
  organizer_id: string;
  name: string;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  location_name: string | null;
  campaign_date: string | null;
  language: string;
  target_group: string;
  volunteers_needed: number;
  status: string;
  ref_tag: string | null;
  flyers_count: number;
  cover_image_url: string | null;
  created_at: string;
}

export interface CampaignVolunteer {
  campaign_id: string;
  volunteer_id: string;
  joined_at: string;
}

export interface FlyerPin {
  id: string;
  campaign_id: string;
  volunteer_id: string;
  lat: number;
  lng: number;
  photo_url: string | null;
  created_at: string;
}

export interface Conversion {
  id: string;
  campaign_id: string;
  volunteer_id: string;
  ref_tag: string | null;
  source: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface PointEvent {
  id: string;
  volunteer_id: string;
  campaign_id: string | null;
  event_type: string;
  points: number;
  created_at: string;
}

export interface Badge {
  id: string;
  volunteer_id: string;
  badge_type: string;
  earned_at: string;
}

/** Minimal sender info for chat messages (display only). Full Volunteer rows are assignable to this. */
export interface MessageSender {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export interface Message {
  id: string;
  campaign_id: string;
  sender_id: string;
  content: string;
  type: string;
  created_at: string;
  sender?: MessageSender;
}

export interface CampaignWithVolunteers extends Campaign {
  volunteers?: Volunteer[];
  volunteer_count?: number;
  organizer?: Volunteer;
}

export type EventType =
  | 'qr_signup'
  | 'social_signup'
  | 'volunteer_joined'
  | 'campaign_created'
  | 'flyer_pinned'
  | 'report_submitted'
  | 'new_neighborhood'
  | 'streak_bonus';

export interface LevelInfo {
  level: number;
  name: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;
}
