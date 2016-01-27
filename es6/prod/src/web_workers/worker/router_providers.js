import { Provider, NgZone, APP_INITIALIZER } from 'angular2/core';
import { PlatformLocation } from 'angular2/src/router/platform_location';
import { WebWorkerPlatformLocation } from './platform_location';
import { ROUTER_PROVIDERS_COMMON } from 'angular2/src/router/router_providers_common';
export var WORKER_APP_ROUTER = [
    ROUTER_PROVIDERS_COMMON,
    new Provider(PlatformLocation, { useClass: WebWorkerPlatformLocation }),
    new Provider(APP_INITIALIZER, {
        useFactory: (platformLocation, zone) => () => initRouter(platformLocation, zone),
        multi: true,
        deps: [PlatformLocation, NgZone]
    })
];
function initRouter(platformLocation, zone) {
    return zone.run(() => { return platformLocation.init(); });
}
