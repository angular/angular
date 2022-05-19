/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {MatTabLabelWrapper as BaseMatTabLabelWrapper} from '@angular/material/tabs';
import {MatInkBarItem, mixinInkBarItem} from './ink-bar';

const _MatTabLabelWrapperBase = mixinInkBarItem(BaseMatTabLabelWrapper);

/**
 * Used in the `mat-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
  selector: '[matTabLabelWrapper]',
  inputs: ['disabled', 'fitInkBarToContent'],
  host: {
    '[class.mat-mdc-tab-disabled]': 'disabled',
    '[attr.aria-disabled]': '!!disabled',
  },
})
export class MatTabLabelWrapper extends _MatTabLabelWrapperBase implements MatInkBarItem {}
