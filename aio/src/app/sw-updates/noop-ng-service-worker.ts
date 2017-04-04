// Alternative to NgServiceWorker when the browser doesn't support NgServiceWorker
//
// Many browsers do not support ServiceWorker (e.g, Safari).
// The Angular NgServiceWorker assumes that the browser supports ServiceWorker
// and starts talking to it immediately in its constructor without checking if it exists.
// Merely injecting the `NgServiceWorker` is an exception in any browser w/o ServiceWorker.
//
// Solution: when the browser doesn't support service worker and a class injects `NgServiceWorker`
// substitute the inert `NoopNgServiceWorker`.

import { Injector } from '@angular/core';
import { NgServiceWorker } from '@angular/service-worker';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

export class NoopNgServiceWorker  {
  // Service worker is supported if `navigator['serviceWorker'] is defined.
  isServiceWorkerSupported = !!navigator['serviceWorker'];

  checkForUpdate() { return of(false); }
  activateUpdate(version: string) { return of(false); }
}

export abstract class NgServiceWorkerForReals {}

export function NgServiceWorkerFactory(injector: Injector, nsw: NoopNgServiceWorker) {
  return nsw.isServiceWorkerSupported ? injector.get(NgServiceWorkerForReals) : nsw;
}

export const noopNgServiceWorkerProviders = [
    NoopNgServiceWorker,
    { provide: NgServiceWorkerForReals, useClass: NgServiceWorker },
    { provide: NgServiceWorker, useFactory: NgServiceWorkerFactory,
        deps: [Injector, NoopNgServiceWorker] }];
