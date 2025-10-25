import { CategoryType } from '../types';

export const CATEGORIES: CategoryType[] = ['food', 'drinks', 'entertainment', 'nature'];

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  food: 'Food',
  drinks: 'Drinks',
  entertainment: 'Entertainment',
  nature: 'Nature',
};

export const DEFAULT_RADIUS_MILES = 15;
export const GROUP_CODE_LENGTH = 6;
