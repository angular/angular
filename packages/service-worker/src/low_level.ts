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

export interface Version {
  hash: string;
  appData?: Object;
}

/**
 * @experimental
 */
export interface UpdateAvailableEvent {
  type: 'UPDATE_AVAILABLE';
  current: Version;
  available: Version;
}

/**
 * @experimental
 */
export interface UpdateActivatedEvent {
  type: 'UPDATE_ACTIVATED';
  previous?: Version;
  current: Version;
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
 * @experimental
*/
export class NgswCommChannel {
  /**
   * @internal
   */
  readonly worker: Observable<ServiceWorker>;

  /**
   * @internal
   */
  readonly registration: Observable<ServiceWorkerRegistration>;

  /**
   * @internal
   */
  readonly events: Observable<TypedEvent>;

  constructor(private serviceWorker: ServiceWorkerContainer|undefined) {
    if (!serviceWorker) {
      this.worker = this.events = this.registration = errorObservable(ERR_SW_NOT_SUPPORTED);
    } else {
      const controllerChangeEvents =
          <Observable<any>>(fromEvent(serviceWorker, 'controllerchange'));
      const controllerChanges = <Observable<ServiceWorker|null>>(
          controllerChangeEvents.pipe(map(() => serviceWorker.controller)));

      const currentController =
          <Observable<ServiceWorker|null>>(defer(() => of (serviceWorker.controller)));

      const controllerWithChanges =
          <Observable<ServiceWorker|null>>(concat(currentController, controllerChanges));
      this.worker = <Observable<ServiceWorker>>(
          controllerWithChanges.pipe(filter((c: ServiceWorker) => !!c)));

      this.registration = <Observable<ServiceWorkerRegistration>>(
          this.worker.pipe(switchMap(() => serviceWorker.getRegistration())));

      const rawEvents = fromEvent(serviceWorker, 'message');

      const rawEventPayload = rawEvents.pipe(map((event: MessageEvent) => event.data));
      const eventsUnconnected =
          (rawEventPayload.pipe(filter((event: Object) => !!event && !!(event as any)['type'])));
      const events = eventsUnconnected.pipe(publish()) as ConnectableObservable<IncomingEvent>;
      this.events = events;
      events.connect();
    }
  }

  /**
   * @internal
   */
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

  /**
   * @internal
   */
  postMessageWithStatus(type: string, payload: Object, nonce: number): Promise<void> {
    const waitForStatus = this.waitForStatus(nonce);
    const postMessage = this.postMessage(type, payload);
    return Promise.all([waitForStatus, postMessage]).then(() => undefined);
  }

  /**
   * @internal
   */
  generateNonce(): number { return Math.round(Math.random() * 10000000); }

  /**
   * @internal
   */
  // TODO(i): the typings and casts in this method are wonky, we should revisit it and make the
  // types flow correctly
  eventsOfType<T extends TypedEvent>(type: string): Observable<T> {
    return <Observable<T>>this.events.pipe(filter((event) => { return event.type === type; }));
  }

  /**
   * @internal
   */
  // TODO(i): the typings and casts in this method are wonky, we should revisit it and make the
  // types flow correctly
  nextEventOfType<T extends TypedEvent>(type: string): Observable<T> {
    return <Observable<T>>(this.eventsOfType(type).pipe(take(1)));
  }

  /**
   * @internal
   */
  waitForStatus(nonce: number): Promise<void> {
    return this.eventsOfType<StatusEvent>('STATUS')
        .pipe(
            filter((event: StatusEvent) => event.nonce === nonce), take(1),
            map((event: StatusEvent) => {
              if (event.status) {
                return undefined;
              }
              throw new Error(event.error !);
            }))
        .toPromise();
  }

  get isEnabled(): boolean { return !!this.serviceWorker; }
}
