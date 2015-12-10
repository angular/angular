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
 *  <input type="checkbox" ng-control="rememberLogin">
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
        selector: 'input[type=checkbox][ng-control],input[type=checkbox][ng-form-control],input[type=checkbox][ng-model]',
        host: { '(change)': 'onChange($event.target.checked)', '(blur)': 'onTouched()' },
        bindings: [CHECKBOX_VALUE_ACCESSOR]
    }), 
    __metadata('design:paramtypes', [Renderer, ElementRef])
], CheckboxControlValueAccessor);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3hfdmFsdWVfYWNjZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvY2hlY2tib3hfdmFsdWVfYWNjZXNzb3IudHMiXSwibmFtZXMiOlsiQ2hlY2tib3hDb250cm9sVmFsdWVBY2Nlc3NvciIsIkNoZWNrYm94Q29udHJvbFZhbHVlQWNjZXNzb3IuY29uc3RydWN0b3IiLCJDaGVja2JveENvbnRyb2xWYWx1ZUFjY2Vzc29yLndyaXRlVmFsdWUiLCJDaGVja2JveENvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25DaGFuZ2UiLCJDaGVja2JveENvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25Ub3VjaGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFRLFVBQVUsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlO09BRWxGLEVBQUMsaUJBQWlCLEVBQXVCLE1BQU0sMEJBQTBCO09BQ3pFLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO0FBRW5ELE1BQU0sdUJBQXVCLEdBQUcsVUFBVSxDQUFDLElBQUksUUFBUSxDQUNuRCxpQkFBaUIsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSw0QkFBNEIsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFcEc7Ozs7Ozs7R0FPRztBQUNIO0lBVUVBLFlBQW9CQSxTQUFtQkEsRUFBVUEsV0FBdUJBO1FBQXBEQyxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtRQUFVQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBWUE7UUFIeEVBLGFBQVFBLEdBQUdBLENBQUNBLENBQUNBLE9BQU1BLENBQUNBLENBQUNBO1FBQ3JCQSxjQUFTQSxHQUFHQSxRQUFPQSxDQUFDQSxDQUFDQTtJQUVzREEsQ0FBQ0E7SUFFNUVELFVBQVVBLENBQUNBLEtBQVVBO1FBQ25CRSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLFNBQVNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3hFQSxDQUFDQTtJQUNERixnQkFBZ0JBLENBQUNBLEVBQWtCQSxJQUFVRyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNsRUgsaUJBQWlCQSxDQUFDQSxFQUFZQSxJQUFVSSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNoRUosQ0FBQ0E7QUFqQkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQ0osdUdBQXVHO1FBQzNHLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxpQ0FBaUMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFDO1FBQzlFLFFBQVEsRUFBRSxDQUFDLHVCQUF1QixDQUFDO0tBQ3BDLENBQUM7O2lDQVlEO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgUmVuZGVyZXIsIEVsZW1lbnRSZWYsIFNlbGYsIGZvcndhcmRSZWYsIFByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmNvbnN0IENIRUNLQk9YX1ZBTFVFX0FDQ0VTU09SID0gQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoXG4gICAgTkdfVkFMVUVfQUNDRVNTT1IsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBDaGVja2JveENvbnRyb2xWYWx1ZUFjY2Vzc29yKSwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogVGhlIGFjY2Vzc29yIGZvciB3cml0aW5nIGEgdmFsdWUgYW5kIGxpc3RlbmluZyB0byBjaGFuZ2VzIG9uIGEgY2hlY2tib3ggaW5wdXQgZWxlbWVudC5cbiAqXG4gKiAgIyMjIEV4YW1wbGVcbiAqICBgYGBcbiAqICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmctY29udHJvbD1cInJlbWVtYmVyTG9naW5cIj5cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOlxuICAgICAgJ2lucHV0W3R5cGU9Y2hlY2tib3hdW25nLWNvbnRyb2xdLGlucHV0W3R5cGU9Y2hlY2tib3hdW25nLWZvcm0tY29udHJvbF0saW5wdXRbdHlwZT1jaGVja2JveF1bbmctbW9kZWxdJyxcbiAgaG9zdDogeycoY2hhbmdlKSc6ICdvbkNoYW5nZSgkZXZlbnQudGFyZ2V0LmNoZWNrZWQpJywgJyhibHVyKSc6ICdvblRvdWNoZWQoKSd9LFxuICBiaW5kaW5nczogW0NIRUNLQk9YX1ZBTFVFX0FDQ0VTU09SXVxufSlcbmV4cG9ydCBjbGFzcyBDaGVja2JveENvbnRyb2xWYWx1ZUFjY2Vzc29yIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xuICBvbkNoYW5nZSA9IChfKSA9PiB7fTtcbiAgb25Ub3VjaGVkID0gKCkgPT4ge307XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyLCBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7fVxuXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRQcm9wZXJ0eSh0aGlzLl9lbGVtZW50UmVmLCAnY2hlY2tlZCcsIHZhbHVlKTtcbiAgfVxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAoXzogYW55KSA9PiB7fSk6IHZvaWQgeyB0aGlzLm9uQ2hhbmdlID0gZm47IH1cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHt9KTogdm9pZCB7IHRoaXMub25Ub3VjaGVkID0gZm47IH1cbn1cbiJdfQ==