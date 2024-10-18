/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentProviders, InjectionToken, makeEnvironmentProviders} from '../../di';
import {NgZone, NoopNgZone} from '../../zone/ng_zone';

/**
 * Provides a change detection confguration to disable Angular's automatic change detection scheduling.
 *
 * This option may be desirable for applications that want more control over when `ApplicationRef.tick`
 * is called rather than relying on Angular's internal knowledge of when it should.
 */
export function provideManualChangeDetection(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: NgZone, useClass: NoopNgZone},
    typeof ngDevMode === 'undefined' || ngDevMode
      ? [{provide: PROVIDED_MANUAL_CHANGE_DETECTION, useValue: true}]
      : [],
  ]);
}

export const PROVIDED_MANUAL_CHANGE_DETECTION = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'manual change detection provided' : '',
  {factory: () => false, providedIn: 'root'},
);
