import { CategoryData } from './CategoryData';

export type CategoriesResult = {
  success: boolean;
  categories: CategoryData[];
  error?: string;
};
