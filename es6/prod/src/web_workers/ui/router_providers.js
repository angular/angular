import { MessageBasedPlatformLocation } from './platform_location';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { BrowserPlatformLocation } from 'angular2/src/router/browser_platform_location';
import { APP_INITIALIZER, Provider, Injector, NgZone } from 'angular2/core';
export const WORKER_RENDER_ROUTER = CONST_EXPR([
    MessageBasedPlatformLocation,
    BrowserPlatformLocation,
    CONST_EXPR(new Provider(APP_INITIALIZER, { useFactory: initRouterListeners, multi: true, deps: CONST_EXPR([Injector]) }))
]);
function initRouterListeners(injector) {
    return () => {
        let zone = injector.get(NgZone);
        zone.run(() => injector.get(MessageBasedPlatformLocation).start());
    };
}
