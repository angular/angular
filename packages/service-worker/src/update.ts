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
import {map as op_map} from 'rxjs/operator/map';

import {NgswCommChannel, UpdateActivatedEvent, UpdateAvailableEvent} from './low_level';


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
    this.available = this.sw.eventsOfType('UPDATE_AVAILABLE');
    this.activated = this.sw.eventsOfType('UPDATE_ACTIVATED');
  }

  checkForUpdate(): Promise<void> {
    const statusNonce = this.sw.generateNonce();
    return this.sw.postMessageWithStatus('CHECK_FOR_UPDATES', {statusNonce}, statusNonce);
  }

  activateUpdate(): Promise<void> {
    const statusNonce = this.sw.generateNonce();
    return this.sw.postMessageWithStatus('ACTIVATE_UPDATE', {statusNonce}, statusNonce);
  }
}
