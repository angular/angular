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
import { bootstrap } from 'angular2/platform/browser';
import { RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';
import { APP_BASE_HREF } from 'angular2/platform/common';
// #docregion routerOnActivate
let ChildCmp = class ChildCmp {
};
ChildCmp = __decorate([
    Component({ template: `Child` }), 
    __metadata('design:paramtypes', [])
], ChildCmp);
let ParentCmp = class ParentCmp {
    constructor() {
        this.log = '';
    }
    routerOnActivate(next, prev) {
        this.log = `Finished navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`;
        return new Promise(resolve => {
            // The ChildCmp gets instantiated only when the Promise is resolved
            setTimeout(() => resolve(null), 1000);
        });
    }
};
ParentCmp = __decorate([
    Component({
        template: `
    <h2>Parent</h2> (<router-outlet></router-outlet>)
    <p>{{log}}</p>`,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([{ path: '/child', name: 'Child', component: ChildCmp }]), 
    __metadata('design:paramtypes', [])
], ParentCmp);
// #enddocregion
export let AppCmp = class AppCmp {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My app</h1>

    <nav>
      <a [routerLink]="['Parent', 'Child']">Child</a>
    </nav>
    <router-outlet></router-outlet>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([{ path: '/parent/...', name: 'Parent', component: ParentCmp }]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/on_activate' })]);
}
