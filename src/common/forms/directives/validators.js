'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbIlJlcXVpcmVkVmFsaWRhdG9yIiwiUmVxdWlyZWRWYWxpZGF0b3IuY29uc3RydWN0b3IiLCJNaW5MZW5ndGhWYWxpZGF0b3IiLCJNaW5MZW5ndGhWYWxpZGF0b3IuY29uc3RydWN0b3IiLCJNaW5MZW5ndGhWYWxpZGF0b3IudmFsaWRhdGUiLCJNYXhMZW5ndGhWYWxpZGF0b3IiLCJNYXhMZW5ndGhWYWxpZGF0b3IuY29uc3RydWN0b3IiLCJNYXhMZW5ndGhWYWxpZGF0b3IudmFsaWRhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFCQUFzRSxlQUFlLENBQUMsQ0FBQTtBQUN0RixxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRCwyQkFBd0MsZUFBZSxDQUFDLENBQUE7QUFHeEQscUJBQTRCLDBCQUEwQixDQUFDLENBQUE7QUFzQnZELElBQU0sa0JBQWtCLEdBQ3BCLGlCQUFVLENBQUMsSUFBSSxlQUFRLENBQUMsMEJBQWEsRUFBRSxFQUFDLFFBQVEsRUFBRSx1QkFBVSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBRTFGOzs7Ozs7Ozs7R0FTRztBQUNIO0lBQUFBO0lBS0FDLENBQUNBO0lBTEREO1FBQUNBLGdCQUFTQSxDQUFDQTtZQUNUQSxRQUFRQSxFQUFFQSx5RUFBeUVBO1lBQ25GQSxTQUFTQSxFQUFFQSxDQUFDQSxrQkFBa0JBLENBQUNBO1NBQ2hDQSxDQUFDQTs7MEJBRURBO0lBQURBLHdCQUFDQTtBQUFEQSxDQUFDQSxBQUxELElBS0M7QUFEWSx5QkFBaUIsb0JBQzdCLENBQUE7QUFFRCxJQUFNLG9CQUFvQixHQUFHLGlCQUFVLENBQ25DLElBQUksZUFBUSxDQUFDLDBCQUFhLEVBQUUsRUFBQyxXQUFXLEVBQUUsaUJBQVUsQ0FBQyxjQUFNLE9BQUEsa0JBQWtCLEVBQWxCLENBQWtCLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25HO0lBT0VFLDRCQUFvQ0EsU0FBaUJBO1FBQ25EQyxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSx1QkFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0Esb0JBQWFBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUVERCxxQ0FBUUEsR0FBUkEsVUFBU0EsQ0FBVUEsSUFBMEJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBWDNFRjtRQUFDQSxnQkFBU0EsQ0FBQ0E7WUFDVEEsUUFBUUEsRUFBRUEsNEVBQTRFQTtZQUN0RkEsU0FBU0EsRUFBRUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQTtTQUNsQ0EsQ0FBQ0E7UUFJWUEsV0FBQ0EsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLENBQUFBOzsyQkFLcENBO0lBQURBLHlCQUFDQTtBQUFEQSxDQUFDQSxBQVpELElBWUM7QUFSWSwwQkFBa0IscUJBUTlCLENBQUE7QUFFRCxJQUFNLG9CQUFvQixHQUFHLGlCQUFVLENBQ25DLElBQUksZUFBUSxDQUFDLDBCQUFhLEVBQUUsRUFBQyxXQUFXLEVBQUUsaUJBQVUsQ0FBQyxjQUFNLE9BQUEsa0JBQWtCLEVBQWxCLENBQWtCLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25HO0lBT0VHLDRCQUFvQ0EsU0FBaUJBO1FBQ25EQyxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSx1QkFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0Esb0JBQWFBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUVERCxxQ0FBUUEsR0FBUkEsVUFBU0EsQ0FBVUEsSUFBMEJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBWDNFRjtRQUFDQSxnQkFBU0EsQ0FBQ0E7WUFDVEEsUUFBUUEsRUFBRUEsNEVBQTRFQTtZQUN0RkEsU0FBU0EsRUFBRUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQTtTQUNsQ0EsQ0FBQ0E7UUFJWUEsV0FBQ0EsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLENBQUFBOzsyQkFLcENBO0lBQURBLHlCQUFDQTtBQUFEQSxDQUFDQSxBQVpELElBWUM7QUFSWSwwQkFBa0IscUJBUTlCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2ZvcndhcmRSZWYsIFByb3ZpZGVyLCBPcGFxdWVUb2tlbiwgQXR0cmlidXRlLCBEaXJlY3RpdmV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcbmltcG9ydCB7Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0ICogYXMgbW9kZWxNb2R1bGUgZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtOdW1iZXJXcmFwcGVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5cblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgdGhhdCBjYW4gYmUgaW1wbGVtZW50ZWQgYnkgY2xhc3NlcyB0aGF0IGNhbiBhY3QgYXMgdmFsaWRhdG9ycy5cbiAqXG4gKiAjIyBVc2FnZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tjdXN0b20tdmFsaWRhdG9yXScsXG4gKiAgIHByb3ZpZGVyczogW3Byb3ZpZGUoTkdfVkFMSURBVE9SUywge3VzZUV4aXN0aW5nOiBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUsIG11bHRpOiB0cnVlfSldXG4gKiB9KVxuICogY2xhc3MgQ3VzdG9tVmFsaWRhdG9yRGlyZWN0aXZlIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAqICAgdmFsaWRhdGUoYzogQ29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAqICAgICByZXR1cm4ge1wiY3VzdG9tXCI6IHRydWV9O1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0b3IgeyB2YWxpZGF0ZShjOiBtb2RlbE1vZHVsZS5Db250cm9sKToge1trZXk6IHN0cmluZ106IGFueX07IH1cblxuY29uc3QgUkVRVUlSRURfVkFMSURBVE9SID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihOR19WQUxJREFUT1JTLCB7dXNlVmFsdWU6IFZhbGlkYXRvcnMucmVxdWlyZWQsIG11bHRpOiB0cnVlfSkpO1xuXG4vKipcbiAqIEEgRGlyZWN0aXZlIHRoYXQgYWRkcyB0aGUgYHJlcXVpcmVkYCB2YWxpZGF0b3IgdG8gYW55IGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYHJlcXVpcmVkYCBhdHRyaWJ1dGUsIHZpYSB0aGUge0BsaW5rIE5HX1ZBTElEQVRPUlN9IGJpbmRpbmcuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIDxpbnB1dCBuZy1jb250cm9sPVwiZnVsbE5hbWVcIiByZXF1aXJlZD5cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcmVxdWlyZWRdW25nLWNvbnRyb2xdLFtyZXF1aXJlZF1bbmctZm9ybS1jb250cm9sXSxbcmVxdWlyZWRdW25nLW1vZGVsXScsXG4gIHByb3ZpZGVyczogW1JFUVVJUkVEX1ZBTElEQVRPUl1cbn0pXG5leHBvcnQgY2xhc3MgUmVxdWlyZWRWYWxpZGF0b3Ige1xufVxuXG5jb25zdCBNSU5fTEVOR1RIX1ZBTElEQVRPUiA9IENPTlNUX0VYUFIoXG4gICAgbmV3IFByb3ZpZGVyKE5HX1ZBTElEQVRPUlMsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNaW5MZW5ndGhWYWxpZGF0b3IpLCBtdWx0aTogdHJ1ZX0pKTtcbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttaW5sZW5ndGhdW25nLWNvbnRyb2xdLFttaW5sZW5ndGhdW25nLWZvcm0tY29udHJvbF0sW21pbmxlbmd0aF1bbmctbW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUlOX0xFTkdUSF9WQUxJREFUT1JdXG59KVxuZXhwb3J0IGNsYXNzIE1pbkxlbmd0aFZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciB7XG4gIHByaXZhdGUgX3ZhbGlkYXRvcjogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZShcIm1pbmxlbmd0aFwiKSBtaW5MZW5ndGg6IHN0cmluZykge1xuICAgIHRoaXMuX3ZhbGlkYXRvciA9IFZhbGlkYXRvcnMubWluTGVuZ3RoKE51bWJlcldyYXBwZXIucGFyc2VJbnQobWluTGVuZ3RoLCAxMCkpO1xuICB9XG5cbiAgdmFsaWRhdGUoYzogQ29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHsgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvcihjKTsgfVxufVxuXG5jb25zdCBNQVhfTEVOR1RIX1ZBTElEQVRPUiA9IENPTlNUX0VYUFIoXG4gICAgbmV3IFByb3ZpZGVyKE5HX1ZBTElEQVRPUlMsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXhMZW5ndGhWYWxpZGF0b3IpLCBtdWx0aTogdHJ1ZX0pKTtcbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXhsZW5ndGhdW25nLWNvbnRyb2xdLFttYXhsZW5ndGhdW25nLWZvcm0tY29udHJvbF0sW21heGxlbmd0aF1bbmctbW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUFYX0xFTkdUSF9WQUxJREFUT1JdXG59KVxuZXhwb3J0IGNsYXNzIE1heExlbmd0aFZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciB7XG4gIHByaXZhdGUgX3ZhbGlkYXRvcjogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZShcIm1heGxlbmd0aFwiKSBtYXhMZW5ndGg6IHN0cmluZykge1xuICAgIHRoaXMuX3ZhbGlkYXRvciA9IFZhbGlkYXRvcnMubWF4TGVuZ3RoKE51bWJlcldyYXBwZXIucGFyc2VJbnQobWF4TGVuZ3RoLCAxMCkpO1xuICB9XG5cbiAgdmFsaWRhdGUoYzogQ29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHsgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvcihjKTsgfVxufVxuIl19