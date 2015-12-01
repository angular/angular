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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fZGVhY3RpdmF0ZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL29uX2RlYWN0aXZhdGUvb25fZGVhY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIkxvZ1NlcnZpY2UiLCJMb2dTZXJ2aWNlLmNvbnN0cnVjdG9yIiwiTG9nU2VydmljZS5hZGRMb2ciLCJNeUNtcCIsIk15Q21wLmNvbnN0cnVjdG9yIiwiTXlDbXAucm91dGVyT25EZWFjdGl2YXRlIiwiQXBwQ21wIiwiQXBwQ21wLmNvbnN0cnVjdG9yIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUMsTUFBTSxtQkFBbUI7T0FDM0UsRUFHTCxXQUFXLEVBQ1gsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDZCxNQUFNLGlCQUFpQjtBQUd4QjtJQUFBQTtRQUVFQyxTQUFJQSxHQUFhQSxFQUFFQSxDQUFDQTtJQUd0QkEsQ0FBQ0E7SUFEQ0QsTUFBTUEsQ0FBQ0EsT0FBZUEsSUFBVUUsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDNURGLENBQUNBO0FBTEQ7SUFBQyxVQUFVLEVBQUU7O2VBS1o7QUFHRCxnQ0FBZ0M7QUFDaEM7SUFFRUcsWUFBb0JBLFVBQXNCQTtRQUF0QkMsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBWUE7SUFBR0EsQ0FBQ0E7SUFFOUNELGtCQUFrQkEsQ0FBQ0EsSUFBMEJBLEVBQUVBLElBQTBCQTtRQUN2RUUsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FDbEJBLG9CQUFvQkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsTUFBTUEsU0FBU0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0FBQ0hGLENBQUNBO0FBUkQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBQyxDQUFDOztVQVE3RDtBQUNELGdCQUFnQjtBQUdoQjtJQXFCRUcsWUFBbUJBLFVBQXNCQTtRQUF0QkMsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBWUE7SUFBR0EsQ0FBQ0E7QUFDL0NELENBQUNBO0FBdEJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFOzs7Ozs7Ozs7OztHQVdUO1FBQ0QsVUFBVSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDO0tBQ3ZDLENBQUM7SUFDRCxXQUFXLENBQUM7UUFDWCxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO1FBQzlDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7S0FDdEQsQ0FBQzs7V0FHRDtBQUdEO0lBQ0VFLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBO1FBQ3ZCQSxPQUFPQSxDQUFDQSxhQUFhQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSw0Q0FBNENBLEVBQUNBLENBQUNBO1FBQ2hGQSxVQUFVQTtLQUNYQSxDQUFDQSxDQUFDQTtBQUNMQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBJbmplY3RhYmxlLCBOZ0ZvciwgcHJvdmlkZSwgYm9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG5pbXBvcnQge1xuICBPbkRlYWN0aXZhdGUsXG4gIENvbXBvbmVudEluc3RydWN0aW9uLFxuICBSb3V0ZUNvbmZpZyxcbiAgUk9VVEVSX0RJUkVDVElWRVMsXG4gIEFQUF9CQVNFX0hSRUZcbn0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcblxuXG5ASW5qZWN0YWJsZSgpXG5jbGFzcyBMb2dTZXJ2aWNlIHtcbiAgbG9nczogc3RyaW5nW10gPSBbXTtcblxuICBhZGRMb2cobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7IHRoaXMubG9ncy5wdXNoKG1lc3NhZ2UpOyB9XG59XG5cblxuLy8gI2RvY3JlZ2lvbiByb3V0ZXJPbkRlYWN0aXZhdGVcbkBDb21wb25lbnQoe3NlbGVjdG9yOiAnbXktY21wJywgdGVtcGxhdGU6IGA8ZGl2PmhlbGxvPC9kaXY+YH0pXG5jbGFzcyBNeUNtcCBpbXBsZW1lbnRzIE9uRGVhY3RpdmF0ZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nU2VydmljZTogTG9nU2VydmljZSkge31cblxuICByb3V0ZXJPbkRlYWN0aXZhdGUobmV4dDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIHByZXY6IENvbXBvbmVudEluc3RydWN0aW9uKSB7XG4gICAgdGhpcy5sb2dTZXJ2aWNlLmFkZExvZyhcbiAgICAgICAgYE5hdmlnYXRpbmcgZnJvbSBcIiR7cHJldiA/IHByZXYudXJsUGF0aCA6ICdudWxsJ31cIiB0byBcIiR7bmV4dC51cmxQYXRofVwiYCk7XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPk15IEFwcDwvaDE+XG4gICAgPG5hdj5cbiAgICAgIDxhIFtyb3V0ZXItbGlua109XCJbJy9Ib21lQ21wJ11cIiBpZD1cImhvbWUtbGlua1wiPk5hdmlnYXRlIEhvbWU8L2E+IHxcbiAgICAgIDxhIFtyb3V0ZXItbGlua109XCJbJy9QYXJhbUNtcCcsIHtwYXJhbTogMX1dXCIgaWQ9XCJwYXJhbS1saW5rXCI+TmF2aWdhdGUgd2l0aCBhIFBhcmFtPC9hPlxuICAgIDwvbmF2PlxuICAgIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAgICA8ZGl2IGlkPVwibG9nXCI+XG4gICAgICA8aDI+TG9nOjwvaDI+XG4gICAgICA8cCAqbmctZm9yPVwiI2xvZ0l0ZW0gb2YgbG9nU2VydmljZS5sb2dzXCI+e3sgbG9nSXRlbSB9fTwvcD5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTLCBOZ0Zvcl1cbn0pXG5AUm91dGVDb25maWcoW1xuICB7cGF0aDogJy8nLCBjb21wb25lbnQ6IE15Q21wLCBuYW1lOiAnSG9tZUNtcCd9LFxuICB7cGF0aDogJy86cGFyYW0nLCBjb21wb25lbnQ6IE15Q21wLCBuYW1lOiAnUGFyYW1DbXAnfVxuXSlcbmNsYXNzIEFwcENtcCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBsb2dTZXJ2aWNlOiBMb2dTZXJ2aWNlKSB7fVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICByZXR1cm4gYm9vdHN0cmFwKEFwcENtcCwgW1xuICAgIHByb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9kZWFjdGl2YXRlJ30pLFxuICAgIExvZ1NlcnZpY2VcbiAgXSk7XG59XG4iXX0=