/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {ConnectableObservable} from 'rxjs/observable/ConnectableObservable';
import {concat as obs_concat} from 'rxjs/observable/concat';
import {defer as obs_defer} from 'rxjs/observable/defer';
import {fromEvent as obs_fromEvent} from 'rxjs/observable/fromEvent';
import {of as obs_of} from 'rxjs/observable/of';
import {_throw as obs_throw} from 'rxjs/observable/throw';
import {_do as op_do} from 'rxjs/operator/do';
import {filter as op_filter} from 'rxjs/operator/filter';
import {map as op_map} from 'rxjs/operator/map';
import {publish as op_publish} from 'rxjs/operator/publish';
import {startWith as op_startWith} from 'rxjs/operator/startWith';
import {switchMap as op_switchMap} from 'rxjs/operator/switchMap';
import {take as op_take} from 'rxjs/operator/take';
import {toPromise as op_toPromise} from 'rxjs/operator/toPromise';

const ERR_SW_NOT_SUPPORTED = 'Service workers are not supported by this browser';

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

interface TypedEvent {
  type: string;
}

interface StatusEvent {
  type: 'STATUS';
  nonce: number;
  status: boolean;
  error?: string;
}


function errorObservable(message: string): Observable<any> {
  return obs_defer(() => obs_throw(new Error(message)));
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
  readonly events: Observable<IncomingEvent>;

  constructor(serviceWorker: ServiceWorkerContainer|undefined) {
    if (!serviceWorker) {
      this.worker = this.events = errorObservable(ERR_SW_NOT_SUPPORTED);
    } else {
      const controllerChangeEvents =
          <Observable<any>>(obs_fromEvent(serviceWorker, 'controllerchange'));
      const controllerChanges = <Observable<ServiceWorker|null>>(
          op_map.call(controllerChangeEvents, () => serviceWorker.controller));

      const currentController =
          <Observable<ServiceWorker|null>>(obs_defer(() => obs_of(serviceWorker.controller)));

      const controllerWithChanges =
          <Observable<ServiceWorker|null>>(obs_concat(currentController, controllerChanges));
      this.worker = <Observable<ServiceWorker>>(
          op_filter.call(controllerWithChanges, (c: ServiceWorker) => !!c));

      this.registration = <Observable<ServiceWorkerRegistration>>(
          op_switchMap.call(this.worker, () => serviceWorker.getRegistration()));

      const rawEvents = <Observable<MessageEvent>>(op_switchMap.call(
          this.registration, (reg: ServiceWorkerRegistration) => obs_fromEvent(reg, 'message')));

      const rawEventPayload =
          <Observable<Object>>(op_map.call(rawEvents, (event: MessageEvent) => event.data));
      const eventsUnconnected = <Observable<IncomingEvent>>(
          op_filter.call(rawEventPayload, (event: Object) => !!event && !!(event as any)['type']));
      const events = <ConnectableObservable<IncomingEvent>>(op_publish.call(eventsUnconnected));
      this.events = events;
      events.connect();
    }
  }

  /**
   * @internal
   */
  postMessage(action: string, payload: Object): Promise<void> {
    const worker = op_take.call(this.worker, 1);
    const sideEffect = op_do.call(worker, (sw: ServiceWorker) => {
      sw.postMessage({
          action, ...payload,
      });
    });
    return <Promise<void>>(op_toPromise.call(sideEffect).then(() => undefined));
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
  eventsOfType<T>(type: string): Observable<T> {
    return <Observable<T>>(
        op_filter.call(this.events, (event: T & TypedEvent) => { return event.type === type; }));
  }

  /**
   * @internal
   */
  nextEventOfType<T>(type: string): Observable<T> {
    return <Observable<T>>(op_take.call(this.eventsOfType(type), 1));
  }

  /**
   * @internal
   */
  waitForStatus(nonce: number): Promise<void> {
    const statusEventsWithNonce = <Observable<StatusEvent>>(
        op_filter.call(this.eventsOfType('STATUS'), (event: StatusEvent) => event.nonce === nonce));
    const singleStatusEvent = <Observable<StatusEvent>>(op_take.call(statusEventsWithNonce, 1));
    const mapErrorAndValue =
        <Observable<void>>(op_map.call(singleStatusEvent, (event: StatusEvent) => {
          if (event.status) {
            return undefined;
          }
          throw new Error(event.error !);
        }));
    return op_toPromise.call(mapErrorAndValue);
  }
}