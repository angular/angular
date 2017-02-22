// #docregion token
import { OpaqueToken } from '@angular/core';

export let APP_CONFIG = new OpaqueToken('app.config');
// #enddocregion token

// #docregion config
export interface AppConfig {
  apiEndpoint: string;
  title: string;
}

export const HERO_DI_CONFIG: AppConfig = {
  apiEndpoint: 'api.heroes.com',
  title: 'Dependency Injection'
};
