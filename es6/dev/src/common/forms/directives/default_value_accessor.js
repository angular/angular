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
        host: { '(input)': 'onChange($event.target.value)', '(blur)': 'onTouched()' },
        bindings: [DEFAULT_VALUE_ACCESSOR]
    }), 
    __metadata('design:paramtypes', [Renderer, ElementRef])
], DefaultValueAccessor);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdF92YWx1ZV9hY2Nlc3Nvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9kZWZhdWx0X3ZhbHVlX2FjY2Vzc29yLnRzIl0sIm5hbWVzIjpbIkRlZmF1bHRWYWx1ZUFjY2Vzc29yIiwiRGVmYXVsdFZhbHVlQWNjZXNzb3IuY29uc3RydWN0b3IiLCJEZWZhdWx0VmFsdWVBY2Nlc3Nvci53cml0ZVZhbHVlIiwiRGVmYXVsdFZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPbkNoYW5nZSIsIkRlZmF1bHRWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25Ub3VjaGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQVEsVUFBVSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWU7T0FDbEYsRUFBQyxpQkFBaUIsRUFBdUIsTUFBTSwwQkFBMEI7T0FDekUsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO0FBRTVELE1BQU0sc0JBQXNCLEdBQUcsVUFBVSxDQUFDLElBQUksUUFBUSxDQUNsRCxpQkFBaUIsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSxvQkFBb0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFNUY7Ozs7Ozs7O0dBUUc7QUFDSDtJQWFFQSxZQUFvQkEsU0FBbUJBLEVBQVVBLFdBQXVCQTtRQUFwREMsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7UUFBVUEsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO1FBSHhFQSxhQUFRQSxHQUFHQSxDQUFDQSxDQUFDQSxPQUFNQSxDQUFDQSxDQUFDQTtRQUNyQkEsY0FBU0EsR0FBR0EsUUFBT0EsQ0FBQ0EsQ0FBQ0E7SUFFc0RBLENBQUNBO0lBRTVFRCxVQUFVQSxDQUFDQSxLQUFVQTtRQUNuQkUsSUFBSUEsZUFBZUEsR0FBR0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDbERBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsT0FBT0EsRUFBRUEsZUFBZUEsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0lBRURGLGdCQUFnQkEsQ0FBQ0EsRUFBb0JBLElBQVVHLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ3BFSCxpQkFBaUJBLENBQUNBLEVBQWNBLElBQVVJLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQ2xFSixDQUFDQTtBQXRCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFDSixnTkFBZ047UUFDcE4sc0VBQXNFO1FBQ3RFLGdFQUFnRTtRQUNoRSx5REFBeUQ7UUFDekQsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLCtCQUErQixFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUM7UUFDM0UsUUFBUSxFQUFFLENBQUMsc0JBQXNCLENBQUM7S0FDbkMsQ0FBQzs7eUJBY0Q7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBSZW5kZXJlciwgU2VsZiwgZm9yd2FyZFJlZiwgUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge2lzQmxhbmssIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmNvbnN0IERFRkFVTFRfVkFMVUVfQUNDRVNTT1IgPSBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihcbiAgICBOR19WQUxVRV9BQ0NFU1NPUiwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IERlZmF1bHRWYWx1ZUFjY2Vzc29yKSwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgYWNjZXNzb3IgZm9yIHdyaXRpbmcgYSB2YWx1ZSBhbmQgbGlzdGVuaW5nIHRvIGNoYW5nZXMgdGhhdCBpcyB1c2VkIGJ5IHRoZVxuICoge0BsaW5rIE5nTW9kZWx9LCB7QGxpbmsgTmdGb3JtQ29udHJvbH0sIGFuZCB7QGxpbmsgTmdDb250cm9sTmFtZX0gZGlyZWN0aXZlcy5cbiAqXG4gKiAgIyMjIEV4YW1wbGVcbiAqICBgYGBcbiAqICA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1jb250cm9sPVwic2VhcmNoUXVlcnlcIj5cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOlxuICAgICAgJ2lucHV0Om5vdChbdHlwZT1jaGVja2JveF0pW25nLWNvbnRyb2xdLHRleHRhcmVhW25nLWNvbnRyb2xdLGlucHV0Om5vdChbdHlwZT1jaGVja2JveF0pW25nLWZvcm0tY29udHJvbF0sdGV4dGFyZWFbbmctZm9ybS1jb250cm9sXSxpbnB1dDpub3QoW3R5cGU9Y2hlY2tib3hdKVtuZy1tb2RlbF0sdGV4dGFyZWFbbmctbW9kZWxdLFtuZy1kZWZhdWx0LWNvbnRyb2xdJyxcbiAgLy8gVE9ETzogdnNhdmtpbiByZXBsYWNlIHRoZSBhYm92ZSBzZWxlY3RvciB3aXRoIHRoZSBvbmUgYmVsb3cgaXQgb25jZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8zMDExIGlzIGltcGxlbWVudGVkXG4gIC8vIHNlbGVjdG9yOiAnW25nLWNvbnRyb2xdLFtuZy1tb2RlbF0sW25nLWZvcm0tY29udHJvbF0nLFxuICBob3N0OiB7JyhpbnB1dCknOiAnb25DaGFuZ2UoJGV2ZW50LnRhcmdldC52YWx1ZSknLCAnKGJsdXIpJzogJ29uVG91Y2hlZCgpJ30sXG4gIGJpbmRpbmdzOiBbREVGQVVMVF9WQUxVRV9BQ0NFU1NPUl1cbn0pXG5leHBvcnQgY2xhc3MgRGVmYXVsdFZhbHVlQWNjZXNzb3IgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciB7XG4gIG9uQ2hhbmdlID0gKF8pID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHt9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdmFyIG5vcm1hbGl6ZWRWYWx1ZSA9IGlzQmxhbmsodmFsdWUpID8gJycgOiB2YWx1ZTtcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkodGhpcy5fZWxlbWVudFJlZiwgJ3ZhbHVlJywgbm9ybWFsaXplZFZhbHVlKTtcbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IChfOiBhbnkpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5vbkNoYW5nZSA9IGZuOyB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMub25Ub3VjaGVkID0gZm47IH1cbn1cbiJdfQ==