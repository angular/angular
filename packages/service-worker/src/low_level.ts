/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, type Injector, ɵRuntimeError as RuntimeError} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter, map, switchMap, take} from 'rxjs/operators';

import {RuntimeErrorCode} from './errors';

export const ERR_SW_NOT_SUPPORTED = 'Service workers are disabled or not supported by this browser';

/**
 * An event emitted when the service worker has checked the version of the app on the server and it
 * didn't find a new version that it doesn't have already downloaded.
 *
 * @see {@link /ecosystem/service-workers/communications Service Worker Communication Guide}

 *
 * @publicApi
 */
export interface NoNewVersionDetectedEvent {
  type: 'NO_NEW_VERSION_DETECTED';
  version: {hash: string; appData?: Object};
}

/**
 * An event emitted when the service worker has detected a new version of the app on the server and
 * is about to start downloading it.
 *
 * @see {@link /ecosystem/service-workers/communications Service Worker Communication Guide}

 *
 * @publicApi
 */
export interface VersionDetectedEvent {
  type: 'VERSION_DETECTED';
  version: {hash: string; appData?: object};
}

/**
 * An event emitted when the installation of a new version failed.
 * It may be used for logging/monitoring purposes.
 *
 * @see {@link /ecosystem/service-workers/communications Service Worker Communication Guide}
 *a
 * @publicApi
 */
export interface VersionInstallationFailedEvent {
  type: 'VERSION_INSTALLATION_FAILED';
  version: {hash: string; appData?: object};
  error: string;
}

/**
 * An event emitted when a new version of the app is available.
 *
 * @see {@link /ecosystem/service-workers/communications Service Worker Communication Guide}

 *
 * @publicApi
 */
export interface VersionReadyEvent {
  type: 'VERSION_READY';
  currentVersion: {hash: string; appData?: object};
  latestVersion: {hash: string; appData?: object};
}

/**
 * An event emitted when a specific version of the app has encountered a critical failure
 * that prevents it from functioning correctly.
 *
 * When a version fails, the service worker will notify all clients currently using that version
 * and may degrade to serving only existing clients if the failed version was the latest one.
 *
 * @see {@link /ecosystem/service-workers/communications Service Worker Communication Guide}
 *
 * @publicApi
 */
export interface VersionFailedEvent {
  type: 'VERSION_FAILED';
  version: {hash: string; appData?: object};
  error: string;
}

/**
 * A union of all event types that can be emitted by
 * {@link SwUpdate#versionUpdates}.
 *
 * @publicApi
 */
export type VersionEvent =
  | VersionDetectedEvent
  | VersionInstallationFailedEvent
  | VersionReadyEvent
  | VersionFailedEvent
  | NoNewVersionDetectedEvent;

/**
 * An event emitted when the version of the app used by the service worker to serve this client is
 * in a broken state that cannot be recovered from and a full page reload is required.
 *
 * For example, the service worker may not be able to retrieve a required resource, neither from the
 * cache nor from the server. This could happen if a new version is deployed to the server and the
 * service worker cache has been partially cleaned by the browser, removing some files of a previous
 * app version but not all.
 *
 * @see {@link /ecosystem/service-workers/communications Service Worker Communication Guide}

 *
 * @publicApi
 */
export interface UnrecoverableStateEvent {
  type: 'UNRECOVERABLE_STATE';
  reason: string;
}

/**
 * An event emitted when a `PushEvent` is received by the service worker.
 */
export interface PushEvent {
  type: 'PUSH';
  data: any;
}

export type IncomingEvent = UnrecoverableStateEvent | VersionEvent;

export interface TypedEvent {
  type: string;
}

type OperationCompletedEvent =
  | {
      type: 'OPERATION_COMPLETED';
      nonce: number;
      result: boolean;
    }
  | {
      type: 'OPERATION_COMPLETED';
      nonce: number;
      result?: undefined;
      error: string;
    };

/**
 * @publicApi
 */
export class NgswCommChannel {
  readonly worker: Observable<ServiceWorker>;

  readonly registration: Observable<ServiceWorkerRegistration>;

  readonly events: Observable<TypedEvent>;

  constructor(
    private serviceWorker: ServiceWorkerContainer | undefined,
    injector?: Injector,
  ) {
    if (!serviceWorker) {
      this.worker =
        this.events =
        this.registration =
          new Observable<never>((subscriber) =>
            subscriber.error(
              new RuntimeError(
                RuntimeErrorCode.SERVICE_WORKER_DISABLED_OR_NOT_SUPPORTED_BY_THIS_BROWSER,
                (typeof ngDevMode === 'undefined' || ngDevMode) && ERR_SW_NOT_SUPPORTED,
              ),
            ),
          );
    } else {
      let currentWorker: ServiceWorker | null = null;
      const workerSubject = new Subject<ServiceWorker>();
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

      this.registration = <Observable<ServiceWorkerRegistration>>(
        this.worker.pipe(switchMap(() => serviceWorker.getRegistration()))
      );

      const _events = new Subject<TypedEvent>();
      this.events = _events.asObservable();

      const messageListener = (event: MessageEvent) => {
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

  postMessage(action: string, payload: Object): Promise<void> {
    return new Promise<void>((resolve) => {
      this.worker.pipe(take(1)).subscribe((sw) => {
        sw.postMessage({
          action,
          ...payload,
        });

        resolve();
      });
    });
  }

  postMessageWithOperation(
    type: string,
    payload: Object,
    operationNonce: number,
  ): Promise<boolean> {
    const waitForOperationCompleted = this.waitForOperationCompleted(operationNonce);
    const postMessage = this.postMessage(type, payload);
    return Promise.all([postMessage, waitForOperationCompleted]).then(([, result]) => result);
  }

  generateNonce(): number {
    return Math.round(Math.random() * 10000000);
  }

  eventsOfType<T extends TypedEvent>(type: T['type'] | T['type'][]): Observable<T> {
    let filterFn: (event: TypedEvent) => event is T;
    if (typeof type === 'string') {
      filterFn = (event: TypedEvent): event is T => event.type === type;
    } else {
      filterFn = (event: TypedEvent): event is T => type.includes(event.type);
    }
    return this.events.pipe(filter(filterFn));
  }

  nextEventOfType<T extends TypedEvent>(type: T['type']): Observable<T> {
    return this.eventsOfType(type).pipe(take(1));
  }

  waitForOperationCompleted(nonce: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.eventsOfType<OperationCompletedEvent>('OPERATION_COMPLETED')
        .pipe(
          filter((event) => event.nonce === nonce),
          take(1),
          map((event) => {
            if (event.result !== undefined) {
              return event.result;
            }
            throw new Error(event.error!);
          }),
        )
        .subscribe({
          next: resolve,
          error: reject,
        });
    });
  }

  get isEnabled(): boolean {
    return !!this.serviceWorker;
  }
}
