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
  separatorKeyCodes: readonly number[] | ReadonlySet<number>;
}

/** Injection token to be used to override the default options for the chips module. */
export const MAT_CHIPS_DEFAULT_OPTIONS = new InjectionToken<MatChipsDefaultOptions>(
  'mat-chips-default-options',
);

/**
 * Injection token that can be used to reference instances of `MatChipAvatar`. It serves as
 * alternative token to the actual `MatChipAvatar` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_CHIP_AVATAR = new InjectionToken('MatChipAvatar');

/**
 * Injection token that can be used to reference instances of `MatChipTrailingIcon`. It serves as
 * alternative token to the actual `MatChipTrailingIcon` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_CHIP_TRAILING_ICON = new InjectionToken('MatChipTrailingIcon');

/**
 * Injection token that can be used to reference instances of `MatChipRemove`. It serves as
 * alternative token to the actual `MatChipRemove` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_CHIP_REMOVE = new InjectionToken('MatChipRemove');

/**
 * Injection token used to avoid a circular dependency between the `MatChip` and `MatChipAction`.
 */
export const MAT_CHIP = new InjectionToken('MatChip');
