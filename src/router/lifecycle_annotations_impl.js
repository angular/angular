'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlX2Fubm90YXRpb25zX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2xpZmVjeWNsZV9hbm5vdGF0aW9uc19pbXBsLnRzIl0sIm5hbWVzIjpbIlJvdXRlTGlmZWN5Y2xlSG9vayIsIlJvdXRlTGlmZWN5Y2xlSG9vay5jb25zdHJ1Y3RvciIsIkNhbkFjdGl2YXRlIiwiQ2FuQWN0aXZhdGUuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUFnQywwQkFBMEIsQ0FBQyxDQUFBO0FBRTNEO0lBRUVBLDRCQUFtQkEsSUFBWUE7UUFBWkMsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBUUE7SUFBR0EsQ0FBQ0E7SUFGckNEO1FBQUNBLFlBQUtBLEVBQUVBOzsyQkFHUEE7SUFBREEseUJBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUZZLDBCQUFrQixxQkFFOUIsQ0FBQTtBQUVEO0lBRUVFLHFCQUFtQkEsRUFBWUE7UUFBWkMsT0FBRUEsR0FBRkEsRUFBRUEsQ0FBVUE7SUFBR0EsQ0FBQ0E7SUFGckNEO1FBQUNBLFlBQUtBLEVBQUVBOztvQkFHUEE7SUFBREEsa0JBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUZZLG1CQUFXLGNBRXZCLENBQUE7QUFFWSxzQkFBYyxHQUN2QixpQkFBVSxDQUFDLElBQUksa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0FBQzVDLDJCQUFtQixHQUM1QixpQkFBVSxDQUFDLElBQUksa0JBQWtCLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0FBQ2pELHdCQUFnQixHQUN6QixpQkFBVSxDQUFDLElBQUksa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO0FBQzlDLHFCQUFhLEdBQ3RCLGlCQUFVLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBQzNDLDBCQUFrQixHQUMzQixpQkFBVSxDQUFDLElBQUksa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVCwgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBSb3V0ZUxpZmVjeWNsZUhvb2sge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nKSB7fVxufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENhbkFjdGl2YXRlIHtcbiAgY29uc3RydWN0b3IocHVibGljIGZuOiBGdW5jdGlvbikge31cbn1cblxuZXhwb3J0IGNvbnN0IHJvdXRlckNhblJldXNlOiBSb3V0ZUxpZmVjeWNsZUhvb2sgPVxuICAgIENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcInJvdXRlckNhblJldXNlXCIpKTtcbmV4cG9ydCBjb25zdCByb3V0ZXJDYW5EZWFjdGl2YXRlOiBSb3V0ZUxpZmVjeWNsZUhvb2sgPVxuICAgIENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcInJvdXRlckNhbkRlYWN0aXZhdGVcIikpO1xuZXhwb3J0IGNvbnN0IHJvdXRlck9uQWN0aXZhdGU6IFJvdXRlTGlmZWN5Y2xlSG9vayA9XG4gICAgQ09OU1RfRVhQUihuZXcgUm91dGVMaWZlY3ljbGVIb29rKFwicm91dGVyT25BY3RpdmF0ZVwiKSk7XG5leHBvcnQgY29uc3Qgcm91dGVyT25SZXVzZTogUm91dGVMaWZlY3ljbGVIb29rID1cbiAgICBDT05TVF9FWFBSKG5ldyBSb3V0ZUxpZmVjeWNsZUhvb2soXCJyb3V0ZXJPblJldXNlXCIpKTtcbmV4cG9ydCBjb25zdCByb3V0ZXJPbkRlYWN0aXZhdGU6IFJvdXRlTGlmZWN5Y2xlSG9vayA9XG4gICAgQ09OU1RfRVhQUihuZXcgUm91dGVMaWZlY3ljbGVIb29rKFwicm91dGVyT25EZWFjdGl2YXRlXCIpKTtcbiJdfQ==