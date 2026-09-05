/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentProviders} from '../../di/interface/provider';
import {provideEnvironmentInitializer} from '../../di/provider_collection';
import {enableSilentListenersImpl} from '../instructions/listener';

/**
 * Turns on the `.silent` event modifier, e.g. `(scroll.silent)="onScroll()"`.
 *
 * Silent listener doesn't mark the view dirty, so it doesn't schedule change detection.
 * If you update a signal that is read in the template, the view still gets refreshed.
 * Makes sense only for zoneless apps.
 */
export function provideSilentListeners(): EnvironmentProviders {
  return provideEnvironmentInitializer(enableSilentListenersImpl);
}
