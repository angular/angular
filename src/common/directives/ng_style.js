'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
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
var NgStyle = (function () {
    function NgStyle(_differs, _ngEl, _renderer) {
        this._differs = _differs;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
    }
    Object.defineProperty(NgStyle.prototype, "rawStyle", {
        set: function (v) {
            this._rawStyle = v;
            if (lang_1.isBlank(this._differ) && lang_1.isPresent(v)) {
                this._differ = this._differs.find(this._rawStyle).create(null);
            }
        },
        enumerable: true,
        configurable: true
    });
    NgStyle.prototype.ngDoCheck = function () {
        if (lang_1.isPresent(this._differ)) {
            var changes = this._differ.diff(this._rawStyle);
            if (lang_1.isPresent(changes)) {
                this._applyChanges(changes);
            }
        }
    };
    NgStyle.prototype._applyChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { _this._setStyle(record.key, record.currentValue); });
        changes.forEachChangedItem(function (record) { _this._setStyle(record.key, record.currentValue); });
        changes.forEachRemovedItem(function (record) { _this._setStyle(record.key, null); });
    };
    NgStyle.prototype._setStyle = function (name, val) {
        this._renderer.setElementStyle(this._ngEl.nativeElement, name, val);
    };
    NgStyle = __decorate([
        core_1.Directive({ selector: '[ngStyle]', inputs: ['rawStyle: ngStyle'] }), 
        __metadata('design:paramtypes', [core_1.KeyValueDiffers, core_1.ElementRef, core_1.Renderer])
    ], NgStyle);
    return NgStyle;
})();
exports.NgStyle = NgStyle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOlsiTmdTdHlsZSIsIk5nU3R5bGUuY29uc3RydWN0b3IiLCJOZ1N0eWxlLnJhd1N0eWxlIiwiTmdTdHlsZS5uZ0RvQ2hlY2siLCJOZ1N0eWxlLl9hcHBseUNoYW5nZXMiLCJOZ1N0eWxlLl9zZXRTdHlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBT08sZUFBZSxDQUFDLENBQUE7QUFDdkIscUJBQXdDLDBCQUEwQixDQUFDLENBQUE7QUFFbkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBQ0g7SUFPRUEsaUJBQW9CQSxRQUF5QkEsRUFBVUEsS0FBaUJBLEVBQ3BEQSxTQUFtQkE7UUFEbkJDLGFBQVFBLEdBQVJBLFFBQVFBLENBQWlCQTtRQUFVQSxVQUFLQSxHQUFMQSxLQUFLQSxDQUFZQTtRQUNwREEsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7SUFBR0EsQ0FBQ0E7SUFFM0NELHNCQUFJQSw2QkFBUUE7YUFBWkEsVUFBYUEsQ0FBQ0E7WUFDWkUsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ2pFQSxDQUFDQTtRQUNIQSxDQUFDQTs7O09BQUFGO0lBRURBLDJCQUFTQSxHQUFUQTtRQUNFRyxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQ2hEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZCQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUM5QkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT0gsK0JBQWFBLEdBQXJCQSxVQUFzQkEsT0FBWUE7UUFBbENJLGlCQUlDQTtRQUhDQSxPQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFVBQUNBLE1BQU1BLElBQU9BLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzNGQSxPQUFPQSxDQUFDQSxrQkFBa0JBLENBQUNBLFVBQUNBLE1BQU1BLElBQU9BLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzdGQSxPQUFPQSxDQUFDQSxrQkFBa0JBLENBQUNBLFVBQUNBLE1BQU1BLElBQU9BLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUVPSiwyQkFBU0EsR0FBakJBLFVBQWtCQSxJQUFZQSxFQUFFQSxHQUFXQTtRQUN6Q0ssSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsYUFBYUEsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDdEVBLENBQUNBO0lBbENITDtRQUFDQSxnQkFBU0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBRUEsV0FBV0EsRUFBRUEsTUFBTUEsRUFBRUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxFQUFDQSxDQUFDQTs7Z0JBbUNqRUE7SUFBREEsY0FBQ0E7QUFBREEsQ0FBQ0EsQUFuQ0QsSUFtQ0M7QUFsQ1ksZUFBTyxVQWtDbkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIERvQ2hlY2ssXG4gIEtleVZhbHVlRGlmZmVyLFxuICBLZXlWYWx1ZURpZmZlcnMsXG4gIEVsZW1lbnRSZWYsXG4gIERpcmVjdGl2ZSxcbiAgUmVuZGVyZXJcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgcHJpbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogVGhlIGBOZ1N0eWxlYCBkaXJlY3RpdmUgY2hhbmdlcyBzdHlsZXMgYmFzZWQgb24gYSByZXN1bHQgb2YgZXhwcmVzc2lvbiBldmFsdWF0aW9uLlxuICpcbiAqIEFuIGV4cHJlc3Npb24gYXNzaWduZWQgdG8gdGhlIGBuZ1N0eWxlYCBwcm9wZXJ0eSBtdXN0IGV2YWx1YXRlIHRvIGFuIG9iamVjdCBhbmQgdGhlXG4gKiBjb3JyZXNwb25kaW5nIGVsZW1lbnQgc3R5bGVzIGFyZSB1cGRhdGVkIGJhc2VkIG9uIGNoYW5nZXMgdG8gdGhpcyBvYmplY3QuIFN0eWxlIG5hbWVzIHRvIHVwZGF0ZVxuICogYXJlIHRha2VuIGZyb20gdGhlIG9iamVjdCdzIGtleXMsIGFuZCB2YWx1ZXMgLSBmcm9tIHRoZSBjb3JyZXNwb25kaW5nIG9iamVjdCdzIHZhbHVlcy5cbiAqXG4gKiAjIyMgU3ludGF4XG4gKlxuICogLSBgPGRpdiBbbmdTdHlsZV09XCJ7J2ZvbnQtc3R5bGUnOiBzdHlsZX1cIj48L2Rpdj5gXG4gKiAtIGA8ZGl2IFtuZ1N0eWxlXT1cInN0eWxlRXhwXCI+PC9kaXY+YCAtIGhlcmUgdGhlIGBzdHlsZUV4cGAgbXVzdCBldmFsdWF0ZSB0byBhbiBvYmplY3RcbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvWWFtR1M2R2tVaDlHcVdOUWhDeU0/cD1wcmV2aWV3KSk6XG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge05nU3R5bGV9IGZyb20gJ2FuZ3VsYXIyL2NvbW1vbic7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgc2VsZWN0b3I6ICduZ1N0eWxlLWV4YW1wbGUnLFxuICogIHRlbXBsYXRlOiBgXG4gKiAgICA8aDEgW25nU3R5bGVdPVwieydmb250LXN0eWxlJzogc3R5bGUsICdmb250LXNpemUnOiBzaXplLCAnZm9udC13ZWlnaHQnOiB3ZWlnaHR9XCI+XG4gKiAgICAgIENoYW5nZSBzdHlsZSBvZiB0aGlzIHRleHQhXG4gKiAgICA8L2gxPlxuICpcbiAqICAgIDxocj5cbiAqXG4gKiAgICA8bGFiZWw+SXRhbGljOiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgKGNoYW5nZSk9XCJjaGFuZ2VTdHlsZSgkZXZlbnQpXCI+PC9sYWJlbD5cbiAqICAgIDxsYWJlbD5Cb2xkOiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgKGNoYW5nZSk9XCJjaGFuZ2VXZWlnaHQoJGV2ZW50KVwiPjwvbGFiZWw+XG4gKiAgICA8bGFiZWw+U2l6ZTogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgW3ZhbHVlXT1cInNpemVcIiAoY2hhbmdlKT1cInNpemUgPSAkZXZlbnQudGFyZ2V0LnZhbHVlXCI+PC9sYWJlbD5cbiAqICBgLFxuICogIGRpcmVjdGl2ZXM6IFtOZ1N0eWxlXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBOZ1N0eWxlRXhhbXBsZSB7XG4gKiAgICBzdHlsZSA9ICdub3JtYWwnO1xuICogICAgd2VpZ2h0ID0gJ25vcm1hbCc7XG4gKiAgICBzaXplID0gJzIwcHgnO1xuICpcbiAqICAgIGNoYW5nZVN0eWxlKCRldmVudDogYW55KSB7XG4gKiAgICAgIHRoaXMuc3R5bGUgPSAkZXZlbnQudGFyZ2V0LmNoZWNrZWQgPyAnaXRhbGljJyA6ICdub3JtYWwnO1xuICogICAgfVxuICpcbiAqICAgIGNoYW5nZVdlaWdodCgkZXZlbnQ6IGFueSkge1xuICogICAgICB0aGlzLndlaWdodCA9ICRldmVudC50YXJnZXQuY2hlY2tlZCA/ICdib2xkJyA6ICdub3JtYWwnO1xuICogICAgfVxuICogfVxuICogYGBgXG4gKlxuICogSW4gdGhpcyBleGFtcGxlIHRoZSBgZm9udC1zdHlsZWAsIGBmb250LXNpemVgIGFuZCBgZm9udC13ZWlnaHRgIHN0eWxlcyB3aWxsIGJlIHVwZGF0ZWRcbiAqIGJhc2VkIG9uIHRoZSBgc3R5bGVgIHByb3BlcnR5J3MgdmFsdWUgY2hhbmdlcy5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTdHlsZV0nLCBpbnB1dHM6IFsncmF3U3R5bGU6IG5nU3R5bGUnXX0pXG5leHBvcnQgY2xhc3MgTmdTdHlsZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICAvKiogQGludGVybmFsICovXG4gIF9yYXdTdHlsZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlmZmVyOiBLZXlWYWx1ZURpZmZlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcikge31cblxuICBzZXQgcmF3U3R5bGUodikge1xuICAgIHRoaXMuX3Jhd1N0eWxlID0gdjtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9kaWZmZXIpICYmIGlzUHJlc2VudCh2KSkge1xuICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHRoaXMuX3Jhd1N0eWxlKS5jcmVhdGUobnVsbCk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fZGlmZmVyKSkge1xuICAgICAgdmFyIGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9yYXdTdHlsZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZXMpKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgbnVsbCk7IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0U3R5bGUobmFtZTogc3RyaW5nLCB2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRTdHlsZSh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIG5hbWUsIHZhbCk7XG4gIH1cbn1cbiJdfQ==