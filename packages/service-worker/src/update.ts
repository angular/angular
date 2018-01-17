/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {defer as obs_defer} from 'rxjs/observable/defer';
import {never as obs_never} from 'rxjs/observable/never';
import {map as op_map} from 'rxjs/operator/map';

import {ERR_SW_NOT_SUPPORTED, NgswCommChannel, UpdateActivatedEvent, UpdateAvailableEvent} from './low_level';


/**
 * Subscribe to update notifications from the Service Worker, trigger update
 * checks, and forcibly activate updates.
 *
 * @experimental
 */
@Injectable()
export class SwUpdate {
  readonly available: Observable<UpdateAvailableEvent>;
  readonly activated: Observable<UpdateActivatedEvent>;

  constructor(private sw: NgswCommChannel) {
    if (!sw.isEnabled) {
      this.available = obs_never();
      this.activated = obs_never();
      return;
    }
    this.available = this.sw.eventsOfType('UPDATE_AVAILABLE');
    this.activated = this.sw.eventsOfType('UPDATE_ACTIVATED');
  }

  /**
   * Returns true if the Service Worker is enabled (supported by the browser and enabled via
   * ServiceWorkerModule).
   */
  get isEnabled(): boolean { return this.sw.isEnabled; }

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
