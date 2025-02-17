import { appMeta } from './app-meta';

type UserState = {
  Principal: string;
  Roles: string[];
  Data: Record<string, any>;
};

const userState = await fetch(appMeta.stateEndpoint).then(r => r.json()) as UserState;

export {
  UserState,
  userState,
};
