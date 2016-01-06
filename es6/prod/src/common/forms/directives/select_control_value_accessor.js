var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
import { Query, Directive, Renderer, forwardRef, Provider, ElementRef, QueryList } from 'angular2/core';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { CONST_EXPR } from 'angular2/src/facade/lang';
const SELECT_VALUE_ACCESSOR = CONST_EXPR(new Provider(NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => SelectControlValueAccessor), multi: true }));
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
export let NgSelectOption = class {
};
NgSelectOption = __decorate([
    Directive({ selector: 'option' }), 
    __metadata('design:paramtypes', [])
], NgSelectOption);
/**
 * The accessor for writing a value and listening to changes on a select element.
 */
export let SelectControlValueAccessor = class {
    constructor(_renderer, _elementRef, query) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.onChange = (_) => { };
        this.onTouched = () => { };
        this._updateValueWhenListOfOptionsChanges(query);
    }
    writeValue(value) {
        this.value = value;
        this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', value);
    }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
    _updateValueWhenListOfOptionsChanges(query) {
        ObservableWrapper.subscribe(query.changes, (_) => this.writeValue(this.value));
    }
};
SelectControlValueAccessor = __decorate([
    Directive({
        selector: 'select[ngControl],select[ngFormControl],select[ngModel]',
        host: { '(input)': 'onChange($event.target.value)', '(blur)': 'onTouched()' },
        bindings: [SELECT_VALUE_ACCESSOR]
    }),
    __param(2, Query(NgSelectOption, { descendants: true })), 
    __metadata('design:paramtypes', [Renderer, ElementRef, QueryList])
], SelectControlValueAccessor);
