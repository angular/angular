/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DebounceTimer,
  Resource,
  Signal,
  debounced,
  resourceFromSnapshots,
  ɵencapsulateResourceError as encapsulateResourceError,
  ɵrethrowFatalResourceErrors as rethrowFatalResourceErrors,
} from '@angular/core';
import {FieldNode} from '../../../field/node';
import {addDefaultField} from '../../../field/validation';
import {FieldPathNode} from '../../../schema/path_node';
import {assertPathIsCurrent} from '../../../schema/schema';
import {FieldContext, PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {createManagedMetadataKey, IS_ASYNC_VALIDATION_RESOURCE, metadata} from '../metadata';
import type {ResourceValidatorOptions} from './validate_resource';

/** Registers the resource and error rules shared by the resource and loader validators. */
export function registerAsyncValidation<TValue, TParams, TResult, TPathKind extends PathKind>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  opts: ResourceValidatorOptions<TValue, TParams, TResult, TPathKind>,
): void {
  assertPathIsCurrent(path);
  const pathNode = FieldPathNode.unwrapFieldPath(path);
  const RESOURCE = createManagedMetadataKey<Resource<TResult | undefined>, TParams | undefined>(
    (_state, params) => {
      const source = createValidationParamsResource(params, opts.debounce);
      return chainValidationResources(source, opts.factory(source));
    },
  );
  RESOURCE[IS_ASYNC_VALIDATION_RESOURCE] = true;

  metadata(path, RESOURCE, (ctx) => {
    const node = ctx.stateOf(path) as FieldNode;
    if (node.validationState.shouldSkipValidation() || !node.validationState.syncValid()) {
      return undefined;
    }
    if (opts.when && !opts.when(ctx)) {
      return undefined;
    }
    return opts.params(ctx);
  });

  pathNode.builder.addAsyncErrorRule((ctx) => {
    const res = ctx.state.metadata(RESOURCE)!;
    switch (res.status()) {
      case 'idle':
        return undefined;
      case 'loading':
      case 'reloading':
        return 'pending';
      case 'resolved':
      case 'local':
        return res.hasValue()
          ? addDefaultField(
              opts.onSuccess(res.value()!, ctx as FieldContext<TValue, TPathKind>),
              ctx.fieldTree,
            )
          : undefined;
      case 'error':
        return addDefaultField(
          opts.onError(res.error(), ctx as FieldContext<TValue, TPathKind>),
          ctx.fieldTree,
        );
    }
  });
}

/** Exposes params failures as error snapshots, without hiding loading behind thrown markers. */
function createValidationParamsResource<T>(
  params: Signal<T>,
  debounce: DebounceTimer<T> | undefined,
): Resource<T> {
  if (debounce !== undefined) {
    const source = debounced(params, debounce);
    return resourceFromSnapshots<T>(() => {
      const snapshot = source.snapshot();
      return snapshot.status === 'error'
        ? {status: 'error', error: encapsulateResourceError(snapshot.error)}
        : snapshot;
    });
  }

  return resourceFromSnapshots<T>(() => {
    try {
      return {status: 'resolved', value: params()};
    } catch (error) {
      rethrowFatalResourceErrors(error);
      // Params and when are user callbacks; their failures must become validation state.
      return {status: 'error', error: encapsulateResourceError(error)};
    }
  });
}

/** Preserves upstream validation state before exposing the target's current result. */
function chainValidationResources<TParams, TResult>(
  source: Resource<TParams | undefined>,
  target: Resource<TResult | undefined> & {reload?: () => boolean},
): Resource<TResult | undefined> & {reload: () => boolean} {
  return Object.assign(
    resourceFromSnapshots<TResult | undefined>(() => {
      const snapshot = source.snapshot();
      switch (snapshot.status) {
        case 'resolved':
        case 'local':
          return snapshot.value === undefined
            ? {status: 'idle', value: undefined}
            : target.snapshot();
        case 'error':
          return snapshot;
        default:
          return {status: snapshot.status, value: undefined};
      }
    }),
    {reload: () => target.reload?.() ?? false},
  );
}
