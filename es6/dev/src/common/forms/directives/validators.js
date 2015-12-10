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
    constructor(maxLength) {
        this._validator = Validators.maxLength(NumberWrapper.parseInt(maxLength, 10));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbIlJlcXVpcmVkVmFsaWRhdG9yIiwiTWluTGVuZ3RoVmFsaWRhdG9yIiwiTWluTGVuZ3RoVmFsaWRhdG9yLmNvbnN0cnVjdG9yIiwiTWluTGVuZ3RoVmFsaWRhdG9yLnZhbGlkYXRlIiwiTWF4TGVuZ3RoVmFsaWRhdG9yIiwiTWF4TGVuZ3RoVmFsaWRhdG9yLmNvbnN0cnVjdG9yIiwiTWF4TGVuZ3RoVmFsaWRhdG9yLnZhbGlkYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQWUsU0FBUyxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWU7T0FDOUUsRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDNUMsRUFBQyxVQUFVLEVBQUUsYUFBYSxFQUFDLE1BQU0sZUFBZTtPQUdoRCxFQUFDLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtBQXNCdEQsTUFBTSxrQkFBa0IsR0FDcEIsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDLGFBQWEsRUFBRSxFQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFMUY7Ozs7Ozs7OztHQVNHO0FBQ0g7QUFLQUEsQ0FBQ0E7QUFMRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSx5RUFBeUU7UUFDbkYsU0FBUyxFQUFFLENBQUMsa0JBQWtCLENBQUM7S0FDaEMsQ0FBQzs7c0JBRUQ7QUFFRCxNQUFNLG9CQUFvQixHQUFHLFVBQVUsQ0FDbkMsSUFBSSxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxNQUFNLGtCQUFrQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUNuRztJQU9FQyxZQUFvQ0EsU0FBaUJBO1FBQ25EQyxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFREQsUUFBUUEsQ0FBQ0EsQ0FBVUEsSUFBMEJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQzNFRixDQUFDQTtBQVpEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLDRFQUE0RTtRQUN0RixTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztLQUNsQyxDQUFDO0lBSVksV0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUE7O3VCQUtwQztBQUVELE1BQU0sb0JBQW9CLEdBQUcsVUFBVSxDQUNuQyxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUUsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLE1BQU0sa0JBQWtCLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25HO0lBT0VHLFlBQW9DQSxTQUFpQkE7UUFDbkRDLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUVERCxRQUFRQSxDQUFDQSxDQUFVQSxJQUEwQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDM0VGLENBQUNBO0FBWkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsNEVBQTRFO1FBQ3RGLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDO0tBQ2xDLENBQUM7SUFJWSxXQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQTs7dUJBS3BDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2ZvcndhcmRSZWYsIFByb3ZpZGVyLCBPcGFxdWVUb2tlbiwgQXR0cmlidXRlLCBEaXJlY3RpdmV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcbmltcG9ydCB7Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0ICogYXMgbW9kZWxNb2R1bGUgZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtOdW1iZXJXcmFwcGVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5cblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgdGhhdCBjYW4gYmUgaW1wbGVtZW50ZWQgYnkgY2xhc3NlcyB0aGF0IGNhbiBhY3QgYXMgdmFsaWRhdG9ycy5cbiAqXG4gKiAjIyBVc2FnZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tjdXN0b20tdmFsaWRhdG9yXScsXG4gKiAgIHByb3ZpZGVyczogW3Byb3ZpZGUoTkdfVkFMSURBVE9SUywge3VzZUV4aXN0aW5nOiBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUsIG11bHRpOiB0cnVlfSldXG4gKiB9KVxuICogY2xhc3MgQ3VzdG9tVmFsaWRhdG9yRGlyZWN0aXZlIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAqICAgdmFsaWRhdGUoYzogQ29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAqICAgICByZXR1cm4ge1wiY3VzdG9tXCI6IHRydWV9O1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0b3IgeyB2YWxpZGF0ZShjOiBtb2RlbE1vZHVsZS5Db250cm9sKToge1trZXk6IHN0cmluZ106IGFueX07IH1cblxuY29uc3QgUkVRVUlSRURfVkFMSURBVE9SID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihOR19WQUxJREFUT1JTLCB7dXNlVmFsdWU6IFZhbGlkYXRvcnMucmVxdWlyZWQsIG11bHRpOiB0cnVlfSkpO1xuXG4vKipcbiAqIEEgRGlyZWN0aXZlIHRoYXQgYWRkcyB0aGUgYHJlcXVpcmVkYCB2YWxpZGF0b3IgdG8gYW55IGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYHJlcXVpcmVkYCBhdHRyaWJ1dGUsIHZpYSB0aGUge0BsaW5rIE5HX1ZBTElEQVRPUlN9IGJpbmRpbmcuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIDxpbnB1dCBuZy1jb250cm9sPVwiZnVsbE5hbWVcIiByZXF1aXJlZD5cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcmVxdWlyZWRdW25nLWNvbnRyb2xdLFtyZXF1aXJlZF1bbmctZm9ybS1jb250cm9sXSxbcmVxdWlyZWRdW25nLW1vZGVsXScsXG4gIHByb3ZpZGVyczogW1JFUVVJUkVEX1ZBTElEQVRPUl1cbn0pXG5leHBvcnQgY2xhc3MgUmVxdWlyZWRWYWxpZGF0b3Ige1xufVxuXG5jb25zdCBNSU5fTEVOR1RIX1ZBTElEQVRPUiA9IENPTlNUX0VYUFIoXG4gICAgbmV3IFByb3ZpZGVyKE5HX1ZBTElEQVRPUlMsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNaW5MZW5ndGhWYWxpZGF0b3IpLCBtdWx0aTogdHJ1ZX0pKTtcbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttaW5sZW5ndGhdW25nLWNvbnRyb2xdLFttaW5sZW5ndGhdW25nLWZvcm0tY29udHJvbF0sW21pbmxlbmd0aF1bbmctbW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUlOX0xFTkdUSF9WQUxJREFUT1JdXG59KVxuZXhwb3J0IGNsYXNzIE1pbkxlbmd0aFZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciB7XG4gIHByaXZhdGUgX3ZhbGlkYXRvcjogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZShcIm1pbmxlbmd0aFwiKSBtaW5MZW5ndGg6IHN0cmluZykge1xuICAgIHRoaXMuX3ZhbGlkYXRvciA9IFZhbGlkYXRvcnMubWluTGVuZ3RoKE51bWJlcldyYXBwZXIucGFyc2VJbnQobWluTGVuZ3RoLCAxMCkpO1xuICB9XG5cbiAgdmFsaWRhdGUoYzogQ29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHsgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvcihjKTsgfVxufVxuXG5jb25zdCBNQVhfTEVOR1RIX1ZBTElEQVRPUiA9IENPTlNUX0VYUFIoXG4gICAgbmV3IFByb3ZpZGVyKE5HX1ZBTElEQVRPUlMsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXhMZW5ndGhWYWxpZGF0b3IpLCBtdWx0aTogdHJ1ZX0pKTtcbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXhsZW5ndGhdW25nLWNvbnRyb2xdLFttYXhsZW5ndGhdW25nLWZvcm0tY29udHJvbF0sW21heGxlbmd0aF1bbmctbW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUFYX0xFTkdUSF9WQUxJREFUT1JdXG59KVxuZXhwb3J0IGNsYXNzIE1heExlbmd0aFZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciB7XG4gIHByaXZhdGUgX3ZhbGlkYXRvcjogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZShcIm1heGxlbmd0aFwiKSBtYXhMZW5ndGg6IHN0cmluZykge1xuICAgIHRoaXMuX3ZhbGlkYXRvciA9IFZhbGlkYXRvcnMubWF4TGVuZ3RoKE51bWJlcldyYXBwZXIucGFyc2VJbnQobWF4TGVuZ3RoLCAxMCkpO1xuICB9XG5cbiAgdmFsaWRhdGUoYzogQ29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHsgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvcihjKTsgfVxufVxuIl19