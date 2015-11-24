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
 * <select ng-control="city">
 *   <option *ng-for="#c of cities" [value]="c"></option>
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
        this._renderer.setElementProperty(this._elementRef, 'value', value);
    }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
    _updateValueWhenListOfOptionsChanges(query) {
        ObservableWrapper.subscribe(query.changes, (_) => this.writeValue(this.value));
    }
};
SelectControlValueAccessor = __decorate([
    Directive({
        selector: 'select[ng-control],select[ng-form-control],select[ng-model]',
        host: {
            '(change)': 'onChange($event.target.value)',
            '(input)': 'onChange($event.target.value)',
            '(blur)': 'onTouched()'
        },
        bindings: [SELECT_VALUE_ACCESSOR]
    }),
    __param(2, Query(NgSelectOption, { descendants: true })), 
    __metadata('design:paramtypes', [Renderer, ElementRef, QueryList])
], SelectControlValueAccessor);
//# sourceMappingURL=select_control_value_accessor.js.map