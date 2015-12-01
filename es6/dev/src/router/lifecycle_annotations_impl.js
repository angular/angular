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
export const canReuse = CONST_EXPR(new RouteLifecycleHook("canReuse"));
export const canDeactivate = CONST_EXPR(new RouteLifecycleHook("canDeactivate"));
export const onActivate = CONST_EXPR(new RouteLifecycleHook("onActivate"));
export const onReuse = CONST_EXPR(new RouteLifecycleHook("onReuse"));
export const onDeactivate = CONST_EXPR(new RouteLifecycleHook("onDeactivate"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlX2Fubm90YXRpb25zX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2xpZmVjeWNsZV9hbm5vdGF0aW9uc19pbXBsLnRzIl0sIm5hbWVzIjpbIlJvdXRlTGlmZWN5Y2xlSG9vayIsIlJvdXRlTGlmZWN5Y2xlSG9vay5jb25zdHJ1Y3RvciIsIkNhbkFjdGl2YXRlIiwiQ2FuQWN0aXZhdGUuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO0FBRTFEO0lBRUVBLFlBQW1CQSxJQUFZQTtRQUFaQyxTQUFJQSxHQUFKQSxJQUFJQSxDQUFRQTtJQUFHQSxDQUFDQTtBQUNyQ0QsQ0FBQ0E7QUFIRDtJQUFDLEtBQUssRUFBRTs7dUJBR1A7QUFFRDtJQUVFRSxZQUFtQkEsRUFBWUE7UUFBWkMsT0FBRUEsR0FBRkEsRUFBRUEsQ0FBVUE7SUFBR0EsQ0FBQ0E7QUFDckNELENBQUNBO0FBSEQ7SUFBQyxLQUFLLEVBQUU7O2dCQUdQO0FBRUQsYUFBYSxRQUFRLEdBQXVCLFVBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDM0YsYUFBYSxhQUFhLEdBQ3RCLFVBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFDeEQsYUFBYSxVQUFVLEdBQXVCLFVBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFDL0YsYUFBYSxPQUFPLEdBQXVCLFVBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDekYsYUFBYSxZQUFZLEdBQXVCLFVBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNULCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFJvdXRlTGlmZWN5Y2xlSG9vayB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcpIHt9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ2FuQWN0aXZhdGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZm46IEZ1bmN0aW9uKSB7fVxufVxuXG5leHBvcnQgY29uc3QgY2FuUmV1c2U6IFJvdXRlTGlmZWN5Y2xlSG9vayA9IENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcImNhblJldXNlXCIpKTtcbmV4cG9ydCBjb25zdCBjYW5EZWFjdGl2YXRlOiBSb3V0ZUxpZmVjeWNsZUhvb2sgPVxuICAgIENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcImNhbkRlYWN0aXZhdGVcIikpO1xuZXhwb3J0IGNvbnN0IG9uQWN0aXZhdGU6IFJvdXRlTGlmZWN5Y2xlSG9vayA9IENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcIm9uQWN0aXZhdGVcIikpO1xuZXhwb3J0IGNvbnN0IG9uUmV1c2U6IFJvdXRlTGlmZWN5Y2xlSG9vayA9IENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcIm9uUmV1c2VcIikpO1xuZXhwb3J0IGNvbnN0IG9uRGVhY3RpdmF0ZTogUm91dGVMaWZlY3ljbGVIb29rID0gQ09OU1RfRVhQUihuZXcgUm91dGVMaWZlY3ljbGVIb29rKFwib25EZWFjdGl2YXRlXCIpKTtcbiJdfQ==