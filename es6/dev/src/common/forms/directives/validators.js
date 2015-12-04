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
import { forwardRef, Provider, Attribute, Directive } from 'angular2/core';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { Validators, NG_VALIDATORS } from '../validators';
import { NumberWrapper } from "angular2/src/facade/lang";
const REQUIRED_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useValue: Validators.required, multi: true }));
/**
 * A Directive that adds the `required` validator to any controls marked with the
 * `required` attribute, via the {@link NG_VALIDATORS} binding.
 *
 * ### Example
 *
 * ```
 * <input ng-control="fullName" required>
 * ```
 */
export let RequiredValidator = class {
};
RequiredValidator = __decorate([
    Directive({
        selector: '[required][ng-control],[required][ng-form-control],[required][ng-model]',
        providers: [REQUIRED_VALIDATOR]
    }), 
    __metadata('design:paramtypes', [])
], RequiredValidator);
const MIN_LENGTH_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useExisting: forwardRef(() => MinLengthValidator), multi: true }));
export let MinLengthValidator = class {
    constructor(minLength) {
        this._validator = Validators.minLength(NumberWrapper.parseInt(minLength, 10));
    }
    validate(c) { return this._validator(c); }
};
MinLengthValidator = __decorate([
    Directive({
        selector: '[minlength][ng-control],[minlength][ng-form-control],[minlength][ng-model]',
        providers: [MIN_LENGTH_VALIDATOR]
    }),
    __param(0, Attribute("minlength")), 
    __metadata('design:paramtypes', [String])
], MinLengthValidator);
const MAX_LENGTH_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useExisting: forwardRef(() => MaxLengthValidator), multi: true }));
export let MaxLengthValidator = class {
    constructor(minLength) {
        this._validator = Validators.maxLength(NumberWrapper.parseInt(minLength, 10));
    }
    validate(c) { return this._validator(c); }
};
MaxLengthValidator = __decorate([
    Directive({
        selector: '[maxlength][ng-control],[maxlength][ng-form-control],[maxlength][ng-model]',
        providers: [MAX_LENGTH_VALIDATOR]
    }),
    __param(0, Attribute("maxlength")), 
    __metadata('design:paramtypes', [String])
], MaxLengthValidator);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbIlJlcXVpcmVkVmFsaWRhdG9yIiwiTWluTGVuZ3RoVmFsaWRhdG9yIiwiTWluTGVuZ3RoVmFsaWRhdG9yLmNvbnN0cnVjdG9yIiwiTWluTGVuZ3RoVmFsaWRhdG9yLnZhbGlkYXRlIiwiTWF4TGVuZ3RoVmFsaWRhdG9yIiwiTWF4TGVuZ3RoVmFsaWRhdG9yLmNvbnN0cnVjdG9yIiwiTWF4TGVuZ3RoVmFsaWRhdG9yLnZhbGlkYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBZSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZTtPQUM5RSxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUM1QyxFQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUMsTUFBTSxlQUFlO09BR2hELEVBQUMsYUFBYSxFQUFDLE1BQU0sMEJBQTBCO0FBc0J0RCxNQUFNLGtCQUFrQixHQUNwQixVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUUxRjs7Ozs7Ozs7O0dBU0c7QUFDSDtBQUtBQSxDQUFDQTtBQUxEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLHlFQUF5RTtRQUNuRixTQUFTLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztLQUNoQyxDQUFDOztzQkFFRDtBQUVELE1BQU0sb0JBQW9CLEdBQUcsVUFBVSxDQUNuQyxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUUsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLE1BQU0sa0JBQWtCLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25HO0lBT0VDLFlBQW9DQSxTQUFpQkE7UUFDbkRDLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUVERCxRQUFRQSxDQUFDQSxDQUFVQSxJQUEwQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDM0VGLENBQUNBO0FBWkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsNEVBQTRFO1FBQ3RGLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDO0tBQ2xDLENBQUM7SUFJWSxXQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQTs7dUJBS3BDO0FBRUQsTUFBTSxvQkFBb0IsR0FBRyxVQUFVLENBQ25DLElBQUksUUFBUSxDQUFDLGFBQWEsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkc7SUFPRUcsWUFBb0NBLFNBQWlCQTtRQUNuREMsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0lBRURELFFBQVFBLENBQUNBLENBQVVBLElBQTBCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUMzRUYsQ0FBQ0E7QUFaRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSw0RUFBNEU7UUFDdEYsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUM7S0FDbEMsQ0FBQztJQUlZLFdBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFBOzt1QkFLcEM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Zm9yd2FyZFJlZiwgUHJvdmlkZXIsIE9wYXF1ZVRva2VuLCBBdHRyaWJ1dGUsIERpcmVjdGl2ZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1ZhbGlkYXRvcnMsIE5HX1ZBTElEQVRPUlN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHtDb250cm9sfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQgKiBhcyBtb2RlbE1vZHVsZSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge051bWJlcldyYXBwZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcblxuXG4vKipcbiAqIEFuIGludGVyZmFjZSB0aGF0IGNhbiBiZSBpbXBsZW1lbnRlZCBieSBjbGFzc2VzIHRoYXQgY2FuIGFjdCBhcyB2YWxpZGF0b3JzLlxuICpcbiAqICMjIFVzYWdlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW2N1c3RvbS12YWxpZGF0b3JdJyxcbiAqICAgcHJvdmlkZXJzOiBbcHJvdmlkZShOR19WQUxJREFUT1JTLCB7dXNlRXhpc3Rpbmc6IEN1c3RvbVZhbGlkYXRvckRpcmVjdGl2ZSwgbXVsdGk6IHRydWV9KV1cbiAqIH0pXG4gKiBjbGFzcyBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xuICogICB2YWxpZGF0ZShjOiBDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICogICAgIHJldHVybiB7XCJjdXN0b21cIjogdHJ1ZX07XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRvciB7IHZhbGlkYXRlKGM6IG1vZGVsTW9kdWxlLkNvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fTsgfVxuXG5jb25zdCBSRVFVSVJFRF9WQUxJREFUT1IgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKE5HX1ZBTElEQVRPUlMsIHt1c2VWYWx1ZTogVmFsaWRhdG9ycy5yZXF1aXJlZCwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogQSBEaXJlY3RpdmUgdGhhdCBhZGRzIHRoZSBgcmVxdWlyZWRgIHZhbGlkYXRvciB0byBhbnkgY29udHJvbHMgbWFya2VkIHdpdGggdGhlXG4gKiBgcmVxdWlyZWRgIGF0dHJpYnV0ZSwgdmlhIHRoZSB7QGxpbmsgTkdfVkFMSURBVE9SU30gYmluZGluZy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogPGlucHV0IG5nLWNvbnRyb2w9XCJmdWxsTmFtZVwiIHJlcXVpcmVkPlxuICogYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tyZXF1aXJlZF1bbmctY29udHJvbF0sW3JlcXVpcmVkXVtuZy1mb3JtLWNvbnRyb2xdLFtyZXF1aXJlZF1bbmctbW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbUkVRVUlSRURfVkFMSURBVE9SXVxufSlcbmV4cG9ydCBjbGFzcyBSZXF1aXJlZFZhbGlkYXRvciB7XG59XG5cbmNvbnN0IE1JTl9MRU5HVEhfVkFMSURBVE9SID0gQ09OU1RfRVhQUihcbiAgICBuZXcgUHJvdmlkZXIoTkdfVkFMSURBVE9SUywge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1pbkxlbmd0aFZhbGlkYXRvciksIG11bHRpOiB0cnVlfSkpO1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21pbmxlbmd0aF1bbmctY29udHJvbF0sW21pbmxlbmd0aF1bbmctZm9ybS1jb250cm9sXSxbbWlubGVuZ3RoXVtuZy1tb2RlbF0nLFxuICBwcm92aWRlcnM6IFtNSU5fTEVOR1RIX1ZBTElEQVRPUl1cbn0pXG5leHBvcnQgY2xhc3MgTWluTGVuZ3RoVmFsaWRhdG9yIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAgcHJpdmF0ZSBfdmFsaWRhdG9yOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihAQXR0cmlidXRlKFwibWlubGVuZ3RoXCIpIG1pbkxlbmd0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fdmFsaWRhdG9yID0gVmFsaWRhdG9ycy5taW5MZW5ndGgoTnVtYmVyV3JhcHBlci5wYXJzZUludChtaW5MZW5ndGgsIDEwKSk7XG4gIH1cblxuICB2YWxpZGF0ZShjOiBDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5fdmFsaWRhdG9yKGMpOyB9XG59XG5cbmNvbnN0IE1BWF9MRU5HVEhfVkFMSURBVE9SID0gQ09OU1RfRVhQUihcbiAgICBuZXcgUHJvdmlkZXIoTkdfVkFMSURBVE9SUywge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1heExlbmd0aFZhbGlkYXRvciksIG11bHRpOiB0cnVlfSkpO1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21heGxlbmd0aF1bbmctY29udHJvbF0sW21heGxlbmd0aF1bbmctZm9ybS1jb250cm9sXSxbbWF4bGVuZ3RoXVtuZy1tb2RlbF0nLFxuICBwcm92aWRlcnM6IFtNQVhfTEVOR1RIX1ZBTElEQVRPUl1cbn0pXG5leHBvcnQgY2xhc3MgTWF4TGVuZ3RoVmFsaWRhdG9yIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAgcHJpdmF0ZSBfdmFsaWRhdG9yOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihAQXR0cmlidXRlKFwibWF4bGVuZ3RoXCIpIG1pbkxlbmd0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fdmFsaWRhdG9yID0gVmFsaWRhdG9ycy5tYXhMZW5ndGgoTnVtYmVyV3JhcHBlci5wYXJzZUludChtaW5MZW5ndGgsIDEwKSk7XG4gIH1cblxuICB2YWxpZGF0ZShjOiBDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5fdmFsaWRhdG9yKGMpOyB9XG59XG4iXX0=