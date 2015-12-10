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
 * An expression assigned to the `ng-style` property must evaluate to an object and the
 * corresponding element styles are updated based on changes to this object. Style names to update
 * are taken from the object's keys, and values - from the corresponding object's values.
 *
 * ### Syntax
 *
 * - `<div [ng-style]="{'font-style': style}"></div>`
 * - `<div [ng-style]="styleExp"></div>` - here the `styleExp` must evaluate to an object
 *
 * ### Example ([live demo](http://plnkr.co/edit/YamGS6GkUh9GqWNQhCyM?p=preview)):
 *
 * ```
 * import {Component, NgStyle} from 'angular2/angular2';
 *
 * @Component({
 *  selector: 'ng-style-example',
 *  template: `
 *    <h1 [ng-style]="{'font-style': style, 'font-size': size, 'font-weight': weight}">
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
        this._renderer.setElementStyle(this._ngEl, name, val);
    }
};
NgStyle = __decorate([
    Directive({ selector: '[ng-style]', inputs: ['rawStyle: ng-style'] }), 
    __metadata('design:paramtypes', [KeyValueDiffers, ElementRef, Renderer])
], NgStyle);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOlsiTmdTdHlsZSIsIk5nU3R5bGUuY29uc3RydWN0b3IiLCJOZ1N0eWxlLnJhd1N0eWxlIiwiTmdTdHlsZS5uZ0RvQ2hlY2siLCJOZ1N0eWxlLl9hcHBseUNoYW5nZXMiLCJOZ1N0eWxlLl9zZXRTdHlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFHTCxlQUFlLEVBQ2YsVUFBVSxFQUNWLFNBQVMsRUFDVCxRQUFRLEVBQ1QsTUFBTSxlQUFlO09BQ2YsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFRLE1BQU0sMEJBQTBCO0FBRWxFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaURHO0FBQ0g7SUFPRUEsWUFBb0JBLFFBQXlCQSxFQUFVQSxLQUFpQkEsRUFDcERBLFNBQW1CQTtRQURuQkMsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBaUJBO1FBQVVBLFVBQUtBLEdBQUxBLEtBQUtBLENBQVlBO1FBQ3BEQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtJQUFHQSxDQUFDQTtJQUUzQ0QsSUFBSUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDWkUsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDbkJBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFDQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNqRUEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREYsU0FBU0E7UUFDUEcsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQ2hEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdkJBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQzlCQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVPSCxhQUFhQSxDQUFDQSxPQUFZQTtRQUNoQ0ksT0FBT0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxNQUFNQSxPQUFPQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzRkEsT0FBT0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxNQUFNQSxPQUFPQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM3RkEsT0FBT0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxNQUFNQSxPQUFPQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFT0osU0FBU0EsQ0FBQ0EsSUFBWUEsRUFBRUEsR0FBV0E7UUFDekNLLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3hEQSxDQUFDQTtBQUNITCxDQUFDQTtBQW5DRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBQyxDQUFDOztZQW1DbkU7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIERvQ2hlY2ssXG4gIEtleVZhbHVlRGlmZmVyLFxuICBLZXlWYWx1ZURpZmZlcnMsXG4gIEVsZW1lbnRSZWYsXG4gIERpcmVjdGl2ZSxcbiAgUmVuZGVyZXJcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgcHJpbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogVGhlIGBOZ1N0eWxlYCBkaXJlY3RpdmUgY2hhbmdlcyBzdHlsZXMgYmFzZWQgb24gYSByZXN1bHQgb2YgZXhwcmVzc2lvbiBldmFsdWF0aW9uLlxuICpcbiAqIEFuIGV4cHJlc3Npb24gYXNzaWduZWQgdG8gdGhlIGBuZy1zdHlsZWAgcHJvcGVydHkgbXVzdCBldmFsdWF0ZSB0byBhbiBvYmplY3QgYW5kIHRoZVxuICogY29ycmVzcG9uZGluZyBlbGVtZW50IHN0eWxlcyBhcmUgdXBkYXRlZCBiYXNlZCBvbiBjaGFuZ2VzIHRvIHRoaXMgb2JqZWN0LiBTdHlsZSBuYW1lcyB0byB1cGRhdGVcbiAqIGFyZSB0YWtlbiBmcm9tIHRoZSBvYmplY3QncyBrZXlzLCBhbmQgdmFsdWVzIC0gZnJvbSB0aGUgY29ycmVzcG9uZGluZyBvYmplY3QncyB2YWx1ZXMuXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIC0gYDxkaXYgW25nLXN0eWxlXT1cInsnZm9udC1zdHlsZSc6IHN0eWxlfVwiPjwvZGl2PmBcbiAqIC0gYDxkaXYgW25nLXN0eWxlXT1cInN0eWxlRXhwXCI+PC9kaXY+YCAtIGhlcmUgdGhlIGBzdHlsZUV4cGAgbXVzdCBldmFsdWF0ZSB0byBhbiBvYmplY3RcbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvWWFtR1M2R2tVaDlHcVdOUWhDeU0/cD1wcmV2aWV3KSk6XG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgTmdTdHlsZX0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogIHNlbGVjdG9yOiAnbmctc3R5bGUtZXhhbXBsZScsXG4gKiAgdGVtcGxhdGU6IGBcbiAqICAgIDxoMSBbbmctc3R5bGVdPVwieydmb250LXN0eWxlJzogc3R5bGUsICdmb250LXNpemUnOiBzaXplLCAnZm9udC13ZWlnaHQnOiB3ZWlnaHR9XCI+XG4gKiAgICAgIENoYW5nZSBzdHlsZSBvZiB0aGlzIHRleHQhXG4gKiAgICA8L2gxPlxuICpcbiAqICAgIDxocj5cbiAqXG4gKiAgICA8bGFiZWw+SXRhbGljOiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgKGNoYW5nZSk9XCJjaGFuZ2VTdHlsZSgkZXZlbnQpXCI+PC9sYWJlbD5cbiAqICAgIDxsYWJlbD5Cb2xkOiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgKGNoYW5nZSk9XCJjaGFuZ2VXZWlnaHQoJGV2ZW50KVwiPjwvbGFiZWw+XG4gKiAgICA8bGFiZWw+U2l6ZTogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgW3ZhbHVlXT1cInNpemVcIiAoY2hhbmdlKT1cInNpemUgPSAkZXZlbnQudGFyZ2V0LnZhbHVlXCI+PC9sYWJlbD5cbiAqICBgLFxuICogIGRpcmVjdGl2ZXM6IFtOZ1N0eWxlXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBOZ1N0eWxlRXhhbXBsZSB7XG4gKiAgICBzdHlsZSA9ICdub3JtYWwnO1xuICogICAgd2VpZ2h0ID0gJ25vcm1hbCc7XG4gKiAgICBzaXplID0gJzIwcHgnO1xuICpcbiAqICAgIGNoYW5nZVN0eWxlKCRldmVudDogYW55KSB7XG4gKiAgICAgIHRoaXMuc3R5bGUgPSAkZXZlbnQudGFyZ2V0LmNoZWNrZWQgPyAnaXRhbGljJyA6ICdub3JtYWwnO1xuICogICAgfVxuICpcbiAqICAgIGNoYW5nZVdlaWdodCgkZXZlbnQ6IGFueSkge1xuICogICAgICB0aGlzLndlaWdodCA9ICRldmVudC50YXJnZXQuY2hlY2tlZCA/ICdib2xkJyA6ICdub3JtYWwnO1xuICogICAgfVxuICogfVxuICogYGBgXG4gKlxuICogSW4gdGhpcyBleGFtcGxlIHRoZSBgZm9udC1zdHlsZWAsIGBmb250LXNpemVgIGFuZCBgZm9udC13ZWlnaHRgIHN0eWxlcyB3aWxsIGJlIHVwZGF0ZWRcbiAqIGJhc2VkIG9uIHRoZSBgc3R5bGVgIHByb3BlcnR5J3MgdmFsdWUgY2hhbmdlcy5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmctc3R5bGVdJywgaW5wdXRzOiBbJ3Jhd1N0eWxlOiBuZy1zdHlsZSddfSlcbmV4cG9ydCBjbGFzcyBOZ1N0eWxlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jhd1N0eWxlO1xuICAvKiogQGludGVybmFsICovXG4gIF9kaWZmZXI6IEtleVZhbHVlRGlmZmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RpZmZlcnM6IEtleVZhbHVlRGlmZmVycywgcHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyKSB7fVxuXG4gIHNldCByYXdTdHlsZSh2KSB7XG4gICAgdGhpcy5fcmF3U3R5bGUgPSB2O1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX2RpZmZlcikgJiYgaXNQcmVzZW50KHYpKSB7XG4gICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodGhpcy5fcmF3U3R5bGUpLmNyZWF0ZShudWxsKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9kaWZmZXIpKSB7XG4gICAgICB2YXIgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX3Jhd1N0eWxlKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY2hhbmdlcykpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4geyB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQ2hhbmdlZEl0ZW0oKHJlY29yZCkgPT4geyB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4geyB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCBudWxsKTsgfSk7XG4gIH1cblxuICBwcml2YXRlIF9zZXRTdHlsZShuYW1lOiBzdHJpbmcsIHZhbDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudFN0eWxlKHRoaXMuX25nRWwsIG5hbWUsIHZhbCk7XG4gIH1cbn1cbiJdfQ==