import { ShoppingListEntry } from './ShoppingListEntry';

export type ShoppingListResult = {
  success: boolean;
  entries: ShoppingListEntry[];
  error?: string;
};
