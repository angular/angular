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
import { bootstrap } from 'angular2/bootstrap';
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
// #docregion routerOnDeactivate
let MyCmp = class {
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
      <a [routerLink]="['/HomeCmp']" id="home-link">Navigate Home</a> |
      <a [routerLink]="['/ParamCmp', {param: 1}]" id="param-link">Navigate with a Param</a>
    </nav>
    <router-outlet></router-outlet>
    <div id="log">
      <h2>Log:</h2>
      <p *ngFor="#logItem of logService.logs">{{ logItem }}</p>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fZGVhY3RpdmF0ZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL29uX2RlYWN0aXZhdGUvb25fZGVhY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIkxvZ1NlcnZpY2UiLCJMb2dTZXJ2aWNlLmNvbnN0cnVjdG9yIiwiTG9nU2VydmljZS5hZGRMb2ciLCJNeUNtcCIsIk15Q21wLmNvbnN0cnVjdG9yIiwiTXlDbXAucm91dGVyT25EZWFjdGl2YXRlIiwiQXBwQ21wIiwiQXBwQ21wLmNvbnN0cnVjdG9yIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBQyxNQUFNLGVBQWU7T0FDckQsRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0I7T0FDckMsRUFHTCxXQUFXLEVBQ1gsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDZCxNQUFNLGlCQUFpQjtBQUd4QjtJQUFBQTtRQUVFQyxTQUFJQSxHQUFhQSxFQUFFQSxDQUFDQTtJQUd0QkEsQ0FBQ0E7SUFEQ0QsTUFBTUEsQ0FBQ0EsT0FBZUEsSUFBVUUsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDNURGLENBQUNBO0FBTEQ7SUFBQyxVQUFVLEVBQUU7O2VBS1o7QUFHRCxnQ0FBZ0M7QUFDaEM7SUFFRUcsWUFBb0JBLFVBQXNCQTtRQUF0QkMsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBWUE7SUFBR0EsQ0FBQ0E7SUFFOUNELGtCQUFrQkEsQ0FBQ0EsSUFBMEJBLEVBQUVBLElBQTBCQTtRQUN2RUUsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FDbEJBLG9CQUFvQkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsTUFBTUEsU0FBU0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0FBQ0hGLENBQUNBO0FBUkQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBQyxDQUFDOztVQVE3RDtBQUNELGdCQUFnQjtBQUdoQjtJQXFCRUcsWUFBbUJBLFVBQXNCQTtRQUF0QkMsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBWUE7SUFBR0EsQ0FBQ0E7QUFDL0NELENBQUNBO0FBdEJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFOzs7Ozs7Ozs7OztHQVdUO1FBQ0QsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDaEMsQ0FBQztJQUNELFdBQVcsQ0FBQztRQUNYLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7UUFDOUMsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztLQUN0RCxDQUFDOztXQUdEO0FBR0Q7SUFDRUUsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUE7UUFDdkJBLE9BQU9BLENBQUNBLGFBQWFBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLDRDQUE0Q0EsRUFBQ0EsQ0FBQ0E7UUFDaEZBLFVBQVVBO0tBQ1hBLENBQUNBLENBQUNBO0FBQ0xBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIEluamVjdGFibGUsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL2Jvb3RzdHJhcCc7XG5pbXBvcnQge1xuICBPbkRlYWN0aXZhdGUsXG4gIENvbXBvbmVudEluc3RydWN0aW9uLFxuICBSb3V0ZUNvbmZpZyxcbiAgUk9VVEVSX0RJUkVDVElWRVMsXG4gIEFQUF9CQVNFX0hSRUZcbn0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcblxuXG5ASW5qZWN0YWJsZSgpXG5jbGFzcyBMb2dTZXJ2aWNlIHtcbiAgbG9nczogc3RyaW5nW10gPSBbXTtcblxuICBhZGRMb2cobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7IHRoaXMubG9ncy5wdXNoKG1lc3NhZ2UpOyB9XG59XG5cblxuLy8gI2RvY3JlZ2lvbiByb3V0ZXJPbkRlYWN0aXZhdGVcbkBDb21wb25lbnQoe3NlbGVjdG9yOiAnbXktY21wJywgdGVtcGxhdGU6IGA8ZGl2PmhlbGxvPC9kaXY+YH0pXG5jbGFzcyBNeUNtcCBpbXBsZW1lbnRzIE9uRGVhY3RpdmF0ZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nU2VydmljZTogTG9nU2VydmljZSkge31cblxuICByb3V0ZXJPbkRlYWN0aXZhdGUobmV4dDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIHByZXY6IENvbXBvbmVudEluc3RydWN0aW9uKSB7XG4gICAgdGhpcy5sb2dTZXJ2aWNlLmFkZExvZyhcbiAgICAgICAgYE5hdmlnYXRpbmcgZnJvbSBcIiR7cHJldiA/IHByZXYudXJsUGF0aCA6ICdudWxsJ31cIiB0byBcIiR7bmV4dC51cmxQYXRofVwiYCk7XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPk15IEFwcDwvaDE+XG4gICAgPG5hdj5cbiAgICAgIDxhIFtyb3V0ZXJMaW5rXT1cIlsnL0hvbWVDbXAnXVwiIGlkPVwiaG9tZS1saW5rXCI+TmF2aWdhdGUgSG9tZTwvYT4gfFxuICAgICAgPGEgW3JvdXRlckxpbmtdPVwiWycvUGFyYW1DbXAnLCB7cGFyYW06IDF9XVwiIGlkPVwicGFyYW0tbGlua1wiPk5hdmlnYXRlIHdpdGggYSBQYXJhbTwvYT5cbiAgICA8L25hdj5cbiAgICA8cm91dGVyLW91dGxldD48L3JvdXRlci1vdXRsZXQ+XG4gICAgPGRpdiBpZD1cImxvZ1wiPlxuICAgICAgPGgyPkxvZzo8L2gyPlxuICAgICAgPHAgKm5nRm9yPVwiI2xvZ0l0ZW0gb2YgbG9nU2VydmljZS5sb2dzXCI+e3sgbG9nSXRlbSB9fTwvcD5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbXG4gIHtwYXRoOiAnLycsIGNvbXBvbmVudDogTXlDbXAsIG5hbWU6ICdIb21lQ21wJ30sXG4gIHtwYXRoOiAnLzpwYXJhbScsIGNvbXBvbmVudDogTXlDbXAsIG5hbWU6ICdQYXJhbUNtcCd9XG5dKVxuY2xhc3MgQXBwQ21wIHtcbiAgY29uc3RydWN0b3IocHVibGljIGxvZ1NlcnZpY2U6IExvZ1NlcnZpY2UpIHt9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIHJldHVybiBib290c3RyYXAoQXBwQ21wLCBbXG4gICAgcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL29uX2RlYWN0aXZhdGUnfSksXG4gICAgTG9nU2VydmljZVxuICBdKTtcbn1cbiJdfQ==