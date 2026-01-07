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
 * @param durationOrDebouncer Either a debounce duration in milliseconds, or a custom
 *     {@link Debouncer} function.
 *
 * @experimental 21.0.0
 */
export function debounce<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  durationOrDebouncer: number | Debouncer<TValue, TPathKind>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  const debouncer =
    typeof durationOrDebouncer === 'function'
      ? durationOrDebouncer
      : durationOrDebouncer > 0
        ? debounceForDuration(durationOrDebouncer)
        : immediate;
  pathNode.builder.addMetadataRule(DEBOUNCER, () => debouncer);
}

function debounceForDuration(durationInMilliseconds: number): Debouncer<unknown> {
  return (_context, abortSignal) => {
    return new Promise((resolve) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const onAbort = () => {
        clearTimeout(timeoutId);
      };

      timeoutId = setTimeout(() => {
        abortSignal.removeEventListener('abort', onAbort);
        resolve();
      }, durationInMilliseconds);

      abortSignal.addEventListener('abort', onAbort, {once: true});
    });
  };
}

function immediate() {}
