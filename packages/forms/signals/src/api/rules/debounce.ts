/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DEBOUNCER} from '../../field/debounce';
import {FieldPathNode} from '../../schema/path_node';
import {assertPathIsCurrent} from '../../schema/schema';
import type {Debouncer, PathKind, SchemaPath, SchemaPathRules} from '../types';

/**
 * Configures the frequency at which a form field is updated by UI events.
 *
 * When this rule is applied, updates from the UI to the form model will be delayed until either
 * the field is touched, or the most recently debounced update resolves.
 *
 * @param path The target path to debounce.
 * @param config A debounce configuration, which can be either a debounce duration in milliseconds,
 *     `'blur'` to debounce until the field is blurred, or a custom {@link Debouncer} function.
 *
 * @experimental 21.0.0
 */
export function debounce<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  config: number | 'blur' | Debouncer<TValue, TPathKind>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  const debouncer = normalizeDebouncer(config);
  pathNode.builder.addMetadataRule(DEBOUNCER, () => debouncer);
}

function normalizeDebouncer<TValue, TPathKind extends PathKind>(
  debouncer: number | 'blur' | Debouncer<TValue, TPathKind>,
) {
  // If it's already a debounce function, return it as-is.
  if (typeof debouncer === 'function') {
    return debouncer;
  }
  // If it's 'blur', return a debouncer that never resolves. The field will still be updated when
  // the control is blurred.
  if (debouncer === 'blur') {
    return debounceUntilBlur();
  }
  // If it's a non-zero number, return a timer-based debouncer.
  if (debouncer > 0) {
    return debounceForDuration(debouncer);
  }
  // Otherwise it's 0, so we return a function that will synchronize the model without delay.
  return immediate;
}

/**
 * Creates a debouncer that will wait for the given duration before resolving.
 */
function debounceForDuration(durationInMilliseconds: number): Debouncer<unknown> {
  return (_context, abortSignal) => {
    return new Promise((resolve) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const onAbort = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      timeoutId = setTimeout(() => {
        abortSignal.removeEventListener('abort', onAbort);
        resolve();
      }, durationInMilliseconds);

      abortSignal.addEventListener('abort', onAbort, {once: true});
    });
  };
}

/**
 * Creates a debouncer that will wait indefinitely, relying on the node to synchronize pending
 * updates when blurred.
 */
function debounceUntilBlur(): Debouncer<unknown> {
  return (_context, abortSignal) => {
    return new Promise((resolve) => {
      abortSignal.addEventListener('abort', () => resolve(), {once: true});
    });
  };
}

function immediate(): void {}
