/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {AbstractControl} from '../model/abstract_model';

/**
 * A validation error used when propagating Reactive Forms errors to FVC components.
 *
 * @internal
 */
export class ReactiveValidationError<T = unknown> {
  readonly kind: string;
  readonly context: T;
  readonly control: AbstractControl;
  readonly message?: string;

  constructor({kind, context, control}: {kind: string; context: T; control: AbstractControl}) {
    this.kind = kind;
    this.context = context;
    this.control = control;
  }
}
