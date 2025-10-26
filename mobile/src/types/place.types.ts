export type CategoryType = 'food' | 'drinks' | 'entertainment' | 'nature';

export interface Place {
  id: string;
  name: string;
  category: CategoryType | null;
  imageUrl: string;
}

export interface Vote {
  placeId: string;
  liked: boolean;
}

export interface Recommendation {
  place: Place;
  matchPercentage: number;
  likedBy: string[];
}
