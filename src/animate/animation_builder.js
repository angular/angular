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
var di_1 = require('angular2/src/core/di');
var css_animation_builder_1 = require('./css_animation_builder');
var browser_details_1 = require('./browser_details');
var AnimationBuilder = (function () {
    /**
     * Used for DI
     * @param browserDetails
     */
    function AnimationBuilder(browserDetails) {
        this.browserDetails = browserDetails;
    }
    /**
     * Creates a new CSS Animation
     * @returns {CssAnimationBuilder}
     */
    AnimationBuilder.prototype.css = function () { return new css_animation_builder_1.CssAnimationBuilder(this.browserDetails); };
    AnimationBuilder = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [browser_details_1.BrowserDetails])
    ], AnimationBuilder);
    return AnimationBuilder;
})();
exports.AnimationBuilder = AnimationBuilder;
//# sourceMappingURL=animation_builder.js.map