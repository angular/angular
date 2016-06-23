/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation} from '@angular/common';
import {APP_INITIALIZER, NgZone} from '@angular/core';

import {WebWorkerPlatformLocation} from './platform_location';


/**
 * Those providers should be added when the router is used in a worker context in addition to the
 * {@link ROUTER_PROVIDERS} and after them.
 * @experimental
 */
export const WORKER_APP_LOCATION_PROVIDERS = [
  {provide: PlatformLocation, useClass: WebWorkerPlatformLocation}, {
    provide: APP_INITIALIZER,
    useFactory: appInitFnFactory,
    multi: true,
    deps: [PlatformLocation, NgZone]
  }
];

function appInitFnFactory(platformLocation: WebWorkerPlatformLocation, zone: NgZone): () =>
    Promise<boolean> {
  return () => { return zone.runGuarded(() => platformLocation.init()); };
}
