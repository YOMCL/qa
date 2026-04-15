import { RealmSchema } from './RealmSchema';

export type RealmInfoResult = {
  success: boolean;
  schemas: RealmSchema[];
  error?: string;
};
