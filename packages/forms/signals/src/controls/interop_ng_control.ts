/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ControlValueAccessor, type AbstractControl, type NgControl} from '@angular/forms';
import type {FieldState} from '../api/types';
import {InteropBase, InteropSharedKeys} from './interop_base';
import {createInteropControl} from './interop_abstract_control';

/**
 * A fake version of `NgControl` provided by the `Field` directive. This allows interoperability
 * with a wider range of components designed to work with reactive forms, in particular ones that
 * inject the `NgControl`. The interop control does not implement *all* properties and methods of
 * the real `NgControl`, but does implement some of the most commonly used ones that have a clear
 * equivalent in signal forms.
 */
export class InteropNgControl
  extends InteropBase<unknown>
  implements Pick<NgControl, 'control' | 'valueAccessor'>
{
  constructor(field: () => FieldState<unknown>) {
    super(field);
  }

  readonly control = createInteropControl(this.field);

  valueAccessor: ControlValueAccessor | null = null;
}
