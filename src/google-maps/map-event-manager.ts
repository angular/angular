/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgZone} from '@angular/core';
import {BehaviorSubject, Observable, Subscriber} from 'rxjs';
import {switchMap} from 'rxjs/operators';

type MapEventManagerTarget = {
  addListener: (name: string, callback: (...args: any[]) => void) => google.maps.MapsEventListener;
} | undefined;

/** Manages event on a Google Maps object, ensuring that events are added only when necessary. */
export class MapEventManager {
  /** Pending listeners that were added before the target was set. */
  private _pending: {observable: Observable<any>, observer: Subscriber<any>}[] = [];
  private _listeners: google.maps.MapsEventListener[] = [];
  private _targetStream = new BehaviorSubject<MapEventManagerTarget>(undefined);

  /** Clears all currently-registered event listeners. */
  private _clearListeners() {
    for (const listener of this._listeners) {
      listener.remove();
    }

    this._listeners = [];
  }

  constructor(private _ngZone: NgZone) {}

  /** Gets an observable that adds an event listener to the map when a consumer subscribes to it. */
  getLazyEmitter<T>(name: string): Observable<T> {
    return this._targetStream.pipe(switchMap(target => {
      const observable = new Observable<T>(observer => {
        // If the target hasn't been initialized yet, cache the observer so it can be added later.
        if (!target) {
          this._pending.push({observable, observer});
          return undefined;
        }

        const listener = target.addListener(name, (event: T) => {
          this._ngZone.run(() => observer.next(event));
        });
        this._listeners.push(listener);
        return () => listener.remove();
      });

      return observable;
    }));
  }

  /** Sets the current target that the manager should bind events to. */
  setTarget(target: MapEventManagerTarget) {
    const currentTarget = this._targetStream.value;

    if (target === currentTarget) {
      return;
    }

    // Clear the listeners from the pre-existing target.
    if (currentTarget) {
      this._clearListeners();
      this._pending = [];
    }

    this._targetStream.next(target);

    // Add the listeners that were bound before the map was initialized.
    this._pending.forEach(subscriber => subscriber.observable.subscribe(subscriber.observer));
    this._pending = [];
  }

  /** Destroys the manager and clears the event listeners. */
  destroy() {
    this._clearListeners();
    this._pending = [];
    this._targetStream.complete();
  }
}
