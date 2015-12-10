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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZS9vbl9hY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIk15Q21wIiwiTXlDbXAuY29uc3RydWN0b3IiLCJNeUNtcC5yb3V0ZXJPbkFjdGl2YXRlIiwiQXBwQ21wIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sZUFBZTtPQUN6QyxFQUFDLFNBQVMsRUFBQyxNQUFNLG9CQUFvQjtPQUNyQyxFQUdMLFdBQVcsRUFDWCxpQkFBaUIsRUFDakIsYUFBYSxFQUNkLE1BQU0saUJBQWlCO0FBR3hCLDhCQUE4QjtBQUM5QjtJQUFBQTtRQUVFQyxRQUFHQSxHQUFXQSxFQUFFQSxDQUFDQTtJQUtuQkEsQ0FBQ0E7SUFIQ0QsZ0JBQWdCQSxDQUFDQSxJQUEwQkEsRUFBRUEsSUFBMEJBO1FBQ3JFRSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSw2QkFBNkJBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLFNBQVNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLENBQUNBO0lBQy9GQSxDQUFDQTtBQUNIRixDQUFDQTtBQVBEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsc0NBQXNDLEVBQUMsQ0FBQzs7VUFPakY7QUFDRCxnQkFBZ0I7QUFHaEI7QUFpQkFHLENBQUNBO0FBakJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFOzs7Ozs7O0dBT1Q7UUFDRCxVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztLQUNoQyxDQUFDO0lBQ0QsV0FBVyxDQUFDO1FBQ1gsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztRQUM5QyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO0tBQ3RELENBQUM7O1dBRUQ7QUFHRDtJQUNFQyxNQUFNQSxDQUFDQSxTQUFTQSxDQUNaQSxNQUFNQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSwwQ0FBMENBLEVBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ2hHQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9ib290c3RyYXAnO1xuaW1wb3J0IHtcbiAgT25BY3RpdmF0ZSxcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIFJvdXRlQ29uZmlnLFxuICBST1VURVJfRElSRUNUSVZFUyxcbiAgQVBQX0JBU0VfSFJFRlxufSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuXG5cbi8vICNkb2NyZWdpb24gcm91dGVyT25BY3RpdmF0ZVxuQENvbXBvbmVudCh7c2VsZWN0b3I6ICdteS1jbXAnLCB0ZW1wbGF0ZTogYDxkaXY+cm91dGVyT25BY3RpdmF0ZToge3tsb2d9fTwvZGl2PmB9KVxuY2xhc3MgTXlDbXAgaW1wbGVtZW50cyBPbkFjdGl2YXRlIHtcbiAgbG9nOiBzdHJpbmcgPSAnJztcblxuICByb3V0ZXJPbkFjdGl2YXRlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHRoaXMubG9nID0gYEZpbmlzaGVkIG5hdmlnYXRpbmcgZnJvbSBcIiR7cHJldiA/IHByZXYudXJsUGF0aCA6ICdudWxsJ31cIiB0byBcIiR7bmV4dC51cmxQYXRofVwiYDtcbiAgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDE+TXkgQXBwPC9oMT5cbiAgICA8bmF2PlxuICAgICAgPGEgW3JvdXRlckxpbmtdPVwiWycvSG9tZUNtcCddXCIgaWQ9XCJob21lLWxpbmtcIj5OYXZpZ2F0ZSBIb21lPC9hPiB8XG4gICAgICA8YSBbcm91dGVyTGlua109XCJbJy9QYXJhbUNtcCcsIHtwYXJhbTogMX1dXCIgaWQ9XCJwYXJhbS1saW5rXCI+TmF2aWdhdGUgd2l0aCBhIFBhcmFtPC9hPlxuICAgIDwvbmF2PlxuICAgIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbXG4gIHtwYXRoOiAnLycsIGNvbXBvbmVudDogTXlDbXAsIG5hbWU6ICdIb21lQ21wJ30sXG4gIHtwYXRoOiAnLzpwYXJhbScsIGNvbXBvbmVudDogTXlDbXAsIG5hbWU6ICdQYXJhbUNtcCd9XG5dKVxuY2xhc3MgQXBwQ21wIHtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChcbiAgICAgIEFwcENtcCwgW3Byb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZSd9KV0pO1xufVxuIl19