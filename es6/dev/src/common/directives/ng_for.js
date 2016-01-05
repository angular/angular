var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ChangeDetectorRef, IterableDiffers, ViewContainerRef, TemplateRef } from 'angular2/core';
import { isPresent, isBlank } from 'angular2/src/facade/lang';
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
export let NgFor = class {
    constructor(_viewContainer, _templateRef, _iterableDiffers, _cdr) {
        this._viewContainer = _viewContainer;
        this._templateRef = _templateRef;
        this._iterableDiffers = _iterableDiffers;
        this._cdr = _cdr;
    }
    set ngForOf(value) {
        this._ngForOf = value;
        if (isBlank(this._differ) && isPresent(value)) {
            this._differ = this._iterableDiffers.find(value).create(this._cdr);
        }
    }
    set ngForTemplate(value) {
        if (isPresent(value)) {
            this._templateRef = value;
        }
    }
    ngDoCheck() {
        if (isPresent(this._differ)) {
            var changes = this._differ.diff(this._ngForOf);
            if (isPresent(changes))
                this._applyChanges(changes);
        }
    }
    _applyChanges(changes) {
        // TODO(rado): check if change detection can produce a change record that is
        // easier to consume than current.
        var recordViewTuples = [];
        changes.forEachRemovedItem((removedRecord) => recordViewTuples.push(new RecordViewTuple(removedRecord, null)));
        changes.forEachMovedItem((movedRecord) => recordViewTuples.push(new RecordViewTuple(movedRecord, null)));
        var insertTuples = this._bulkRemove(recordViewTuples);
        changes.forEachAddedItem((addedRecord) => insertTuples.push(new RecordViewTuple(addedRecord, null)));
        this._bulkInsert(insertTuples);
        for (var i = 0; i < insertTuples.length; i++) {
            this._perViewChange(insertTuples[i].view, insertTuples[i].record);
        }
        for (var i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
            this._viewContainer.get(i).setLocal('last', i === ilen - 1);
        }
    }
    _perViewChange(view, record) {
        view.setLocal('\$implicit', record.item);
        view.setLocal('index', record.currentIndex);
        view.setLocal('even', (record.currentIndex % 2 == 0));
        view.setLocal('odd', (record.currentIndex % 2 == 1));
    }
    _bulkRemove(tuples) {
        tuples.sort((a, b) => a.record.previousIndex - b.record.previousIndex);
        var movedTuples = [];
        for (var i = tuples.length - 1; i >= 0; i--) {
            var tuple = tuples[i];
            // separate moved views from removed views.
            if (isPresent(tuple.record.currentIndex)) {
                tuple.view = this._viewContainer.detach(tuple.record.previousIndex);
                movedTuples.push(tuple);
            }
            else {
                this._viewContainer.remove(tuple.record.previousIndex);
            }
        }
        return movedTuples;
    }
    _bulkInsert(tuples) {
        tuples.sort((a, b) => a.record.currentIndex - b.record.currentIndex);
        for (var i = 0; i < tuples.length; i++) {
            var tuple = tuples[i];
            if (isPresent(tuple.view)) {
                this._viewContainer.insert(tuple.view, tuple.record.currentIndex);
            }
            else {
                tuple.view =
                    this._viewContainer.createEmbeddedView(this._templateRef, tuple.record.currentIndex);
            }
        }
        return tuples;
    }
};
NgFor = __decorate([
    Directive({ selector: '[ngFor][ngForOf]', inputs: ['ngForOf', 'ngForTemplate'] }), 
    __metadata('design:paramtypes', [ViewContainerRef, TemplateRef, IterableDiffers, ChangeDetectorRef])
], NgFor);
class RecordViewTuple {
    constructor(record, view) {
        this.record = record;
        this.view = view;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX2Zvci50cyJdLCJuYW1lcyI6WyJOZ0ZvciIsIk5nRm9yLmNvbnN0cnVjdG9yIiwiTmdGb3IubmdGb3JPZiIsIk5nRm9yLm5nRm9yVGVtcGxhdGUiLCJOZ0Zvci5uZ0RvQ2hlY2siLCJOZ0Zvci5fYXBwbHlDaGFuZ2VzIiwiTmdGb3IuX3BlclZpZXdDaGFuZ2UiLCJOZ0Zvci5fYnVsa1JlbW92ZSIsIk5nRm9yLl9idWxrSW5zZXJ0IiwiUmVjb3JkVmlld1R1cGxlIiwiUmVjb3JkVmlld1R1cGxlLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUVMLFNBQVMsRUFDVCxpQkFBaUIsRUFFakIsZUFBZSxFQUNmLGdCQUFnQixFQUNoQixXQUFXLEVBRVosTUFBTSxlQUFlO09BQ2YsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO0FBRTNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnREc7QUFDSDtJQU1FQSxZQUFvQkEsY0FBZ0NBLEVBQVVBLFlBQXlCQSxFQUNuRUEsZ0JBQWlDQSxFQUFVQSxJQUF1QkE7UUFEbEVDLG1CQUFjQSxHQUFkQSxjQUFjQSxDQUFrQkE7UUFBVUEsaUJBQVlBLEdBQVpBLFlBQVlBLENBQWFBO1FBQ25FQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQWlCQTtRQUFVQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFtQkE7SUFBR0EsQ0FBQ0E7SUFFMUZELElBQUlBLE9BQU9BLENBQUNBLEtBQVVBO1FBQ3BCRSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN0QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDckVBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURGLElBQUlBLGFBQWFBLENBQUNBLEtBQWtCQTtRQUNsQ0csRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLEtBQUtBLENBQUNBO1FBQzVCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVESCxTQUFTQTtRQUNQSSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUN0REEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT0osYUFBYUEsQ0FBQ0EsT0FBT0E7UUFDM0JLLDRFQUE0RUE7UUFDNUVBLGtDQUFrQ0E7UUFDbENBLElBQUlBLGdCQUFnQkEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDMUJBLE9BQU9BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsYUFBYUEsS0FDVkEsZ0JBQWdCQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxhQUFhQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVoR0EsT0FBT0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxXQUFXQSxLQUNSQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLGVBQWVBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBRTVGQSxJQUFJQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO1FBRXREQSxPQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLFdBQVdBLEtBQ1JBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLGVBQWVBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBRXhGQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUUvQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3BFQSxDQUFDQTtRQUVEQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUNqRUEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsS0FBS0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDOURBLENBQUNBO0lBQ0hBLENBQUNBO0lBRU9MLGNBQWNBLENBQUNBLElBQUlBLEVBQUVBLE1BQU1BO1FBQ2pDTSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN6Q0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsRUFBRUEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBLFlBQVlBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3REQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFDQSxZQUFZQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN2REEsQ0FBQ0E7SUFFT04sV0FBV0EsQ0FBQ0EsTUFBeUJBO1FBQzNDTyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxHQUFHQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUN2RUEsSUFBSUEsV0FBV0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDckJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1lBQzVDQSxJQUFJQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0QkEsMkNBQTJDQTtZQUMzQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3pDQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtnQkFDcEVBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQzFCQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7WUFDekRBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUVPUCxXQUFXQSxDQUFDQSxNQUF5QkE7UUFDM0NRLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFlBQVlBLEdBQUdBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBQ3JFQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUN2Q0EsSUFBSUEsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxQkEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7WUFDcEVBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxLQUFLQSxDQUFDQSxJQUFJQTtvQkFDTkEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxFQUFFQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtZQUMzRkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0FBQ0hSLENBQUNBO0FBM0ZEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsRUFBQyxDQUFDOztVQTJGL0U7QUFFRDtJQUdFUyxZQUFZQSxNQUFNQSxFQUFFQSxJQUFJQTtRQUN0QkMsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO0lBQ25CQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRG9DaGVjayxcbiAgRGlyZWN0aXZlLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgSXRlcmFibGVEaWZmZXIsXG4gIEl0ZXJhYmxlRGlmZmVycyxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdSZWZcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBUaGUgYE5nRm9yYCBkaXJlY3RpdmUgaW5zdGFudGlhdGVzIGEgdGVtcGxhdGUgb25jZSBwZXIgaXRlbSBmcm9tIGFuIGl0ZXJhYmxlLiBUaGUgY29udGV4dCBmb3JcbiAqIGVhY2ggaW5zdGFudGlhdGVkIHRlbXBsYXRlIGluaGVyaXRzIGZyb20gdGhlIG91dGVyIGNvbnRleHQgd2l0aCB0aGUgZ2l2ZW4gbG9vcCB2YXJpYWJsZSBzZXRcbiAqIHRvIHRoZSBjdXJyZW50IGl0ZW0gZnJvbSB0aGUgaXRlcmFibGUuXG4gKlxuICogIyBMb2NhbCBWYXJpYWJsZXNcbiAqXG4gKiBgTmdGb3JgIHByb3ZpZGVzIHNldmVyYWwgZXhwb3J0ZWQgdmFsdWVzIHRoYXQgY2FuIGJlIGFsaWFzZWQgdG8gbG9jYWwgdmFyaWFibGVzOlxuICpcbiAqICogYGluZGV4YCB3aWxsIGJlIHNldCB0byB0aGUgY3VycmVudCBsb29wIGl0ZXJhdGlvbiBmb3IgZWFjaCB0ZW1wbGF0ZSBjb250ZXh0LlxuICogKiBgbGFzdGAgd2lsbCBiZSBzZXQgdG8gYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgaXRlbSBpcyB0aGUgbGFzdCBvbmUgaW4gdGhlXG4gKiAgIGl0ZXJhdGlvbi5cbiAqICogYGV2ZW5gIHdpbGwgYmUgc2V0IHRvIGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhpcyBpdGVtIGhhcyBhbiBldmVuIGluZGV4LlxuICogKiBgb2RkYCB3aWxsIGJlIHNldCB0byBhIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoaXMgaXRlbSBoYXMgYW4gb2RkIGluZGV4LlxuICpcbiAqICMgQ2hhbmdlIFByb3BhZ2F0aW9uXG4gKlxuICogV2hlbiB0aGUgY29udGVudHMgb2YgdGhlIGl0ZXJhdG9yIGNoYW5nZXMsIGBOZ0ZvcmAgbWFrZXMgdGhlIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byB0aGUgRE9NOlxuICpcbiAqICogV2hlbiBhbiBpdGVtIGlzIGFkZGVkLCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdGVtcGxhdGUgaXMgYWRkZWQgdG8gdGhlIERPTS5cbiAqICogV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQsIGl0cyB0ZW1wbGF0ZSBpbnN0YW5jZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAqICogV2hlbiBpdGVtcyBhcmUgcmVvcmRlcmVkLCB0aGVpciByZXNwZWN0aXZlIHRlbXBsYXRlcyBhcmUgcmVvcmRlcmVkIGluIHRoZSBET00uXG4gKiAqIE90aGVyd2lzZSwgdGhlIERPTSBlbGVtZW50IGZvciB0aGF0IGl0ZW0gd2lsbCByZW1haW4gdGhlIHNhbWUuXG4gKlxuICogQW5ndWxhciB1c2VzIG9iamVjdCBpZGVudGl0eSB0byB0cmFjayBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgd2l0aGluIHRoZSBpdGVyYXRvciBhbmQgcmVwcm9kdWNlXG4gKiB0aG9zZSBjaGFuZ2VzIGluIHRoZSBET00uIFRoaXMgaGFzIGltcG9ydGFudCBpbXBsaWNhdGlvbnMgZm9yIGFuaW1hdGlvbnMgYW5kIGFueSBzdGF0ZWZ1bFxuICogY29udHJvbHNcbiAqIChzdWNoIGFzIGA8aW5wdXQ+YCBlbGVtZW50cyB3aGljaCBhY2NlcHQgdXNlciBpbnB1dCkgdGhhdCBhcmUgcHJlc2VudC4gSW5zZXJ0ZWQgcm93cyBjYW4gYmVcbiAqIGFuaW1hdGVkIGluLCBkZWxldGVkIHJvd3MgY2FuIGJlIGFuaW1hdGVkIG91dCwgYW5kIHVuY2hhbmdlZCByb3dzIHJldGFpbiBhbnkgdW5zYXZlZCBzdGF0ZSBzdWNoXG4gKiBhcyB1c2VyIGlucHV0LlxuICpcbiAqIEl0IGlzIHBvc3NpYmxlIGZvciB0aGUgaWRlbnRpdGllcyBvZiBlbGVtZW50cyBpbiB0aGUgaXRlcmF0b3IgdG8gY2hhbmdlIHdoaWxlIHRoZSBkYXRhIGRvZXMgbm90LlxuICogVGhpcyBjYW4gaGFwcGVuLCBmb3IgZXhhbXBsZSwgaWYgdGhlIGl0ZXJhdG9yIHByb2R1Y2VkIGZyb20gYW4gUlBDIHRvIHRoZSBzZXJ2ZXIsIGFuZCB0aGF0XG4gKiBSUEMgaXMgcmUtcnVuLiBFdmVuIGlmIHRoZSBkYXRhIGhhc24ndCBjaGFuZ2VkLCB0aGUgc2Vjb25kIHJlc3BvbnNlIHdpbGwgcHJvZHVjZSBvYmplY3RzIHdpdGhcbiAqIGRpZmZlcmVudCBpZGVudGl0aWVzLCBhbmQgQW5ndWxhciB3aWxsIHRlYXIgZG93biB0aGUgZW50aXJlIERPTSBhbmQgcmVidWlsZCBpdCAoYXMgaWYgYWxsIG9sZFxuICogZWxlbWVudHMgd2VyZSBkZWxldGVkIGFuZCBhbGwgbmV3IGVsZW1lbnRzIGluc2VydGVkKS4gVGhpcyBpcyBhbiBleHBlbnNpdmUgb3BlcmF0aW9uIGFuZCBzaG91bGRcbiAqIGJlIGF2b2lkZWQgaWYgcG9zc2libGUuXG4gKlxuICogIyBTeW50YXhcbiAqXG4gKiAtIGA8bGkgKm5nRm9yPVwiI2l0ZW0gb2YgaXRlbXM7ICNpID0gaW5kZXhcIj4uLi48L2xpPmBcbiAqIC0gYDxsaSB0ZW1wbGF0ZT1cIm5nRm9yICNpdGVtIG9mIGl0ZW1zOyAjaSA9IGluZGV4XCI+Li4uPC9saT5gXG4gKiAtIGA8dGVtcGxhdGUgbmdGb3IgI2l0ZW0gW25nRm9yT2ZdPVwiaXRlbXNcIiAjaT1cImluZGV4XCI+PGxpPi4uLjwvbGk+PC90ZW1wbGF0ZT5gXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBTZWUgYSBbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9LVnVYeERwMHFpbkdEeW8zMDdRVz9wPXByZXZpZXcpIGZvciBhIG1vcmUgZGV0YWlsZWRcbiAqIGV4YW1wbGUuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nRm9yXVtuZ0Zvck9mXScsIGlucHV0czogWyduZ0Zvck9mJywgJ25nRm9yVGVtcGxhdGUnXX0pXG5leHBvcnQgY2xhc3MgTmdGb3IgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmdGb3JPZjogYW55O1xuICBwcml2YXRlIF9kaWZmZXI6IEl0ZXJhYmxlRGlmZmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHByaXZhdGUgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfaXRlcmFibGVEaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsIHByaXZhdGUgX2NkcjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHt9XG5cbiAgc2V0IG5nRm9yT2YodmFsdWU6IGFueSkge1xuICAgIHRoaXMuX25nRm9yT2YgPSB2YWx1ZTtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9kaWZmZXIpICYmIGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2l0ZXJhYmxlRGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5fY2RyKTtcbiAgICB9XG4gIH1cblxuICBzZXQgbmdGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWYpIHtcbiAgICBpZiAoaXNQcmVzZW50KHZhbHVlKSkge1xuICAgICAgdGhpcy5fdGVtcGxhdGVSZWYgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9kaWZmZXIpKSB7XG4gICAgICB2YXIgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX25nRm9yT2YpO1xuICAgICAgaWYgKGlzUHJlc2VudChjaGFuZ2VzKSkgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKSB7XG4gICAgLy8gVE9ETyhyYWRvKTogY2hlY2sgaWYgY2hhbmdlIGRldGVjdGlvbiBjYW4gcHJvZHVjZSBhIGNoYW5nZSByZWNvcmQgdGhhdCBpc1xuICAgIC8vIGVhc2llciB0byBjb25zdW1lIHRoYW4gY3VycmVudC5cbiAgICB2YXIgcmVjb3JkVmlld1R1cGxlcyA9IFtdO1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZW1vdmVkUmVjb3JkKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvcmRWaWV3VHVwbGVzLnB1c2gobmV3IFJlY29yZFZpZXdUdXBsZShyZW1vdmVkUmVjb3JkLCBudWxsKSkpO1xuXG4gICAgY2hhbmdlcy5mb3JFYWNoTW92ZWRJdGVtKChtb3ZlZFJlY29yZCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29yZFZpZXdUdXBsZXMucHVzaChuZXcgUmVjb3JkVmlld1R1cGxlKG1vdmVkUmVjb3JkLCBudWxsKSkpO1xuXG4gICAgdmFyIGluc2VydFR1cGxlcyA9IHRoaXMuX2J1bGtSZW1vdmUocmVjb3JkVmlld1R1cGxlcyk7XG5cbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKGFkZGVkUmVjb3JkKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0VHVwbGVzLnB1c2gobmV3IFJlY29yZFZpZXdUdXBsZShhZGRlZFJlY29yZCwgbnVsbCkpKTtcblxuICAgIHRoaXMuX2J1bGtJbnNlcnQoaW5zZXJ0VHVwbGVzKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5zZXJ0VHVwbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9wZXJWaWV3Q2hhbmdlKGluc2VydFR1cGxlc1tpXS52aWV3LCBpbnNlcnRUdXBsZXNbaV0ucmVjb3JkKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMCwgaWxlbiA9IHRoaXMuX3ZpZXdDb250YWluZXIubGVuZ3RoOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmdldChpKS5zZXRMb2NhbCgnbGFzdCcsIGkgPT09IGlsZW4gLSAxKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wZXJWaWV3Q2hhbmdlKHZpZXcsIHJlY29yZCkge1xuICAgIHZpZXcuc2V0TG9jYWwoJ1xcJGltcGxpY2l0JywgcmVjb3JkLml0ZW0pO1xuICAgIHZpZXcuc2V0TG9jYWwoJ2luZGV4JywgcmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgdmlldy5zZXRMb2NhbCgnZXZlbicsIChyZWNvcmQuY3VycmVudEluZGV4ICUgMiA9PSAwKSk7XG4gICAgdmlldy5zZXRMb2NhbCgnb2RkJywgKHJlY29yZC5jdXJyZW50SW5kZXggJSAyID09IDEpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1bGtSZW1vdmUodHVwbGVzOiBSZWNvcmRWaWV3VHVwbGVbXSk6IFJlY29yZFZpZXdUdXBsZVtdIHtcbiAgICB0dXBsZXMuc29ydCgoYSwgYikgPT4gYS5yZWNvcmQucHJldmlvdXNJbmRleCAtIGIucmVjb3JkLnByZXZpb3VzSW5kZXgpO1xuICAgIHZhciBtb3ZlZFR1cGxlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSB0dXBsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciB0dXBsZSA9IHR1cGxlc1tpXTtcbiAgICAgIC8vIHNlcGFyYXRlIG1vdmVkIHZpZXdzIGZyb20gcmVtb3ZlZCB2aWV3cy5cbiAgICAgIGlmIChpc1ByZXNlbnQodHVwbGUucmVjb3JkLmN1cnJlbnRJbmRleCkpIHtcbiAgICAgICAgdHVwbGUudmlldyA9IHRoaXMuX3ZpZXdDb250YWluZXIuZGV0YWNoKHR1cGxlLnJlY29yZC5wcmV2aW91c0luZGV4KTtcbiAgICAgICAgbW92ZWRUdXBsZXMucHVzaCh0dXBsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLnJlbW92ZSh0dXBsZS5yZWNvcmQucHJldmlvdXNJbmRleCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtb3ZlZFR1cGxlcztcbiAgfVxuXG4gIHByaXZhdGUgX2J1bGtJbnNlcnQodHVwbGVzOiBSZWNvcmRWaWV3VHVwbGVbXSk6IFJlY29yZFZpZXdUdXBsZVtdIHtcbiAgICB0dXBsZXMuc29ydCgoYSwgYikgPT4gYS5yZWNvcmQuY3VycmVudEluZGV4IC0gYi5yZWNvcmQuY3VycmVudEluZGV4KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHR1cGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHR1cGxlID0gdHVwbGVzW2ldO1xuICAgICAgaWYgKGlzUHJlc2VudCh0dXBsZS52aWV3KSkge1xuICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmluc2VydCh0dXBsZS52aWV3LCB0dXBsZS5yZWNvcmQuY3VycmVudEluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR1cGxlLnZpZXcgPVxuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYsIHR1cGxlLnJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHVwbGVzO1xuICB9XG59XG5cbmNsYXNzIFJlY29yZFZpZXdUdXBsZSB7XG4gIHZpZXc6IFZpZXdSZWY7XG4gIHJlY29yZDogYW55O1xuICBjb25zdHJ1Y3RvcihyZWNvcmQsIHZpZXcpIHtcbiAgICB0aGlzLnJlY29yZCA9IHJlY29yZDtcbiAgICB0aGlzLnZpZXcgPSB2aWV3O1xuICB9XG59XG4iXX0=