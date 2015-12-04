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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19saXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X2xpc3RlbmVyLnRzIl0sIm5hbWVzIjpbIkFwcFZpZXdMaXN0ZW5lciIsIkFwcFZpZXdMaXN0ZW5lci5jb25zdHJ1Y3RvciIsIkFwcFZpZXdMaXN0ZW5lci5vblZpZXdDcmVhdGVkIiwiQXBwVmlld0xpc3RlbmVyLm9uVmlld0Rlc3Ryb3llZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUdoRDs7R0FFRztBQUNIO0lBQUFBO0lBSUFDLENBQUNBO0lBRkNELHVDQUFhQSxHQUFiQSxVQUFjQSxJQUF3QkEsSUFBR0UsQ0FBQ0E7SUFDMUNGLHlDQUFlQSxHQUFmQSxVQUFnQkEsSUFBd0JBLElBQUdHLENBQUNBO0lBSDlDSDtRQUFDQSxlQUFVQSxFQUFFQTs7d0JBSVpBO0lBQURBLHNCQUFDQTtBQUFEQSxDQUFDQSxBQUpELElBSUM7QUFIWSx1QkFBZSxrQkFHM0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0ICogYXMgdmlld01vZHVsZSBmcm9tICcuL3ZpZXcnO1xuXG4vKipcbiAqIExpc3RlbmVyIGZvciB2aWV3IGNyZWF0aW9uIC8gZGVzdHJ1Y3Rpb24uXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBcHBWaWV3TGlzdGVuZXIge1xuICBvblZpZXdDcmVhdGVkKHZpZXc6IHZpZXdNb2R1bGUuQXBwVmlldykge31cbiAgb25WaWV3RGVzdHJveWVkKHZpZXc6IHZpZXdNb2R1bGUuQXBwVmlldykge31cbn1cbiJdfQ==