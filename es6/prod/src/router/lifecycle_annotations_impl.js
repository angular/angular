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
//# sourceMappingURL=lifecycle_annotations_impl.js.map