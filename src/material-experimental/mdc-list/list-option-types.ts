/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

/**
 * Type describing possible positions of a checkbox in a list option
 * with respect to the list item's text.
 */
export type MatListOptionCheckboxPosition = 'before' | 'after';

/**
 * Interface describing a list option. This is used to avoid circular
 * dependencies between the list-option and the styler directives.
 * @docs-private
 */
export interface ListOption {
  _getCheckboxPosition(): MatListOptionCheckboxPosition;
}

/**
 * Injection token that can be used to reference instances of an `ListOption`. It serves
 * as alternative token to an actual implementation which could result in undesired
 * retention of the class or circular references breaking runtime execution.
 * @docs-private
 */
export const LIST_OPTION = new InjectionToken<ListOption>('ListOption');
