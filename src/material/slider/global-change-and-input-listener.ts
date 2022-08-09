/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, NgZone, OnDestroy} from '@angular/core';
import {SpecificEventListener} from '@material/base';
import {fromEvent, Observable, Subject, Subscription} from 'rxjs';
import {finalize, share, takeUntil} from 'rxjs/operators';

/**
 * Handles listening for all change and input events that occur on the document.
 *
 * This service exposes a single method #listen to allow users to subscribe to change and input
 * events that occur on the document. Since listening for these events can be expensive, we use
 * #fromEvent which will lazily attach a listener when the first subscription is made and remove the
 * listener once the last observer unsubscribes.
 */
@Injectable({providedIn: 'root'})
export class GlobalChangeAndInputListener<K extends 'change' | 'input'> implements OnDestroy {
  /** The injected document if available or fallback to the global document reference. */
  private _document: Document;

  /** Stores the subjects that emit the events that occur on the global document. */
  private _observables = new Map<K, Observable<Event>>();

  /** The notifier that triggers the global event observables to stop emitting and complete. */
  private _destroyed = new Subject();

  constructor(@Inject(DOCUMENT) document: any, private _ngZone: NgZone) {
    this._document = document;
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    this._observables.clear();
  }

  /** Returns a subscription to global change or input events. */
  listen(type: K, callback: SpecificEventListener<K>): Subscription {
    // If this is the first time we are listening to this event, create the observable for it.
    if (!this._observables.has(type)) {
      this._observables.set(type, this._createGlobalEventObservable(type));
    }

    return this._ngZone.runOutsideAngular(() =>
      this._observables
        .get(type)!
        .subscribe((event: Event) => this._ngZone.run(() => callback(event))),
    );
  }

  /** Creates an observable that emits all events of the given type. */
  private _createGlobalEventObservable(type: K) {
    return fromEvent(this._document, type, {capture: true, passive: true}).pipe(
      takeUntil(this._destroyed),
      finalize(() => this._observables.delete(type)),
      share(),
    );
  }
}
