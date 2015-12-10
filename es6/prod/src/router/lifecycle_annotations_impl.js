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
