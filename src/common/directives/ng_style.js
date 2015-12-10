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
        core_1.Directive({ selector: '[ng-style]', inputs: ['rawStyle: ng-style'] }), 
        __metadata('design:paramtypes', [core_1.KeyValueDiffers, core_1.ElementRef, core_1.Renderer])
    ], NgStyle);
    return NgStyle;
})();
exports.NgStyle = NgStyle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOlsiTmdTdHlsZSIsIk5nU3R5bGUuY29uc3RydWN0b3IiLCJOZ1N0eWxlLnJhd1N0eWxlIiwiTmdTdHlsZS5uZ0RvQ2hlY2siLCJOZ1N0eWxlLl9hcHBseUNoYW5nZXMiLCJOZ1N0eWxlLl9zZXRTdHlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBT08sZUFBZSxDQUFDLENBQUE7QUFDdkIscUJBQXdDLDBCQUEwQixDQUFDLENBQUE7QUFFbkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpREc7QUFDSDtJQU9FQSxpQkFBb0JBLFFBQXlCQSxFQUFVQSxLQUFpQkEsRUFDcERBLFNBQW1CQTtRQURuQkMsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBaUJBO1FBQVVBLFVBQUtBLEdBQUxBLEtBQUtBLENBQVlBO1FBQ3BEQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtJQUFHQSxDQUFDQTtJQUUzQ0Qsc0JBQUlBLDZCQUFRQTthQUFaQSxVQUFhQSxDQUFDQTtZQUNaRSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNuQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDakVBLENBQUNBO1FBQ0hBLENBQUNBOzs7T0FBQUY7SUFFREEsMkJBQVNBLEdBQVRBO1FBQ0VHLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFDaERBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdkJBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQzlCQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVPSCwrQkFBYUEsR0FBckJBLFVBQXNCQSxPQUFZQTtRQUFsQ0ksaUJBSUNBO1FBSENBLE9BQU9BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsVUFBQ0EsTUFBTUEsSUFBT0EsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0ZBLE9BQU9BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsVUFBQ0EsTUFBTUEsSUFBT0EsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0ZBLE9BQU9BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsVUFBQ0EsTUFBTUEsSUFBT0EsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0lBRU9KLDJCQUFTQSxHQUFqQkEsVUFBa0JBLElBQVlBLEVBQUVBLEdBQVdBO1FBQ3pDSyxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN4REEsQ0FBQ0E7SUFsQ0hMO1FBQUNBLGdCQUFTQSxDQUFDQSxFQUFDQSxRQUFRQSxFQUFFQSxZQUFZQSxFQUFFQSxNQUFNQSxFQUFFQSxDQUFDQSxvQkFBb0JBLENBQUNBLEVBQUNBLENBQUNBOztnQkFtQ25FQTtJQUFEQSxjQUFDQTtBQUFEQSxDQUFDQSxBQW5DRCxJQW1DQztBQWxDWSxlQUFPLFVBa0NuQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRG9DaGVjayxcbiAgS2V5VmFsdWVEaWZmZXIsXG4gIEtleVZhbHVlRGlmZmVycyxcbiAgRWxlbWVudFJlZixcbiAgRGlyZWN0aXZlLFxuICBSZW5kZXJlclxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBwcmludH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBUaGUgYE5nU3R5bGVgIGRpcmVjdGl2ZSBjaGFuZ2VzIHN0eWxlcyBiYXNlZCBvbiBhIHJlc3VsdCBvZiBleHByZXNzaW9uIGV2YWx1YXRpb24uXG4gKlxuICogQW4gZXhwcmVzc2lvbiBhc3NpZ25lZCB0byB0aGUgYG5nLXN0eWxlYCBwcm9wZXJ0eSBtdXN0IGV2YWx1YXRlIHRvIGFuIG9iamVjdCBhbmQgdGhlXG4gKiBjb3JyZXNwb25kaW5nIGVsZW1lbnQgc3R5bGVzIGFyZSB1cGRhdGVkIGJhc2VkIG9uIGNoYW5nZXMgdG8gdGhpcyBvYmplY3QuIFN0eWxlIG5hbWVzIHRvIHVwZGF0ZVxuICogYXJlIHRha2VuIGZyb20gdGhlIG9iamVjdCdzIGtleXMsIGFuZCB2YWx1ZXMgLSBmcm9tIHRoZSBjb3JyZXNwb25kaW5nIG9iamVjdCdzIHZhbHVlcy5cbiAqXG4gKiAjIyMgU3ludGF4XG4gKlxuICogLSBgPGRpdiBbbmctc3R5bGVdPVwieydmb250LXN0eWxlJzogc3R5bGV9XCI+PC9kaXY+YFxuICogLSBgPGRpdiBbbmctc3R5bGVdPVwic3R5bGVFeHBcIj48L2Rpdj5gIC0gaGVyZSB0aGUgYHN0eWxlRXhwYCBtdXN0IGV2YWx1YXRlIHRvIGFuIG9iamVjdFxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9ZYW1HUzZHa1VoOUdxV05RaEN5TT9wPXByZXZpZXcpKTpcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBOZ1N0eWxlfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgc2VsZWN0b3I6ICduZy1zdHlsZS1leGFtcGxlJyxcbiAqICB0ZW1wbGF0ZTogYFxuICogICAgPGgxIFtuZy1zdHlsZV09XCJ7J2ZvbnQtc3R5bGUnOiBzdHlsZSwgJ2ZvbnQtc2l6ZSc6IHNpemUsICdmb250LXdlaWdodCc6IHdlaWdodH1cIj5cbiAqICAgICAgQ2hhbmdlIHN0eWxlIG9mIHRoaXMgdGV4dCFcbiAqICAgIDwvaDE+XG4gKlxuICogICAgPGhyPlxuICpcbiAqICAgIDxsYWJlbD5JdGFsaWM6IDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAoY2hhbmdlKT1cImNoYW5nZVN0eWxlKCRldmVudClcIj48L2xhYmVsPlxuICogICAgPGxhYmVsPkJvbGQ6IDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAoY2hhbmdlKT1cImNoYW5nZVdlaWdodCgkZXZlbnQpXCI+PC9sYWJlbD5cbiAqICAgIDxsYWJlbD5TaXplOiA8aW5wdXQgdHlwZT1cInRleHRcIiBbdmFsdWVdPVwic2l6ZVwiIChjaGFuZ2UpPVwic2l6ZSA9ICRldmVudC50YXJnZXQudmFsdWVcIj48L2xhYmVsPlxuICogIGAsXG4gKiAgZGlyZWN0aXZlczogW05nU3R5bGVdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE5nU3R5bGVFeGFtcGxlIHtcbiAqICAgIHN0eWxlID0gJ25vcm1hbCc7XG4gKiAgICB3ZWlnaHQgPSAnbm9ybWFsJztcbiAqICAgIHNpemUgPSAnMjBweCc7XG4gKlxuICogICAgY2hhbmdlU3R5bGUoJGV2ZW50OiBhbnkpIHtcbiAqICAgICAgdGhpcy5zdHlsZSA9ICRldmVudC50YXJnZXQuY2hlY2tlZCA/ICdpdGFsaWMnIDogJ25vcm1hbCc7XG4gKiAgICB9XG4gKlxuICogICAgY2hhbmdlV2VpZ2h0KCRldmVudDogYW55KSB7XG4gKiAgICAgIHRoaXMud2VpZ2h0ID0gJGV2ZW50LnRhcmdldC5jaGVja2VkID8gJ2JvbGQnIDogJ25vcm1hbCc7XG4gKiAgICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUgdGhlIGBmb250LXN0eWxlYCwgYGZvbnQtc2l6ZWAgYW5kIGBmb250LXdlaWdodGAgc3R5bGVzIHdpbGwgYmUgdXBkYXRlZFxuICogYmFzZWQgb24gdGhlIGBzdHlsZWAgcHJvcGVydHkncyB2YWx1ZSBjaGFuZ2VzLlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZy1zdHlsZV0nLCBpbnB1dHM6IFsncmF3U3R5bGU6IG5nLXN0eWxlJ119KVxuZXhwb3J0IGNsYXNzIE5nU3R5bGUgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmF3U3R5bGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RpZmZlcjogS2V5VmFsdWVEaWZmZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLCBwcml2YXRlIF9uZ0VsOiBFbGVtZW50UmVmLFxuICAgICAgICAgICAgICBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIpIHt9XG5cbiAgc2V0IHJhd1N0eWxlKHYpIHtcbiAgICB0aGlzLl9yYXdTdHlsZSA9IHY7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fZGlmZmVyKSAmJiBpc1ByZXNlbnQodikpIHtcbiAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh0aGlzLl9yYXdTdHlsZSkuY3JlYXRlKG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2RpZmZlcikpIHtcbiAgICAgIHZhciBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fcmF3U3R5bGUpO1xuICAgICAgaWYgKGlzUHJlc2VudChjaGFuZ2VzKSkge1xuICAgICAgICB0aGlzLl9hcHBseUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hDaGFuZ2VkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIG51bGwpOyB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3NldFN0eWxlKG5hbWU6IHN0cmluZywgdmFsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50U3R5bGUodGhpcy5fbmdFbCwgbmFtZSwgdmFsKTtcbiAgfVxufVxuIl19