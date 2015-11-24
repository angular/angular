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
import { isBlank, CONST_EXPR } from 'angular2/src/facade/lang';
const DEFAULT_VALUE_ACCESSOR = CONST_EXPR(new Provider(NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => DefaultValueAccessor), multi: true }));
/**
 * The default accessor for writing a value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  <input type="text" ng-control="searchQuery">
 *  ```
 */
export let DefaultValueAccessor = class {
    constructor(_renderer, _elementRef) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.onChange = (_) => { };
        this.onTouched = () => { };
    }
    writeValue(value) {
        var normalizedValue = isBlank(value) ? '' : value;
        this._renderer.setElementProperty(this._elementRef, 'value', normalizedValue);
    }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
};
DefaultValueAccessor = __decorate([
    Directive({
        selector: 'input:not([type=checkbox])[ng-control],textarea[ng-control],input:not([type=checkbox])[ng-form-control],textarea[ng-form-control],input:not([type=checkbox])[ng-model],textarea[ng-model],[ng-default-control]',
        // TODO: vsavkin replace the above selector with the one below it once
        // https://github.com/angular/angular/issues/3011 is implemented
        // selector: '[ng-control],[ng-model],[ng-form-control]',
        host: {
            '(change)': 'onChange($event.target.value)',
            '(input)': 'onChange($event.target.value)',
            '(blur)': 'onTouched()'
        },
        bindings: [DEFAULT_VALUE_ACCESSOR]
    }), 
    __metadata('design:paramtypes', [Renderer, ElementRef])
], DefaultValueAccessor);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdF92YWx1ZV9hY2Nlc3Nvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9kZWZhdWx0X3ZhbHVlX2FjY2Vzc29yLnRzIl0sIm5hbWVzIjpbIkRlZmF1bHRWYWx1ZUFjY2Vzc29yIiwiRGVmYXVsdFZhbHVlQWNjZXNzb3IuY29uc3RydWN0b3IiLCJEZWZhdWx0VmFsdWVBY2Nlc3Nvci53cml0ZVZhbHVlIiwiRGVmYXVsdFZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPbkNoYW5nZSIsIkRlZmF1bHRWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25Ub3VjaGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQVEsVUFBVSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWU7T0FDbEYsRUFBQyxpQkFBaUIsRUFBdUIsTUFBTSwwQkFBMEI7T0FDekUsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO0FBRTVELE1BQU0sc0JBQXNCLEdBQUcsVUFBVSxDQUFDLElBQUksUUFBUSxDQUNsRCxpQkFBaUIsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSxvQkFBb0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFNUY7Ozs7Ozs7O0dBUUc7QUFDSDtJQWlCRUEsWUFBb0JBLFNBQW1CQSxFQUFVQSxXQUF1QkE7UUFBcERDLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBQVVBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFZQTtRQUh4RUEsYUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsT0FBTUEsQ0FBQ0EsQ0FBQ0E7UUFDckJBLGNBQVNBLEdBQUdBLFFBQU9BLENBQUNBLENBQUNBO0lBRXNEQSxDQUFDQTtJQUU1RUQsVUFBVUEsQ0FBQ0EsS0FBVUE7UUFDbkJFLElBQUlBLGVBQWVBLEdBQUdBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2xEQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLE9BQU9BLEVBQUVBLGVBQWVBLENBQUNBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUVERixnQkFBZ0JBLENBQUNBLEVBQW9CQSxJQUFVRyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNwRUgsaUJBQWlCQSxDQUFDQSxFQUFjQSxJQUFVSSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNsRUosQ0FBQ0E7QUExQkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQ0osZ05BQWdOO1FBQ3BOLHNFQUFzRTtRQUN0RSxnRUFBZ0U7UUFDaEUseURBQXlEO1FBQ3pELElBQUksRUFBRTtZQUNKLFVBQVUsRUFBRSwrQkFBK0I7WUFDM0MsU0FBUyxFQUFFLCtCQUErQjtZQUMxQyxRQUFRLEVBQUUsYUFBYTtTQUN4QjtRQUNELFFBQVEsRUFBRSxDQUFDLHNCQUFzQixDQUFDO0tBQ25DLENBQUM7O3lCQWNEO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgUmVuZGVyZXIsIFNlbGYsIGZvcndhcmRSZWYsIFByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5jb25zdCBERUZBVUxUX1ZBTFVFX0FDQ0VTU09SID0gQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoXG4gICAgTkdfVkFMVUVfQUNDRVNTT1IsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBEZWZhdWx0VmFsdWVBY2Nlc3NvciksIG11bHRpOiB0cnVlfSkpO1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGFjY2Vzc29yIGZvciB3cml0aW5nIGEgdmFsdWUgYW5kIGxpc3RlbmluZyB0byBjaGFuZ2VzIHRoYXQgaXMgdXNlZCBieSB0aGVcbiAqIHtAbGluayBOZ01vZGVsfSwge0BsaW5rIE5nRm9ybUNvbnRyb2x9LCBhbmQge0BsaW5rIE5nQ29udHJvbE5hbWV9IGRpcmVjdGl2ZXMuXG4gKlxuICogICMjIyBFeGFtcGxlXG4gKiAgYGBgXG4gKiAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctY29udHJvbD1cInNlYXJjaFF1ZXJ5XCI+XG4gKiAgYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjpcbiAgICAgICdpbnB1dDpub3QoW3R5cGU9Y2hlY2tib3hdKVtuZy1jb250cm9sXSx0ZXh0YXJlYVtuZy1jb250cm9sXSxpbnB1dDpub3QoW3R5cGU9Y2hlY2tib3hdKVtuZy1mb3JtLWNvbnRyb2xdLHRleHRhcmVhW25nLWZvcm0tY29udHJvbF0saW5wdXQ6bm90KFt0eXBlPWNoZWNrYm94XSlbbmctbW9kZWxdLHRleHRhcmVhW25nLW1vZGVsXSxbbmctZGVmYXVsdC1jb250cm9sXScsXG4gIC8vIFRPRE86IHZzYXZraW4gcmVwbGFjZSB0aGUgYWJvdmUgc2VsZWN0b3Igd2l0aCB0aGUgb25lIGJlbG93IGl0IG9uY2VcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzAxMSBpcyBpbXBsZW1lbnRlZFxuICAvLyBzZWxlY3RvcjogJ1tuZy1jb250cm9sXSxbbmctbW9kZWxdLFtuZy1mb3JtLWNvbnRyb2xdJyxcbiAgaG9zdDoge1xuICAgICcoY2hhbmdlKSc6ICdvbkNoYW5nZSgkZXZlbnQudGFyZ2V0LnZhbHVlKScsXG4gICAgJyhpbnB1dCknOiAnb25DaGFuZ2UoJGV2ZW50LnRhcmdldC52YWx1ZSknLFxuICAgICcoYmx1ciknOiAnb25Ub3VjaGVkKCknXG4gIH0sXG4gIGJpbmRpbmdzOiBbREVGQVVMVF9WQUxVRV9BQ0NFU1NPUl1cbn0pXG5leHBvcnQgY2xhc3MgRGVmYXVsdFZhbHVlQWNjZXNzb3IgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciB7XG4gIG9uQ2hhbmdlID0gKF8pID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHt9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdmFyIG5vcm1hbGl6ZWRWYWx1ZSA9IGlzQmxhbmsodmFsdWUpID8gJycgOiB2YWx1ZTtcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkodGhpcy5fZWxlbWVudFJlZiwgJ3ZhbHVlJywgbm9ybWFsaXplZFZhbHVlKTtcbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IChfOiBhbnkpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5vbkNoYW5nZSA9IGZuOyB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMub25Ub3VjaGVkID0gZm47IH1cbn0iXX0=