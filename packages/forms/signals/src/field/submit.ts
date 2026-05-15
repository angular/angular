/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, linkedSignal, Signal, signal, WritableSignal} from '@angular/core';
import {ValidationError} from '../api/rules/validation/validation_errors';
import type {FieldNode} from './node';
import {formDebugObj} from '../util/debug';

/**
 * State of a `FieldNode` that's associated with form submission.
 */
export class FieldSubmitState {
  /**
   * Whether this field was directly submitted (as opposed to indirectly by a parent field being submitted)
   * and is still in the process of submitting.
   */
  readonly selfSubmitting: WritableSignal<boolean>;

  /** Submission errors that are associated with this field. */
  readonly submissionErrors: WritableSignal<readonly ValidationError.WithFieldTree[]>;

  /**
   * Whether this form is currently in the process of being submitted.
   * Either because the field was submitted directly, or because a parent field was submitted.
   */
  readonly submitting: Signal<boolean>;

  constructor(private readonly node: FieldNode) {
    this.selfSubmitting = signal<boolean>(
      false,
      ngDevMode ? formDebugObj(this.node.debugName, 'selfSubmitting') : undefined,
    );

    this.submissionErrors = linkedSignal({
      source: this.node.structure.value,
      computation: () => [] as readonly ValidationError.WithFieldTree[],
      ...(ngDevMode ? formDebugObj(this.node.debugName, 'submissionErrors') : undefined),
    });

    this.submitting = computed(
      () => {
        return this.selfSubmitting() || (this.node.structure.parent?.submitting() ?? false);
      },
      ngDevMode ? formDebugObj(this.node.debugName, 'submitting') : undefined,
    );
  }
}
