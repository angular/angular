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
exports.routerCanReuse = lang_1.CONST_EXPR(new RouteLifecycleHook("routerCanReuse"));
exports.routerCanDeactivate = lang_1.CONST_EXPR(new RouteLifecycleHook("routerCanDeactivate"));
exports.routerOnActivate = lang_1.CONST_EXPR(new RouteLifecycleHook("routerOnActivate"));
exports.routerOnReuse = lang_1.CONST_EXPR(new RouteLifecycleHook("routerOnReuse"));
exports.routerOnDeactivate = lang_1.CONST_EXPR(new RouteLifecycleHook("routerOnDeactivate"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlX2Fubm90YXRpb25zX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2xpZmVjeWNsZV9hbm5vdGF0aW9uc19pbXBsLnRzIl0sIm5hbWVzIjpbIlJvdXRlTGlmZWN5Y2xlSG9vayIsIlJvdXRlTGlmZWN5Y2xlSG9vay5jb25zdHJ1Y3RvciIsIkNhbkFjdGl2YXRlIiwiQ2FuQWN0aXZhdGUuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUJBQWdDLDBCQUEwQixDQUFDLENBQUE7QUFFM0Q7SUFFRUEsNEJBQW1CQSxJQUFZQTtRQUFaQyxTQUFJQSxHQUFKQSxJQUFJQSxDQUFRQTtJQUFHQSxDQUFDQTtJQUZyQ0Q7UUFBQ0EsWUFBS0EsRUFBRUE7OzJCQUdQQTtJQUFEQSx5QkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlksMEJBQWtCLHFCQUU5QixDQUFBO0FBRUQ7SUFFRUUscUJBQW1CQSxFQUFZQTtRQUFaQyxPQUFFQSxHQUFGQSxFQUFFQSxDQUFVQTtJQUFHQSxDQUFDQTtJQUZyQ0Q7UUFBQ0EsWUFBS0EsRUFBRUE7O29CQUdQQTtJQUFEQSxrQkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlksbUJBQVcsY0FFdkIsQ0FBQTtBQUVZLHNCQUFjLEdBQ3ZCLGlCQUFVLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7QUFDNUMsMkJBQW1CLEdBQzVCLGlCQUFVLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7QUFDakQsd0JBQWdCLEdBQ3pCLGlCQUFVLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7QUFDOUMscUJBQWEsR0FDdEIsaUJBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFDM0MsMEJBQWtCLEdBQzNCLGlCQUFVLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNULCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFJvdXRlTGlmZWN5Y2xlSG9vayB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcpIHt9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ2FuQWN0aXZhdGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZm46IEZ1bmN0aW9uKSB7fVxufVxuXG5leHBvcnQgY29uc3Qgcm91dGVyQ2FuUmV1c2U6IFJvdXRlTGlmZWN5Y2xlSG9vayA9XG4gICAgQ09OU1RfRVhQUihuZXcgUm91dGVMaWZlY3ljbGVIb29rKFwicm91dGVyQ2FuUmV1c2VcIikpO1xuZXhwb3J0IGNvbnN0IHJvdXRlckNhbkRlYWN0aXZhdGU6IFJvdXRlTGlmZWN5Y2xlSG9vayA9XG4gICAgQ09OU1RfRVhQUihuZXcgUm91dGVMaWZlY3ljbGVIb29rKFwicm91dGVyQ2FuRGVhY3RpdmF0ZVwiKSk7XG5leHBvcnQgY29uc3Qgcm91dGVyT25BY3RpdmF0ZTogUm91dGVMaWZlY3ljbGVIb29rID1cbiAgICBDT05TVF9FWFBSKG5ldyBSb3V0ZUxpZmVjeWNsZUhvb2soXCJyb3V0ZXJPbkFjdGl2YXRlXCIpKTtcbmV4cG9ydCBjb25zdCByb3V0ZXJPblJldXNlOiBSb3V0ZUxpZmVjeWNsZUhvb2sgPVxuICAgIENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcInJvdXRlck9uUmV1c2VcIikpO1xuZXhwb3J0IGNvbnN0IHJvdXRlck9uRGVhY3RpdmF0ZTogUm91dGVMaWZlY3ljbGVIb29rID1cbiAgICBDT05TVF9FWFBSKG5ldyBSb3V0ZUxpZmVjeWNsZUhvb2soXCJyb3V0ZXJPbkRlYWN0aXZhdGVcIikpO1xuIl19