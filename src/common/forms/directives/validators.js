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
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var metadata_1 = require('angular2/src/core/metadata');
var validators_1 = require('../validators');
var lang_2 = require("angular2/src/facade/lang");
var REQUIRED_VALIDATOR = lang_1.CONST_EXPR(new di_1.Provider(validators_1.NG_VALIDATORS, { useValue: validators_1.Validators.required, multi: true }));
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
        metadata_1.Directive({
            selector: '[required][ng-control],[required][ng-form-control],[required][ng-model]',
            providers: [REQUIRED_VALIDATOR]
        }), 
        __metadata('design:paramtypes', [])
    ], RequiredValidator);
    return RequiredValidator;
})();
exports.RequiredValidator = RequiredValidator;
var MIN_LENGTH_VALIDATOR = lang_1.CONST_EXPR(new di_1.Provider(validators_1.NG_VALIDATORS, { useExisting: di_1.forwardRef(function () { return MinLengthValidator; }), multi: true }));
var MinLengthValidator = (function () {
    function MinLengthValidator(minLength) {
        this._validator = validators_1.Validators.minLength(lang_2.NumberWrapper.parseInt(minLength, 10));
    }
    MinLengthValidator.prototype.validate = function (c) { return this._validator(c); };
    MinLengthValidator = __decorate([
        metadata_1.Directive({
            selector: '[minlength][ng-control],[minlength][ng-form-control],[minlength][ng-model]',
            providers: [MIN_LENGTH_VALIDATOR]
        }),
        __param(0, metadata_1.Attribute("minlength")), 
        __metadata('design:paramtypes', [String])
    ], MinLengthValidator);
    return MinLengthValidator;
})();
exports.MinLengthValidator = MinLengthValidator;
var MAX_LENGTH_VALIDATOR = lang_1.CONST_EXPR(new di_1.Provider(validators_1.NG_VALIDATORS, { useExisting: di_1.forwardRef(function () { return MaxLengthValidator; }), multi: true }));
var MaxLengthValidator = (function () {
    function MaxLengthValidator(minLength) {
        this._validator = validators_1.Validators.maxLength(lang_2.NumberWrapper.parseInt(minLength, 10));
    }
    MaxLengthValidator.prototype.validate = function (c) { return this._validator(c); };
    MaxLengthValidator = __decorate([
        metadata_1.Directive({
            selector: '[maxlength][ng-control],[maxlength][ng-form-control],[maxlength][ng-model]',
            providers: [MAX_LENGTH_VALIDATOR]
        }),
        __param(0, metadata_1.Attribute("maxlength")), 
        __metadata('design:paramtypes', [String])
    ], MaxLengthValidator);
    return MaxLengthValidator;
})();
exports.MaxLengthValidator = MaxLengthValidator;
//# sourceMappingURL=validators.js.map