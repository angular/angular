/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CollectionChangeRecord, DefaultIterableDiffer, Directive, EmbeddedViewRef, Input, IterableDiffer, IterableDiffers, TemplateRef, ViewContainerRef} from '@angular/core';

export class NgForRangeRow {
  constructor(public index: number, public count: number) {}

  get first(): boolean { return this.index === 0; }

  get last(): boolean { return this.index === this.count - 1; }

  get even(): boolean { return this.index % 2 === 0; }

  get odd(): boolean { return !this.even; }
}

@Directive({selector: '[ngForRange]'})
export class NgForRange {
  private _differ: IterableDiffer;

  constructor(
      private _viewContainer: ViewContainerRef, private _template: TemplateRef<any>,
      differs: IterableDiffers) {
    this._differ = differs.find([]).create(null);
  }

  @Input()
  set ngForRange(length: number) {
    if (length != null && length >= 0) {
      const newRange: number[] = range(length);
      const changes: DefaultIterableDiffer = this._differ.diff(newRange);
      if (changes) {
        this._applyChanges(changes);
      }
    }
  }

  private _applyChanges(changes: DefaultIterableDiffer) {
    changes.forEachAddedItem((item: CollectionChangeRecord) => {
      this._viewContainer.createEmbeddedView(
          this._template, new NgForRangeRow(0, 0), item.currentIndex);
    });

    changes.forEachRemovedItem(
        (item: CollectionChangeRecord) => this._viewContainer.remove(item.previousIndex));

    for (let i = 0, len = this._viewContainer.length; i < len; i++) {
      const viewRef = <EmbeddedViewRef<NgForRangeRow>>this._viewContainer.get(i);
      viewRef.context.index = i;
      viewRef.context.count = len;
    }
  }
}

function range(length: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < length; i++) {
    result.push(i);
  }
  return result;
}
