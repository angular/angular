import {ROUTER_PROVIDERS_COMMON} from './router_providers_common';
import {BrowserPlatformLocation} from '@angular/platform-browser';
import {PlatformLocation} from '@angular/common';

export const ROUTER_PROVIDERS: any[] = /*@ts2dart_const*/[
  ROUTER_PROVIDERS_COMMON,
  /*@ts2dart_Provider*/ {provide: PlatformLocation, useClass: BrowserPlatformLocation},
];
