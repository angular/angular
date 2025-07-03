/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, linkedSignal, Signal, signal, WritableSignal} from '@angular/core';
import type {AsyncValidationResult, SubmittedStatus} from '../api/types';
import type {ValidationError, ValidationTreeError} from '../api/validation_errors';
import type {FieldNode} from './node';

/**
 * State of a `FieldNode` that's associated with form submission.
 */
export class FieldSubmitState {
  readonly selfSubmittedStatus = signal<SubmittedStatus>('unsubmitted');
  readonly serverErrors: WritableSignal<readonly ValidationError[]>;

  constructor(private readonly node: FieldNode) {
    this.serverErrors = linkedSignal({
      source: this.node.structure.value,
      computation: () => [] as readonly ValidationError[],
    });
  }

  /**
   * The submitted status of the form.
   */
  readonly submittedStatus: Signal<SubmittedStatus> = computed(() =>
    this.selfSubmittedStatus() !== 'unsubmitted'
      ? this.selfSubmittedStatus()
      : (this.node.structure.parent?.submitState.submittedStatus() ?? 'unsubmitted'),
  );

  setServerErrors(result: Exclude<AsyncValidationResult, 'pending'>) {
    let errors: ValidationError[];
    if (result === undefined) {
      errors = [];
    } else if (!Array.isArray(result)) {
      errors = [stripField(result as ValidationError)];
    } else {
      errors = result.map(stripField);
    }
    this.serverErrors.set(errors);
  }

  reset(): void {
    this.selfSubmittedStatus.set('unsubmitted');
    for (const child of this.node.structure.children()) {
      child.submitState.reset();
    }
  }
}

function stripField({field, ...rest}: ValidationTreeError): ValidationError {
  return rest as ValidationError;
}
