'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('angular2/core');
var async_1 = require('angular2/src/facade/async');
var control_value_accessor_1 = require('./control_value_accessor');
var lang_1 = require('angular2/src/facade/lang');
var SELECT_VALUE_ACCESSOR = lang_1.CONST_EXPR(new core_1.Provider(control_value_accessor_1.NG_VALUE_ACCESSOR, { useExisting: core_1.forwardRef(function () { return SelectControlValueAccessor; }), multi: true }));
/**
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * ### Example
 *
 * ```
 * <select ngControl="city">
 *   <option *ngFor="#c of cities" [value]="c"></option>
 * </select>
 * ```
 */
var NgSelectOption = (function () {
    function NgSelectOption() {
    }
    NgSelectOption = __decorate([
        core_1.Directive({ selector: 'option' }), 
        __metadata('design:paramtypes', [])
    ], NgSelectOption);
    return NgSelectOption;
})();
exports.NgSelectOption = NgSelectOption;
/**
 * The accessor for writing a value and listening to changes on a select element.
 */
var SelectControlValueAccessor = (function () {
    function SelectControlValueAccessor(_renderer, _elementRef, query) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.onChange = function (_) { };
        this.onTouched = function () { };
        this._updateValueWhenListOfOptionsChanges(query);
    }
    SelectControlValueAccessor.prototype.writeValue = function (value) {
        this.value = value;
        this._renderer.setElementProperty(this._elementRef, 'value', value);
    };
    SelectControlValueAccessor.prototype.registerOnChange = function (fn) { this.onChange = fn; };
    SelectControlValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    SelectControlValueAccessor.prototype._updateValueWhenListOfOptionsChanges = function (query) {
        var _this = this;
        async_1.ObservableWrapper.subscribe(query.changes, function (_) { return _this.writeValue(_this.value); });
    };
    SelectControlValueAccessor = __decorate([
        core_1.Directive({
            selector: 'select[ngControl],select[ngFormControl],select[ngModel]',
            host: {
                '(change)': 'onChange($event.target.value)',
                '(input)': 'onChange($event.target.value)',
                '(blur)': 'onTouched()'
            },
            bindings: [SELECT_VALUE_ACCESSOR]
        }),
        __param(2, core_1.Query(NgSelectOption, { descendants: true })), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef, core_1.QueryList])
    ], SelectControlValueAccessor);
    return SelectControlValueAccessor;
})();
exports.SelectControlValueAccessor = SelectControlValueAccessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvc2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IudHMiXSwibmFtZXMiOlsiTmdTZWxlY3RPcHRpb24iLCJOZ1NlbGVjdE9wdGlvbi5jb25zdHJ1Y3RvciIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IuY29uc3RydWN0b3IiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci53cml0ZVZhbHVlIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPbkNoYW5nZSIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25Ub3VjaGVkIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IuX3VwZGF0ZVZhbHVlV2hlbkxpc3RPZk9wdGlvbnNDaGFuZ2VzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQkFTTyxlQUFlLENBQUMsQ0FBQTtBQUV2QixzQkFBZ0MsMkJBQTJCLENBQUMsQ0FBQTtBQUM1RCx1Q0FBc0QsMEJBQTBCLENBQUMsQ0FBQTtBQUNqRixxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVwRCxJQUFNLHFCQUFxQixHQUFHLGlCQUFVLENBQUMsSUFBSSxlQUFRLENBQ2pELDBDQUFpQixFQUFFLEVBQUMsV0FBVyxFQUFFLGlCQUFVLENBQUMsY0FBTSxPQUFBLDBCQUEwQixFQUExQixDQUEwQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUVsRzs7Ozs7Ozs7OztHQVVHO0FBQ0g7SUFBQUE7SUFFQUMsQ0FBQ0E7SUFGREQ7UUFBQ0EsZ0JBQVNBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLFFBQVFBLEVBQUNBLENBQUNBOzt1QkFFL0JBO0lBQURBLHFCQUFDQTtBQUFEQSxDQUFDQSxBQUZELElBRUM7QUFEWSxzQkFBYyxpQkFDMUIsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFjRUUsb0NBQW9CQSxTQUFtQkEsRUFBVUEsV0FBdUJBLEVBQ2hCQSxLQUFnQ0E7UUFEcEVDLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBQVVBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFZQTtRQUh4RUEsYUFBUUEsR0FBR0EsVUFBQ0EsQ0FBQ0EsSUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDckJBLGNBQVNBLEdBQUdBLGNBQU9BLENBQUNBLENBQUNBO1FBSW5CQSxJQUFJQSxDQUFDQSxvQ0FBb0NBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQ25EQSxDQUFDQTtJQUVERCwrQ0FBVUEsR0FBVkEsVUFBV0EsS0FBVUE7UUFDbkJFLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ25CQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLE9BQU9BLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3RFQSxDQUFDQTtJQUVERixxREFBZ0JBLEdBQWhCQSxVQUFpQkEsRUFBYUEsSUFBVUcsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0RILHNEQUFpQkEsR0FBakJBLFVBQWtCQSxFQUFhQSxJQUFVSSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV2REoseUVBQW9DQSxHQUE1Q0EsVUFBNkNBLEtBQWdDQTtRQUE3RUssaUJBRUNBO1FBRENBLHlCQUFpQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBQ0EsQ0FBQ0EsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBM0JBLENBQTJCQSxDQUFDQSxDQUFDQTtJQUNqRkEsQ0FBQ0E7SUE3QkhMO1FBQUNBLGdCQUFTQSxDQUFDQTtZQUNUQSxRQUFRQSxFQUFFQSx5REFBeURBO1lBQ25FQSxJQUFJQSxFQUFFQTtnQkFDSkEsVUFBVUEsRUFBRUEsK0JBQStCQTtnQkFDM0NBLFNBQVNBLEVBQUVBLCtCQUErQkE7Z0JBQzFDQSxRQUFRQSxFQUFFQSxhQUFhQTthQUN4QkE7WUFDREEsUUFBUUEsRUFBRUEsQ0FBQ0EscUJBQXFCQSxDQUFDQTtTQUNsQ0EsQ0FBQ0E7UUFPWUEsV0FBQ0EsWUFBS0EsQ0FBQ0EsY0FBY0EsRUFBRUEsRUFBQ0EsV0FBV0EsRUFBRUEsSUFBSUEsRUFBQ0EsQ0FBQ0EsQ0FBQUE7O21DQWV4REE7SUFBREEsaUNBQUNBO0FBQURBLENBQUNBLEFBOUJELElBOEJDO0FBckJZLGtDQUEwQiw2QkFxQnRDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBRdWVyeSxcbiAgRGlyZWN0aXZlLFxuICBSZW5kZXJlcixcbiAgU2VsZixcbiAgZm9yd2FyZFJlZixcbiAgUHJvdmlkZXIsXG4gIEVsZW1lbnRSZWYsXG4gIFF1ZXJ5TGlzdFxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge05HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZnJvbSAnLi9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuY29uc3QgU0VMRUNUX1ZBTFVFX0FDQ0VTU09SID0gQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoXG4gICAgTkdfVkFMVUVfQUNDRVNTT1IsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3NvciksIG11bHRpOiB0cnVlfSkpO1xuXG4vKipcbiAqIE1hcmtzIGA8b3B0aW9uPmAgYXMgZHluYW1pYywgc28gQW5ndWxhciBjYW4gYmUgbm90aWZpZWQgd2hlbiBvcHRpb25zIGNoYW5nZS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogPHNlbGVjdCBuZ0NvbnRyb2w9XCJjaXR5XCI+XG4gKiAgIDxvcHRpb24gKm5nRm9yPVwiI2Mgb2YgY2l0aWVzXCIgW3ZhbHVlXT1cImNcIj48L29wdGlvbj5cbiAqIDwvc2VsZWN0PlxuICogYGBgXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnb3B0aW9uJ30pXG5leHBvcnQgY2xhc3MgTmdTZWxlY3RPcHRpb24ge1xufVxuXG4vKipcbiAqIFRoZSBhY2Nlc3NvciBmb3Igd3JpdGluZyBhIHZhbHVlIGFuZCBsaXN0ZW5pbmcgdG8gY2hhbmdlcyBvbiBhIHNlbGVjdCBlbGVtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdzZWxlY3RbbmdDb250cm9sXSxzZWxlY3RbbmdGb3JtQ29udHJvbF0sc2VsZWN0W25nTW9kZWxdJyxcbiAgaG9zdDoge1xuICAgICcoY2hhbmdlKSc6ICdvbkNoYW5nZSgkZXZlbnQudGFyZ2V0LnZhbHVlKScsXG4gICAgJyhpbnB1dCknOiAnb25DaGFuZ2UoJGV2ZW50LnRhcmdldC52YWx1ZSknLFxuICAgICcoYmx1ciknOiAnb25Ub3VjaGVkKCknXG4gIH0sXG4gIGJpbmRpbmdzOiBbU0VMRUNUX1ZBTFVFX0FDQ0VTU09SXVxufSlcbmV4cG9ydCBjbGFzcyBTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3NvciBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcbiAgdmFsdWU6IHN0cmluZztcbiAgb25DaGFuZ2UgPSAoXykgPT4ge307XG4gIG9uVG91Y2hlZCA9ICgpID0+IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlciwgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgQFF1ZXJ5KE5nU2VsZWN0T3B0aW9uLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBxdWVyeTogUXVlcnlMaXN0PE5nU2VsZWN0T3B0aW9uPikge1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlV2hlbkxpc3RPZk9wdGlvbnNDaGFuZ2VzKHF1ZXJ5KTtcbiAgfVxuXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkodGhpcy5fZWxlbWVudFJlZiwgJ3ZhbHVlJywgdmFsdWUpO1xuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKCkgPT4gYW55KTogdm9pZCB7IHRoaXMub25DaGFuZ2UgPSBmbjsgfVxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4gYW55KTogdm9pZCB7IHRoaXMub25Ub3VjaGVkID0gZm47IH1cblxuICBwcml2YXRlIF91cGRhdGVWYWx1ZVdoZW5MaXN0T2ZPcHRpb25zQ2hhbmdlcyhxdWVyeTogUXVlcnlMaXN0PE5nU2VsZWN0T3B0aW9uPikge1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShxdWVyeS5jaGFuZ2VzLCAoXykgPT4gdGhpcy53cml0ZVZhbHVlKHRoaXMudmFsdWUpKTtcbiAgfVxufVxuIl19