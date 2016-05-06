import {MessageBasedPlatformLocation} from './platform_location';
import {
  BrowserPlatformLocation
} from '@angular/platform-browser/src/browser/location/browser_platform_location';
import {APP_INITIALIZER, Provider, Injector, NgZone} from '@angular/core';

export const WORKER_RENDER_ROUTER = /*@ts2dart_const*/[
  MessageBasedPlatformLocation,
  BrowserPlatformLocation,
  /* @ts2dart_Provider */ {provide: APP_INITIALIZER, useFactory: initRouterListeners, multi: true, deps: [Injector]}
];

function initRouterListeners(injector: Injector): () => void {
  return () => {
    let zone = injector.get(NgZone);

    zone.runGuarded(() => injector.get(MessageBasedPlatformLocation).start());
  };
}
