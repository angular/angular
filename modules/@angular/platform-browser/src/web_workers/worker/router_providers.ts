import {Provider, NgZone, APP_INITIALIZER} from '@angular/core';
import {PlatformLocation} from '@angular/common';
import {WebWorkerPlatformLocation} from './platform_location';
import {ROUTER_PROVIDERS} from '@angular/router';

export var WORKER_APP_ROUTER = [
  ROUTER_PROVIDERS,
  /* @ts2dart_Provider */ {provide: PlatformLocation, useClass: WebWorkerPlatformLocation},
  {
    provide: APP_INITIALIZER,
    useFactory: (platformLocation: WebWorkerPlatformLocation, zone: NgZone) => () =>
                    initRouter(platformLocation, zone),
    multi: true,
    deps: [PlatformLocation, NgZone]
  }
];

function initRouter(platformLocation: WebWorkerPlatformLocation, zone: NgZone): Promise<boolean> {
  return zone.runGuarded(() => { return platformLocation.init(); });
}
