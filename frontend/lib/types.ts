export interface SiteSettings {
  church_name: string;
  tagline?: string;
  service_times?: string;
  address?: string;
  timezone?: string;
}

export interface Celebrant {
  id: string;
  display_name: string;
  photo_path: string | null;
  department: string | null;
  date: string | null;
  is_today: boolean;
}

export interface Activity {
  id: string;
  activity_id: string;
  activity_title: string;
  title: string | null;
  category: string | null;
  start_at: string;
  end_at: string | null;
  venue: string | null;
  description: string | null;
  cover_image_path: string | null;
  occurrence_status: string;
  registration_required: boolean;
  registration_deadline: string | null;
  department: string | null;
}

export interface MonthlyWord {
  id: string;
  month: number;
  year: number;
  title: string;
  pastor_name: string | null;
  video_url: string | null;
  thumbnail_path: string | null;
  message_description: string | null;
  prayer_focus: string | null;
  scripture_reference: string | null;
  prayer_points: string[];
  published_at: string | null;
}

export interface Sermon {
  id: string;
  title: string;
  preacher_name: string | null;
  sermon_date: string | null;
  scripture_reference: string | null;
  category: string | null;
  description: string | null;
  video_url: string | null;
  audio_url: string | null;
  thumbnail_path: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  image_path: string | null;
  published_at: string | null;
  expires_at: string | null;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string | null;
  album_date: string | null;
  cover_image_path: string | null;
  media_count: number;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  leader_name: string | null;
}

export interface Member {
  id: string;
  member_number: string;
  full_name: string;
  preferred_display_name: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  address?: string;
  date_joined?: string;
  membership_status: string;
  /** Role in the church system (maps to profiles.role_id → roles.name) */
  role?: string;
  profile_photo_path: string | null;
  profile_photo_status: string | null;
  /** true when this member has a linked login account */
  has_login?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export interface AdminOverview {
  total_active_members: number;
  pending_registrations: number;
  pending_photos: number;
  upcoming_activities: number;
  today_birthday_count: number;
}
