'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOlsiTmdTdHlsZSIsIk5nU3R5bGUuY29uc3RydWN0b3IiLCJOZ1N0eWxlLnJhd1N0eWxlIiwiTmdTdHlsZS5uZ0RvQ2hlY2siLCJOZ1N0eWxlLl9hcHBseUNoYW5nZXMiLCJOZ1N0eWxlLl9zZXRTdHlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQkFPTyxlQUFlLENBQUMsQ0FBQTtBQUN2QixxQkFBd0MsMEJBQTBCLENBQUMsQ0FBQTtBQUVuRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlERztBQUNIO0lBT0VBLGlCQUFvQkEsUUFBeUJBLEVBQVVBLEtBQWlCQSxFQUNwREEsU0FBbUJBO1FBRG5CQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFpQkE7UUFBVUEsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBWUE7UUFDcERBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO0lBQUdBLENBQUNBO0lBRTNDRCxzQkFBSUEsNkJBQVFBO2FBQVpBLFVBQWFBLENBQUNBO1lBQ1pFLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLENBQUNBLENBQUNBO1lBQ25CQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFDQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNqRUEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7OztPQUFBRjtJQUVEQSwyQkFBU0EsR0FBVEE7UUFDRUcsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUNoREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN2QkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFDOUJBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRU9ILCtCQUFhQSxHQUFyQkEsVUFBc0JBLE9BQVlBO1FBQWxDSSxpQkFJQ0E7UUFIQ0EsT0FBT0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxVQUFDQSxNQUFNQSxJQUFPQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzRkEsT0FBT0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxVQUFDQSxNQUFNQSxJQUFPQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM3RkEsT0FBT0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxVQUFDQSxNQUFNQSxJQUFPQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFT0osMkJBQVNBLEdBQWpCQSxVQUFrQkEsSUFBWUEsRUFBRUEsR0FBV0E7UUFDekNLLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3hEQSxDQUFDQTtJQWxDSEw7UUFBQ0EsZ0JBQVNBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLFlBQVlBLEVBQUVBLE1BQU1BLEVBQUVBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsRUFBQ0EsQ0FBQ0E7O2dCQW1DbkVBO0lBQURBLGNBQUNBO0FBQURBLENBQUNBLEFBbkNELElBbUNDO0FBbENZLGVBQU8sVUFrQ25CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBEb0NoZWNrLFxuICBLZXlWYWx1ZURpZmZlcixcbiAgS2V5VmFsdWVEaWZmZXJzLFxuICBFbGVtZW50UmVmLFxuICBEaXJlY3RpdmUsXG4gIFJlbmRlcmVyXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIHByaW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIFRoZSBgTmdTdHlsZWAgZGlyZWN0aXZlIGNoYW5nZXMgc3R5bGVzIGJhc2VkIG9uIGEgcmVzdWx0IG9mIGV4cHJlc3Npb24gZXZhbHVhdGlvbi5cbiAqXG4gKiBBbiBleHByZXNzaW9uIGFzc2lnbmVkIHRvIHRoZSBgbmctc3R5bGVgIHByb3BlcnR5IG11c3QgZXZhbHVhdGUgdG8gYW4gb2JqZWN0IGFuZCB0aGVcbiAqIGNvcnJlc3BvbmRpbmcgZWxlbWVudCBzdHlsZXMgYXJlIHVwZGF0ZWQgYmFzZWQgb24gY2hhbmdlcyB0byB0aGlzIG9iamVjdC4gU3R5bGUgbmFtZXMgdG8gdXBkYXRlXG4gKiBhcmUgdGFrZW4gZnJvbSB0aGUgb2JqZWN0J3Mga2V5cywgYW5kIHZhbHVlcyAtIGZyb20gdGhlIGNvcnJlc3BvbmRpbmcgb2JqZWN0J3MgdmFsdWVzLlxuICpcbiAqICMjIyBTeW50YXhcbiAqXG4gKiAtIGA8ZGl2IFtuZy1zdHlsZV09XCJ7J2ZvbnQtc3R5bGUnOiBzdHlsZX1cIj48L2Rpdj5gXG4gKiAtIGA8ZGl2IFtuZy1zdHlsZV09XCJzdHlsZUV4cFwiPjwvZGl2PmAgLSBoZXJlIHRoZSBgc3R5bGVFeHBgIG11c3QgZXZhbHVhdGUgdG8gYW4gb2JqZWN0XG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1lhbUdTNkdrVWg5R3FXTlFoQ3lNP3A9cHJldmlldykpOlxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIE5nU3R5bGV9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICBzZWxlY3RvcjogJ25nLXN0eWxlLWV4YW1wbGUnLFxuICogIHRlbXBsYXRlOiBgXG4gKiAgICA8aDEgW25nLXN0eWxlXT1cInsnZm9udC1zdHlsZSc6IHN0eWxlLCAnZm9udC1zaXplJzogc2l6ZSwgJ2ZvbnQtd2VpZ2h0Jzogd2VpZ2h0fVwiPlxuICogICAgICBDaGFuZ2Ugc3R5bGUgb2YgdGhpcyB0ZXh0IVxuICogICAgPC9oMT5cbiAqXG4gKiAgICA8aHI+XG4gKlxuICogICAgPGxhYmVsPkl0YWxpYzogPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIChjaGFuZ2UpPVwiY2hhbmdlU3R5bGUoJGV2ZW50KVwiPjwvbGFiZWw+XG4gKiAgICA8bGFiZWw+Qm9sZDogPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIChjaGFuZ2UpPVwiY2hhbmdlV2VpZ2h0KCRldmVudClcIj48L2xhYmVsPlxuICogICAgPGxhYmVsPlNpemU6IDxpbnB1dCB0eXBlPVwidGV4dFwiIFt2YWx1ZV09XCJzaXplXCIgKGNoYW5nZSk9XCJzaXplID0gJGV2ZW50LnRhcmdldC52YWx1ZVwiPjwvbGFiZWw+XG4gKiAgYCxcbiAqICBkaXJlY3RpdmVzOiBbTmdTdHlsZV1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTmdTdHlsZUV4YW1wbGUge1xuICogICAgc3R5bGUgPSAnbm9ybWFsJztcbiAqICAgIHdlaWdodCA9ICdub3JtYWwnO1xuICogICAgc2l6ZSA9ICcyMHB4JztcbiAqXG4gKiAgICBjaGFuZ2VTdHlsZSgkZXZlbnQ6IGFueSkge1xuICogICAgICB0aGlzLnN0eWxlID0gJGV2ZW50LnRhcmdldC5jaGVja2VkID8gJ2l0YWxpYycgOiAnbm9ybWFsJztcbiAqICAgIH1cbiAqXG4gKiAgICBjaGFuZ2VXZWlnaHQoJGV2ZW50OiBhbnkpIHtcbiAqICAgICAgdGhpcy53ZWlnaHQgPSAkZXZlbnQudGFyZ2V0LmNoZWNrZWQgPyAnYm9sZCcgOiAnbm9ybWFsJztcbiAqICAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEluIHRoaXMgZXhhbXBsZSB0aGUgYGZvbnQtc3R5bGVgLCBgZm9udC1zaXplYCBhbmQgYGZvbnQtd2VpZ2h0YCBzdHlsZXMgd2lsbCBiZSB1cGRhdGVkXG4gKiBiYXNlZCBvbiB0aGUgYHN0eWxlYCBwcm9wZXJ0eSdzIHZhbHVlIGNoYW5nZXMuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nLXN0eWxlXScsIGlucHV0czogWydyYXdTdHlsZTogbmctc3R5bGUnXX0pXG5leHBvcnQgY2xhc3MgTmdTdHlsZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICAvKiogQGludGVybmFsICovXG4gIF9yYXdTdHlsZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlmZmVyOiBLZXlWYWx1ZURpZmZlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcikge31cblxuICBzZXQgcmF3U3R5bGUodikge1xuICAgIHRoaXMuX3Jhd1N0eWxlID0gdjtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9kaWZmZXIpICYmIGlzUHJlc2VudCh2KSkge1xuICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHRoaXMuX3Jhd1N0eWxlKS5jcmVhdGUobnVsbCk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fZGlmZmVyKSkge1xuICAgICAgdmFyIGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9yYXdTdHlsZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZXMpKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgbnVsbCk7IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0U3R5bGUobmFtZTogc3RyaW5nLCB2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRTdHlsZSh0aGlzLl9uZ0VsLCBuYW1lLCB2YWwpO1xuICB9XG59XG4iXX0=