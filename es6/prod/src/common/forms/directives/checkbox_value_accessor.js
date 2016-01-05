var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, Renderer, ElementRef, forwardRef, Provider } from 'angular2/core';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { CONST_EXPR } from 'angular2/src/facade/lang';
const CHECKBOX_VALUE_ACCESSOR = CONST_EXPR(new Provider(NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => CheckboxControlValueAccessor), multi: true }));
/**
 * The accessor for writing a value and listening to changes on a checkbox input element.
 *
 *  ### Example
 *  ```
 *  <input type="checkbox" ngControl="rememberLogin">
 *  ```
 */
export let CheckboxControlValueAccessor = class {
    constructor(_renderer, _elementRef) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.onChange = (_) => { };
        this.onTouched = () => { };
    }
    writeValue(value) {
        this._renderer.setElementProperty(this._elementRef, 'checked', value);
    }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
};
CheckboxControlValueAccessor = __decorate([
    Directive({
        selector: 'input[type=checkbox][ngControl],input[type=checkbox][ngFormControl],input[type=checkbox][ngModel]',
        host: { '(change)': 'onChange($event.target.checked)', '(blur)': 'onTouched()' },
        bindings: [CHECKBOX_VALUE_ACCESSOR]
    }), 
    __metadata('design:paramtypes', [Renderer, ElementRef])
], CheckboxControlValueAccessor);
