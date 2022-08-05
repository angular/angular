/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

/** Default options, for the chips module, that can be overridden. */
export interface MatLegacyChipsDefaultOptions {
  /** The list of key codes that will trigger a chipEnd event. */
  separatorKeyCodes: readonly number[] | ReadonlySet<number>;
}

/** Injection token to be used to override the default options for the chips module. */
export const MAT_CHIPS_DEFAULT_OPTIONS = new InjectionToken<MatLegacyChipsDefaultOptions>(
  'mat-chips-default-options',
);
