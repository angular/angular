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
var control_value_accessor_1 = require('./control_value_accessor');
var lang_1 = require('angular2/src/facade/lang');
var CHECKBOX_VALUE_ACCESSOR = lang_1.CONST_EXPR(new core_1.Provider(control_value_accessor_1.NG_VALUE_ACCESSOR, { useExisting: core_1.forwardRef(function () { return CheckboxControlValueAccessor; }), multi: true }));
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
    CheckboxControlValueAccessor.prototype.writeValue = function (value) {
        this._renderer.setElementProperty(this._elementRef, 'checked', value);
    };
    CheckboxControlValueAccessor.prototype.registerOnChange = function (fn) { this.onChange = fn; };
    CheckboxControlValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    CheckboxControlValueAccessor = __decorate([
        core_1.Directive({
            selector: 'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]',
            host: { '(change)': 'onChange($event.target.checked)', '(blur)': 'onTouched()' },
            bindings: [CHECKBOX_VALUE_ACCESSOR]
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef])
    ], CheckboxControlValueAccessor);
    return CheckboxControlValueAccessor;
})();
exports.CheckboxControlValueAccessor = CheckboxControlValueAccessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3hfdmFsdWVfYWNjZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvY2hlY2tib3hfdmFsdWVfYWNjZXNzb3IudHMiXSwibmFtZXMiOlsiQ2hlY2tib3hDb250cm9sVmFsdWVBY2Nlc3NvciIsIkNoZWNrYm94Q29udHJvbFZhbHVlQWNjZXNzb3IuY29uc3RydWN0b3IiLCJDaGVja2JveENvbnRyb2xWYWx1ZUFjY2Vzc29yLndyaXRlVmFsdWUiLCJDaGVja2JveENvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25DaGFuZ2UiLCJDaGVja2JveENvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25Ub3VjaGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFCQUEwRSxlQUFlLENBQUMsQ0FBQTtBQUUxRix1Q0FBc0QsMEJBQTBCLENBQUMsQ0FBQTtBQUNqRixxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVwRCxJQUFNLHVCQUF1QixHQUFHLGlCQUFVLENBQUMsSUFBSSxlQUFRLENBQ25ELDBDQUFpQixFQUFFLEVBQUMsV0FBVyxFQUFFLGlCQUFVLENBQUMsY0FBTSxPQUFBLDRCQUE0QixFQUE1QixDQUE0QixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUVwRzs7Ozs7OztHQU9HO0FBQ0g7SUFVRUEsc0NBQW9CQSxTQUFtQkEsRUFBVUEsV0FBdUJBO1FBQXBEQyxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtRQUFVQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBWUE7UUFIeEVBLGFBQVFBLEdBQUdBLFVBQUNBLENBQUNBLElBQU1BLENBQUNBLENBQUNBO1FBQ3JCQSxjQUFTQSxHQUFHQSxjQUFPQSxDQUFDQSxDQUFDQTtJQUVzREEsQ0FBQ0E7SUFFNUVELGlEQUFVQSxHQUFWQSxVQUFXQSxLQUFVQTtRQUNuQkUsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxTQUFTQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN4RUEsQ0FBQ0E7SUFDREYsdURBQWdCQSxHQUFoQkEsVUFBaUJBLEVBQWtCQSxJQUFVRyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNsRUgsd0RBQWlCQSxHQUFqQkEsVUFBa0JBLEVBQVlBLElBQVVJLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBaEJoRUo7UUFBQ0EsZ0JBQVNBLENBQUNBO1lBQ1RBLFFBQVFBLEVBQ0pBLHVHQUF1R0E7WUFDM0dBLElBQUlBLEVBQUVBLEVBQUNBLFVBQVVBLEVBQUVBLGlDQUFpQ0EsRUFBRUEsUUFBUUEsRUFBRUEsYUFBYUEsRUFBQ0E7WUFDOUVBLFFBQVFBLEVBQUVBLENBQUNBLHVCQUF1QkEsQ0FBQ0E7U0FDcENBLENBQUNBOztxQ0FZREE7SUFBREEsbUNBQUNBO0FBQURBLENBQUNBLEFBakJELElBaUJDO0FBWFksb0NBQTRCLCtCQVd4QyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIFJlbmRlcmVyLCBFbGVtZW50UmVmLCBTZWxmLCBmb3J3YXJkUmVmLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7TkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5jb25zdCBDSEVDS0JPWF9WQUxVRV9BQ0NFU1NPUiA9IENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKFxuICAgIE5HX1ZBTFVFX0FDQ0VTU09SLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQ2hlY2tib3hDb250cm9sVmFsdWVBY2Nlc3NvciksIG11bHRpOiB0cnVlfSkpO1xuXG4vKipcbiAqIFRoZSBhY2Nlc3NvciBmb3Igd3JpdGluZyBhIHZhbHVlIGFuZCBsaXN0ZW5pbmcgdG8gY2hhbmdlcyBvbiBhIGNoZWNrYm94IGlucHV0IGVsZW1lbnQuXG4gKlxuICogICMjIyBFeGFtcGxlXG4gKiAgYGBgXG4gKiAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5nLWNvbnRyb2w9XCJyZW1lbWJlckxvZ2luXCI+XG4gKiAgYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjpcbiAgICAgICdpbnB1dFt0eXBlPWNoZWNrYm94XVtuZy1jb250cm9sXSxpbnB1dFt0eXBlPWNoZWNrYm94XVtuZy1mb3JtLWNvbnRyb2xdLGlucHV0W3R5cGU9Y2hlY2tib3hdW25nLW1vZGVsXScsXG4gIGhvc3Q6IHsnKGNoYW5nZSknOiAnb25DaGFuZ2UoJGV2ZW50LnRhcmdldC5jaGVja2VkKScsICcoYmx1ciknOiAnb25Ub3VjaGVkKCknfSxcbiAgYmluZGluZ3M6IFtDSEVDS0JPWF9WQUxVRV9BQ0NFU1NPUl1cbn0pXG5leHBvcnQgY2xhc3MgQ2hlY2tib3hDb250cm9sVmFsdWVBY2Nlc3NvciBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcbiAgb25DaGFuZ2UgPSAoXykgPT4ge307XG4gIG9uVG91Y2hlZCA9ICgpID0+IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlciwgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZikge31cblxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkodGhpcy5fZWxlbWVudFJlZiwgJ2NoZWNrZWQnLCB2YWx1ZSk7XG4gIH1cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKF86IGFueSkgPT4ge30pOiB2b2lkIHsgdGhpcy5vbkNoYW5nZSA9IGZuOyB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB7fSk6IHZvaWQgeyB0aGlzLm9uVG91Y2hlZCA9IGZuOyB9XG59XG4iXX0=