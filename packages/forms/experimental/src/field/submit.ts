/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, linkedSignal, Signal, signal, WritableSignal} from '@angular/core';
import type {SubmittedStatus, TreeValidationResult} from '../api/types';
import {stripField, type ValidationError} from '../api/validation_errors';
import {isArray} from '../util/is_array';
import type {FieldNode} from './node';

/**
 * State of a `FieldNode` that's associated with form submission.
 */
export class FieldSubmitState {
  readonly selfSubmitting = signal<boolean>(false);
  readonly serverErrors: WritableSignal<readonly ValidationError[]>;

  constructor(private readonly node: FieldNode) {
    this.serverErrors = linkedSignal({
      source: this.node.structure.value,
      computation: () => [] as readonly ValidationError[],
    });
  }

  /**
   * Whether this form is currently being submitted.
   */
  readonly submitting: Signal<boolean> = computed(() => {
    return this.selfSubmitting() || (this.node.structure.parent?.submitting() ?? false);
  });

  setServerErrors(result: Exclude<TreeValidationResult, null | undefined>) {
    this.serverErrors.set(isArray(result) ? result.map(stripField) : [stripField(result)]);
  }
}
