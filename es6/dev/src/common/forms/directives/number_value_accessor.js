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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3ZhbHVlX2FjY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9kaXJlY3RpdmVzL251bWJlcl92YWx1ZV9hY2Nlc3Nvci50cyJdLCJuYW1lcyI6WyJOdW1iZXJWYWx1ZUFjY2Vzc29yIiwiTnVtYmVyVmFsdWVBY2Nlc3Nvci5jb25zdHJ1Y3RvciIsIk51bWJlclZhbHVlQWNjZXNzb3Iud3JpdGVWYWx1ZSIsIk51bWJlclZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPbkNoYW5nZSIsIk51bWJlclZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPblRvdWNoZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBUSxVQUFVLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZTtPQUNsRixFQUFDLGlCQUFpQixFQUF1QixNQUFNLDBCQUEwQjtPQUN6RSxFQUFVLFVBQVUsRUFBRSxhQUFhLEVBQUMsTUFBTSwwQkFBMEI7QUFFM0UsTUFBTSxxQkFBcUIsR0FBRyxVQUFVLENBQUMsSUFBSSxRQUFRLENBQ2pELGlCQUFpQixFQUFFLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxNQUFNLG1CQUFtQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUUzRjs7Ozs7Ozs7R0FRRztBQUNIO0lBY0VBLFlBQW9CQSxTQUFtQkEsRUFBVUEsV0FBdUJBO1FBQXBEQyxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtRQUFVQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBWUE7UUFIeEVBLGFBQVFBLEdBQUdBLENBQUNBLENBQUNBLE9BQU1BLENBQUNBLENBQUNBO1FBQ3JCQSxjQUFTQSxHQUFHQSxRQUFPQSxDQUFDQSxDQUFDQTtJQUVzREEsQ0FBQ0E7SUFFNUVELFVBQVVBLENBQUNBLEtBQWFBO1FBQ3RCRSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLE9BQU9BLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3RFQSxDQUFDQTtJQUVERixnQkFBZ0JBLENBQUNBLEVBQXVCQTtRQUN0Q0csSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsQ0FBQ0EsS0FBS0EsT0FBT0EsRUFBRUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDdEVBLENBQUNBO0lBQ0RILGlCQUFpQkEsQ0FBQ0EsRUFBY0EsSUFBVUksSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDbEVKLENBQUNBO0FBeEJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUNKLGlHQUFpRztRQUNyRyxJQUFJLEVBQUU7WUFDSixVQUFVLEVBQUUsK0JBQStCO1lBQzNDLFNBQVMsRUFBRSwrQkFBK0I7WUFDMUMsUUFBUSxFQUFFLGFBQWE7U0FDeEI7UUFDRCxRQUFRLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztLQUNsQyxDQUFDOzt3QkFlRDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIFJlbmRlcmVyLCBTZWxmLCBmb3J3YXJkUmVmLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge05HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZnJvbSAnLi9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7aXNCbGFuaywgQ09OU1RfRVhQUiwgTnVtYmVyV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuY29uc3QgTlVNQkVSX1ZBTFVFX0FDQ0VTU09SID0gQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoXG4gICAgTkdfVkFMVUVfQUNDRVNTT1IsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOdW1iZXJWYWx1ZUFjY2Vzc29yKSwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogVGhlIGFjY2Vzc29yIGZvciB3cml0aW5nIGEgbnVtYmVyIHZhbHVlIGFuZCBsaXN0ZW5pbmcgdG8gY2hhbmdlcyB0aGF0IGlzIHVzZWQgYnkgdGhlXG4gKiB7QGxpbmsgTmdNb2RlbH0sIHtAbGluayBOZ0Zvcm1Db250cm9sfSwgYW5kIHtAbGluayBOZ0NvbnRyb2xOYW1lfSBkaXJlY3RpdmVzLlxuICpcbiAqICAjIyMgRXhhbXBsZVxuICogIGBgYFxuICogIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgWyhuZy1tb2RlbCldPVwiYWdlXCI+XG4gKiAgYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjpcbiAgICAgICdpbnB1dFt0eXBlPW51bWJlcl1bbmctY29udHJvbF0saW5wdXRbdHlwZT1udW1iZXJdW25nLWZvcm0tY29udHJvbF0saW5wdXRbdHlwZT1udW1iZXJdW25nLW1vZGVsXScsXG4gIGhvc3Q6IHtcbiAgICAnKGNoYW5nZSknOiAnb25DaGFuZ2UoJGV2ZW50LnRhcmdldC52YWx1ZSknLFxuICAgICcoaW5wdXQpJzogJ29uQ2hhbmdlKCRldmVudC50YXJnZXQudmFsdWUpJyxcbiAgICAnKGJsdXIpJzogJ29uVG91Y2hlZCgpJ1xuICB9LFxuICBiaW5kaW5nczogW05VTUJFUl9WQUxVRV9BQ0NFU1NPUl1cbn0pXG5leHBvcnQgY2xhc3MgTnVtYmVyVmFsdWVBY2Nlc3NvciBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcbiAgb25DaGFuZ2UgPSAoXykgPT4ge307XG4gIG9uVG91Y2hlZCA9ICgpID0+IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlciwgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZikge31cblxuICB3cml0ZVZhbHVlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkodGhpcy5fZWxlbWVudFJlZiwgJ3ZhbHVlJywgdmFsdWUpO1xuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKF86IG51bWJlcikgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMub25DaGFuZ2UgPSAodmFsdWUpID0+IHsgZm4oTnVtYmVyV3JhcHBlci5wYXJzZUZsb2F0KHZhbHVlKSk7IH07XG4gIH1cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5vblRvdWNoZWQgPSBmbjsgfVxufVxuIl19