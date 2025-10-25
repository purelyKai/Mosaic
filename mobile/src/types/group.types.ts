// Trip represents a group trip in the database
export interface Trip {
  id: string;
  code: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  radius_miles: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// TripMember represents a user's membership in a trip
export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  joined_at: string;
}

// Input for creating a new trip
export interface CreateTripInput {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  radius_miles?: number;
}

// Legacy alias for backwards compatibility
export type Group = Trip;
export type CreateGroupInput = CreateTripInput;
