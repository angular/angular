/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { EmbeddedViewRef, ViewContainerRef, TemplateRef, IterableChangeRecord, IterableChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';

/**
 * @experimental
 */
export interface ViewSyncerContext<T> {
  $implicit: T;
  index: number;
  count: number;
}

/**
 * @experimental
 */
export type ViewSyncerContextFactory<T> = () => ViewSyncerContext<T>;

/**
 * @experimental
 */
export type ViewSyncerContextUpdate<T> = (index: number, count: number, viewRef: EmbeddedViewRef<ViewSyncerContext<T>>) => void;

export type RecordPositionChangesOperation = 'INSERT' | 'MOVE' | 'REMOVE';

/**
 * The `ViewSyncer` class is designed to keep the `changes` from an `IterableDiffer` in sync with the view.
 *
 * @experimental
 */
export class ViewSyncer<T> {

  recordPositionChanges = new Subject<{index: number, item: any, operation: RecordPositionChangesOperation}>();

  constructor(
    private _viewContainer: ViewContainerRef,
    private _template: TemplateRef<ViewSyncerContext<T>>,
    private _contextFactory: ViewSyncerContextFactory<T>,
    private _contextUpdate?: ViewSyncerContextUpdate<T>,
  ) { }

  setTemplate(value: TemplateRef<ViewSyncerContext<T>>) {
    this._template = value;
  }

  applyChanges(changes: IterableChanges<T>) {
    changes.forEachOperation(
      (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
        if (item.previousIndex == null) {
          this._applyInsert(item, currentIndex);
        } else if (currentIndex == null) {
          this._applyRemove(adjustedPreviousIndex, item);
        } else {
          this._applyMove(adjustedPreviousIndex, currentIndex, item);
        }
      });

    for (let i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
      const viewRef = <EmbeddedViewRef<ViewSyncerContext<T>>>this._viewContainer.get(i);
      if (this._contextUpdate) {
        this._contextUpdate(i, ilen, viewRef);
      }
    }

    changes.forEachIdentityChange((record: any) => {
      const viewRef =
        <EmbeddedViewRef<ViewSyncerContext<T>>>this._viewContainer.get(record.currentIndex);
      this._setImplicit(record, viewRef);
    });
  }

  private _setImplicit<T>(record: any, view: EmbeddedViewRef<ViewSyncerContext<T>>) {
    view.context.$implicit = record.item;
  }

  private _applyRemove(index: number, item: any) {
    this._viewContainer.remove(index);
    this.recordPositionChanges.next({
      item,
      index,
      operation: 'REMOVE'
    });
  }

  private _applyInsert(item: any, adjustedPreviousIndex: number) {
    const view = this._viewContainer.createEmbeddedView(
      this._template, this._contextFactory(), adjustedPreviousIndex);
    this._setImplicit(item, view);
    this.recordPositionChanges.next({
      item,
      index: adjustedPreviousIndex,
      operation: 'INSERT'
    });
  }

  private _applyMove(adjustedPreviousIndex: number, currentIndex: number, item: any) {
    const view = this._viewContainer.get(adjustedPreviousIndex)!;
    this._viewContainer.move(view, currentIndex);
    this._setImplicit(item, <EmbeddedViewRef<ViewSyncerContext<T>>>view);
    this.recordPositionChanges.next({
      item,
      index: currentIndex,
      operation: 'MOVE'
    });
  }

}
