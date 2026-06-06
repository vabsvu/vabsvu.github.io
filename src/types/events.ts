export type EventCategory =
  | "flagship"
  | "social"
  | "cultural"
  | "meeting"
  | "food"
  | "other";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM (24h)
  endTime?: string; // HH:MM (24h)
  location?: string;
  description?: string;
  category: EventCategory;
  imageUrl?: string;
  instagramPermalink?: string;
  /** Optional host/organizer name shown on event cards (e.g. "VABS Board") */
  host?: string;
}

export interface EventsData {
  lastUpdated: string;
  events: CalendarEvent[];
}

export interface InstagramPost {
  id: string;
  caption: string;
  imageUrl: string;
  timestamp: string;
  permalink: string;
}

export interface PostsData {
  lastUpdated: string;
  posts: InstagramPost[];
}
