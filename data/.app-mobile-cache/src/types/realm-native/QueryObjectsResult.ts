export type QueryObjectsResult = {
  success: boolean;
  objects: unknown[];
  totalCount: number;
  returnedCount: number;
  error?: string;
};
