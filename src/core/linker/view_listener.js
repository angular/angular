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
/**
 * Listener for view creation / destruction.
 */
var AppViewListener = (function () {
    function AppViewListener() {
    }
    AppViewListener.prototype.onViewCreated = function (view) { };
    AppViewListener.prototype.onViewDestroyed = function (view) { };
    AppViewListener = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], AppViewListener);
    return AppViewListener;
})();
exports.AppViewListener = AppViewListener;
//# sourceMappingURL=view_listener.js.map