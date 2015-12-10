var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, provide } from 'angular2/core';
import { bootstrap } from 'angular2/bootstrap';
import { RouteConfig, ROUTER_DIRECTIVES, APP_BASE_HREF } from 'angular2/router';
// #docregion routerOnActivate
let MyCmp = class {
    constructor() {
        this.log = '';
    }
    routerOnActivate(next, prev) {
        this.log = `Finished navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`;
    }
};
MyCmp = __decorate([
    Component({ selector: 'my-cmp', template: `<div>routerOnActivate: {{log}}</div>` }), 
    __metadata('design:paramtypes', [])
], MyCmp);
// #enddocregion
let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My App</h1>
    <nav>
      <a [routerLink]="['/HomeCmp']" id="home-link">Navigate Home</a> |
      <a [routerLink]="['/ParamCmp', {param: 1}]" id="param-link">Navigate with a Param</a>
    </nav>
    <router-outlet></router-outlet>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([
        { path: '/', component: MyCmp, name: 'HomeCmp' },
        { path: '/:param', component: MyCmp, name: 'ParamCmp' }
    ]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/on_activate' })]);
}
