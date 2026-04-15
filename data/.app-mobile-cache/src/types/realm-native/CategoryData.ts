export type CategoryData = {
  _id: string;
  name: string;
  parent: string | null;
  icon: string | null;
  tags: string[];
};
