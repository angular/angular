var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var metadata_1 = require('angular2/src/core/metadata');
var render_1 = require('angular2/src/core/render');
var linker_1 = require('angular2/src/core/linker');
var di_1 = require('angular2/src/core/di');
var control_value_accessor_1 = require('./control_value_accessor');
var lang_1 = require('angular2/src/facade/lang');
var shared_1 = require('./shared');
var CHECKBOX_VALUE_ACCESSOR = lang_1.CONST_EXPR(new di_1.Provider(control_value_accessor_1.NG_VALUE_ACCESSOR, { useExisting: di_1.forwardRef(function () { return CheckboxControlValueAccessor; }), multi: true }));
/**
 * The accessor for writing a value and listening to changes on a checkbox input element.
 *
 *  ### Example
 *  ```
 *  <input type="checkbox" ng-control="rememberLogin">
 *  ```
 */
var CheckboxControlValueAccessor = (function () {
    function CheckboxControlValueAccessor(_renderer, _elementRef) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.onChange = function (_) { };
        this.onTouched = function () { };
    }
    CheckboxControlValueAccessor.prototype.writeValue = function (value) { shared_1.setProperty(this._renderer, this._elementRef, "checked", value); };
    CheckboxControlValueAccessor.prototype.registerOnChange = function (fn) { this.onChange = fn; };
    CheckboxControlValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    CheckboxControlValueAccessor = __decorate([
        metadata_1.Directive({
            selector: 'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]',
            host: { '(change)': 'onChange($event.target.checked)', '(blur)': 'onTouched()' },
            bindings: [CHECKBOX_VALUE_ACCESSOR]
        }), 
        __metadata('design:paramtypes', [render_1.Renderer, linker_1.ElementRef])
    ], CheckboxControlValueAccessor);
    return CheckboxControlValueAccessor;
})();
exports.CheckboxControlValueAccessor = CheckboxControlValueAccessor;
//# sourceMappingURL=checkbox_value_accessor.js.map