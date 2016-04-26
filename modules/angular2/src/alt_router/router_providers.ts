import {ROUTER_PROVIDERS_COMMON} from './router_providers_common';
import {
  BrowserPlatformLocation
} from 'angular2/src/platform/browser/location/browser_platform_location';
import {PlatformLocation} from 'angular2/platform/common';

export const ROUTER_PROVIDERS: any[] = /*@ts2dart_const*/[
  ROUTER_PROVIDERS_COMMON,
  /*@ts2dart_Provider*/{provide: PlatformLocation, useClass: BrowserPlatformLocation},
];
