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
var DEFAULT_VALUE_ACCESSOR = lang_1.CONST_EXPR(new core_1.Provider(control_value_accessor_1.NG_VALUE_ACCESSOR, { useExisting: core_1.forwardRef(function () { return DefaultValueAccessor; }), multi: true }));
/**
 * The default accessor for writing a value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  <input type="text" ng-control="searchQuery">
 *  ```
 */
var DefaultValueAccessor = (function () {
    function DefaultValueAccessor(_renderer, _elementRef) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.onChange = function (_) { };
        this.onTouched = function () { };
    }
    DefaultValueAccessor.prototype.writeValue = function (value) {
        var normalizedValue = lang_1.isBlank(value) ? '' : value;
        this._renderer.setElementProperty(this._elementRef, 'value', normalizedValue);
    };
    DefaultValueAccessor.prototype.registerOnChange = function (fn) { this.onChange = fn; };
    DefaultValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    DefaultValueAccessor = __decorate([
        core_1.Directive({
            selector: 'input:not([type=checkbox])[ng-control],textarea[ng-control],input:not([type=checkbox])[ng-form-control],textarea[ng-form-control],input:not([type=checkbox])[ng-model],textarea[ng-model],[ng-default-control]',
            // TODO: vsavkin replace the above selector with the one below it once
            // https://github.com/angular/angular/issues/3011 is implemented
            // selector: '[ng-control],[ng-model],[ng-form-control]',
            host: { '(input)': 'onChange($event.target.value)', '(blur)': 'onTouched()' },
            bindings: [DEFAULT_VALUE_ACCESSOR]
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef])
    ], DefaultValueAccessor);
    return DefaultValueAccessor;
})();
exports.DefaultValueAccessor = DefaultValueAccessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdF92YWx1ZV9hY2Nlc3Nvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9kZWZhdWx0X3ZhbHVlX2FjY2Vzc29yLnRzIl0sIm5hbWVzIjpbIkRlZmF1bHRWYWx1ZUFjY2Vzc29yIiwiRGVmYXVsdFZhbHVlQWNjZXNzb3IuY29uc3RydWN0b3IiLCJEZWZhdWx0VmFsdWVBY2Nlc3Nvci53cml0ZVZhbHVlIiwiRGVmYXVsdFZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPbkNoYW5nZSIsIkRlZmF1bHRWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25Ub3VjaGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFCQUEwRSxlQUFlLENBQUMsQ0FBQTtBQUMxRix1Q0FBc0QsMEJBQTBCLENBQUMsQ0FBQTtBQUNqRixxQkFBa0MsMEJBQTBCLENBQUMsQ0FBQTtBQUU3RCxJQUFNLHNCQUFzQixHQUFHLGlCQUFVLENBQUMsSUFBSSxlQUFRLENBQ2xELDBDQUFpQixFQUFFLEVBQUMsV0FBVyxFQUFFLGlCQUFVLENBQUMsY0FBTSxPQUFBLG9CQUFvQixFQUFwQixDQUFvQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUU1Rjs7Ozs7Ozs7R0FRRztBQUNIO0lBYUVBLDhCQUFvQkEsU0FBbUJBLEVBQVVBLFdBQXVCQTtRQUFwREMsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7UUFBVUEsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO1FBSHhFQSxhQUFRQSxHQUFHQSxVQUFDQSxDQUFDQSxJQUFNQSxDQUFDQSxDQUFDQTtRQUNyQkEsY0FBU0EsR0FBR0EsY0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFFc0RBLENBQUNBO0lBRTVFRCx5Q0FBVUEsR0FBVkEsVUFBV0EsS0FBVUE7UUFDbkJFLElBQUlBLGVBQWVBLEdBQUdBLGNBQU9BLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2xEQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLE9BQU9BLEVBQUVBLGVBQWVBLENBQUNBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUVERiwrQ0FBZ0JBLEdBQWhCQSxVQUFpQkEsRUFBb0JBLElBQVVHLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ3BFSCxnREFBaUJBLEdBQWpCQSxVQUFrQkEsRUFBY0EsSUFBVUksSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFyQmxFSjtRQUFDQSxnQkFBU0EsQ0FBQ0E7WUFDVEEsUUFBUUEsRUFDSkEsZ05BQWdOQTtZQUNwTkEsc0VBQXNFQTtZQUN0RUEsZ0VBQWdFQTtZQUNoRUEseURBQXlEQTtZQUN6REEsSUFBSUEsRUFBRUEsRUFBQ0EsU0FBU0EsRUFBRUEsK0JBQStCQSxFQUFFQSxRQUFRQSxFQUFFQSxhQUFhQSxFQUFDQTtZQUMzRUEsUUFBUUEsRUFBRUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQTtTQUNuQ0EsQ0FBQ0E7OzZCQWNEQTtJQUFEQSwyQkFBQ0E7QUFBREEsQ0FBQ0EsQUF0QkQsSUFzQkM7QUFiWSw0QkFBb0IsdUJBYWhDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgUmVuZGVyZXIsIFNlbGYsIGZvcndhcmRSZWYsIFByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5jb25zdCBERUZBVUxUX1ZBTFVFX0FDQ0VTU09SID0gQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoXG4gICAgTkdfVkFMVUVfQUNDRVNTT1IsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBEZWZhdWx0VmFsdWVBY2Nlc3NvciksIG11bHRpOiB0cnVlfSkpO1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGFjY2Vzc29yIGZvciB3cml0aW5nIGEgdmFsdWUgYW5kIGxpc3RlbmluZyB0byBjaGFuZ2VzIHRoYXQgaXMgdXNlZCBieSB0aGVcbiAqIHtAbGluayBOZ01vZGVsfSwge0BsaW5rIE5nRm9ybUNvbnRyb2x9LCBhbmQge0BsaW5rIE5nQ29udHJvbE5hbWV9IGRpcmVjdGl2ZXMuXG4gKlxuICogICMjIyBFeGFtcGxlXG4gKiAgYGBgXG4gKiAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctY29udHJvbD1cInNlYXJjaFF1ZXJ5XCI+XG4gKiAgYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjpcbiAgICAgICdpbnB1dDpub3QoW3R5cGU9Y2hlY2tib3hdKVtuZy1jb250cm9sXSx0ZXh0YXJlYVtuZy1jb250cm9sXSxpbnB1dDpub3QoW3R5cGU9Y2hlY2tib3hdKVtuZy1mb3JtLWNvbnRyb2xdLHRleHRhcmVhW25nLWZvcm0tY29udHJvbF0saW5wdXQ6bm90KFt0eXBlPWNoZWNrYm94XSlbbmctbW9kZWxdLHRleHRhcmVhW25nLW1vZGVsXSxbbmctZGVmYXVsdC1jb250cm9sXScsXG4gIC8vIFRPRE86IHZzYXZraW4gcmVwbGFjZSB0aGUgYWJvdmUgc2VsZWN0b3Igd2l0aCB0aGUgb25lIGJlbG93IGl0IG9uY2VcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzAxMSBpcyBpbXBsZW1lbnRlZFxuICAvLyBzZWxlY3RvcjogJ1tuZy1jb250cm9sXSxbbmctbW9kZWxdLFtuZy1mb3JtLWNvbnRyb2xdJyxcbiAgaG9zdDogeycoaW5wdXQpJzogJ29uQ2hhbmdlKCRldmVudC50YXJnZXQudmFsdWUpJywgJyhibHVyKSc6ICdvblRvdWNoZWQoKSd9LFxuICBiaW5kaW5nczogW0RFRkFVTFRfVkFMVUVfQUNDRVNTT1JdXG59KVxuZXhwb3J0IGNsYXNzIERlZmF1bHRWYWx1ZUFjY2Vzc29yIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xuICBvbkNoYW5nZSA9IChfKSA9PiB7fTtcbiAgb25Ub3VjaGVkID0gKCkgPT4ge307XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyLCBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7fVxuXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHZhciBub3JtYWxpemVkVmFsdWUgPSBpc0JsYW5rKHZhbHVlKSA/ICcnIDogdmFsdWU7XG4gICAgdGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudFByb3BlcnR5KHRoaXMuX2VsZW1lbnRSZWYsICd2YWx1ZScsIG5vcm1hbGl6ZWRWYWx1ZSk7XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAoXzogYW55KSA9PiB2b2lkKTogdm9pZCB7IHRoaXMub25DaGFuZ2UgPSBmbjsgfVxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLm9uVG91Y2hlZCA9IGZuOyB9XG59XG4iXX0=