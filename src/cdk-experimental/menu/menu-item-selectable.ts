/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty, BooleanInput} from '@angular/cdk/coercion';
import {Input, Directive, Output, EventEmitter} from '@angular/core';
import {CdkMenuItem} from './menu-item';

/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;

/**
 * Base class providing checked state for MenuItems along with outputting a clicked event when the
 * element is triggered. It provides functionality for selectable elements.
 */
@Directive()
export abstract class CdkMenuItemSelectable extends CdkMenuItem {
  /** Event emitted when the selectable item is clicked */
  @Output('cdkMenuItemToggled') toggled: EventEmitter<CdkMenuItemSelectable> = new EventEmitter();

  /** Whether the element is checked */
  @Input()
  get checked() {
    return this._checked;
  }
  set checked(value: boolean) {
    this._checked = coerceBooleanProperty(value);
  }
  private _checked = false;

  /** The name of the selectable element with a default value */
  @Input() name: string = `cdk-selectable-item-${nextId++}`;

  /** The id of the selectable element with a default value */
  @Input() id: string = `cdk-selectable-item-${nextId++}`;

  /** If the element is not disabled emit the click event */
  trigger() {
    if (!this.disabled) {
      this.toggled.next(this);
    }
  }

  static ngAcceptInputType_checked: BooleanInput;
}
