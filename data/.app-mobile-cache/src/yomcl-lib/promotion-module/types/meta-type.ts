import type Id from './id';

type Context = {
  customerId?: Id;
  commerceId?: Id;
  customerDomain?: string;
};

type User = {
  commerceId: Id;
};

type Meta = {
  user?: User;
  context: Context;
};

export default Meta;
