var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ElementRef, Renderer, forwardRef, Provider } from 'angular2/core';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { CONST_EXPR, NumberWrapper } from 'angular2/src/facade/lang';
const NUMBER_VALUE_ACCESSOR = CONST_EXPR(new Provider(NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => NumberValueAccessor), multi: true }));
/**
 * The accessor for writing a number value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  <input type="number" [(ng-model)]="age">
 *  ```
 */
export let NumberValueAccessor = class {
    constructor(_renderer, _elementRef) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.onChange = (_) => { };
        this.onTouched = () => { };
    }
    writeValue(value) {
        this._renderer.setElementProperty(this._elementRef, 'value', value);
    }
    registerOnChange(fn) {
        this.onChange = (value) => { fn(NumberWrapper.parseFloat(value)); };
    }
    registerOnTouched(fn) { this.onTouched = fn; }
};
NumberValueAccessor = __decorate([
    Directive({
        selector: 'input[type=number][ng-control],input[type=number][ng-form-control],input[type=number][ng-model]',
        host: {
            '(change)': 'onChange($event.target.value)',
            '(input)': 'onChange($event.target.value)',
            '(blur)': 'onTouched()'
        },
        bindings: [NUMBER_VALUE_ACCESSOR]
    }), 
    __metadata('design:paramtypes', [Renderer, ElementRef])
], NumberValueAccessor);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3ZhbHVlX2FjY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9kaXJlY3RpdmVzL251bWJlcl92YWx1ZV9hY2Nlc3Nvci50cyJdLCJuYW1lcyI6WyJOdW1iZXJWYWx1ZUFjY2Vzc29yIiwiTnVtYmVyVmFsdWVBY2Nlc3Nvci5jb25zdHJ1Y3RvciIsIk51bWJlclZhbHVlQWNjZXNzb3Iud3JpdGVWYWx1ZSIsIk51bWJlclZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPbkNoYW5nZSIsIk51bWJlclZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPblRvdWNoZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQVEsVUFBVSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWU7T0FDbEYsRUFBQyxpQkFBaUIsRUFBdUIsTUFBTSwwQkFBMEI7T0FDekUsRUFBVSxVQUFVLEVBQUUsYUFBYSxFQUFDLE1BQU0sMEJBQTBCO0FBRTNFLE1BQU0scUJBQXFCLEdBQUcsVUFBVSxDQUFDLElBQUksUUFBUSxDQUNqRCxpQkFBaUIsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSxtQkFBbUIsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFM0Y7Ozs7Ozs7O0dBUUc7QUFDSDtJQWNFQSxZQUFvQkEsU0FBbUJBLEVBQVVBLFdBQXVCQTtRQUFwREMsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7UUFBVUEsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO1FBSHhFQSxhQUFRQSxHQUFHQSxDQUFDQSxDQUFDQSxPQUFNQSxDQUFDQSxDQUFDQTtRQUNyQkEsY0FBU0EsR0FBR0EsUUFBT0EsQ0FBQ0EsQ0FBQ0E7SUFFc0RBLENBQUNBO0lBRTVFRCxVQUFVQSxDQUFDQSxLQUFhQTtRQUN0QkUsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxPQUFPQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN0RUEsQ0FBQ0E7SUFFREYsZ0JBQWdCQSxDQUFDQSxFQUF1QkE7UUFDdENHLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLENBQUNBLEtBQUtBLE9BQU9BLEVBQUVBLENBQUNBLGFBQWFBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3RFQSxDQUFDQTtJQUNESCxpQkFBaUJBLENBQUNBLEVBQWNBLElBQVVJLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQ2xFSixDQUFDQTtBQXhCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFDSixpR0FBaUc7UUFDckcsSUFBSSxFQUFFO1lBQ0osVUFBVSxFQUFFLCtCQUErQjtZQUMzQyxTQUFTLEVBQUUsK0JBQStCO1lBQzFDLFFBQVEsRUFBRSxhQUFhO1NBQ3hCO1FBQ0QsUUFBUSxFQUFFLENBQUMscUJBQXFCLENBQUM7S0FDbEMsQ0FBQzs7d0JBZUQ7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBSZW5kZXJlciwgU2VsZiwgZm9yd2FyZFJlZiwgUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge2lzQmxhbmssIENPTlNUX0VYUFIsIE51bWJlcldyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmNvbnN0IE5VTUJFUl9WQUxVRV9BQ0NFU1NPUiA9IENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKFxuICAgIE5HX1ZBTFVFX0FDQ0VTU09SLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTnVtYmVyVmFsdWVBY2Nlc3NvciksIG11bHRpOiB0cnVlfSkpO1xuXG4vKipcbiAqIFRoZSBhY2Nlc3NvciBmb3Igd3JpdGluZyBhIG51bWJlciB2YWx1ZSBhbmQgbGlzdGVuaW5nIHRvIGNoYW5nZXMgdGhhdCBpcyB1c2VkIGJ5IHRoZVxuICoge0BsaW5rIE5nTW9kZWx9LCB7QGxpbmsgTmdGb3JtQ29udHJvbH0sIGFuZCB7QGxpbmsgTmdDb250cm9sTmFtZX0gZGlyZWN0aXZlcy5cbiAqXG4gKiAgIyMjIEV4YW1wbGVcbiAqICBgYGBcbiAqICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIFsobmctbW9kZWwpXT1cImFnZVwiPlxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6XG4gICAgICAnaW5wdXRbdHlwZT1udW1iZXJdW25nLWNvbnRyb2xdLGlucHV0W3R5cGU9bnVtYmVyXVtuZy1mb3JtLWNvbnRyb2xdLGlucHV0W3R5cGU9bnVtYmVyXVtuZy1tb2RlbF0nLFxuICBob3N0OiB7XG4gICAgJyhjaGFuZ2UpJzogJ29uQ2hhbmdlKCRldmVudC50YXJnZXQudmFsdWUpJyxcbiAgICAnKGlucHV0KSc6ICdvbkNoYW5nZSgkZXZlbnQudGFyZ2V0LnZhbHVlKScsXG4gICAgJyhibHVyKSc6ICdvblRvdWNoZWQoKSdcbiAgfSxcbiAgYmluZGluZ3M6IFtOVU1CRVJfVkFMVUVfQUNDRVNTT1JdXG59KVxuZXhwb3J0IGNsYXNzIE51bWJlclZhbHVlQWNjZXNzb3IgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciB7XG4gIG9uQ2hhbmdlID0gKF8pID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHt9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudFByb3BlcnR5KHRoaXMuX2VsZW1lbnRSZWYsICd2YWx1ZScsIHZhbHVlKTtcbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IChfOiBudW1iZXIpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLm9uQ2hhbmdlID0gKHZhbHVlKSA9PiB7IGZuKE51bWJlcldyYXBwZXIucGFyc2VGbG9hdCh2YWx1ZSkpOyB9O1xuICB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMub25Ub3VjaGVkID0gZm47IH1cbn1cbiJdfQ==