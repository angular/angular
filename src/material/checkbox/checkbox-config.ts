/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {InjectionToken} from '@angular/core';


/**
 * Checkbox click action when user click on input element.
 * noop: Do not toggle checked or indeterminate.
 * check: Only toggle checked status, ignore indeterminate.
 * check-indeterminate: Toggle checked status, set indeterminate to false. Default behavior.
 * undefined: Same as `check-indeterminate`.
 */
export type MatCheckboxClickAction = 'noop' | 'check' | 'check-indeterminate' | undefined;

/**
 * Injection token that can be used to specify the checkbox click behavior.
 */
export const MAT_CHECKBOX_CLICK_ACTION =
    new InjectionToken<MatCheckboxClickAction>('mat-checkbox-click-action');
