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
import { bootstrap, provide, Component } from 'angular2/angular2';
import { CanActivate, RouteConfig, APP_BASE_HREF, ROUTER_DIRECTIVES } from 'angular2/router';
function checkIfWeHavePermission(instruction) {
    return instruction.params['id'] == '1';
}
// #docregion canActivate
let ControlPanelCmp = class {
};
ControlPanelCmp = __decorate([
    Component({ selector: 'control-panel-cmp', template: `<div>Settings: ...</div>` }),
    CanActivate(checkIfWeHavePermission), 
    __metadata('design:paramtypes', [])
], ControlPanelCmp);
// #enddocregion
let HomeCmp = class {
};
HomeCmp = __decorate([
    Component({
        selector: 'home-cmp',
        template: `
    <h1>Welcome Home!</h1>
    <div>
      Edit <a [router-link]="['/ControlPanelCmp', {id: 1}]" id="user-1-link">User 1</a> |
      Edit <a [router-link]="['/ControlPanelCmp', {id: 2}]" id="user-2-link">User 2</a>
    </div>
  `,
        directives: [ROUTER_DIRECTIVES]
    }), 
    __metadata('design:paramtypes', [])
], HomeCmp);
let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My App</h1>
    <router-outlet></router-outlet>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([
        { path: '/user-settings/:id', component: ControlPanelCmp, name: 'ControlPanelCmp' },
        { path: '/', component: HomeCmp, name: 'HomeCmp' }
    ]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/can_activate' })]);
}
//# sourceMappingURL=can_activate_example.js.map