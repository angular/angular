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
 * @publicApi
 */
export interface UpdateActivatedEvent {
  type: 'UPDATE_ACTIVATED';
  previous?: {hash: string, appData?: Object};
  current: {hash: string, appData?: Object};
}

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

export type IncomingEvent = UpdateAvailableEvent|UpdateActivatedEvent|UnrecoverableStateEvent;

export interface TypedEvent {
  type: string;
}

interface StatusEvent {
  type: 'STATUS';
  nonce: number;
  status: boolean;
  error?: string;
}


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

  postMessageWithStatus(type: string, payload: Object, nonce: number): Promise<void> {
    const waitForStatus = this.waitForStatus(nonce);
    const postMessage = this.postMessage(type, payload);
    return Promise.all([waitForStatus, postMessage]).then(() => undefined);
  }

  generateNonce(): number {
    return Math.round(Math.random() * 10000000);
  }

  eventsOfType<T extends TypedEvent>(type: T['type']): Observable<T> {
    const filterFn = (event: TypedEvent): event is T => event.type === type;
    return this.events.pipe(filter(filterFn));
  }

  nextEventOfType<T extends TypedEvent>(type: T['type']): Observable<T> {
    return this.eventsOfType(type).pipe(take(1));
  }

  waitForStatus(nonce: number): Promise<void> {
    return this.eventsOfType<StatusEvent>('STATUS')
        .pipe(filter(event => event.nonce === nonce), take(1), map(event => {
                if (event.status) {
                  return undefined;
                }
                throw new Error(event.error!);
              }))
        .toPromise();
  }

  get isEnabled(): boolean {
    return !!this.serviceWorker;
  }
}
