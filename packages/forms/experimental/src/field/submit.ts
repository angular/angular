/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, linkedSignal, Signal, signal, WritableSignal} from '@angular/core';
import type {SubmittedStatus} from '../api/types';
import {stripField, WithField, type ValidationError} from '../api/validation_errors';
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

  setServerErrors(
    result:
      | ValidationError
      | WithField<ValidationError>
      | (ValidationError | WithField<ValidationError>)[],
  ) {
    this.serverErrors.set(Array.isArray(result) ? result.map(stripField) : [stripField(result)]);
  }

  reset(): void {
    this.selfSubmittedStatus.set('unsubmitted');
    for (const child of this.node.structure.children()) {
      child.submitState.reset();
    }
  }
}
