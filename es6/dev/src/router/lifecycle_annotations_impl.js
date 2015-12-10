var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST, CONST_EXPR } from 'angular2/src/facade/lang';
export let RouteLifecycleHook = class {
    constructor(name) {
        this.name = name;
    }
};
RouteLifecycleHook = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String])
], RouteLifecycleHook);
export let CanActivate = class {
    constructor(fn) {
        this.fn = fn;
    }
};
CanActivate = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Function])
], CanActivate);
export const routerCanReuse = CONST_EXPR(new RouteLifecycleHook("routerCanReuse"));
export const routerCanDeactivate = CONST_EXPR(new RouteLifecycleHook("routerCanDeactivate"));
export const routerOnActivate = CONST_EXPR(new RouteLifecycleHook("routerOnActivate"));
export const routerOnReuse = CONST_EXPR(new RouteLifecycleHook("routerOnReuse"));
export const routerOnDeactivate = CONST_EXPR(new RouteLifecycleHook("routerOnDeactivate"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlX2Fubm90YXRpb25zX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2xpZmVjeWNsZV9hbm5vdGF0aW9uc19pbXBsLnRzIl0sIm5hbWVzIjpbIlJvdXRlTGlmZWN5Y2xlSG9vayIsIlJvdXRlTGlmZWN5Y2xlSG9vay5jb25zdHJ1Y3RvciIsIkNhbkFjdGl2YXRlIiwiQ2FuQWN0aXZhdGUuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsS0FBSyxFQUFFLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtBQUUxRDtJQUVFQSxZQUFtQkEsSUFBWUE7UUFBWkMsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBUUE7SUFBR0EsQ0FBQ0E7QUFDckNELENBQUNBO0FBSEQ7SUFBQyxLQUFLLEVBQUU7O3VCQUdQO0FBRUQ7SUFFRUUsWUFBbUJBLEVBQVlBO1FBQVpDLE9BQUVBLEdBQUZBLEVBQUVBLENBQVVBO0lBQUdBLENBQUNBO0FBQ3JDRCxDQUFDQTtBQUhEO0lBQUMsS0FBSyxFQUFFOztnQkFHUDtBQUVELGFBQWEsY0FBYyxHQUN2QixVQUFVLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7QUFDekQsYUFBYSxtQkFBbUIsR0FDNUIsVUFBVSxDQUFDLElBQUksa0JBQWtCLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0FBQzlELGFBQWEsZ0JBQWdCLEdBQ3pCLFVBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztBQUMzRCxhQUFhLGFBQWEsR0FDdEIsVUFBVSxDQUFDLElBQUksa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztBQUN4RCxhQUFhLGtCQUFrQixHQUMzQixVQUFVLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNULCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFJvdXRlTGlmZWN5Y2xlSG9vayB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcpIHt9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ2FuQWN0aXZhdGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZm46IEZ1bmN0aW9uKSB7fVxufVxuXG5leHBvcnQgY29uc3Qgcm91dGVyQ2FuUmV1c2U6IFJvdXRlTGlmZWN5Y2xlSG9vayA9XG4gICAgQ09OU1RfRVhQUihuZXcgUm91dGVMaWZlY3ljbGVIb29rKFwicm91dGVyQ2FuUmV1c2VcIikpO1xuZXhwb3J0IGNvbnN0IHJvdXRlckNhbkRlYWN0aXZhdGU6IFJvdXRlTGlmZWN5Y2xlSG9vayA9XG4gICAgQ09OU1RfRVhQUihuZXcgUm91dGVMaWZlY3ljbGVIb29rKFwicm91dGVyQ2FuRGVhY3RpdmF0ZVwiKSk7XG5leHBvcnQgY29uc3Qgcm91dGVyT25BY3RpdmF0ZTogUm91dGVMaWZlY3ljbGVIb29rID1cbiAgICBDT05TVF9FWFBSKG5ldyBSb3V0ZUxpZmVjeWNsZUhvb2soXCJyb3V0ZXJPbkFjdGl2YXRlXCIpKTtcbmV4cG9ydCBjb25zdCByb3V0ZXJPblJldXNlOiBSb3V0ZUxpZmVjeWNsZUhvb2sgPVxuICAgIENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcInJvdXRlck9uUmV1c2VcIikpO1xuZXhwb3J0IGNvbnN0IHJvdXRlck9uRGVhY3RpdmF0ZTogUm91dGVMaWZlY3ljbGVIb29rID1cbiAgICBDT05TVF9FWFBSKG5ldyBSb3V0ZUxpZmVjeWNsZUhvb2soXCJyb3V0ZXJPbkRlYWN0aXZhdGVcIikpO1xuIl19