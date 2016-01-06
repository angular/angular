import {
  DoCheck,
  Directive,
  ChangeDetectorRef,
  IterableDiffer,
  IterableDiffers,
  ViewContainerRef,
  TemplateRef,
  EmbeddedViewRef,
  TrackByFn
} from 'angular2/core';
import {isPresent, isBlank, stringify, getTypeNameForDebugging} from 'angular2/src/facade/lang';
import {
  DefaultIterableDiffer,
  CollectionChangeRecord
} from "../../core/change_detection/differs/default_iterable_differ";
import {BaseException} from "../../facade/exceptions";

/**
 * The `NgFor` directive instantiates a template once per item from an iterable. The context for
 * each instantiated template inherits from the outer context with the given loop variable set
 * to the current item from the iterable.
 *
 * # Local Variables
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
 * # Change Propagation
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
 * # Syntax
 *
 * - `<li *ngFor="#item of items; #i = index">...</li>`
 * - `<li template="ngFor #item of items; #i = index">...</li>`
 * - `<template ngFor #item [ngForOf]="items" #i="index"><li>...</li></template>`
 *
 * ### Example
 *
 * See a [live demo](http://plnkr.co/edit/KVuXxDp0qinGDyo307QW?p=preview) for a more detailed
 * example.
 */
@Directive({selector: '[ngFor][ngForOf]', inputs: ['ngForTrackBy', 'ngForOf', 'ngForTemplate']})
export class NgFor implements DoCheck {
  /** @internal */
  _ngForOf: any;
  /** @internal */
  _ngForTrackBy: TrackByFn;
  private _differ: IterableDiffer;

  constructor(private _viewContainer: ViewContainerRef, private _templateRef: TemplateRef,
              private _iterableDiffers: IterableDiffers, private _cdr: ChangeDetectorRef) {}

  set ngForOf(value: any) {
    this._ngForOf = value;
    if (isBlank(this._differ) && isPresent(value)) {
      try {
        this._differ = this._iterableDiffers.find(value).create(this._cdr, this._ngForTrackBy);
      } catch (e) {
        throw new BaseException(
            `Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
      }
    }
  }

  set ngForTemplate(value: TemplateRef) {
    if (isPresent(value)) {
      this._templateRef = value;
    }
  }

  set ngForTrackBy(value: TrackByFn) { this._ngForTrackBy = value; }

  ngDoCheck() {
    if (isPresent(this._differ)) {
      var changes = this._differ.diff(this._ngForOf);
      if (isPresent(changes)) this._applyChanges(changes);
    }
  }

  private _applyChanges(changes: DefaultIterableDiffer) {
    // TODO(rado): check if change detection can produce a change record that is
    // easier to consume than current.
    var recordViewTuples: RecordViewTuple[] = [];
    changes.forEachRemovedItem((removedRecord: CollectionChangeRecord) =>
                                   recordViewTuples.push(new RecordViewTuple(removedRecord, null)));

    changes.forEachMovedItem((movedRecord: CollectionChangeRecord) =>
                                 recordViewTuples.push(new RecordViewTuple(movedRecord, null)));

    var insertTuples = this._bulkRemove(recordViewTuples);

    changes.forEachAddedItem((addedRecord: CollectionChangeRecord) =>
                                 insertTuples.push(new RecordViewTuple(addedRecord, null)));

    this._bulkInsert(insertTuples);

    for (var i = 0; i < insertTuples.length; i++) {
      this._perViewChange(insertTuples[i].view, insertTuples[i].record);
    }

    for (var i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
      var viewRef = <EmbeddedViewRef>this._viewContainer.get(i);
      viewRef.setLocal('first', i === 0);
      viewRef.setLocal('last', i === ilen - 1);
    }

    changes.forEachIdentityChange((record) => {
      var viewRef = <EmbeddedViewRef>this._viewContainer.get(record.currentIndex);
      viewRef.setLocal('\$implicit', record.item);
    });
  }

  private _perViewChange(view: EmbeddedViewRef, record: CollectionChangeRecord) {
    view.setLocal('\$implicit', record.item);
    view.setLocal('index', record.currentIndex);
    view.setLocal('even', (record.currentIndex % 2 == 0));
    view.setLocal('odd', (record.currentIndex % 2 == 1));
  }

  private _bulkRemove(tuples: RecordViewTuple[]): RecordViewTuple[] {
    tuples.sort((a: RecordViewTuple, b: RecordViewTuple) =>
                    a.record.previousIndex - b.record.previousIndex);
    var movedTuples: RecordViewTuple[] = [];
    for (var i = tuples.length - 1; i >= 0; i--) {
      var tuple = tuples[i];
      // separate moved views from removed views.
      if (isPresent(tuple.record.currentIndex)) {
        tuple.view = <EmbeddedViewRef>this._viewContainer.detach(tuple.record.previousIndex);
        movedTuples.push(tuple);
      } else {
        this._viewContainer.remove(tuple.record.previousIndex);
      }
    }
    return movedTuples;
  }

  private _bulkInsert(tuples: RecordViewTuple[]): RecordViewTuple[] {
    tuples.sort((a, b) => a.record.currentIndex - b.record.currentIndex);
    for (var i = 0; i < tuples.length; i++) {
      var tuple = tuples[i];
      if (isPresent(tuple.view)) {
        this._viewContainer.insert(tuple.view, tuple.record.currentIndex);
      } else {
        tuple.view =
            this._viewContainer.createEmbeddedView(this._templateRef, tuple.record.currentIndex);
      }
    }
    return tuples;
  }
}

class RecordViewTuple {
  view: EmbeddedViewRef;
  record: any;
  constructor(record: any, view: EmbeddedViewRef) {
    this.record = record;
    this.view = view;
  }
}
