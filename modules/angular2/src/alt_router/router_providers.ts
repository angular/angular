import {ROUTER_PROVIDERS_COMMON} from './router_providers_common';
import {Provider} from 'angular2/core';
import {
  BrowserPlatformLocation
} from 'angular2/src/platform/browser/location/browser_platform_location';
import {PlatformLocation} from 'angular2/platform/common';
import {CONST_EXPR} from 'angular2/src/facade/lang';

export const ROUTER_PROVIDERS: any[] = CONST_EXPR([
  ROUTER_PROVIDERS_COMMON,
  CONST_EXPR(new Provider(PlatformLocation, {useClass: BrowserPlatformLocation})),
]);