/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, signal, WritableSignal} from '@angular/core';

/**
 * Holds the instance ID of the component to navigate to from a Chrome
 * Performance panel deep link
 */
export const DEEP_LINK_INSTANCE_ID = new InjectionToken<WritableSignal<number | null>>(
  'DEEP_LINK_INSTANCE_ID',
  {factory: () => signal(null)},
);
