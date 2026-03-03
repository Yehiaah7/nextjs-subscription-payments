import { createClient } from './server';

export const createUntypedClient = () => {
  return createClient() as any;
};
