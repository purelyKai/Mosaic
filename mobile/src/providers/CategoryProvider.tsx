import React, { useState, PropsWithChildren } from 'react';
import { CategoryContext } from '../context/CategoryContext';
import type { CategoryType } from '../context/CategoryContext';

export default function CategoryProvider({ children }: PropsWithChildren) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');

  return (
    <CategoryContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}
