export interface Group {
  id: string;
  code: string;
  name: string;
  location: GroupLocation;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
}

export interface GroupLocation {
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radiusMiles: number;
}

export interface CreateGroupInput {
  name: string;
  location: {
    city: string;
    coordinates: { lat: number; lng: number };
  };
}
