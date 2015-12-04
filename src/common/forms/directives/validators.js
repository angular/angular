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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var validators_1 = require('../validators');
var lang_2 = require("angular2/src/facade/lang");
var REQUIRED_VALIDATOR = lang_1.CONST_EXPR(new core_1.Provider(validators_1.NG_VALIDATORS, { useValue: validators_1.Validators.required, multi: true }));
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
var RequiredValidator = (function () {
    function RequiredValidator() {
    }
    RequiredValidator = __decorate([
        core_1.Directive({
            selector: '[required][ng-control],[required][ng-form-control],[required][ng-model]',
            providers: [REQUIRED_VALIDATOR]
        }), 
        __metadata('design:paramtypes', [])
    ], RequiredValidator);
    return RequiredValidator;
})();
exports.RequiredValidator = RequiredValidator;
var MIN_LENGTH_VALIDATOR = lang_1.CONST_EXPR(new core_1.Provider(validators_1.NG_VALIDATORS, { useExisting: core_1.forwardRef(function () { return MinLengthValidator; }), multi: true }));
var MinLengthValidator = (function () {
    function MinLengthValidator(minLength) {
        this._validator = validators_1.Validators.minLength(lang_2.NumberWrapper.parseInt(minLength, 10));
    }
    MinLengthValidator.prototype.validate = function (c) { return this._validator(c); };
    MinLengthValidator = __decorate([
        core_1.Directive({
            selector: '[minlength][ng-control],[minlength][ng-form-control],[minlength][ng-model]',
            providers: [MIN_LENGTH_VALIDATOR]
        }),
        __param(0, core_1.Attribute("minlength")), 
        __metadata('design:paramtypes', [String])
    ], MinLengthValidator);
    return MinLengthValidator;
})();
exports.MinLengthValidator = MinLengthValidator;
var MAX_LENGTH_VALIDATOR = lang_1.CONST_EXPR(new core_1.Provider(validators_1.NG_VALIDATORS, { useExisting: core_1.forwardRef(function () { return MaxLengthValidator; }), multi: true }));
var MaxLengthValidator = (function () {
    function MaxLengthValidator(maxLength) {
        this._validator = validators_1.Validators.maxLength(lang_2.NumberWrapper.parseInt(maxLength, 10));
    }
    MaxLengthValidator.prototype.validate = function (c) { return this._validator(c); };
    MaxLengthValidator = __decorate([
        core_1.Directive({
            selector: '[maxlength][ng-control],[maxlength][ng-form-control],[maxlength][ng-model]',
            providers: [MAX_LENGTH_VALIDATOR]
        }),
        __param(0, core_1.Attribute("maxlength")), 
        __metadata('design:paramtypes', [String])
    ], MaxLengthValidator);
    return MaxLengthValidator;
})();
exports.MaxLengthValidator = MaxLengthValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbIlJlcXVpcmVkVmFsaWRhdG9yIiwiUmVxdWlyZWRWYWxpZGF0b3IuY29uc3RydWN0b3IiLCJNaW5MZW5ndGhWYWxpZGF0b3IiLCJNaW5MZW5ndGhWYWxpZGF0b3IuY29uc3RydWN0b3IiLCJNaW5MZW5ndGhWYWxpZGF0b3IudmFsaWRhdGUiLCJNYXhMZW5ndGhWYWxpZGF0b3IiLCJNYXhMZW5ndGhWYWxpZGF0b3IuY29uc3RydWN0b3IiLCJNYXhMZW5ndGhWYWxpZGF0b3IudmFsaWRhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBQXNFLGVBQWUsQ0FBQyxDQUFBO0FBQ3RGLHFCQUF5QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3BELDJCQUF3QyxlQUFlLENBQUMsQ0FBQTtBQUd4RCxxQkFBNEIsMEJBQTBCLENBQUMsQ0FBQTtBQXNCdkQsSUFBTSxrQkFBa0IsR0FDcEIsaUJBQVUsQ0FBQyxJQUFJLGVBQVEsQ0FBQywwQkFBYSxFQUFFLEVBQUMsUUFBUSxFQUFFLHVCQUFVLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFMUY7Ozs7Ozs7OztHQVNHO0FBQ0g7SUFBQUE7SUFLQUMsQ0FBQ0E7SUFMREQ7UUFBQ0EsZ0JBQVNBLENBQUNBO1lBQ1RBLFFBQVFBLEVBQUVBLHlFQUF5RUE7WUFDbkZBLFNBQVNBLEVBQUVBLENBQUNBLGtCQUFrQkEsQ0FBQ0E7U0FDaENBLENBQUNBOzswQkFFREE7SUFBREEsd0JBQUNBO0FBQURBLENBQUNBLEFBTEQsSUFLQztBQURZLHlCQUFpQixvQkFDN0IsQ0FBQTtBQUVELElBQU0sb0JBQW9CLEdBQUcsaUJBQVUsQ0FDbkMsSUFBSSxlQUFRLENBQUMsMEJBQWEsRUFBRSxFQUFDLFdBQVcsRUFBRSxpQkFBVSxDQUFDLGNBQU0sT0FBQSxrQkFBa0IsRUFBbEIsQ0FBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkc7SUFPRUUsNEJBQW9DQSxTQUFpQkE7UUFDbkRDLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLHVCQUFVQSxDQUFDQSxTQUFTQSxDQUFDQSxvQkFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0lBRURELHFDQUFRQSxHQUFSQSxVQUFTQSxDQUFVQSxJQUEwQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFYM0VGO1FBQUNBLGdCQUFTQSxDQUFDQTtZQUNUQSxRQUFRQSxFQUFFQSw0RUFBNEVBO1lBQ3RGQSxTQUFTQSxFQUFFQSxDQUFDQSxvQkFBb0JBLENBQUNBO1NBQ2xDQSxDQUFDQTtRQUlZQSxXQUFDQSxnQkFBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQUE7OzJCQUtwQ0E7SUFBREEseUJBQUNBO0FBQURBLENBQUNBLEFBWkQsSUFZQztBQVJZLDBCQUFrQixxQkFROUIsQ0FBQTtBQUVELElBQU0sb0JBQW9CLEdBQUcsaUJBQVUsQ0FDbkMsSUFBSSxlQUFRLENBQUMsMEJBQWEsRUFBRSxFQUFDLFdBQVcsRUFBRSxpQkFBVSxDQUFDLGNBQU0sT0FBQSxrQkFBa0IsRUFBbEIsQ0FBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkc7SUFPRUcsNEJBQW9DQSxTQUFpQkE7UUFDbkRDLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLHVCQUFVQSxDQUFDQSxTQUFTQSxDQUFDQSxvQkFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0lBRURELHFDQUFRQSxHQUFSQSxVQUFTQSxDQUFVQSxJQUEwQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFYM0VGO1FBQUNBLGdCQUFTQSxDQUFDQTtZQUNUQSxRQUFRQSxFQUFFQSw0RUFBNEVBO1lBQ3RGQSxTQUFTQSxFQUFFQSxDQUFDQSxvQkFBb0JBLENBQUNBO1NBQ2xDQSxDQUFDQTtRQUlZQSxXQUFDQSxnQkFBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQUE7OzJCQUtwQ0E7SUFBREEseUJBQUNBO0FBQURBLENBQUNBLEFBWkQsSUFZQztBQVJZLDBCQUFrQixxQkFROUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Zm9yd2FyZFJlZiwgUHJvdmlkZXIsIE9wYXF1ZVRva2VuLCBBdHRyaWJ1dGUsIERpcmVjdGl2ZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1ZhbGlkYXRvcnMsIE5HX1ZBTElEQVRPUlN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHtDb250cm9sfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQgKiBhcyBtb2RlbE1vZHVsZSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge051bWJlcldyYXBwZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcblxuXG4vKipcbiAqIEFuIGludGVyZmFjZSB0aGF0IGNhbiBiZSBpbXBsZW1lbnRlZCBieSBjbGFzc2VzIHRoYXQgY2FuIGFjdCBhcyB2YWxpZGF0b3JzLlxuICpcbiAqICMjIFVzYWdlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW2N1c3RvbS12YWxpZGF0b3JdJyxcbiAqICAgcHJvdmlkZXJzOiBbcHJvdmlkZShOR19WQUxJREFUT1JTLCB7dXNlRXhpc3Rpbmc6IEN1c3RvbVZhbGlkYXRvckRpcmVjdGl2ZSwgbXVsdGk6IHRydWV9KV1cbiAqIH0pXG4gKiBjbGFzcyBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xuICogICB2YWxpZGF0ZShjOiBDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICogICAgIHJldHVybiB7XCJjdXN0b21cIjogdHJ1ZX07XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRvciB7IHZhbGlkYXRlKGM6IG1vZGVsTW9kdWxlLkNvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fTsgfVxuXG5jb25zdCBSRVFVSVJFRF9WQUxJREFUT1IgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKE5HX1ZBTElEQVRPUlMsIHt1c2VWYWx1ZTogVmFsaWRhdG9ycy5yZXF1aXJlZCwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogQSBEaXJlY3RpdmUgdGhhdCBhZGRzIHRoZSBgcmVxdWlyZWRgIHZhbGlkYXRvciB0byBhbnkgY29udHJvbHMgbWFya2VkIHdpdGggdGhlXG4gKiBgcmVxdWlyZWRgIGF0dHJpYnV0ZSwgdmlhIHRoZSB7QGxpbmsgTkdfVkFMSURBVE9SU30gYmluZGluZy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogPGlucHV0IG5nLWNvbnRyb2w9XCJmdWxsTmFtZVwiIHJlcXVpcmVkPlxuICogYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tyZXF1aXJlZF1bbmctY29udHJvbF0sW3JlcXVpcmVkXVtuZy1mb3JtLWNvbnRyb2xdLFtyZXF1aXJlZF1bbmctbW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbUkVRVUlSRURfVkFMSURBVE9SXVxufSlcbmV4cG9ydCBjbGFzcyBSZXF1aXJlZFZhbGlkYXRvciB7XG59XG5cbmNvbnN0IE1JTl9MRU5HVEhfVkFMSURBVE9SID0gQ09OU1RfRVhQUihcbiAgICBuZXcgUHJvdmlkZXIoTkdfVkFMSURBVE9SUywge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1pbkxlbmd0aFZhbGlkYXRvciksIG11bHRpOiB0cnVlfSkpO1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21pbmxlbmd0aF1bbmctY29udHJvbF0sW21pbmxlbmd0aF1bbmctZm9ybS1jb250cm9sXSxbbWlubGVuZ3RoXVtuZy1tb2RlbF0nLFxuICBwcm92aWRlcnM6IFtNSU5fTEVOR1RIX1ZBTElEQVRPUl1cbn0pXG5leHBvcnQgY2xhc3MgTWluTGVuZ3RoVmFsaWRhdG9yIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAgcHJpdmF0ZSBfdmFsaWRhdG9yOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihAQXR0cmlidXRlKFwibWlubGVuZ3RoXCIpIG1pbkxlbmd0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fdmFsaWRhdG9yID0gVmFsaWRhdG9ycy5taW5MZW5ndGgoTnVtYmVyV3JhcHBlci5wYXJzZUludChtaW5MZW5ndGgsIDEwKSk7XG4gIH1cblxuICB2YWxpZGF0ZShjOiBDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5fdmFsaWRhdG9yKGMpOyB9XG59XG5cbmNvbnN0IE1BWF9MRU5HVEhfVkFMSURBVE9SID0gQ09OU1RfRVhQUihcbiAgICBuZXcgUHJvdmlkZXIoTkdfVkFMSURBVE9SUywge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1heExlbmd0aFZhbGlkYXRvciksIG11bHRpOiB0cnVlfSkpO1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21heGxlbmd0aF1bbmctY29udHJvbF0sW21heGxlbmd0aF1bbmctZm9ybS1jb250cm9sXSxbbWF4bGVuZ3RoXVtuZy1tb2RlbF0nLFxuICBwcm92aWRlcnM6IFtNQVhfTEVOR1RIX1ZBTElEQVRPUl1cbn0pXG5leHBvcnQgY2xhc3MgTWF4TGVuZ3RoVmFsaWRhdG9yIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAgcHJpdmF0ZSBfdmFsaWRhdG9yOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihAQXR0cmlidXRlKFwibWF4bGVuZ3RoXCIpIG1heExlbmd0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fdmFsaWRhdG9yID0gVmFsaWRhdG9ycy5tYXhMZW5ndGgoTnVtYmVyV3JhcHBlci5wYXJzZUludChtYXhMZW5ndGgsIDEwKSk7XG4gIH1cblxuICB2YWxpZGF0ZShjOiBDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5fdmFsaWRhdG9yKGMpOyB9XG59XG4iXX0=