/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {NEVER, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';

import {ERR_SW_NOT_SUPPORTED, NgswCommChannel, UnrecoverableStateEvent, UpdateActivatedEvent, UpdateAvailableEvent, VersionEvent, VersionReadyEvent} from './low_level';



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
   * Emits a `VersionDetectedEvent` event whenever a new version is detected on the server.
   *
   * Emits a `VersionInstallationFailedEvent` event whenever checking for or downloading a new
   * version fails.
   *
   * Emits a `VersionReadyEvent` event whenever a new version has been downloaded and is ready for
   * activation.
   */
  readonly versionUpdates: Observable<VersionEvent>;

  /**
   * Emits an `UpdateAvailableEvent` event whenever a new app version is available.
   *
   * @deprecated Use {@link versionUpdates} instead.
   *
   * The behavior of `available` can be replicated by using `versionUpdates` by filtering for the
   * `VersionReadyEvent`:
   *
   * {@example service-worker-getting-started/src/app/prompt-update.service.ts
   * region='sw-replicate-available'}
   */
  readonly available: Observable<UpdateAvailableEvent>;

  /**
   * Emits an `UpdateActivatedEvent` event whenever the app has been updated to a new version.
   *
   * @deprecated Use the return value of {@link SwUpdate#activateUpdate} instead.
   *
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
      this.versionUpdates = NEVER;
      this.available = NEVER;
      this.activated = NEVER;
      this.unrecoverable = NEVER;
      return;
    }
    this.versionUpdates = this.sw.eventsOfType<VersionEvent>([
      'VERSION_DETECTED',
      'VERSION_INSTALLATION_FAILED',
      'VERSION_READY',
      'NO_NEW_VERSION_DETECTED',
    ]);
    this.available = this.versionUpdates.pipe(
        filter((evt: VersionEvent): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map(evt => ({
              type: 'UPDATE_AVAILABLE',
              current: evt.currentVersion,
              available: evt.latestVersion,
            })));
    this.activated = this.sw.eventsOfType<UpdateActivatedEvent>('UPDATE_ACTIVATED');
    this.unrecoverable = this.sw.eventsOfType<UnrecoverableStateEvent>('UNRECOVERABLE_STATE');
  }

  /**
   * Checks for an update and waits until the new version is downloaded from the server and ready
   * for activation.
   *
   * @returns a promise that
   * - resolves to `true` if a new version was found and is ready to be activated.
   * - resolves to `false` if no new version was found
   * - rejects if any error occurs
   */
  checkForUpdate(): Promise<boolean> {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const nonce = this.sw.generateNonce();
    return this.sw.postMessageWithOperation('CHECK_FOR_UPDATES', {nonce}, nonce);
  }

  /**
   * Updates the current client (i.e. browser tab) to the latest version that is ready for
   * activation.
   *
   * In most cases, you should not use this method and instead should update a client by reloading
   * the page.
   *
   * <div class="alert is-important">
   *
   * Updating a client without reloading can easily result in a broken application due to a version
   * mismatch between the [application shell](guide/glossary#app-shell) and other page resources,
   * such as [lazy-loaded chunks](guide/glossary#lazy-loading), whose filenames may change between
   * versions.
   *
   * Only use this method, if you are certain it is safe for your specific use case.
   *
   * </div>
   *
   * @returns a promise that
   *  - resolves to `true` if an update was activated successfully
   *  - resolves to `false` if no update was available (for example, the client was already on the
   *    latest version).
   *  - rejects if any error occurs
   */
  activateUpdate(): Promise<boolean> {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const nonce = this.sw.generateNonce();
    return this.sw.postMessageWithOperation('ACTIVATE_UPDATE', {nonce}, nonce);
  }
}
