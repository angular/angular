/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConnectableObservable, Observable, concat, defer, fromEvent, of , throwError} from 'rxjs';
import {filter, map, publish, switchMap, take, tap} from 'rxjs/operators';

export const ERR_SW_NOT_SUPPORTED = 'Service workers are disabled or not supported by this browser';

/**
 * An event emitted when a new version of the app is available.
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
 * @publicApi
 */
export interface UpdateActivatedEvent {
  type: 'UPDATE_ACTIVATED';
  previous?: {hash: string, appData?: Object};
  current: {hash: string, appData?: Object};
}

/**
 * An event emitted when a `PushEvent` is received by the service worker.
 */
export interface PushEvent {
  type: 'PUSH';
  data: any;
}

export type IncomingEvent = UpdateAvailableEvent | UpdateActivatedEvent;

export interface TypedEvent { type: string; }

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
      const currentController = defer(() => of (serviceWorker.controller));
      const controllerWithChanges = concat(currentController, controllerChanges);

      this.worker = controllerWithChanges.pipe(filter<ServiceWorker>(c => !!c));

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
                    action, ...payload,
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

  generateNonce(): number { return Math.round(Math.random() * 10000000); }

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
                throw new Error(event.error !);
              }))
        .toPromise();
  }

  get isEnabled(): boolean { return !!this.serviceWorker; }
}
