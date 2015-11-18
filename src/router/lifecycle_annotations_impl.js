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
var lang_1 = require('angular2/src/facade/lang');
var RouteLifecycleHook = (function () {
    function RouteLifecycleHook(name) {
        this.name = name;
    }
    RouteLifecycleHook = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String])
    ], RouteLifecycleHook);
    return RouteLifecycleHook;
})();
exports.RouteLifecycleHook = RouteLifecycleHook;
var CanActivate = (function () {
    function CanActivate(fn) {
        this.fn = fn;
    }
    CanActivate = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Function])
    ], CanActivate);
    return CanActivate;
})();
exports.CanActivate = CanActivate;
exports.canReuse = lang_1.CONST_EXPR(new RouteLifecycleHook("canReuse"));
exports.canDeactivate = lang_1.CONST_EXPR(new RouteLifecycleHook("canDeactivate"));
exports.onActivate = lang_1.CONST_EXPR(new RouteLifecycleHook("onActivate"));
exports.onReuse = lang_1.CONST_EXPR(new RouteLifecycleHook("onReuse"));
exports.onDeactivate = lang_1.CONST_EXPR(new RouteLifecycleHook("onDeactivate"));
//# sourceMappingURL=lifecycle_annotations_impl.js.map