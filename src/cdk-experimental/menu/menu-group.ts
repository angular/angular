/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';

/**
 * A grouping container for `CdkMenuItemRadio` instances, similar to a `role="radiogroup"` element.
 */
@Directive({
  selector: '[cdkMenuGroup]',
  exportAs: 'cdkMenuGroup',
  host: {
    'role': 'group',
    'class': 'cdk-menu-group',
  },
  providers: [{provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher}],
})
export class CdkMenuGroup {}
