/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, CollectionChangeRecord, DefaultIterableDiffer, Directive, DoCheck, EmbeddedViewRef, Input, IterableDiffer, IterableDiffers, OnChanges, SimpleChanges, TemplateRef, TrackByFn, ViewContainerRef} from '@angular/core';

import {getTypeNameForDebugging} from '../facade/lang';

export class NgForRow {
  constructor(public $implicit: any, public index: number, public count: number) {}

  get first(): boolean { return this.index === 0; }

  get last(): boolean { return this.index === this.count - 1; }

  get even(): boolean { return this.index % 2 === 0; }

  get odd(): boolean { return !this.even; }
}

/**
 * The `NgFor` directive instantiates a template once per item from an iterable. The context for
 * each instantiated template inherits from the outer context with the given loop variable set
 * to the current item from the iterable.
 *
 * ### Local Variables
 *
 * `NgFor` provides several exported values that can be aliased to local variables:
 *
 * * `index` will be set to the current loop iteration for each template context.
 * * `first` will be set to a boolean value indicating whether the item is the first one in the
 *   iteration.
 * * `last` will be set to a boolean value indicating whether the item is the last one in the
 *   iteration.
 * * `even` will be set to a boolean value indicating whether this item has an even index.
 * * `odd` will be set to a boolean value indicating whether this item has an odd index.
 *
 * ### Change Propagation
 *
 * When the contents of the iterator changes, `NgFor` makes the corresponding changes to the DOM:
 *
 * * When an item is added, a new instance of the template is added to the DOM.
 * * When an item is removed, its template instance is removed from the DOM.
 * * When items are reordered, their respective templates are reordered in the DOM.
 * * Otherwise, the DOM element for that item will remain the same.
 *
 * Angular uses object identity to track insertions and deletions within the iterator and reproduce
 * those changes in the DOM. This has important implications for animations and any stateful
 * controls
 * (such as `<input>` elements which accept user input) that are present. Inserted rows can be
 * animated in, deleted rows can be animated out, and unchanged rows retain any unsaved state such
 * as user input.
 *
 * It is possible for the identities of elements in the iterator to change while the data does not.
 * This can happen, for example, if the iterator produced from an RPC to the server, and that
 * RPC is re-run. Even if the data hasn't changed, the second response will produce objects with
 * different identities, and Angular will tear down the entire DOM and rebuild it (as if all old
 * elements were deleted and all new elements inserted). This is an expensive operation and should
 * be avoided if possible.
 *
 * To customize the default tracking algorithm, `NgFor` supports `trackBy` option.
 * `trackBy` takes a function which has two arguments: `index` and `item`.
 * If `trackBy` is given, Angular tracks changes by the return value of the function.
 *
 * ### Syntax
 *
 * - `<li *ngFor="let item of items; let i = index; trackBy: trackByFn">...</li>`
 * - `<li template="ngFor let item of items; let i = index; trackBy: trackByFn">...</li>`
 *
 * With `<template>` element:
 *
 * ```
 * <template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
 *   <li>...</li>
 * </template>
 * ```
 *
 * ### Example
 *
 * See a [live demo](http://plnkr.co/edit/KVuXxDp0qinGDyo307QW?p=preview) for a more detailed
 * example.
 *
 * @stable
 */
@Directive({selector: '[ngFor][ngForOf]'})
export class NgFor implements DoCheck, OnChanges {
  @Input() ngForOf: any;
  @Input() ngForTrackBy: TrackByFn;

  private _differ: IterableDiffer = null;

  constructor(
      private _viewContainer: ViewContainerRef, private _template: TemplateRef<NgForRow>,
      private _differs: IterableDiffers, private _cdr: ChangeDetectorRef) {}

  @Input()
  set ngForTemplate(value: TemplateRef<NgForRow>) {
    if (value) {
      this._template = value;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('ngForOf' in changes) {
      // React on ngForOf changes only once all inputs have been initialized
      const value = changes['ngForOf'].currentValue;
      if (!this._differ && value) {
        try {
          this._differ = this._differs.find(value).create(this._cdr, this.ngForTrackBy);
        } catch (e) {
          throw new Error(
              `Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
        }
      }
    }
  }

  ngDoCheck() {
    if (this._differ) {
      const changes = this._differ.diff(this.ngForOf);
      if (changes) this._applyChanges(changes);
    }
  }

  private _applyChanges(changes: DefaultIterableDiffer) {
    const insertTuples: RecordViewTuple[] = [];
    changes.forEachOperation(
        (item: CollectionChangeRecord, adjustedPreviousIndex: number, currentIndex: number) => {
          if (item.previousIndex == null) {
            const view = this._viewContainer.createEmbeddedView(
                this._template, new NgForRow(null, null, null), currentIndex);
            const tuple = new RecordViewTuple(item, view);
            insertTuples.push(tuple);
          } else if (currentIndex == null) {
            this._viewContainer.remove(adjustedPreviousIndex);
          } else {
            const view = this._viewContainer.get(adjustedPreviousIndex);
            this._viewContainer.move(view, currentIndex);
            const tuple = new RecordViewTuple(item, <EmbeddedViewRef<NgForRow>>view);
            insertTuples.push(tuple);
          }
        });

    for (let i = 0; i < insertTuples.length; i++) {
      this._perViewChange(insertTuples[i].view, insertTuples[i].record);
    }

    for (let i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
      let viewRef = <EmbeddedViewRef<NgForRow>>this._viewContainer.get(i);
      viewRef.context.index = i;
      viewRef.context.count = ilen;
    }

    changes.forEachIdentityChange((record: any) => {
      let viewRef = <EmbeddedViewRef<NgForRow>>this._viewContainer.get(record.currentIndex);
      viewRef.context.$implicit = record.item;
    });
  }

  private _perViewChange(view: EmbeddedViewRef<NgForRow>, record: CollectionChangeRecord) {
    view.context.$implicit = record.item;
  }
}

class RecordViewTuple {
  constructor(public record: any, public view: EmbeddedViewRef<NgForRow>) {}
}
