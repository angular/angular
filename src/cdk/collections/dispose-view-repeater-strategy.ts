/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  EmbeddedViewRef,
  IterableChangeRecord,
  IterableChanges,
  ViewContainerRef,
} from '@angular/core';
import {
  _ViewRepeater,
  _ViewRepeaterItemChanged,
  _ViewRepeaterItemContext,
  _ViewRepeaterItemContextFactory,
  _ViewRepeaterItemValueResolver,
  _ViewRepeaterOperation,
} from './view-repeater';

/**
 * A repeater that destroys views when they are removed from a
 * {@link ViewContainerRef}. When new items are inserted into the container,
 * the repeater will always construct a new embedded view for each item.
 *
 * @template T The type for the embedded view's $implicit property.
 * @template R The type for the item in each IterableDiffer change record.
 * @template C The type for the context passed to each embedded view.
 */
export class _DisposeViewRepeaterStrategy<T, R, C extends _ViewRepeaterItemContext<T>>
  implements _ViewRepeater<T, R, C>
{
  applyChanges(
    changes: IterableChanges<R>,
    viewContainerRef: ViewContainerRef,
    itemContextFactory: _ViewRepeaterItemContextFactory<T, R, C>,
    itemValueResolver: _ViewRepeaterItemValueResolver<T, R>,
    itemViewChanged?: _ViewRepeaterItemChanged<R, C>,
  ) {
    changes.forEachOperation(
      (
        record: IterableChangeRecord<R>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null,
      ) => {
        let view: EmbeddedViewRef<C> | undefined;
        let operation: _ViewRepeaterOperation;
        if (record.previousIndex == null) {
          const insertContext = itemContextFactory(record, adjustedPreviousIndex, currentIndex);
          view = viewContainerRef.createEmbeddedView(
            insertContext.templateRef,
            insertContext.context,
            insertContext.index,
          );
          operation = _ViewRepeaterOperation.INSERTED;
        } else if (currentIndex == null) {
          viewContainerRef.remove(adjustedPreviousIndex!);
          operation = _ViewRepeaterOperation.REMOVED;
        } else {
          view = viewContainerRef.get(adjustedPreviousIndex!) as EmbeddedViewRef<C>;
          viewContainerRef.move(view!, currentIndex);
          operation = _ViewRepeaterOperation.MOVED;
        }

        if (itemViewChanged) {
          itemViewChanged({
            context: view?.context,
            operation,
            record,
          });
        }
      },
    );
  }

  detach() {}
}
