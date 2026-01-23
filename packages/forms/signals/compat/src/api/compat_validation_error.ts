/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbstractControl} from '@angular/forms';
import {ValidationError} from '../../../src/api/rules/validation/validation_errors';
import {FieldTree} from '../../../src/api/types';

/**
 * An error used for compat errors.
 *
 * @experimental 21.0.0
 * @category interop
 */
export class CompatValidationError<T = unknown> implements ValidationError {
  readonly kind: string = 'compat';
  readonly control: AbstractControl;
  readonly fieldTree!: FieldTree<unknown>;
  readonly context: T;
  readonly message?: string;

  constructor({context, kind, control}: {context: T; kind: string; control: AbstractControl}) {
    this.context = context;
    this.kind = kind;
    this.control = control;
  }
}
