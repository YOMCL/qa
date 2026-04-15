import { RealmSchemaField } from './RealmSchemaField';

export type RealmSchema = {
  name: string;
  count: number;
  fields: RealmSchemaField[];
};
