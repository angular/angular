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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fZGVhY3RpdmF0ZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL29uX2RlYWN0aXZhdGUvb25fZGVhY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIkxvZ1NlcnZpY2UiLCJMb2dTZXJ2aWNlLmNvbnN0cnVjdG9yIiwiTG9nU2VydmljZS5hZGRMb2ciLCJNeUNtcCIsIk15Q21wLmNvbnN0cnVjdG9yIiwiTXlDbXAub25EZWFjdGl2YXRlIiwiQXBwQ21wIiwiQXBwQ21wLmNvbnN0cnVjdG9yIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUMsTUFBTSxtQkFBbUI7T0FDM0UsRUFHTCxXQUFXLEVBQ1gsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDZCxNQUFNLGlCQUFpQjtBQUd4QjtJQUFBQTtRQUVFQyxTQUFJQSxHQUFhQSxFQUFFQSxDQUFDQTtJQUd0QkEsQ0FBQ0E7SUFEQ0QsTUFBTUEsQ0FBQ0EsT0FBZUEsSUFBVUUsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDNURGLENBQUNBO0FBTEQ7SUFBQyxVQUFVLEVBQUU7O2VBS1o7QUFHRCwwQkFBMEI7QUFDMUI7SUFFRUcsWUFBb0JBLFVBQXNCQTtRQUF0QkMsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBWUE7SUFBR0EsQ0FBQ0E7SUFFOUNELFlBQVlBLENBQUNBLElBQTBCQSxFQUFFQSxJQUEwQkE7UUFDakVFLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLE1BQU1BLENBQ2xCQSxvQkFBb0JBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLFNBQVNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLENBQUNBLENBQUNBO0lBQ2hGQSxDQUFDQTtBQUNIRixDQUFDQTtBQVJEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQzs7VUFRN0Q7QUFDRCxnQkFBZ0I7QUFHaEI7SUFxQkVHLFlBQW1CQSxVQUFzQkE7UUFBdEJDLGVBQVVBLEdBQVZBLFVBQVVBLENBQVlBO0lBQUdBLENBQUNBO0FBQy9DRCxDQUFDQTtBQXRCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7R0FXVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQztLQUN2QyxDQUFDO0lBQ0QsV0FBVyxDQUFDO1FBQ1gsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztRQUM5QyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO0tBQ3RELENBQUM7O1dBR0Q7QUFHRDtJQUNFRSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQTtRQUN2QkEsT0FBT0EsQ0FBQ0EsYUFBYUEsRUFBRUEsRUFBQ0EsUUFBUUEsRUFBRUEsNENBQTRDQSxFQUFDQSxDQUFDQTtRQUNoRkEsVUFBVUE7S0FDWEEsQ0FBQ0EsQ0FBQ0E7QUFDTEEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgSW5qZWN0YWJsZSwgTmdGb3IsIHByb3ZpZGUsIGJvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuaW1wb3J0IHtcbiAgT25EZWFjdGl2YXRlLFxuICBDb21wb25lbnRJbnN0cnVjdGlvbixcbiAgUm91dGVDb25maWcsXG4gIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICBBUFBfQkFTRV9IUkVGXG59IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5cblxuQEluamVjdGFibGUoKVxuY2xhc3MgTG9nU2VydmljZSB7XG4gIGxvZ3M6IHN0cmluZ1tdID0gW107XG5cbiAgYWRkTG9nKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgeyB0aGlzLmxvZ3MucHVzaChtZXNzYWdlKTsgfVxufVxuXG5cbi8vICNkb2NyZWdpb24gb25EZWFjdGl2YXRlXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogJ215LWNtcCcsIHRlbXBsYXRlOiBgPGRpdj5oZWxsbzwvZGl2PmB9KVxuY2xhc3MgTXlDbXAgaW1wbGVtZW50cyBPbkRlYWN0aXZhdGUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxvZ1NlcnZpY2U6IExvZ1NlcnZpY2UpIHt9XG5cbiAgb25EZWFjdGl2YXRlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHRoaXMubG9nU2VydmljZS5hZGRMb2coXG4gICAgICAgIGBOYXZpZ2F0aW5nIGZyb20gXCIke3ByZXYgPyBwcmV2LnVybFBhdGggOiAnbnVsbCd9XCIgdG8gXCIke25leHQudXJsUGF0aH1cImApO1xuICB9XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5NeSBBcHA8L2gxPlxuICAgIDxuYXY+XG4gICAgICA8YSBbcm91dGVyLWxpbmtdPVwiWycvSG9tZUNtcCddXCIgaWQ9XCJob21lLWxpbmtcIj5OYXZpZ2F0ZSBIb21lPC9hPiB8XG4gICAgICA8YSBbcm91dGVyLWxpbmtdPVwiWycvUGFyYW1DbXAnLCB7cGFyYW06IDF9XVwiIGlkPVwicGFyYW0tbGlua1wiPk5hdmlnYXRlIHdpdGggYSBQYXJhbTwvYT5cbiAgICA8L25hdj5cbiAgICA8cm91dGVyLW91dGxldD48L3JvdXRlci1vdXRsZXQ+XG4gICAgPGRpdiBpZD1cImxvZ1wiPlxuICAgICAgPGgyPkxvZzo8L2gyPlxuICAgICAgPHAgKm5nLWZvcj1cIiNsb2dJdGVtIG9mIGxvZ1NlcnZpY2UubG9nc1wiPnt7IGxvZ0l0ZW0gfX08L3A+XG4gICAgPC9kaXY+XG4gIGAsXG4gIGRpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFUywgTmdGb3JdXG59KVxuQFJvdXRlQ29uZmlnKFtcbiAge3BhdGg6ICcvJywgY29tcG9uZW50OiBNeUNtcCwgbmFtZTogJ0hvbWVDbXAnfSxcbiAge3BhdGg6ICcvOnBhcmFtJywgY29tcG9uZW50OiBNeUNtcCwgbmFtZTogJ1BhcmFtQ21wJ31cbl0pXG5jbGFzcyBBcHBDbXAge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbG9nU2VydmljZTogTG9nU2VydmljZSkge31cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChBcHBDbXAsIFtcbiAgICBwcm92aWRlKEFQUF9CQVNFX0hSRUYsIHt1c2VWYWx1ZTogJy9hbmd1bGFyMi9leGFtcGxlcy9yb3V0ZXIvdHMvb25fZGVhY3RpdmF0ZSd9KSxcbiAgICBMb2dTZXJ2aWNlXG4gIF0pO1xufVxuIl19