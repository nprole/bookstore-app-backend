import { ConfigFactory } from 'code-config';
import { join } from 'path';
import { PATHS } from '../../../shared/constants/paths';
import { authConfigDefault } from './auth-config.default';

interface Secret {
  appId: number | string;
  appSecret: string;
}
export interface SecretsSchema {
  facebook: Secret;
  google: Secret;
}

export const authConfig = ConfigFactory.getConfig<SecretsSchema>(
  join(PATHS.config, 'auth.config.json'),
  authConfigDefault,
);

authConfig.initPrettify();
