var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Injectable, provide } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
import { RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';
import { APP_BASE_HREF } from 'angular2/platform/common';
let LogService = class LogService {
    constructor() {
        this.logs = [];
    }
    addLog(message) { this.logs.push(message); }
};
LogService = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], LogService);
// #docregion routerOnDeactivate
let MyCmp = class MyCmp {
    constructor(logService) {
        this.logService = logService;
    }
    routerOnDeactivate(next, prev) {
        this.logService.addLog(`Navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`);
    }
};
MyCmp = __decorate([
    Component({ selector: 'my-cmp', template: `<div>hello</div>` }), 
    __metadata('design:paramtypes', [LogService])
], MyCmp);
// #enddocregion
let AppCmp = class AppCmp {
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
      <a [routerLink]="['/HomeCmp']" id="home-link">Navigate Home</a> |
      <a [routerLink]="['/ParamCmp', {param: 1}]" id="param-link">Navigate with a Param</a>
    </nav>
    <router-outlet></router-outlet>
    <div id="log">
      <h2>Log:</h2>
      <p *ngFor="let logItem of logService.logs">{{ logItem }}</p>
    </div>
  `,
        directives: [ROUTER_DIRECTIVES]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fZGVhY3RpdmF0ZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL29uX2RlYWN0aXZhdGUvb25fZGVhY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUMsTUFBTSxlQUFlO09BQ3JELEVBQUMsU0FBUyxFQUFDLE1BQU0sMkJBQTJCO09BQzVDLEVBQXFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGlCQUFpQjtPQUMzRixFQUFDLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtBQUl0RDtJQUFBO1FBQ0UsU0FBSSxHQUFhLEVBQUUsQ0FBQztJQUd0QixDQUFDO0lBREMsTUFBTSxDQUFDLE9BQWUsSUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUxEO0lBQUMsVUFBVSxFQUFFOztjQUFBO0FBUWIsZ0NBQWdDO0FBRWhDO0lBQ0UsWUFBb0IsVUFBc0I7UUFBdEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtJQUFHLENBQUM7SUFFOUMsa0JBQWtCLENBQUMsSUFBMEIsRUFBRSxJQUEwQjtRQUN2RSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FDbEIsb0JBQW9CLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sU0FBUyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNoRixDQUFDO0FBQ0gsQ0FBQztBQVJEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQzs7U0FBQTtBQVM5RCxnQkFBZ0I7QUF1QmhCO0lBQ0UsWUFBbUIsVUFBc0I7UUFBdEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtJQUFHLENBQUM7QUFDL0MsQ0FBQztBQXRCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7R0FXVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7SUFDRCxXQUFXLENBQUM7UUFDWCxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO1FBQzlDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7S0FDdEQsQ0FBQzs7VUFBQTtBQU1GO0lBQ0UsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7UUFDdkIsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFDLFFBQVEsRUFBRSw0Q0FBNEMsRUFBQyxDQUFDO1FBQ2hGLFVBQVU7S0FDWCxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIEluamVjdGFibGUsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuaW1wb3J0IHtPbkRlYWN0aXZhdGUsIENvbXBvbmVudEluc3RydWN0aW9uLCBSb3V0ZUNvbmZpZywgUk9VVEVSX0RJUkVDVElWRVN9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5pbXBvcnQge0FQUF9CQVNFX0hSRUZ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbic7XG5cblxuQEluamVjdGFibGUoKVxuY2xhc3MgTG9nU2VydmljZSB7XG4gIGxvZ3M6IHN0cmluZ1tdID0gW107XG5cbiAgYWRkTG9nKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgeyB0aGlzLmxvZ3MucHVzaChtZXNzYWdlKTsgfVxufVxuXG5cbi8vICNkb2NyZWdpb24gcm91dGVyT25EZWFjdGl2YXRlXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogJ215LWNtcCcsIHRlbXBsYXRlOiBgPGRpdj5oZWxsbzwvZGl2PmB9KVxuY2xhc3MgTXlDbXAgaW1wbGVtZW50cyBPbkRlYWN0aXZhdGUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxvZ1NlcnZpY2U6IExvZ1NlcnZpY2UpIHt9XG5cbiAgcm91dGVyT25EZWFjdGl2YXRlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHRoaXMubG9nU2VydmljZS5hZGRMb2coXG4gICAgICAgIGBOYXZpZ2F0aW5nIGZyb20gXCIke3ByZXYgPyBwcmV2LnVybFBhdGggOiAnbnVsbCd9XCIgdG8gXCIke25leHQudXJsUGF0aH1cImApO1xuICB9XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5NeSBBcHA8L2gxPlxuICAgIDxuYXY+XG4gICAgICA8YSBbcm91dGVyTGlua109XCJbJy9Ib21lQ21wJ11cIiBpZD1cImhvbWUtbGlua1wiPk5hdmlnYXRlIEhvbWU8L2E+IHxcbiAgICAgIDxhIFtyb3V0ZXJMaW5rXT1cIlsnL1BhcmFtQ21wJywge3BhcmFtOiAxfV1cIiBpZD1cInBhcmFtLWxpbmtcIj5OYXZpZ2F0ZSB3aXRoIGEgUGFyYW08L2E+XG4gICAgPC9uYXY+XG4gICAgPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICAgIDxkaXYgaWQ9XCJsb2dcIj5cbiAgICAgIDxoMj5Mb2c6PC9oMj5cbiAgICAgIDxwICpuZ0Zvcj1cImxldCBsb2dJdGVtIG9mIGxvZ1NlcnZpY2UubG9nc1wiPnt7IGxvZ0l0ZW0gfX08L3A+XG4gICAgPC9kaXY+XG4gIGAsXG4gIGRpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU11cbn0pXG5AUm91dGVDb25maWcoW1xuICB7cGF0aDogJy8nLCBjb21wb25lbnQ6IE15Q21wLCBuYW1lOiAnSG9tZUNtcCd9LFxuICB7cGF0aDogJy86cGFyYW0nLCBjb21wb25lbnQ6IE15Q21wLCBuYW1lOiAnUGFyYW1DbXAnfVxuXSlcbmNsYXNzIEFwcENtcCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBsb2dTZXJ2aWNlOiBMb2dTZXJ2aWNlKSB7fVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICByZXR1cm4gYm9vdHN0cmFwKEFwcENtcCwgW1xuICAgIHByb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9kZWFjdGl2YXRlJ30pLFxuICAgIExvZ1NlcnZpY2VcbiAgXSk7XG59XG4iXX0=