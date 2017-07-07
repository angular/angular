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

import {CMD_ACTIVATE_UPDATE, CMD_CHECK_FOR_UPDATES, CMD_REQUEST_UPDATE_STATUS, CMD_REQUEST_VERSION, EVENT_APP_UPDATE_ACTIVATED, EVENT_APP_UPDATE_AVAILABLE, EVENT_STATUS, EVENT_VERSION, NgswCommChannel} from './low_level';

interface VersionPayload {
  readonly version: NgswAppVersion|null;
}

/**
 * A version of the application the Service Worker is managing, defined by its
 * manifest hash.
 *
 * @experimental
 */
export interface NgswAppVersion {
  readonly manifestHash: string;
  readonly appData: Object|null;
}

/**
 * A new update has become available.
 *
 * @experimental
 */
export interface NgswUpdateAvailableEvent {
  readonly current: NgswAppVersion;
  readonly next: NgswAppVersion;
}

/**
 * A new update has been activated and is now the current version.
 *
 * @experimental
 */
export interface NgswUpdateActivatedEvent {
  readonly previous: NgswAppVersion|null;
  readonly current: NgswAppVersion;
}

/**
 * Subscribe to update notifications from the Service Worker, trigger update
 * checks, and forcibly activate updates.
 *
 * @experimental
 */
@Injectable()
export class NgswUpdate {
  readonly available: Observable<NgswUpdateAvailableEvent>;
  readonly activated: Observable<NgswUpdateActivatedEvent>;
  readonly version: Observable<NgswAppVersion|null>;

  constructor(private sw: NgswCommChannel) {
    this.activated = this.sw.eventsOfType(EVENT_APP_UPDATE_ACTIVATED);
    this.available = this.sw.eventsOfType(EVENT_APP_UPDATE_AVAILABLE);
    this.version = obs_defer(() => {
      this.sw.postMessage(CMD_REQUEST_VERSION, {});
      return op_map.call(
          this.sw.eventsOfType(EVENT_VERSION), (event: VersionPayload) => event.version);
    }) as Observable<NgswAppVersion|null>;
  }

  check(): Promise<void> {
    const statusNonce = this.sw.generateNonce();
    return this.sw.postMessageWithStatus(CMD_CHECK_FOR_UPDATES, {statusNonce}, statusNonce);
  }

  activateUpdate(version: NgswAppVersion): Promise<void> {
    const statusNonce = this.sw.generateNonce();
    return this.sw.postMessageWithStatus(
        CMD_ACTIVATE_UPDATE, {manifestHash: version.manifestHash, statusNonce}, statusNonce);
  }
}
