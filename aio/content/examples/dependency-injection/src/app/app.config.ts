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
// #enddocregion config

// #docregion multitoken
export const APP_MULTI_CONFIG = new InjectionToken<AppConfig[]>('app.multi.config');
// #enddocregion multitoken

// #docregion multiconfig
export const HERO_MULTI_DI_CONFIG: AppConfig[] = [{
  apiEndpoint: 'api.heroes.com',
  title: 'Dependency Injection'
}];
// #enddocregion multiconfig
