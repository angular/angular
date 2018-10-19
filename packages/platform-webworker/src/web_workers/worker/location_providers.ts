/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LOCATION_INITIALIZED, PlatformLocation} from '@angular/common';
import {APP_INITIALIZER, InjectionToken, NgZone} from '@angular/core';

import {WebWorkerPlatformLocation} from './platform_location';


/**
 * The {@link PlatformLocation} providers that should be added when the {@link Location} is used in
 * a worker context.
 *
 * @publicApi
 */
export const WORKER_APP_LOCATION_PROVIDERS = [
  {provide: PlatformLocation, useClass: WebWorkerPlatformLocation}, {
    provide: APP_INITIALIZER,
    useFactory: appInitFnFactory,
    multi: true,
    deps: [PlatformLocation, NgZone]
  },
  {provide: LOCATION_INITIALIZED, useFactory: locationInitialized, deps: [PlatformLocation]}
];

export function locationInitialized(platformLocation: WebWorkerPlatformLocation) {
  return platformLocation.initialized;
}

export function appInitFnFactory(platformLocation: WebWorkerPlatformLocation, zone: NgZone): () =>
    Promise<boolean> {
  return () => zone.runGuarded(() => platformLocation.init());
}
