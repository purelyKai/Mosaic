import { createContext, useContext } from 'react';

export type CategoryType = 'All' | 'Entertainment' | 'Food' | 'Nature';

export type CategoryData = {
  selectedCategory: CategoryType;
  setSelectedCategory: (category: CategoryType) => void;
};

export const CategoryContext = createContext<CategoryData>({
  selectedCategory: 'All',
  setSelectedCategory: () => {},
});

export const useCategoryContext = () => useContext(CategoryContext);
