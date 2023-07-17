/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';


/**
 * This directive is used to flag an element to NOT trigger collapsing an
 * expanded row
 */
@Directive({
  selector: '[cfcUncollapsible]',
})
export class ExpandingRowUncollapsible {
}
