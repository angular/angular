/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {concat, ConnectableObservable, defer, fromEvent, Observable, of, throwError} from 'rxjs';
import {filter, map, publish, switchMap, take, tap} from 'rxjs/operators';

export const ERR_SW_NOT_SUPPORTED = 'Service workers are disabled or not supported by this browser';

/**
 * An event emitted when a new version of the app is available.
 *
 * @see {@link guide/service-worker-communications Service worker communication guide}
 *
 * @deprecated
 * This event is only emitted by the deprecated {@link SwUpdate#available}.
 * Use the {@link VersionReadyEvent} instead, which is emitted by {@link SwUpdate#versionUpdates}.
 * See {@link SwUpdate#available} docs for an example.
 *
 * @publicApi
 */
export interface UpdateAvailableEvent {
  type: 'UPDATE_AVAILABLE';
  current: {hash: string, appData?: Object};
  available: {hash: string, appData?: Object};
}

/**
 * An event emitted when a new version of the app has been downloaded and activated.
 *
 * @see {@link guide/service-worker-communications Service worker communication guide}
 *
 * @deprecated
 * This event is only emitted by the deprecated {@link SwUpdate#activated}.
 * Use the return value of {@link SwUpdate#activateUpdate} instead.
 *
 * @publicApi
 */
export interface UpdateActivatedEvent {
  type: 'UPDATE_ACTIVATED';
  previous?: {hash: string, appData?: Object};
  current: {hash: string, appData?: Object};
}

/**
 * An event emitted when the service worker has checked the version of the app on the server and it
 * didn't find a new version that it doesn't have already downloaded.
 *
 * @see {@link guide/service-worker-communications Service worker communication guide}
 *
 * @publicApi
 */
export interface NoNewVersionDetectedEvent {
  type: 'NO_NEW_VERSION_DETECTED';
  version: {hash: string; appData?: Object;};
}

/**
 * An event emitted when the service worker has detected a new version of the app on the server and
 * is about to start downloading it.
 *
 * @see {@link guide/service-worker-communications Service worker communication guide}
 *
 * @publicApi
 */
export interface VersionDetectedEvent {
  type: 'VERSION_DETECTED';
  version: {hash: string; appData?: object;};
}

/**
 * An event emitted when the installation of a new version failed.
 * It may be used for logging/monitoring purposes.
 *
 * @see {@link guide/service-worker-communications Service worker communication guide}
 *
 * @publicApi
 */
export interface VersionInstallationFailedEvent {
  type: 'VERSION_INSTALLATION_FAILED';
  version: {hash: string; appData?: object;};
  error: string;
}

/**
 * An event emitted when a new version of the app is available.
 *
 * @see {@link guide/service-worker-communications Service worker communication guide}
 *
 * @publicApi
 */
export interface VersionReadyEvent {
  type: 'VERSION_READY';
  currentVersion: {hash: string; appData?: object;};
  latestVersion: {hash: string; appData?: object;};
}


/**
 * A union of all event types that can be emitted by
 * {@link api/service-worker/SwUpdate#versionUpdates SwUpdate#versionUpdates}.
 *
 * @publicApi
 */
export type VersionEvent =
    VersionDetectedEvent|VersionInstallationFailedEvent|VersionReadyEvent|NoNewVersionDetectedEvent;

/**
 * An event emitted when the version of the app used by the service worker to serve this client is
 * in a broken state that cannot be recovered from and a full page reload is required.
 *
 * For example, the service worker may not be able to retrieve a required resource, neither from the
 * cache nor from the server. This could happen if a new version is deployed to the server and the
 * service worker cache has been partially cleaned by the browser, removing some files of a previous
 * app version but not all.
 *
 * @see {@link guide/service-worker-communications Service worker communication guide}
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

export type IncomingEvent = UpdateActivatedEvent|UnrecoverableStateEvent|VersionEvent;

export interface TypedEvent {
  type: string;
}

type OperationCompletedEvent = {
  type: 'OPERATION_COMPLETED'; nonce: number; result: boolean;
}|{
  type: 'OPERATION_COMPLETED';
  nonce: number;
  result?: undefined;
  error: string;
};


function errorObservable(message: string): Observable<any> {
  return defer(() => throwError(new Error(message)));
}

/**
 * @publicApi
 */
export class NgswCommChannel {
  readonly worker: Observable<ServiceWorker>;

  readonly registration: Observable<ServiceWorkerRegistration>;

  readonly events: Observable<TypedEvent>;

  constructor(private serviceWorker: ServiceWorkerContainer|undefined) {
    if (!serviceWorker) {
      this.worker = this.events = this.registration = errorObservable(ERR_SW_NOT_SUPPORTED);
    } else {
      const controllerChangeEvents = fromEvent(serviceWorker, 'controllerchange');
      const controllerChanges = controllerChangeEvents.pipe(map(() => serviceWorker.controller));
      const currentController = defer(() => of(serviceWorker.controller));
      const controllerWithChanges = concat(currentController, controllerChanges);

      this.worker = controllerWithChanges.pipe(filter((c): c is ServiceWorker => !!c));

      this.registration = <Observable<ServiceWorkerRegistration>>(
          this.worker.pipe(switchMap(() => serviceWorker.getRegistration())));

      const rawEvents = fromEvent<MessageEvent>(serviceWorker, 'message');
      const rawEventPayload = rawEvents.pipe(map(event => event.data));
      const eventsUnconnected = rawEventPayload.pipe(filter(event => event && event.type));
      const events = eventsUnconnected.pipe(publish()) as ConnectableObservable<IncomingEvent>;
      events.connect();

      this.events = events;
    }
  }

  postMessage(action: string, payload: Object): Promise<void> {
    return this.worker
        .pipe(take(1), tap((sw: ServiceWorker) => {
                sw.postMessage({
                  action,
                  ...payload,
                });
              }))
        .toPromise()
        .then(() => undefined);
  }

  postMessageWithOperation(type: string, payload: Object, operationNonce: number):
      Promise<boolean> {
    const waitForOperationCompleted = this.waitForOperationCompleted(operationNonce);
    const postMessage = this.postMessage(type, payload);
    return Promise.all([postMessage, waitForOperationCompleted]).then(([, result]) => result);
  }

  generateNonce(): number {
    return Math.round(Math.random() * 10000000);
  }

  eventsOfType<T extends TypedEvent>(type: T['type']|T['type'][]): Observable<T> {
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
    return this.eventsOfType<OperationCompletedEvent>('OPERATION_COMPLETED')
        .pipe(filter(event => event.nonce === nonce), take(1), map(event => {
                if (event.result !== undefined) {
                  return event.result;
                }
                throw new Error(event.error!);
              }))
        .toPromise();
  }

  get isEnabled(): boolean {
    return !!this.serviceWorker;
  }
}
