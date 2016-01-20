'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
/**
 * Proxy that allows to intercept component view factories.
 * This also works for precompiled templates, if they were
 * generated in development mode.
 */
var ViewFactoryProxy = (function () {
    function ViewFactoryProxy() {
    }
    ViewFactoryProxy.prototype.getComponentViewFactory = function (component, originalViewFactory) {
        return originalViewFactory;
    };
    ViewFactoryProxy = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ViewFactoryProxy);
    return ViewFactoryProxy;
})();
exports.ViewFactoryProxy = ViewFactoryProxy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19saXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X2xpc3RlbmVyLnRzIl0sIm5hbWVzIjpbIkFwcFZpZXdMaXN0ZW5lciIsIkFwcFZpZXdMaXN0ZW5lci5jb25zdHJ1Y3RvciIsIkFwcFZpZXdMaXN0ZW5lci5vblZpZXdDcmVhdGVkIiwiQXBwVmlld0xpc3RlbmVyLm9uVmlld0Rlc3Ryb3llZCIsIlZpZXdGYWN0b3J5UHJveHkiLCJWaWV3RmFjdG9yeVByb3h5LmNvbnN0cnVjdG9yIiwiVmlld0ZhY3RvcnlQcm94eS5nZXRDb21wb25lbnRWaWV3RmFjdG9yeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFJaEQ7O0dBRUc7QUFDSDtJQUFBQTtJQUlBQyxDQUFDQTtJQUZDRCx1Q0FBYUEsR0FBYkEsVUFBY0EsSUFBd0JBLElBQUdFLENBQUNBO0lBQzFDRix5Q0FBZUEsR0FBZkEsVUFBZ0JBLElBQXdCQSxJQUFHRyxDQUFDQTtJQUg5Q0g7UUFBQ0EsZUFBVUEsRUFBRUE7O3dCQUlaQTtJQUFEQSxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxJQUlDO0FBSFksdUJBQWUsa0JBRzNCLENBQUE7QUFFRDs7OztHQUlHO0FBQ0g7SUFBQUk7SUFLQUMsQ0FBQ0E7SUFIQ0Qsa0RBQXVCQSxHQUF2QkEsVUFBd0JBLFNBQWVBLEVBQUVBLG1CQUE2QkE7UUFDcEVFLE1BQU1BLENBQUNBLG1CQUFtQkEsQ0FBQ0E7SUFDN0JBLENBQUNBO0lBSkhGO1FBQUNBLGVBQVVBLEVBQUVBOzt5QkFLWkE7SUFBREEsdUJBQUNBO0FBQURBLENBQUNBLEFBTEQsSUFLQztBQUpZLHdCQUFnQixtQkFJNUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0ICogYXMgdmlld01vZHVsZSBmcm9tICcuL3ZpZXcnO1xuXG4vKipcbiAqIExpc3RlbmVyIGZvciB2aWV3IGNyZWF0aW9uIC8gZGVzdHJ1Y3Rpb24uXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBcHBWaWV3TGlzdGVuZXIge1xuICBvblZpZXdDcmVhdGVkKHZpZXc6IHZpZXdNb2R1bGUuQXBwVmlldykge31cbiAgb25WaWV3RGVzdHJveWVkKHZpZXc6IHZpZXdNb2R1bGUuQXBwVmlldykge31cbn1cblxuLyoqXG4gKiBQcm94eSB0aGF0IGFsbG93cyB0byBpbnRlcmNlcHQgY29tcG9uZW50IHZpZXcgZmFjdG9yaWVzLlxuICogVGhpcyBhbHNvIHdvcmtzIGZvciBwcmVjb21waWxlZCB0ZW1wbGF0ZXMsIGlmIHRoZXkgd2VyZVxuICogZ2VuZXJhdGVkIGluIGRldmVsb3BtZW50IG1vZGUuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBWaWV3RmFjdG9yeVByb3h5IHtcbiAgZ2V0Q29tcG9uZW50Vmlld0ZhY3RvcnkoY29tcG9uZW50OiBUeXBlLCBvcmlnaW5hbFZpZXdGYWN0b3J5OiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gb3JpZ2luYWxWaWV3RmFjdG9yeTtcbiAgfVxufVxuIl19