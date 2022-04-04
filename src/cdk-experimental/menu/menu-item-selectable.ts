/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {Directive, Input} from '@angular/core';
import {CdkMenuItem} from './menu-item';

/**
 * Base class providing checked state for MenuItems along with outputting a clicked event when the
 * element is triggered. It provides functionality for selectable elements.
 */
@Directive({
  host: {
    '[attr.aria-checked]': '!!checked',
    '[attr.aria-disabled]': 'disabled || null',
  },
})
export abstract class CdkMenuItemSelectable extends CdkMenuItem {
  /** Whether the element is checked */
  @Input('cdkMenuItemChecked')
  get checked(): boolean {
    return this._checked;
  }
  set checked(value: BooleanInput) {
    this._checked = coerceBooleanProperty(value);
  }
  private _checked = false;

  protected override closeOnSpacebarTrigger = false;
}
