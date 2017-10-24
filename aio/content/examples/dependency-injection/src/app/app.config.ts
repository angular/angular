import { AppConfig } from './app-config';
export { AppConfig } from './app-config';

// #docregion token
import { InjectionToken } from '@angular/core';

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
// #enddocregion token

// #docregion config
export const HERO_DI_CONFIG: AppConfig = {
  apiEndpoint: 'api.heroes.com',
  title: 'Dependency Injection'
};
