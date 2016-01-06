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
export let NgStyle = class {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOlsiTmdTdHlsZSIsIk5nU3R5bGUuY29uc3RydWN0b3IiLCJOZ1N0eWxlLnJhd1N0eWxlIiwiTmdTdHlsZS5uZ0RvQ2hlY2siLCJOZ1N0eWxlLl9hcHBseUNoYW5nZXMiLCJOZ1N0eWxlLl9zZXRTdHlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFHTCxlQUFlLEVBQ2YsVUFBVSxFQUNWLFNBQVMsRUFDVCxRQUFRLEVBQ1QsTUFBTSxlQUFlO09BQ2YsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFRLE1BQU0sMEJBQTBCO0FBRWxFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtERztBQUNIO0lBT0VBLFlBQW9CQSxRQUF5QkEsRUFBVUEsS0FBaUJBLEVBQ3BEQSxTQUFtQkE7UUFEbkJDLGFBQVFBLEdBQVJBLFFBQVFBLENBQWlCQTtRQUFVQSxVQUFLQSxHQUFMQSxLQUFLQSxDQUFZQTtRQUNwREEsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7SUFBR0EsQ0FBQ0E7SUFFM0NELElBQUlBLFFBQVFBLENBQUNBLENBQUNBO1FBQ1pFLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ25CQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDakVBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURGLFNBQVNBO1FBQ1BHLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUNoREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZCQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUM5QkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT0gsYUFBYUEsQ0FBQ0EsT0FBWUE7UUFDaENJLE9BQU9BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsT0FBT0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0ZBLE9BQU9BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsT0FBT0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0ZBLE9BQU9BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsT0FBT0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0lBRU9KLFNBQVNBLENBQUNBLElBQVlBLEVBQUVBLEdBQVdBO1FBQ3pDSyxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN0RUEsQ0FBQ0E7QUFDSEwsQ0FBQ0E7QUFuQ0Q7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUMsQ0FBQzs7WUFtQ2pFO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBEb0NoZWNrLFxuICBLZXlWYWx1ZURpZmZlcixcbiAgS2V5VmFsdWVEaWZmZXJzLFxuICBFbGVtZW50UmVmLFxuICBEaXJlY3RpdmUsXG4gIFJlbmRlcmVyXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIHByaW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIFRoZSBgTmdTdHlsZWAgZGlyZWN0aXZlIGNoYW5nZXMgc3R5bGVzIGJhc2VkIG9uIGEgcmVzdWx0IG9mIGV4cHJlc3Npb24gZXZhbHVhdGlvbi5cbiAqXG4gKiBBbiBleHByZXNzaW9uIGFzc2lnbmVkIHRvIHRoZSBgbmdTdHlsZWAgcHJvcGVydHkgbXVzdCBldmFsdWF0ZSB0byBhbiBvYmplY3QgYW5kIHRoZVxuICogY29ycmVzcG9uZGluZyBlbGVtZW50IHN0eWxlcyBhcmUgdXBkYXRlZCBiYXNlZCBvbiBjaGFuZ2VzIHRvIHRoaXMgb2JqZWN0LiBTdHlsZSBuYW1lcyB0byB1cGRhdGVcbiAqIGFyZSB0YWtlbiBmcm9tIHRoZSBvYmplY3QncyBrZXlzLCBhbmQgdmFsdWVzIC0gZnJvbSB0aGUgY29ycmVzcG9uZGluZyBvYmplY3QncyB2YWx1ZXMuXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIC0gYDxkaXYgW25nU3R5bGVdPVwieydmb250LXN0eWxlJzogc3R5bGV9XCI+PC9kaXY+YFxuICogLSBgPGRpdiBbbmdTdHlsZV09XCJzdHlsZUV4cFwiPjwvZGl2PmAgLSBoZXJlIHRoZSBgc3R5bGVFeHBgIG11c3QgZXZhbHVhdGUgdG8gYW4gb2JqZWN0XG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1lhbUdTNkdrVWg5R3FXTlFoQ3lNP3A9cHJldmlldykpOlxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtOZ1N0eWxlfSBmcm9tICdhbmd1bGFyMi9jb21tb24nO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogIHNlbGVjdG9yOiAnbmdTdHlsZS1leGFtcGxlJyxcbiAqICB0ZW1wbGF0ZTogYFxuICogICAgPGgxIFtuZ1N0eWxlXT1cInsnZm9udC1zdHlsZSc6IHN0eWxlLCAnZm9udC1zaXplJzogc2l6ZSwgJ2ZvbnQtd2VpZ2h0Jzogd2VpZ2h0fVwiPlxuICogICAgICBDaGFuZ2Ugc3R5bGUgb2YgdGhpcyB0ZXh0IVxuICogICAgPC9oMT5cbiAqXG4gKiAgICA8aHI+XG4gKlxuICogICAgPGxhYmVsPkl0YWxpYzogPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIChjaGFuZ2UpPVwiY2hhbmdlU3R5bGUoJGV2ZW50KVwiPjwvbGFiZWw+XG4gKiAgICA8bGFiZWw+Qm9sZDogPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIChjaGFuZ2UpPVwiY2hhbmdlV2VpZ2h0KCRldmVudClcIj48L2xhYmVsPlxuICogICAgPGxhYmVsPlNpemU6IDxpbnB1dCB0eXBlPVwidGV4dFwiIFt2YWx1ZV09XCJzaXplXCIgKGNoYW5nZSk9XCJzaXplID0gJGV2ZW50LnRhcmdldC52YWx1ZVwiPjwvbGFiZWw+XG4gKiAgYCxcbiAqICBkaXJlY3RpdmVzOiBbTmdTdHlsZV1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTmdTdHlsZUV4YW1wbGUge1xuICogICAgc3R5bGUgPSAnbm9ybWFsJztcbiAqICAgIHdlaWdodCA9ICdub3JtYWwnO1xuICogICAgc2l6ZSA9ICcyMHB4JztcbiAqXG4gKiAgICBjaGFuZ2VTdHlsZSgkZXZlbnQ6IGFueSkge1xuICogICAgICB0aGlzLnN0eWxlID0gJGV2ZW50LnRhcmdldC5jaGVja2VkID8gJ2l0YWxpYycgOiAnbm9ybWFsJztcbiAqICAgIH1cbiAqXG4gKiAgICBjaGFuZ2VXZWlnaHQoJGV2ZW50OiBhbnkpIHtcbiAqICAgICAgdGhpcy53ZWlnaHQgPSAkZXZlbnQudGFyZ2V0LmNoZWNrZWQgPyAnYm9sZCcgOiAnbm9ybWFsJztcbiAqICAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEluIHRoaXMgZXhhbXBsZSB0aGUgYGZvbnQtc3R5bGVgLCBgZm9udC1zaXplYCBhbmQgYGZvbnQtd2VpZ2h0YCBzdHlsZXMgd2lsbCBiZSB1cGRhdGVkXG4gKiBiYXNlZCBvbiB0aGUgYHN0eWxlYCBwcm9wZXJ0eSdzIHZhbHVlIGNoYW5nZXMuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3R5bGVdJywgaW5wdXRzOiBbJ3Jhd1N0eWxlOiBuZ1N0eWxlJ119KVxuZXhwb3J0IGNsYXNzIE5nU3R5bGUgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmF3U3R5bGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RpZmZlcjogS2V5VmFsdWVEaWZmZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLCBwcml2YXRlIF9uZ0VsOiBFbGVtZW50UmVmLFxuICAgICAgICAgICAgICBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIpIHt9XG5cbiAgc2V0IHJhd1N0eWxlKHYpIHtcbiAgICB0aGlzLl9yYXdTdHlsZSA9IHY7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fZGlmZmVyKSAmJiBpc1ByZXNlbnQodikpIHtcbiAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh0aGlzLl9yYXdTdHlsZSkuY3JlYXRlKG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2RpZmZlcikpIHtcbiAgICAgIHZhciBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fcmF3U3R5bGUpO1xuICAgICAgaWYgKGlzUHJlc2VudChjaGFuZ2VzKSkge1xuICAgICAgICB0aGlzLl9hcHBseUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hDaGFuZ2VkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIG51bGwpOyB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3NldFN0eWxlKG5hbWU6IHN0cmluZywgdmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50U3R5bGUodGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBuYW1lLCB2YWwpO1xuICB9XG59XG4iXX0=