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
 * <select ng-control="city">
 *   <option *ng-for="#c of cities" [value]="c"></option>
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
            selector: 'select[ng-control],select[ng-form-control],select[ng-model]',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvc2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IudHMiXSwibmFtZXMiOlsiTmdTZWxlY3RPcHRpb24iLCJOZ1NlbGVjdE9wdGlvbi5jb25zdHJ1Y3RvciIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IuY29uc3RydWN0b3IiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci53cml0ZVZhbHVlIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPbkNoYW5nZSIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25Ub3VjaGVkIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IuX3VwZGF0ZVZhbHVlV2hlbkxpc3RPZk9wdGlvbnNDaGFuZ2VzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHFCQVNPLGVBQWUsQ0FBQyxDQUFBO0FBRXZCLHNCQUFnQywyQkFBMkIsQ0FBQyxDQUFBO0FBQzVELHVDQUFzRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQ2pGLHFCQUF5QiwwQkFBMEIsQ0FBQyxDQUFBO0FBRXBELElBQU0scUJBQXFCLEdBQUcsaUJBQVUsQ0FBQyxJQUFJLGVBQVEsQ0FDakQsMENBQWlCLEVBQUUsRUFBQyxXQUFXLEVBQUUsaUJBQVUsQ0FBQyxjQUFNLE9BQUEsMEJBQTBCLEVBQTFCLENBQTBCLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBRWxHOzs7Ozs7Ozs7O0dBVUc7QUFDSDtJQUFBQTtJQUVBQyxDQUFDQTtJQUZERDtRQUFDQSxnQkFBU0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBRUEsUUFBUUEsRUFBQ0EsQ0FBQ0E7O3VCQUUvQkE7SUFBREEscUJBQUNBO0FBQURBLENBQUNBLEFBRkQsSUFFQztBQURZLHNCQUFjLGlCQUMxQixDQUFBO0FBRUQ7O0dBRUc7QUFDSDtJQWNFRSxvQ0FBb0JBLFNBQW1CQSxFQUFVQSxXQUF1QkEsRUFDaEJBLEtBQWdDQTtRQURwRUMsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7UUFBVUEsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO1FBSHhFQSxhQUFRQSxHQUFHQSxVQUFDQSxDQUFDQSxJQUFNQSxDQUFDQSxDQUFDQTtRQUNyQkEsY0FBU0EsR0FBR0EsY0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFJbkJBLElBQUlBLENBQUNBLG9DQUFvQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDbkRBLENBQUNBO0lBRURELCtDQUFVQSxHQUFWQSxVQUFXQSxLQUFVQTtRQUNuQkUsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDbkJBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsT0FBT0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDdEVBLENBQUNBO0lBRURGLHFEQUFnQkEsR0FBaEJBLFVBQWlCQSxFQUFhQSxJQUFVRyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3REgsc0RBQWlCQSxHQUFqQkEsVUFBa0JBLEVBQWFBLElBQVVJLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRXZESix5RUFBb0NBLEdBQTVDQSxVQUE2Q0EsS0FBZ0NBO1FBQTdFSyxpQkFFQ0E7UUFEQ0EseUJBQWlCQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxFQUFFQSxVQUFDQSxDQUFDQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUEzQkEsQ0FBMkJBLENBQUNBLENBQUNBO0lBQ2pGQSxDQUFDQTtJQTdCSEw7UUFBQ0EsZ0JBQVNBLENBQUNBO1lBQ1RBLFFBQVFBLEVBQUVBLDZEQUE2REE7WUFDdkVBLElBQUlBLEVBQUVBO2dCQUNKQSxVQUFVQSxFQUFFQSwrQkFBK0JBO2dCQUMzQ0EsU0FBU0EsRUFBRUEsK0JBQStCQTtnQkFDMUNBLFFBQVFBLEVBQUVBLGFBQWFBO2FBQ3hCQTtZQUNEQSxRQUFRQSxFQUFFQSxDQUFDQSxxQkFBcUJBLENBQUNBO1NBQ2xDQSxDQUFDQTtRQU9ZQSxXQUFDQSxZQUFLQSxDQUFDQSxjQUFjQSxFQUFFQSxFQUFDQSxXQUFXQSxFQUFFQSxJQUFJQSxFQUFDQSxDQUFDQSxDQUFBQTs7bUNBZXhEQTtJQUFEQSxpQ0FBQ0E7QUFBREEsQ0FBQ0EsQUE5QkQsSUE4QkM7QUFyQlksa0NBQTBCLDZCQXFCdEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFF1ZXJ5LFxuICBEaXJlY3RpdmUsXG4gIFJlbmRlcmVyLFxuICBTZWxmLFxuICBmb3J3YXJkUmVmLFxuICBQcm92aWRlcixcbiAgRWxlbWVudFJlZixcbiAgUXVlcnlMaXN0XG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5jb25zdCBTRUxFQ1RfVkFMVUVfQUNDRVNTT1IgPSBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihcbiAgICBOR19WQUxVRV9BQ0NFU1NPUiwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IFNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yKSwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogTWFya3MgYDxvcHRpb24+YCBhcyBkeW5hbWljLCBzbyBBbmd1bGFyIGNhbiBiZSBub3RpZmllZCB3aGVuIG9wdGlvbnMgY2hhbmdlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiA8c2VsZWN0IG5nLWNvbnRyb2w9XCJjaXR5XCI+XG4gKiAgIDxvcHRpb24gKm5nLWZvcj1cIiNjIG9mIGNpdGllc1wiIFt2YWx1ZV09XCJjXCI+PC9vcHRpb24+XG4gKiA8L3NlbGVjdD5cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ29wdGlvbid9KVxuZXhwb3J0IGNsYXNzIE5nU2VsZWN0T3B0aW9uIHtcbn1cblxuLyoqXG4gKiBUaGUgYWNjZXNzb3IgZm9yIHdyaXRpbmcgYSB2YWx1ZSBhbmQgbGlzdGVuaW5nIHRvIGNoYW5nZXMgb24gYSBzZWxlY3QgZWxlbWVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnc2VsZWN0W25nLWNvbnRyb2xdLHNlbGVjdFtuZy1mb3JtLWNvbnRyb2xdLHNlbGVjdFtuZy1tb2RlbF0nLFxuICBob3N0OiB7XG4gICAgJyhjaGFuZ2UpJzogJ29uQ2hhbmdlKCRldmVudC50YXJnZXQudmFsdWUpJyxcbiAgICAnKGlucHV0KSc6ICdvbkNoYW5nZSgkZXZlbnQudGFyZ2V0LnZhbHVlKScsXG4gICAgJyhibHVyKSc6ICdvblRvdWNoZWQoKSdcbiAgfSxcbiAgYmluZGluZ3M6IFtTRUxFQ1RfVkFMVUVfQUNDRVNTT1JdXG59KVxuZXhwb3J0IGNsYXNzIFNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xuICB2YWx1ZTogc3RyaW5nO1xuICBvbkNoYW5nZSA9IChfKSA9PiB7fTtcbiAgb25Ub3VjaGVkID0gKCkgPT4ge307XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyLCBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgICAgICAgICBAUXVlcnkoTmdTZWxlY3RPcHRpb24sIHtkZXNjZW5kYW50czogdHJ1ZX0pIHF1ZXJ5OiBRdWVyeUxpc3Q8TmdTZWxlY3RPcHRpb24+KSB7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWVXaGVuTGlzdE9mT3B0aW9uc0NoYW5nZXMocXVlcnkpO1xuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRQcm9wZXJ0eSh0aGlzLl9lbGVtZW50UmVmLCAndmFsdWUnLCB2YWx1ZSk7XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAoKSA9PiBhbnkpOiB2b2lkIHsgdGhpcy5vbkNoYW5nZSA9IGZuOyB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiBhbnkpOiB2b2lkIHsgdGhpcy5vblRvdWNoZWQgPSBmbjsgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVZhbHVlV2hlbkxpc3RPZk9wdGlvbnNDaGFuZ2VzKHF1ZXJ5OiBRdWVyeUxpc3Q8TmdTZWxlY3RPcHRpb24+KSB7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHF1ZXJ5LmNoYW5nZXMsIChfKSA9PiB0aGlzLndyaXRlVmFsdWUodGhpcy52YWx1ZSkpO1xuICB9XG59XG4iXX0=