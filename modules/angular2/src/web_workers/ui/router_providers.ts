import {MessageBasedPlatformLocation} from './platform_location';
import {CONST_EXPR} from 'angular2/src/facade/lang';
import {
  BrowserPlatformLocation
} from 'angular2/src/platform/browser/location/browser_platform_location';
import {APP_INITIALIZER, Provider, Injector, NgZone} from 'angular2/core';

export const WORKER_RENDER_ROUTER = CONST_EXPR([
  MessageBasedPlatformLocation,
  BrowserPlatformLocation,
  CONST_EXPR(
      new Provider(APP_INITIALIZER,
                   {useFactory: initRouterListeners, multi: true, deps: CONST_EXPR([Injector])}))
]);

function initRouterListeners(injector: Injector): () => void {
  return () => {
    let zone = injector.get(NgZone);

    zone.runGuarded(() => injector.get(MessageBasedPlatformLocation).start());
  };
}
