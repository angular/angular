'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var di_1 = require('angular2/src/core/di');
var animation_builder_1 = require('angular2/src/animate/animation_builder');
var css_animation_builder_1 = require('angular2/src/animate/css_animation_builder');
var animation_1 = require('angular2/src/animate/animation');
var browser_details_1 = require('angular2/src/animate/browser_details');
var MockAnimationBuilder = (function (_super) {
    __extends(MockAnimationBuilder, _super);
    function MockAnimationBuilder() {
        _super.call(this, null);
    }
    MockAnimationBuilder.prototype.css = function () { return new MockCssAnimationBuilder(); };
    MockAnimationBuilder = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockAnimationBuilder);
    return MockAnimationBuilder;
})(animation_builder_1.AnimationBuilder);
exports.MockAnimationBuilder = MockAnimationBuilder;
var MockCssAnimationBuilder = (function (_super) {
    __extends(MockCssAnimationBuilder, _super);
    function MockCssAnimationBuilder() {
        _super.call(this, null);
    }
    MockCssAnimationBuilder.prototype.start = function (element) { return new MockAnimation(element, this.data); };
    return MockCssAnimationBuilder;
})(css_animation_builder_1.CssAnimationBuilder);
var MockBrowserAbstraction = (function (_super) {
    __extends(MockBrowserAbstraction, _super);
    function MockBrowserAbstraction() {
        _super.apply(this, arguments);
    }
    MockBrowserAbstraction.prototype.doesElapsedTimeIncludesDelay = function () { this.elapsedTimeIncludesDelay = false; };
    return MockBrowserAbstraction;
})(browser_details_1.BrowserDetails);
var MockAnimation = (function (_super) {
    __extends(MockAnimation, _super);
    function MockAnimation(element, data) {
        _super.call(this, element, data, new MockBrowserAbstraction());
    }
    MockAnimation.prototype.wait = function (callback) { this._callback = callback; };
    MockAnimation.prototype.flush = function () {
        this._callback(0);
        this._callback = null;
    };
    return MockAnimation;
})(animation_1.Animation);
//# sourceMappingURL=animation_builder_mock.js.map