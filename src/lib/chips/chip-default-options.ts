/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

/** Default options, for the chips module, that can be overridden. */
export interface MatChipsDefaultOptions {
  /** The list of key codes that will trigger a chipEnd event. */
  separatorKeyCodes: number[] | Set<number>;
}

/** Injection token to be used to override the default options for the chips module. */
export const MAT_CHIPS_DEFAULT_OPTIONS =
    new InjectionToken<MatChipsDefaultOptions>('mat-chips-default-options');
