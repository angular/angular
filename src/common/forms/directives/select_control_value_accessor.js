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
//# sourceMappingURL=select_control_value_accessor.js.map