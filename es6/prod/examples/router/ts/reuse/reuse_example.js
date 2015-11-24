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
import { bootstrap, Component, provide } from 'angular2/angular2';
import { RouteConfig, ROUTER_DIRECTIVES, APP_BASE_HREF, RouteParams } from 'angular2/router';
// #docregion reuseCmp
let MyCmp = class {
    constructor(params) {
        this.name = params.get('name') || 'NOBODY';
    }
    canReuse(next, prev) { return true; }
    onReuse(next, prev) {
        this.name = next.params['name'];
    }
};
MyCmp = __decorate([
    Component({
        selector: 'my-cmp',
        template: `
    <div>hello {{name}}!</div>
    <div>message: <input id="message"></div>
  `
    }), 
    __metadata('design:paramtypes', [RouteParams])
], MyCmp);
// #enddocregion
let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>Say hi to...</h1>
    <a [router-link]="['/HomeCmp', {name: 'naomi'}]" id="naomi-link">Naomi</a> |
    <a [router-link]="['/HomeCmp', {name: 'brad'}]" id="brad-link">Brad</a>
    <router-outlet></router-outlet>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([
        { path: '/', component: MyCmp, name: 'HomeCmp' },
        { path: '/:name', component: MyCmp, name: 'HomeCmp' }
    ]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/reuse' })]);
}
//# sourceMappingURL=reuse_example.js.map