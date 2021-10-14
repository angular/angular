/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  InjectionToken,
  IterableChangeRecord,
  IterableChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

/**
 * The context for an embedded view in the repeater's view container.
 *
 * @template T The type for the embedded view's $implicit property.
 */
export interface _ViewRepeaterItemContext<T> {
  $implicit?: T;
}

/**
 * The arguments needed to construct an embedded view for an item in a view
 * container.
 *
 * @template C The type for the context passed to each embedded view.
 */
export interface _ViewRepeaterItemInsertArgs<C> {
  templateRef: TemplateRef<C>;
  context?: C;
  index?: number;
}

/**
 * A factory that derives the embedded view context for an item in a view
 * container.
 *
 * @template T The type for the embedded view's $implicit property.
 * @template R The type for the item in each IterableDiffer change record.
 * @template C The type for the context passed to each embedded view.
 */
export type _ViewRepeaterItemContextFactory<T, R, C extends _ViewRepeaterItemContext<T>> = (
  record: IterableChangeRecord<R>,
  adjustedPreviousIndex: number | null,
  currentIndex: number | null,
) => _ViewRepeaterItemInsertArgs<C>;

/**
 * Extracts the value of an item from an {@link IterableChangeRecord}.
 *
 * @template T The type for the embedded view's $implicit property.
 * @template R The type for the item in each IterableDiffer change record.
 */
export type _ViewRepeaterItemValueResolver<T, R> = (record: IterableChangeRecord<R>) => T;

/** Indicates how a view was changed by a {@link _ViewRepeater}. */
export const enum _ViewRepeaterOperation {
  /** The content of an existing view was replaced with another item. */
  REPLACED,
  /** A new view was created with `createEmbeddedView`. */
  INSERTED,
  /** The position of a view changed, but the content remains the same. */
  MOVED,
  /** A view was detached from the view container. */
  REMOVED,
}

/**
 * Meta data describing the state of a view after it was updated by a
 * {@link _ViewRepeater}.
 *
 * @template R The type for the item in each IterableDiffer change record.
 * @template C The type for the context passed to each embedded view.
 */
export interface _ViewRepeaterItemChange<R, C> {
  /** The view's context after it was changed. */
  context?: C;
  /** Indicates how the view was changed. */
  operation: _ViewRepeaterOperation;
  /** The view's corresponding change record. */
  record: IterableChangeRecord<R>;
}

/**
 * Type for a callback to be executed after a view has changed.
 *
 * @template R The type for the item in each IterableDiffer change record.
 * @template C The type for the context passed to each embedded view.
 */
export type _ViewRepeaterItemChanged<R, C> = (change: _ViewRepeaterItemChange<R, C>) => void;

/**
 * Describes a strategy for rendering items in a {@link ViewContainerRef}.
 *
 * @template T The type for the embedded view's $implicit property.
 * @template R The type for the item in each IterableDiffer change record.
 * @template C The type for the context passed to each embedded view.
 */
export interface _ViewRepeater<T, R, C extends _ViewRepeaterItemContext<T>> {
  applyChanges(
    changes: IterableChanges<R>,
    viewContainerRef: ViewContainerRef,
    itemContextFactory: _ViewRepeaterItemContextFactory<T, R, C>,
    itemValueResolver: _ViewRepeaterItemValueResolver<T, R>,
    itemViewChanged?: _ViewRepeaterItemChanged<R, C>,
  ): void;

  detach(): void;
}

/**
 * Injection token for {@link _ViewRepeater}. This token is for use by Angular Material only.
 * @docs-private
 */
export const _VIEW_REPEATER_STRATEGY = new InjectionToken<
  _ViewRepeater<unknown, unknown, _ViewRepeaterItemContext<unknown>>
>('_ViewRepeater');
