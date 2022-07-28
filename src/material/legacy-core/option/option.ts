/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {
  MAT_OPTION_PARENT_COMPONENT,
  _MatOptionBase,
  MatOptionParentComponent,
  MAT_OPTGROUP,
} from '@angular/material/core';
import {MatLegacyOptgroup} from './optgroup';

/**
 * Single option inside of a `<mat-select>` element.
 */
@Component({
  selector: 'mat-option',
  exportAs: 'matOption',
  host: {
    'role': 'option',
    '[attr.tabindex]': '_getTabIndex()',
    '[class.mat-selected]': 'selected',
    '[class.mat-option-multiple]': 'multiple',
    '[class.mat-active]': 'active',
    '[id]': 'id',
    '[attr.aria-selected]': '_getAriaSelected()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[class.mat-option-disabled]': 'disabled',
    '(click)': '_selectViaInteraction()',
    '(keydown)': '_handleKeydown($event)',
    'class': 'mat-option mat-focus-indicator',
  },
  styleUrls: ['option.css'],
  templateUrl: 'option.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatLegacyOption<T = any> extends _MatOptionBase<T> {
  constructor(
    element: ElementRef<HTMLElement>,
    changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_OPTION_PARENT_COMPONENT) parent: MatOptionParentComponent,
    @Optional() @Inject(MAT_OPTGROUP) group: MatLegacyOptgroup,
  ) {
    super(element, changeDetectorRef, parent, group);
  }
}
