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
import { Component, provide, bootstrap } from 'angular2/angular2';
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
      <a [router-link]="['/HomeCmp']" id="home-link">Navigate Home</a> |
      <a [router-link]="['/ParamCmp', {param: 1}]" id="param-link">Navigate with a Param</a>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZS9vbl9hY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIk15Q21wIiwiTXlDbXAuY29uc3RydWN0b3IiLCJNeUNtcC5yb3V0ZXJPbkFjdGl2YXRlIiwiQXBwQ21wIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sbUJBQW1CO09BQ3hELEVBR0wsV0FBVyxFQUNYLGlCQUFpQixFQUNqQixhQUFhLEVBQ2QsTUFBTSxpQkFBaUI7QUFHeEIsOEJBQThCO0FBQzlCO0lBQUFBO1FBRUVDLFFBQUdBLEdBQVdBLEVBQUVBLENBQUNBO0lBS25CQSxDQUFDQTtJQUhDRCxnQkFBZ0JBLENBQUNBLElBQTBCQSxFQUFFQSxJQUEwQkE7UUFDckVFLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLDZCQUE2QkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsTUFBTUEsU0FBU0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0E7SUFDL0ZBLENBQUNBO0FBQ0hGLENBQUNBO0FBUEQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxzQ0FBc0MsRUFBQyxDQUFDOztVQU9qRjtBQUNELGdCQUFnQjtBQUdoQjtBQWlCQUcsQ0FBQ0E7QUFqQkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixRQUFRLEVBQUU7Ozs7Ozs7R0FPVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7SUFDRCxXQUFXLENBQUM7UUFDWCxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO1FBQzlDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7S0FDdEQsQ0FBQzs7V0FFRDtBQUdEO0lBQ0VDLE1BQU1BLENBQUNBLFNBQVNBLENBQ1pBLE1BQU1BLEVBQUVBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLDBDQUEwQ0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDaEdBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGUsIGJvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuaW1wb3J0IHtcbiAgT25BY3RpdmF0ZSxcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIFJvdXRlQ29uZmlnLFxuICBST1VURVJfRElSRUNUSVZFUyxcbiAgQVBQX0JBU0VfSFJFRlxufSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuXG5cbi8vICNkb2NyZWdpb24gcm91dGVyT25BY3RpdmF0ZVxuQENvbXBvbmVudCh7c2VsZWN0b3I6ICdteS1jbXAnLCB0ZW1wbGF0ZTogYDxkaXY+cm91dGVyT25BY3RpdmF0ZToge3tsb2d9fTwvZGl2PmB9KVxuY2xhc3MgTXlDbXAgaW1wbGVtZW50cyBPbkFjdGl2YXRlIHtcbiAgbG9nOiBzdHJpbmcgPSAnJztcblxuICByb3V0ZXJPbkFjdGl2YXRlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHRoaXMubG9nID0gYEZpbmlzaGVkIG5hdmlnYXRpbmcgZnJvbSBcIiR7cHJldiA/IHByZXYudXJsUGF0aCA6ICdudWxsJ31cIiB0byBcIiR7bmV4dC51cmxQYXRofVwiYDtcbiAgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDE+TXkgQXBwPC9oMT5cbiAgICA8bmF2PlxuICAgICAgPGEgW3JvdXRlci1saW5rXT1cIlsnL0hvbWVDbXAnXVwiIGlkPVwiaG9tZS1saW5rXCI+TmF2aWdhdGUgSG9tZTwvYT4gfFxuICAgICAgPGEgW3JvdXRlci1saW5rXT1cIlsnL1BhcmFtQ21wJywge3BhcmFtOiAxfV1cIiBpZD1cInBhcmFtLWxpbmtcIj5OYXZpZ2F0ZSB3aXRoIGEgUGFyYW08L2E+XG4gICAgPC9uYXY+XG4gICAgPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICBgLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuQFJvdXRlQ29uZmlnKFtcbiAge3BhdGg6ICcvJywgY29tcG9uZW50OiBNeUNtcCwgbmFtZTogJ0hvbWVDbXAnfSxcbiAge3BhdGg6ICcvOnBhcmFtJywgY29tcG9uZW50OiBNeUNtcCwgbmFtZTogJ1BhcmFtQ21wJ31cbl0pXG5jbGFzcyBBcHBDbXAge1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICByZXR1cm4gYm9vdHN0cmFwKFxuICAgICAgQXBwQ21wLCBbcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL29uX2FjdGl2YXRlJ30pXSk7XG59XG4iXX0=