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
 * import {Component, NgStyle} from 'angular2/angular2';
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
        this._renderer.setElementStyle(this._ngEl, name, val);
    };
    NgStyle = __decorate([
        core_1.Directive({ selector: '[ngStyle]', inputs: ['rawStyle: ngStyle'] }), 
        __metadata('design:paramtypes', [core_1.KeyValueDiffers, core_1.ElementRef, core_1.Renderer])
    ], NgStyle);
    return NgStyle;
})();
exports.NgStyle = NgStyle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOlsiTmdTdHlsZSIsIk5nU3R5bGUuY29uc3RydWN0b3IiLCJOZ1N0eWxlLnJhd1N0eWxlIiwiTmdTdHlsZS5uZ0RvQ2hlY2siLCJOZ1N0eWxlLl9hcHBseUNoYW5nZXMiLCJOZ1N0eWxlLl9zZXRTdHlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBT08sZUFBZSxDQUFDLENBQUE7QUFDdkIscUJBQXdDLDBCQUEwQixDQUFDLENBQUE7QUFFbkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpREc7QUFDSDtJQU9FQSxpQkFBb0JBLFFBQXlCQSxFQUFVQSxLQUFpQkEsRUFDcERBLFNBQW1CQTtRQURuQkMsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBaUJBO1FBQVVBLFVBQUtBLEdBQUxBLEtBQUtBLENBQVlBO1FBQ3BEQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtJQUFHQSxDQUFDQTtJQUUzQ0Qsc0JBQUlBLDZCQUFRQTthQUFaQSxVQUFhQSxDQUFDQTtZQUNaRSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNuQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDakVBLENBQUNBO1FBQ0hBLENBQUNBOzs7T0FBQUY7SUFFREEsMkJBQVNBLEdBQVRBO1FBQ0VHLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFDaERBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdkJBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQzlCQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVPSCwrQkFBYUEsR0FBckJBLFVBQXNCQSxPQUFZQTtRQUFsQ0ksaUJBSUNBO1FBSENBLE9BQU9BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsVUFBQ0EsTUFBTUEsSUFBT0EsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0ZBLE9BQU9BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsVUFBQ0EsTUFBTUEsSUFBT0EsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0ZBLE9BQU9BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsVUFBQ0EsTUFBTUEsSUFBT0EsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0lBRU9KLDJCQUFTQSxHQUFqQkEsVUFBa0JBLElBQVlBLEVBQUVBLEdBQVdBO1FBQ3pDSyxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN4REEsQ0FBQ0E7SUFsQ0hMO1FBQUNBLGdCQUFTQSxDQUFDQSxFQUFDQSxRQUFRQSxFQUFFQSxXQUFXQSxFQUFFQSxNQUFNQSxFQUFFQSxDQUFDQSxtQkFBbUJBLENBQUNBLEVBQUNBLENBQUNBOztnQkFtQ2pFQTtJQUFEQSxjQUFDQTtBQUFEQSxDQUFDQSxBQW5DRCxJQW1DQztBQWxDWSxlQUFPLFVBa0NuQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRG9DaGVjayxcbiAgS2V5VmFsdWVEaWZmZXIsXG4gIEtleVZhbHVlRGlmZmVycyxcbiAgRWxlbWVudFJlZixcbiAgRGlyZWN0aXZlLFxuICBSZW5kZXJlclxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBwcmludH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBUaGUgYE5nU3R5bGVgIGRpcmVjdGl2ZSBjaGFuZ2VzIHN0eWxlcyBiYXNlZCBvbiBhIHJlc3VsdCBvZiBleHByZXNzaW9uIGV2YWx1YXRpb24uXG4gKlxuICogQW4gZXhwcmVzc2lvbiBhc3NpZ25lZCB0byB0aGUgYG5nU3R5bGVgIHByb3BlcnR5IG11c3QgZXZhbHVhdGUgdG8gYW4gb2JqZWN0IGFuZCB0aGVcbiAqIGNvcnJlc3BvbmRpbmcgZWxlbWVudCBzdHlsZXMgYXJlIHVwZGF0ZWQgYmFzZWQgb24gY2hhbmdlcyB0byB0aGlzIG9iamVjdC4gU3R5bGUgbmFtZXMgdG8gdXBkYXRlXG4gKiBhcmUgdGFrZW4gZnJvbSB0aGUgb2JqZWN0J3Mga2V5cywgYW5kIHZhbHVlcyAtIGZyb20gdGhlIGNvcnJlc3BvbmRpbmcgb2JqZWN0J3MgdmFsdWVzLlxuICpcbiAqICMjIyBTeW50YXhcbiAqXG4gKiAtIGA8ZGl2IFtuZ1N0eWxlXT1cInsnZm9udC1zdHlsZSc6IHN0eWxlfVwiPjwvZGl2PmBcbiAqIC0gYDxkaXYgW25nU3R5bGVdPVwic3R5bGVFeHBcIj48L2Rpdj5gIC0gaGVyZSB0aGUgYHN0eWxlRXhwYCBtdXN0IGV2YWx1YXRlIHRvIGFuIG9iamVjdFxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9ZYW1HUzZHa1VoOUdxV05RaEN5TT9wPXByZXZpZXcpKTpcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBOZ1N0eWxlfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgc2VsZWN0b3I6ICduZ1N0eWxlLWV4YW1wbGUnLFxuICogIHRlbXBsYXRlOiBgXG4gKiAgICA8aDEgW25nU3R5bGVdPVwieydmb250LXN0eWxlJzogc3R5bGUsICdmb250LXNpemUnOiBzaXplLCAnZm9udC13ZWlnaHQnOiB3ZWlnaHR9XCI+XG4gKiAgICAgIENoYW5nZSBzdHlsZSBvZiB0aGlzIHRleHQhXG4gKiAgICA8L2gxPlxuICpcbiAqICAgIDxocj5cbiAqXG4gKiAgICA8bGFiZWw+SXRhbGljOiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgKGNoYW5nZSk9XCJjaGFuZ2VTdHlsZSgkZXZlbnQpXCI+PC9sYWJlbD5cbiAqICAgIDxsYWJlbD5Cb2xkOiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgKGNoYW5nZSk9XCJjaGFuZ2VXZWlnaHQoJGV2ZW50KVwiPjwvbGFiZWw+XG4gKiAgICA8bGFiZWw+U2l6ZTogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgW3ZhbHVlXT1cInNpemVcIiAoY2hhbmdlKT1cInNpemUgPSAkZXZlbnQudGFyZ2V0LnZhbHVlXCI+PC9sYWJlbD5cbiAqICBgLFxuICogIGRpcmVjdGl2ZXM6IFtOZ1N0eWxlXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBOZ1N0eWxlRXhhbXBsZSB7XG4gKiAgICBzdHlsZSA9ICdub3JtYWwnO1xuICogICAgd2VpZ2h0ID0gJ25vcm1hbCc7XG4gKiAgICBzaXplID0gJzIwcHgnO1xuICpcbiAqICAgIGNoYW5nZVN0eWxlKCRldmVudDogYW55KSB7XG4gKiAgICAgIHRoaXMuc3R5bGUgPSAkZXZlbnQudGFyZ2V0LmNoZWNrZWQgPyAnaXRhbGljJyA6ICdub3JtYWwnO1xuICogICAgfVxuICpcbiAqICAgIGNoYW5nZVdlaWdodCgkZXZlbnQ6IGFueSkge1xuICogICAgICB0aGlzLndlaWdodCA9ICRldmVudC50YXJnZXQuY2hlY2tlZCA/ICdib2xkJyA6ICdub3JtYWwnO1xuICogICAgfVxuICogfVxuICogYGBgXG4gKlxuICogSW4gdGhpcyBleGFtcGxlIHRoZSBgZm9udC1zdHlsZWAsIGBmb250LXNpemVgIGFuZCBgZm9udC13ZWlnaHRgIHN0eWxlcyB3aWxsIGJlIHVwZGF0ZWRcbiAqIGJhc2VkIG9uIHRoZSBgc3R5bGVgIHByb3BlcnR5J3MgdmFsdWUgY2hhbmdlcy5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTdHlsZV0nLCBpbnB1dHM6IFsncmF3U3R5bGU6IG5nU3R5bGUnXX0pXG5leHBvcnQgY2xhc3MgTmdTdHlsZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICAvKiogQGludGVybmFsICovXG4gIF9yYXdTdHlsZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlmZmVyOiBLZXlWYWx1ZURpZmZlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcikge31cblxuICBzZXQgcmF3U3R5bGUodikge1xuICAgIHRoaXMuX3Jhd1N0eWxlID0gdjtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9kaWZmZXIpICYmIGlzUHJlc2VudCh2KSkge1xuICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHRoaXMuX3Jhd1N0eWxlKS5jcmVhdGUobnVsbCk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fZGlmZmVyKSkge1xuICAgICAgdmFyIGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9yYXdTdHlsZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZXMpKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgbnVsbCk7IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0U3R5bGUobmFtZTogc3RyaW5nLCB2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRTdHlsZSh0aGlzLl9uZ0VsLCBuYW1lLCB2YWwpO1xuICB9XG59XG4iXX0=