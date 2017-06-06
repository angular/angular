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
import { isPresent, isBlank, getTypeNameForDebugging } from 'angular2/src/facade/lang';
import { BaseException } from "../../facade/exceptions";
export class NgForRow {
    constructor($implicit, index, count) {
        this.$implicit = $implicit;
        this.index = index;
        this.count = count;
    }
    get first() { return this.index === 0; }
    get last() { return this.index === this.count - 1; }
    get even() { return this.index % 2 === 0; }
    get odd() { return !this.even; }
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
 * ### Syntax
 *
 * - `<li *ngFor="let item of items; #i = index">...</li>`
 * - `<li template="ngFor #item of items; #i = index">...</li>`
 * - `<template ngFor #item [ngForOf]="items" #i="index"><li>...</li></template>`
 *
 * ### Example
 *
 * See a [live demo](http://plnkr.co/edit/KVuXxDp0qinGDyo307QW?p=preview) for a more detailed
 * example.
 */
export let NgFor = class NgFor {
    constructor(_viewContainer, _templateRef, _iterableDiffers, _cdr) {
        this._viewContainer = _viewContainer;
        this._templateRef = _templateRef;
        this._iterableDiffers = _iterableDiffers;
        this._cdr = _cdr;
    }
    set ngForOf(value) {
        this._ngForOf = value;
        if (isBlank(this._differ) && isPresent(value)) {
            try {
                this._differ = this._iterableDiffers.find(value).create(this._cdr, this._ngForTrackBy);
            }
            catch (e) {
                throw new BaseException(`Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
            }
        }
    }
    set ngForTemplate(value) {
        if (isPresent(value)) {
            this._templateRef = value;
        }
    }
    set ngForTrackBy(value) { this._ngForTrackBy = value; }
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
            var viewRef = this._viewContainer.get(i);
            viewRef.context.index = i;
            viewRef.context.count = ilen;
        }
        changes.forEachIdentityChange((record) => {
            var viewRef = this._viewContainer.get(record.currentIndex);
            viewRef.context.$implicit = record.item;
        });
    }
    _perViewChange(view, record) {
        view.context.$implicit = record.item;
    }
    _bulkRemove(tuples) {
        tuples.sort((a, b) => a.record.previousIndex - b.record.previousIndex);
        var movedTuples = [];
        for (var i = tuples.length - 1; i >= 0; i--) {
            var tuple = tuples[i];
            // separate moved views from removed views.
            if (isPresent(tuple.record.currentIndex)) {
                tuple.view =
                    this._viewContainer.detach(tuple.record.previousIndex);
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
                tuple.view = this._viewContainer.createEmbeddedView(this._templateRef, new NgForRow(null, null, null), tuple.record.currentIndex);
            }
        }
        return tuples;
    }
};
NgFor = __decorate([
    Directive({ selector: '[ngFor][ngForOf]', inputs: ['ngForTrackBy', 'ngForOf', 'ngForTemplate'] }), 
    __metadata('design:paramtypes', [ViewContainerRef, TemplateRef, IterableDiffers, ChangeDetectorRef])
], NgFor);
class RecordViewTuple {
    constructor(record, view) {
        this.record = record;
        this.view = view;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX2Zvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUVMLFNBQVMsRUFDVCxpQkFBaUIsRUFFakIsZUFBZSxFQUNmLGdCQUFnQixFQUNoQixXQUFXLEVBR1osTUFBTSxlQUFlO09BQ2YsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFhLHVCQUF1QixFQUFDLE1BQU0sMEJBQTBCO09BS3hGLEVBQUMsYUFBYSxFQUFDLE1BQU0seUJBQXlCO0FBRXJEO0lBQ0UsWUFBbUIsU0FBYyxFQUFTLEtBQWEsRUFBUyxLQUFhO1FBQTFELGNBQVMsR0FBVCxTQUFTLENBQUs7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBUTtJQUFHLENBQUM7SUFFakYsSUFBSSxLQUFLLEtBQWMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVqRCxJQUFJLElBQUksS0FBYyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0QsSUFBSSxJQUFJLEtBQWMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFcEQsSUFBSSxHQUFHLEtBQWMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtERztBQUVIO0lBT0UsWUFBb0IsY0FBZ0MsRUFBVSxZQUFtQyxFQUM3RSxnQkFBaUMs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SUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FDL0MsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDcEYsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7QUFDSCxDQUFDO0FBMUdEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUMsQ0FBQzs7U0FBQTtBQTRHaEc7SUFHRSxZQUFZLE1BQVcsRUFBRSxJQUErQjtRQUN0RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0FBQ0gsQ0FBQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRG9DaGVjayxcbiAgRGlyZWN0aXZlLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgSXRlcmFibGVEaWZmZXIsXG4gIEl0ZXJhYmxlRGlmZmVycyxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVGVtcGxhdGVSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgVHJhY2tCeUZuXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIHN0cmluZ2lmeSwgZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1xuICBEZWZhdWx0SXRlcmFibGVEaWZmZXIsXG4gIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmRcbn0gZnJvbSBcIi4uLy4uL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9kaWZmZXJzL2RlZmF1bHRfaXRlcmFibGVfZGlmZmVyXCI7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gXCIuLi8uLi9mYWNhZGUvZXhjZXB0aW9uc1wiO1xuXG5leHBvcnQgY2xhc3MgTmdGb3JSb3cge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgJGltcGxpY2l0OiBhbnksIHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgY291bnQ6IG51bWJlcikge31cblxuICBnZXQgZmlyc3QoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmluZGV4ID09PSAwOyB9XG5cbiAgZ2V0IGxhc3QoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmluZGV4ID09PSB0aGlzLmNvdW50IC0gMTsgfVxuXG4gIGdldCBldmVuKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pbmRleCAlIDIgPT09IDA7IH1cblxuICBnZXQgb2RkKCk6IGJvb2xlYW4geyByZXR1cm4gIXRoaXMuZXZlbjsgfVxufVxuXG4vKipcbiAqIFRoZSBgTmdGb3JgIGRpcmVjdGl2ZSBpbnN0YW50aWF0ZXMgYSB0ZW1wbGF0ZSBvbmNlIHBlciBpdGVtIGZyb20gYW4gaXRlcmFibGUuIFRoZSBjb250ZXh0IGZvclxuICogZWFjaCBpbnN0YW50aWF0ZWQgdGVtcGxhdGUgaW5oZXJpdHMgZnJvbSB0aGUgb3V0ZXIgY29udGV4dCB3aXRoIHRoZSBnaXZlbiBsb29wIHZhcmlhYmxlIHNldFxuICogdG8gdGhlIGN1cnJlbnQgaXRlbSBmcm9tIHRoZSBpdGVyYWJsZS5cbiAqXG4gKiAjIyMgTG9jYWwgVmFyaWFibGVzXG4gKlxuICogYE5nRm9yYCBwcm92aWRlcyBzZXZlcmFsIGV4cG9ydGVkIHZhbHVlcyB0aGF0IGNhbiBiZSBhbGlhc2VkIHRvIGxvY2FsIHZhcmlhYmxlczpcbiAqXG4gKiAqIGBpbmRleGAgd2lsbCBiZSBzZXQgdG8gdGhlIGN1cnJlbnQgbG9vcCBpdGVyYXRpb24gZm9yIGVhY2ggdGVtcGxhdGUgY29udGV4dC5cbiAqICogYGZpcnN0YCB3aWxsIGJlIHNldCB0byBhIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBpdGVtIGlzIHRoZSBmaXJzdCBvbmUgaW4gdGhlXG4gKiAgIGl0ZXJhdGlvbi5cbiAqICogYGxhc3RgIHdpbGwgYmUgc2V0IHRvIGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGl0ZW0gaXMgdGhlIGxhc3Qgb25lIGluIHRoZVxuICogICBpdGVyYXRpb24uXG4gKiAqIGBldmVuYCB3aWxsIGJlIHNldCB0byBhIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoaXMgaXRlbSBoYXMgYW4gZXZlbiBpbmRleC5cbiAqICogYG9kZGAgd2lsbCBiZSBzZXQgdG8gYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGlzIGl0ZW0gaGFzIGFuIG9kZCBpbmRleC5cbiAqXG4gKiAjIyMgQ2hhbmdlIFByb3BhZ2F0aW9uXG4gKlxuICogV2hlbiB0aGUgY29udGVudHMgb2YgdGhlIGl0ZXJhdG9yIGNoYW5nZXMsIGBOZ0ZvcmAgbWFrZXMgdGhlIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byB0aGUgRE9NOlxuICpcbiAqICogV2hlbiBhbiBpdGVtIGlzIGFkZGVkLCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdGVtcGxhdGUgaXMgYWRkZWQgdG8gdGhlIERPTS5cbiAqICogV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQsIGl0cyB0ZW1wbGF0ZSBpbnN0YW5jZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAqICogV2hlbiBpdGVtcyBhcmUgcmVvcmRlcmVkLCB0aGVpciByZXNwZWN0aXZlIHRlbXBsYXRlcyBhcmUgcmVvcmRlcmVkIGluIHRoZSBET00uXG4gKiAqIE90aGVyd2lzZSwgdGhlIERPTSBlbGVtZW50IGZvciB0aGF0IGl0ZW0gd2lsbCByZW1haW4gdGhlIHNhbWUuXG4gKlxuICogQW5ndWxhciB1c2VzIG9iamVjdCBpZGVudGl0eSB0byB0cmFjayBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgd2l0aGluIHRoZSBpdGVyYXRvciBhbmQgcmVwcm9kdWNlXG4gKiB0aG9zZSBjaGFuZ2VzIGluIHRoZSBET00uIFRoaXMgaGFzIGltcG9ydGFudCBpbXBsaWNhdGlvbnMgZm9yIGFuaW1hdGlvbnMgYW5kIGFueSBzdGF0ZWZ1bFxuICogY29udHJvbHNcbiAqIChzdWNoIGFzIGA8aW5wdXQ+YCBlbGVtZW50cyB3aGljaCBhY2NlcHQgdXNlciBpbnB1dCkgdGhhdCBhcmUgcHJlc2VudC4gSW5zZXJ0ZWQgcm93cyBjYW4gYmVcbiAqIGFuaW1hdGVkIGluLCBkZWxldGVkIHJvd3MgY2FuIGJlIGFuaW1hdGVkIG91dCwgYW5kIHVuY2hhbmdlZCByb3dzIHJldGFpbiBhbnkgdW5zYXZlZCBzdGF0ZSBzdWNoXG4gKiBhcyB1c2VyIGlucHV0LlxuICpcbiAqIEl0IGlzIHBvc3NpYmxlIGZvciB0aGUgaWRlbnRpdGllcyBvZiBlbGVtZW50cyBpbiB0aGUgaXRlcmF0b3IgdG8gY2hhbmdlIHdoaWxlIHRoZSBkYXRhIGRvZXMgbm90LlxuICogVGhpcyBjYW4gaGFwcGVuLCBmb3IgZXhhbXBsZSwgaWYgdGhlIGl0ZXJhdG9yIHByb2R1Y2VkIGZyb20gYW4gUlBDIHRvIHRoZSBzZXJ2ZXIsIGFuZCB0aGF0XG4gKiBSUEMgaXMgcmUtcnVuLiBFdmVuIGlmIHRoZSBkYXRhIGhhc24ndCBjaGFuZ2VkLCB0aGUgc2Vjb25kIHJlc3BvbnNlIHdpbGwgcHJvZHVjZSBvYmplY3RzIHdpdGhcbiAqIGRpZmZlcmVudCBpZGVudGl0aWVzLCBhbmQgQW5ndWxhciB3aWxsIHRlYXIgZG93biB0aGUgZW50aXJlIERPTSBhbmQgcmVidWlsZCBpdCAoYXMgaWYgYWxsIG9sZFxuICogZWxlbWVudHMgd2VyZSBkZWxldGVkIGFuZCBhbGwgbmV3IGVsZW1lbnRzIGluc2VydGVkKS4gVGhpcyBpcyBhbiBleHBlbnNpdmUgb3BlcmF0aW9uIGFuZCBzaG91bGRcbiAqIGJlIGF2b2lkZWQgaWYgcG9zc2libGUuXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIC0gYDxsaSAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtczsgI2kgPSBpbmRleFwiPi4uLjwvbGk+YFxuICogLSBgPGxpIHRlbXBsYXRlPVwibmdGb3IgI2l0ZW0gb2YgaXRlbXM7ICNpID0gaW5kZXhcIj4uLi48L2xpPmBcbiAqIC0gYDx0ZW1wbGF0ZSBuZ0ZvciAjaXRlbSBbbmdGb3JPZl09XCJpdGVtc1wiICNpPVwiaW5kZXhcIj48bGk+Li4uPC9saT48L3RlbXBsYXRlPmBcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFNlZSBhIFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0tWdVh4RHAwcWluR0R5bzMwN1FXP3A9cHJldmlldykgZm9yIGEgbW9yZSBkZXRhaWxlZFxuICogZXhhbXBsZS5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdGb3JdW25nRm9yT2ZdJywgaW5wdXRzOiBbJ25nRm9yVHJhY2tCeScsICduZ0Zvck9mJywgJ25nRm9yVGVtcGxhdGUnXX0pXG5leHBvcnQgY2xhc3MgTmdGb3IgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmdGb3JPZjogYW55O1xuICAvKiogQGludGVybmFsICovXG4gIF9uZ0ZvclRyYWNrQnk6IFRyYWNrQnlGbjtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8TmdGb3JSb3c+LFxuICAgICAgICAgICAgICBwcml2YXRlIF9pdGVyYWJsZURpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycywgcHJpdmF0ZSBfY2RyOiBDaGFuZ2VEZXRlY3RvclJlZikge31cblxuICBzZXQgbmdGb3JPZih2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5fbmdGb3JPZiA9IHZhbHVlO1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX2RpZmZlcikgJiYgaXNQcmVzZW50KHZhbHVlKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5faXRlcmFibGVEaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSh0aGlzLl9jZHIsIHRoaXMuX25nRm9yVHJhY2tCeSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfScgb2YgdHlwZSAnJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh2YWx1ZSl9Jy4gTmdGb3Igb25seSBzdXBwb3J0cyBiaW5kaW5nIHRvIEl0ZXJhYmxlcyBzdWNoIGFzIEFycmF5cy5gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXQgbmdGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8TmdGb3JSb3c+KSB7XG4gICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuX3RlbXBsYXRlUmVmID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgc2V0IG5nRm9yVHJhY2tCeSh2YWx1ZTogVHJhY2tCeUZuKSB7IHRoaXMuX25nRm9yVHJhY2tCeSA9IHZhbHVlOyB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fZGlmZmVyKSkge1xuICAgICAgdmFyIGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9uZ0Zvck9mKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY2hhbmdlcykpIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogRGVmYXVsdEl0ZXJhYmxlRGlmZmVyKSB7XG4gICAgLy8gVE9ETyhyYWRvKTogY2hlY2sgaWYgY2hhbmdlIGRldGVjdGlvbiBjYW4gcHJvZHVjZSBhIGNoYW5nZSByZWNvcmQgdGhhdCBpc1xuICAgIC8vIGVhc2llciB0byBjb25zdW1lIHRoYW4gY3VycmVudC5cbiAgICB2YXIgcmVjb3JkVmlld1R1cGxlczogUmVjb3JkVmlld1R1cGxlW10gPSBbXTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVtb3ZlZFJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3JkVmlld1R1cGxlcy5wdXNoKG5ldyBSZWNvcmRWaWV3VHVwbGUocmVtb3ZlZFJlY29yZCwgbnVsbCkpKTtcblxuICAgIGNoYW5nZXMuZm9yRWFjaE1vdmVkSXRlbSgobW92ZWRSZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvcmRWaWV3VHVwbGVzLnB1c2gobmV3IFJlY29yZFZpZXdUdXBsZShtb3ZlZFJlY29yZCwgbnVsbCkpKTtcblxuICAgIHZhciBpbnNlcnRUdXBsZXMgPSB0aGlzLl9idWxrUmVtb3ZlKHJlY29yZFZpZXdUdXBsZXMpO1xuXG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChhZGRlZFJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydFR1cGxlcy5wdXNoKG5ldyBSZWNvcmRWaWV3VHVwbGUoYWRkZWRSZWNvcmQsIG51bGwpKSk7XG5cbiAgICB0aGlzLl9idWxrSW5zZXJ0KGluc2VydFR1cGxlcyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluc2VydFR1cGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fcGVyVmlld0NoYW5nZShpbnNlcnRUdXBsZXNbaV0udmlldywgaW5zZXJ0VHVwbGVzW2ldLnJlY29yZCk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGlsZW4gPSB0aGlzLl92aWV3Q29udGFpbmVyLmxlbmd0aDsgaSA8IGlsZW47IGkrKykge1xuICAgICAgdmFyIHZpZXdSZWYgPSA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yUm93Pj50aGlzLl92aWV3Q29udGFpbmVyLmdldChpKTtcbiAgICAgIHZpZXdSZWYuY29udGV4dC5pbmRleCA9IGk7XG4gICAgICB2aWV3UmVmLmNvbnRleHQuY291bnQgPSBpbGVuO1xuICAgIH1cblxuICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQpID0+IHtcbiAgICAgIHZhciB2aWV3UmVmID0gPEVtYmVkZGVkVmlld1JlZjxOZ0ZvclJvdz4+dGhpcy5fdmlld0NvbnRhaW5lci5nZXQocmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgICB2aWV3UmVmLmNvbnRleHQuJGltcGxpY2l0ID0gcmVjb3JkLml0ZW07XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9wZXJWaWV3Q2hhbmdlKHZpZXc6IEVtYmVkZGVkVmlld1JlZjxOZ0ZvclJvdz4sIHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCkge1xuICAgIHZpZXcuY29udGV4dC4kaW1wbGljaXQgPSByZWNvcmQuaXRlbTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1bGtSZW1vdmUodHVwbGVzOiBSZWNvcmRWaWV3VHVwbGVbXSk6IFJlY29yZFZpZXdUdXBsZVtdIHtcbiAgICB0dXBsZXMuc29ydCgoYTogUmVjb3JkVmlld1R1cGxlLCBiOiBSZWNvcmRWaWV3VHVwbGUpID0+XG4gICAgICAgICAgICAgICAgICAgIGEucmVjb3JkLnByZXZpb3VzSW5kZXggLSBiLnJlY29yZC5wcmV2aW91c0luZGV4KTtcbiAgICB2YXIgbW92ZWRUdXBsZXM6IFJlY29yZFZpZXdUdXBsZVtdID0gW107XG4gICAgZm9yICh2YXIgaSA9IHR1cGxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIHR1cGxlID0gdHVwbGVzW2ldO1xuICAgICAgLy8gc2VwYXJhdGUgbW92ZWQgdmlld3MgZnJvbSByZW1vdmVkIHZpZXdzLlxuICAgICAgaWYgKGlzUHJlc2VudCh0dXBsZS5yZWNvcmQuY3VycmVudEluZGV4KSkge1xuICAgICAgICB0dXBsZS52aWV3ID1cbiAgICAgICAgICAgIDxFbWJlZGRlZFZpZXdSZWY8TmdGb3JSb3c+PnRoaXMuX3ZpZXdDb250YWluZXIuZGV0YWNoKHR1cGxlLnJlY29yZC5wcmV2aW91c0luZGV4KTtcbiAgICAgICAgbW92ZWRUdXBsZXMucHVzaCh0dXBsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLnJlbW92ZSh0dXBsZS5yZWNvcmQucHJldmlvdXNJbmRleCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtb3ZlZFR1cGxlcztcbiAgfVxuXG4gIHByaXZhdGUgX2J1bGtJbnNlcnQodHVwbGVzOiBSZWNvcmRWaWV3VHVwbGVbXSk6IFJlY29yZFZpZXdUdXBsZVtdIHtcbiAgICB0dXBsZXMuc29ydCgoYSwgYikgPT4gYS5yZWNvcmQuY3VycmVudEluZGV4IC0gYi5yZWNvcmQuY3VycmVudEluZGV4KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHR1cGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHR1cGxlID0gdHVwbGVzW2ldO1xuICAgICAgaWYgKGlzUHJlc2VudCh0dXBsZS52aWV3KSkge1xuICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmluc2VydCh0dXBsZS52aWV3LCB0dXBsZS5yZWNvcmQuY3VycmVudEluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR1cGxlLnZpZXcgPSB0aGlzLl92aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlUmVmLCBuZXcgTmdGb3JSb3cobnVsbCwgbnVsbCwgbnVsbCksIHR1cGxlLnJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHVwbGVzO1xuICB9XG59XG5cbmNsYXNzIFJlY29yZFZpZXdUdXBsZSB7XG4gIHZpZXc6IEVtYmVkZGVkVmlld1JlZjxOZ0ZvclJvdz47XG4gIHJlY29yZDogYW55O1xuICBjb25zdHJ1Y3RvcihyZWNvcmQ6IGFueSwgdmlldzogRW1iZWRkZWRWaWV3UmVmPE5nRm9yUm93Pikge1xuICAgIHRoaXMucmVjb3JkID0gcmVjb3JkO1xuICAgIHRoaXMudmlldyA9IHZpZXc7XG4gIH1cbn1cbiJdfQ==