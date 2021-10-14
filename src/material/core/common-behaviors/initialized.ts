/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable, Subscriber} from 'rxjs';
import {Constructor} from './constructor';

/**
 * Mixin that adds an initialized property to a directive which, when subscribed to, will emit a
 * value once markInitialized has been called, which should be done during the ngOnInit function.
 * If the subscription is made after it has already been marked as initialized, then it will trigger
 * an emit immediately.
 * @docs-private
 */
export interface HasInitialized {
  /** Stream that emits once during the directive/component's ngOnInit. */
  initialized: Observable<void>;

  /**
   * Sets the state as initialized and must be called during ngOnInit to notify subscribers that
   * the directive has been initialized.
   * @docs-private
   */
  _markInitialized: () => void;
}

type HasInitializedCtor = Constructor<HasInitialized>;

/** Mixin to augment a directive with an initialized property that will emits when ngOnInit ends. */
export function mixinInitialized<T extends Constructor<{}>>(base: T): HasInitializedCtor & T {
  return class extends base {
    /** Whether this directive has been marked as initialized. */
    _isInitialized = false;

    /**
     * List of subscribers that subscribed before the directive was initialized. Should be notified
     * during _markInitialized. Set to null after pending subscribers are notified, and should
     * not expect to be populated after.
     */
    _pendingSubscribers: Subscriber<void>[] | null = [];

    /**
     * Observable stream that emits when the directive initializes. If already initialized, the
     * subscriber is stored to be notified once _markInitialized is called.
     */
    initialized = new Observable<void>(subscriber => {
      // If initialized, immediately notify the subscriber. Otherwise store the subscriber to notify
      // when _markInitialized is called.
      if (this._isInitialized) {
        this._notifySubscriber(subscriber);
      } else {
        this._pendingSubscribers!.push(subscriber);
      }
    });

    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * Marks the state as initialized and notifies pending subscribers. Should be called at the end
     * of ngOnInit.
     * @docs-private
     */
    _markInitialized(): void {
      if (this._isInitialized && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw Error(
          'This directive has already been marked as initialized and ' +
            'should not be called twice.',
        );
      }

      this._isInitialized = true;

      this._pendingSubscribers!.forEach(this._notifySubscriber);
      this._pendingSubscribers = null;
    }

    /** Emits and completes the subscriber stream (should only emit once). */
    _notifySubscriber(subscriber: Subscriber<void>): void {
      subscriber.next();
      subscriber.complete();
    }
  };
}
