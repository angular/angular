var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { KeyValueDiffers, ElementRef, Directive, Renderer } from 'angular2/core';
import { isPresent, isBlank } from 'angular2/src/facade/lang';
/**
 * The `NgStyle` directive changes styles based on a result of expression evaluation.
 *
 * An expression assigned to the `ngStyle` property must evaluate to an object and the
 * corresponding element styles are updated based on changes to this object. Style names to update
 * are taken from the object's keys, and values - from the corresponding object's values.
 *
 * ### Syntax
 *
 * - `<div [ngStyle]="{'font-style': style}"></div>`
 * - `<div [ngStyle]="styleExp"></div>` - here the `styleExp` must evaluate to an object
 *
 * ### Example ([live demo](http://plnkr.co/edit/YamGS6GkUh9GqWNQhCyM?p=preview)):
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {NgStyle} from 'angular2/common';
 *
 * @Component({
 *  selector: 'ngStyle-example',
 *  template: `
 *    <h1 [ngStyle]="{'font-style': style, 'font-size': size, 'font-weight': weight}">
 *      Change style of this text!
 *    </h1>
 *
 *    <hr>
 *
 *    <label>Italic: <input type="checkbox" (change)="changeStyle($event)"></label>
 *    <label>Bold: <input type="checkbox" (change)="changeWeight($event)"></label>
 *    <label>Size: <input type="text" [value]="size" (change)="size = $event.target.value"></label>
 *  `,
 *  directives: [NgStyle]
 * })
 * export class NgStyleExample {
 *    style = 'normal';
 *    weight = 'normal';
 *    size = '20px';
 *
 *    changeStyle($event: any) {
 *      this.style = $event.target.checked ? 'italic' : 'normal';
 *    }
 *
 *    changeWeight($event: any) {
 *      this.weight = $event.target.checked ? 'bold' : 'normal';
 *    }
 * }
 * ```
 *
 * In this example the `font-style`, `font-size` and `font-weight` styles will be updated
 * based on the `style` property's value changes.
 */
export let NgStyle = class NgStyle {
    constructor(_differs, _ngEl, _renderer) {
        this._differs = _differs;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
    }
    set rawStyle(v) {
        this._rawStyle = v;
        if (isBlank(this._differ) && isPresent(v)) {
            this._differ = this._differs.find(this._rawStyle).create(null);
        }
    }
    ngDoCheck() {
        if (isPresent(this._differ)) {
            var changes = this._differ.diff(this._rawStyle);
            if (isPresent(changes)) {
                this._applyChanges(changes);
            }
        }
    }
    _applyChanges(changes) {
        changes.forEachAddedItem((record) => { this._setStyle(record.key, record.currentValue); });
        changes.forEachChangedItem((record) => { this._setStyle(record.key, record.currentValue); });
        changes.forEachRemovedItem((record) => { this._setStyle(record.key, null); });
    }
    _setStyle(name, val) {
        this._renderer.setElementStyle(this._ngEl.nativeElement, name, val);
    }
};
NgStyle = __decorate([
    Directive({ selector: '[ngStyle]', inputs: ['rawStyle: ngStyle'] }), 
    __metadata('design:paramtypes', [KeyValueDiffers, ElementRef, Renderer])
], NgStyle);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFHTCxlQUFlLEVBQ2YsVUFBVSxFQUNWLFNBQVMsRUFDVCxRQUFRLEVBQ1QsTUFBTSxlQUFlO09BQ2YsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFRLE1BQU0sMEJBQTBCO0FBR2xFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtERztBQUVIO0lBTUUsWUFBb0IsUUFBeUIsRUFBVSxLQUFpQixFQUNwRCxTQUFtQjtRQURuQixhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUFVLFVBQUssR0FBTCxLQUFLLENBQVk7UUFDcEQsY0FBUyxHQUFULFNBQVMsQ0FBVTtJQUFHLENBQUM7SUFFM0MsSUFBSSxRQUFRLENBQUMsQ0FBMEI7UUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbkIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRSxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVM7UUFDUCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDaEQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFTyxhQUFhLENBQUMsT0FBWTtRQUNoQyxPQUFPLENBQUMsZ0JBQWdCLENBQ3BCLENBQUMsTUFBNEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUYsT0FBTyxDQUFDLGtCQUFrQixDQUN0QixDQUFDLE1BQTRCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVGLE9BQU8sQ0FBQyxrQkFBa0IsQ0FDdEIsQ0FBQyxNQUE0QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFTyxTQUFTLENBQUMsSUFBWSxFQUFFLEdBQVc7UUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7QUFDSCxDQUFDO0FBdENEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLENBQUM7O1dBQUE7QUFzQ2pFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRG9DaGVjayxcbiAgS2V5VmFsdWVEaWZmZXIsXG4gIEtleVZhbHVlRGlmZmVycyxcbiAgRWxlbWVudFJlZixcbiAgRGlyZWN0aXZlLFxuICBSZW5kZXJlclxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBwcmludH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7S2V5VmFsdWVDaGFuZ2VSZWNvcmR9IGZyb20gXCIuLi8uLi9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9kZWZhdWx0X2tleXZhbHVlX2RpZmZlclwiO1xuXG4vKipcbiAqIFRoZSBgTmdTdHlsZWAgZGlyZWN0aXZlIGNoYW5nZXMgc3R5bGVzIGJhc2VkIG9uIGEgcmVzdWx0IG9mIGV4cHJlc3Npb24gZXZhbHVhdGlvbi5cbiAqXG4gKiBBbiBleHByZXNzaW9uIGFzc2lnbmVkIHRvIHRoZSBgbmdTdHlsZWAgcHJvcGVydHkgbXVzdCBldmFsdWF0ZSB0byBhbiBvYmplY3QgYW5kIHRoZVxuICogY29ycmVzcG9uZGluZyBlbGVtZW50IHN0eWxlcyBhcmUgdXBkYXRlZCBiYXNlZCBvbiBjaGFuZ2VzIHRvIHRoaXMgb2JqZWN0LiBTdHlsZSBuYW1lcyB0byB1cGRhdGVcbiAqIGFyZSB0YWtlbiBmcm9tIHRoZSBvYmplY3QncyBrZXlzLCBhbmQgdmFsdWVzIC0gZnJvbSB0aGUgY29ycmVzcG9uZGluZyBvYmplY3QncyB2YWx1ZXMuXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIC0gYDxkaXYgW25nU3R5bGVdPVwieydmb250LXN0eWxlJzogc3R5bGV9XCI+PC9kaXY+YFxuICogLSBgPGRpdiBbbmdTdHlsZV09XCJzdHlsZUV4cFwiPjwvZGl2PmAgLSBoZXJlIHRoZSBgc3R5bGVFeHBgIG11c3QgZXZhbHVhdGUgdG8gYW4gb2JqZWN0XG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1lhbUdTNkdrVWg5R3FXTlFoQ3lNP3A9cHJldmlldykpOlxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtOZ1N0eWxlfSBmcm9tICdhbmd1bGFyMi9jb21tb24nO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogIHNlbGVjdG9yOiAnbmdTdHlsZS1leGFtcGxlJyxcbiAqICB0ZW1wbGF0ZTogYFxuICogICAgPGgxIFtuZ1N0eWxlXT1cInsnZm9udC1zdHlsZSc6IHN0eWxlLCAnZm9udC1zaXplJzogc2l6ZSwgJ2ZvbnQtd2VpZ2h0Jzogd2VpZ2h0fVwiPlxuICogICAgICBDaGFuZ2Ugc3R5bGUgb2YgdGhpcyB0ZXh0IVxuICogICAgPC9oMT5cbiAqXG4gKiAgICA8aHI+XG4gKlxuICogICAgPGxhYmVsPkl0YWxpYzogPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIChjaGFuZ2UpPVwiY2hhbmdlU3R5bGUoJGV2ZW50KVwiPjwvbGFiZWw+XG4gKiAgICA8bGFiZWw+Qm9sZDogPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIChjaGFuZ2UpPVwiY2hhbmdlV2VpZ2h0KCRldmVudClcIj48L2xhYmVsPlxuICogICAgPGxhYmVsPlNpemU6IDxpbnB1dCB0eXBlPVwidGV4dFwiIFt2YWx1ZV09XCJzaXplXCIgKGNoYW5nZSk9XCJzaXplID0gJGV2ZW50LnRhcmdldC52YWx1ZVwiPjwvbGFiZWw+XG4gKiAgYCxcbiAqICBkaXJlY3RpdmVzOiBbTmdTdHlsZV1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTmdTdHlsZUV4YW1wbGUge1xuICogICAgc3R5bGUgPSAnbm9ybWFsJztcbiAqICAgIHdlaWdodCA9ICdub3JtYWwnO1xuICogICAgc2l6ZSA9ICcyMHB4JztcbiAqXG4gKiAgICBjaGFuZ2VTdHlsZSgkZXZlbnQ6IGFueSkge1xuICogICAgICB0aGlzLnN0eWxlID0gJGV2ZW50LnRhcmdldC5jaGVja2VkID8gJ2l0YWxpYycgOiAnbm9ybWFsJztcbiAqICAgIH1cbiAqXG4gKiAgICBjaGFuZ2VXZWlnaHQoJGV2ZW50OiBhbnkpIHtcbiAqICAgICAgdGhpcy53ZWlnaHQgPSAkZXZlbnQudGFyZ2V0LmNoZWNrZWQgPyAnYm9sZCcgOiAnbm9ybWFsJztcbiAqICAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEluIHRoaXMgZXhhbXBsZSB0aGUgYGZvbnQtc3R5bGVgLCBgZm9udC1zaXplYCBhbmQgYGZvbnQtd2VpZ2h0YCBzdHlsZXMgd2lsbCBiZSB1cGRhdGVkXG4gKiBiYXNlZCBvbiB0aGUgYHN0eWxlYCBwcm9wZXJ0eSdzIHZhbHVlIGNoYW5nZXMuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3R5bGVdJywgaW5wdXRzOiBbJ3Jhd1N0eWxlOiBuZ1N0eWxlJ119KVxuZXhwb3J0IGNsYXNzIE5nU3R5bGUgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmF3U3R5bGU6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICAvKiogQGludGVybmFsICovXG4gIF9kaWZmZXI6IEtleVZhbHVlRGlmZmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RpZmZlcnM6IEtleVZhbHVlRGlmZmVycywgcHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyKSB7fVxuXG4gIHNldCByYXdTdHlsZSh2OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgIHRoaXMuX3Jhd1N0eWxlID0gdjtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9kaWZmZXIpICYmIGlzUHJlc2VudCh2KSkge1xuICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHRoaXMuX3Jhd1N0eWxlKS5jcmVhdGUobnVsbCk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fZGlmZmVyKSkge1xuICAgICAgdmFyIGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9yYXdTdHlsZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZXMpKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKFxuICAgICAgICAocmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZCkgPT4geyB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQ2hhbmdlZEl0ZW0oXG4gICAgICAgIChyZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkKSA9PiB7IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbShcbiAgICAgICAgKHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgbnVsbCk7IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0U3R5bGUobmFtZTogc3RyaW5nLCB2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRTdHlsZSh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIG5hbWUsIHZhbCk7XG4gIH1cbn1cbiJdfQ==