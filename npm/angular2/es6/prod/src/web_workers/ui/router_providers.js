import { MessageBasedPlatformLocation } from './platform_location';
import { BrowserPlatformLocation } from 'angular2/src/platform/browser/location/browser_platform_location';
import { APP_INITIALIZER, Injector, NgZone } from 'angular2/core';
export const WORKER_RENDER_ROUTER = [
    MessageBasedPlatformLocation,
    BrowserPlatformLocation,
    /* @ts2dart_Provider */ { provide: APP_INITIALIZER, useFactory: initRouterListeners, multi: true, deps: [Injector] }
];
function initRouterListeners(injector) {
    return () => {
        let zone = injector.get(NgZone);
        zone.runGuarded(() => injector.get(MessageBasedPlatformLocation).start());
    };
}
