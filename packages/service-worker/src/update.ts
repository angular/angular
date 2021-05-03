/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {NEVER, Observable} from 'rxjs';

import {ERR_SW_NOT_SUPPORTED, NgswCommChannel, UnrecoverableStateEvent, UpdateActivatedEvent, UpdateAvailableEvent} from './low_level';



/**
 * Subscribe to update notifications from the Service Worker, trigger update
 * checks, and forcibly activate updates.
 *
 * @see {@link guide/service-worker-communications Service worker communication guide}
 *
 * @publicApi
 */
@Injectable()
export class SwUpdate {
  /**
   * Emits an `UpdateAvailableEvent` event whenever a new app version is available.
   */
  readonly available: Observable<UpdateAvailableEvent>;

  /**
   * Emits an `UpdateActivatedEvent` event whenever the app has been updated to a new version.
   */
  readonly activated: Observable<UpdateActivatedEvent>;

  /**
   * Emits an `UnrecoverableStateEvent` event whenever the version of the app used by the service
   * worker to serve this client is in a broken state that cannot be recovered from without a full
   * page reload.
   */
  readonly unrecoverable: Observable<UnrecoverableStateEvent>;

  /**
   * True if the Service Worker is enabled (supported by the browser and enabled via
   * `ServiceWorkerModule`).
   */
  get isEnabled(): boolean {
    return this.sw.isEnabled;
  }

  constructor(private sw: NgswCommChannel) {
    if (!sw.isEnabled) {
      this.available = NEVER;
      this.activated = NEVER;
      this.unrecoverable = NEVER;
      return;
    }
    this.available = this.sw.eventsOfType<UpdateAvailableEvent>('UPDATE_AVAILABLE');
    this.activated = this.sw.eventsOfType<UpdateActivatedEvent>('UPDATE_ACTIVATED');
    this.unrecoverable = this.sw.eventsOfType<UnrecoverableStateEvent>('UNRECOVERABLE_STATE');
  }

  checkForUpdate(): Promise<void> {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const statusNonce = this.sw.generateNonce();
    return this.sw.postMessageWithStatus('CHECK_FOR_UPDATES', {statusNonce}, statusNonce);
  }

  activateUpdate(): Promise<void> {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const statusNonce = this.sw.generateNonce();
    return this.sw.postMessageWithStatus('ACTIVATE_UPDATE', {statusNonce}, statusNonce);
  }
}
