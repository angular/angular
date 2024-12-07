/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbstractControlDirective} from './abstract_control_directive';
import {ControlContainer} from './control_container';
import {ControlValueAccessor} from './control_value_accessor';

/**
 * @description
 * A base class that all `FormControl`-based directives extend. It binds a `FormControl`
 * object to a DOM element.
 *
 * @publicApi
 */
export abstract class NgControl extends AbstractControlDirective {
  /**
   * @description
   * The parent form for the control.
   *
   * @internal
   */
  _parent: ControlContainer | null = null;

  /**
   * @description
   * The name for the control
   */
  name: string | number | null = null;

  /**
   * @description
   * The value accessor for the control
   */
  valueAccessor: ControlValueAccessor | null = null;

  /**
   * @description
   * The callback method to update the model from the view when requested
   *
   * @param newValue The new value for the view
   */
  abstract viewToModelUpdate(newValue: any): void;
}
