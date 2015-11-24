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
import { Component, Injectable, NgFor, provide, bootstrap } from 'angular2/angular2';
import { RouteConfig, ROUTER_DIRECTIVES, APP_BASE_HREF } from 'angular2/router';
let LogService = class {
    constructor() {
        this.logs = [];
    }
    addLog(message) { this.logs.push(message); }
};
LogService = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], LogService);
// #docregion onDeactivate
let MyCmp = class {
    constructor(logService) {
        this.logService = logService;
    }
    onDeactivate(next, prev) {
        this.logService.addLog(`Navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`);
    }
};
MyCmp = __decorate([
    Component({ selector: 'my-cmp', template: `<div>hello</div>` }), 
    __metadata('design:paramtypes', [LogService])
], MyCmp);
// #enddocregion
let AppCmp = class {
    constructor(logService) {
        this.logService = logService;
    }
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My App</h1>
    <nav>
      <a [router-link]="['/HomeCmp']" id="home-link">Navigate Home</a> |
      <a [router-link]="['/ParamCmp', {param: 1}]" id="param-link">Navigate with a Param</a>
    </nav>
    <router-outlet></router-outlet>
    <div id="log">
      <h2>Log:</h2>
      <p *ng-for="#logItem of logService.logs">{{ logItem }}</p>
    </div>
  `,
        directives: [ROUTER_DIRECTIVES, NgFor]
    }),
    RouteConfig([
        { path: '/', component: MyCmp, name: 'HomeCmp' },
        { path: '/:param', component: MyCmp, name: 'ParamCmp' }
    ]), 
    __metadata('design:paramtypes', [LogService])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [
        provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/on_deactivate' }),
        LogService
    ]);
}
//# sourceMappingURL=on_deactivate_example.js.map