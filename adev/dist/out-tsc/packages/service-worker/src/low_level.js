/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ApplicationRef, ɵRuntimeError as RuntimeError} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter, map, switchMap, take} from 'rxjs/operators';
export const ERR_SW_NOT_SUPPORTED = 'Service workers are disabled or not supported by this browser';
/**
 * @publicApi
 */
export class NgswCommChannel {
  serviceWorker;
  worker;
  registration;
  events;
  constructor(serviceWorker, injector) {
    this.serviceWorker = serviceWorker;
    if (!serviceWorker) {
      this.worker =
        this.events =
        this.registration =
          new Observable((subscriber) =>
            subscriber.error(
              new RuntimeError(
                5601 /* RuntimeErrorCode.SERVICE_WORKER_DISABLED_OR_NOT_SUPPORTED_BY_THIS_BROWSER */,
                (typeof ngDevMode === 'undefined' || ngDevMode) && ERR_SW_NOT_SUPPORTED,
              ),
            ),
          );
    } else {
      let currentWorker = null;
      const workerSubject = new Subject();
      this.worker = new Observable((subscriber) => {
        if (currentWorker !== null) {
          subscriber.next(currentWorker);
        }
        return workerSubject.subscribe((v) => subscriber.next(v));
      });
      const updateController = () => {
        const {controller} = serviceWorker;
        if (controller === null) {
          return;
        }
        currentWorker = controller;
        workerSubject.next(currentWorker);
      };
      serviceWorker.addEventListener('controllerchange', updateController);
      updateController();
      this.registration = this.worker.pipe(
        switchMap(() =>
          serviceWorker.getRegistration().then((registration) => {
            // The `getRegistration()` method may return undefined in
            // non-secure contexts or incognito mode, where service worker
            // registration might not be allowed.
            if (!registration) {
              throw new RuntimeError(
                5601 /* RuntimeErrorCode.SERVICE_WORKER_DISABLED_OR_NOT_SUPPORTED_BY_THIS_BROWSER */,
                (typeof ngDevMode === 'undefined' || ngDevMode) && ERR_SW_NOT_SUPPORTED,
              );
            }
            return registration;
          }),
        ),
      );
      const _events = new Subject();
      this.events = _events.asObservable();
      const messageListener = (event) => {
        const {data} = event;
        if (data?.type) {
          _events.next(data);
        }
      };
      serviceWorker.addEventListener('message', messageListener);
      // The injector is optional to avoid breaking changes.
      const appRef = injector?.get(ApplicationRef, null, {optional: true});
      appRef?.onDestroy(() => {
        serviceWorker.removeEventListener('controllerchange', updateController);
        serviceWorker.removeEventListener('message', messageListener);
      });
    }
  }
  postMessage(action, payload) {
    return new Promise((resolve) => {
      this.worker.pipe(take(1)).subscribe((sw) => {
        sw.postMessage({
          action,
          ...payload,
        });
        resolve();
      });
    });
  }
  postMessageWithOperation(type, payload, operationNonce) {
    const waitForOperationCompleted = this.waitForOperationCompleted(operationNonce);
    const postMessage = this.postMessage(type, payload);
    return Promise.all([postMessage, waitForOperationCompleted]).then(([, result]) => result);
  }
  generateNonce() {
    return Math.round(Math.random() * 10000000);
  }
  eventsOfType(type) {
    let filterFn;
    if (typeof type === 'string') {
      filterFn = (event) => event.type === type;
    } else {
      filterFn = (event) => type.includes(event.type);
    }
    return this.events.pipe(filter(filterFn));
  }
  nextEventOfType(type) {
    return this.eventsOfType(type).pipe(take(1));
  }
  waitForOperationCompleted(nonce) {
    return new Promise((resolve, reject) => {
      this.eventsOfType('OPERATION_COMPLETED')
        .pipe(
          filter((event) => event.nonce === nonce),
          take(1),
          map((event) => {
            if (event.result !== undefined) {
              return event.result;
            }
            throw new Error(event.error);
          }),
        )
        .subscribe({
          next: resolve,
          error: reject,
        });
    });
  }
  get isEnabled() {
    return !!this.serviceWorker;
  }
}
//# sourceMappingURL=low_level.js.map
