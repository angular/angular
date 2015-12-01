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
// #docregion onActivate
let MyCmp = class {
    constructor() {
        this.log = '';
    }
    onActivate(next, prev) {
        this.log = `Finished navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`;
    }
};
MyCmp = __decorate([
    Component({ selector: 'my-cmp', template: `<div>onActivate: {{log}}</div>` }), 
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZS9vbl9hY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIk15Q21wIiwiTXlDbXAuY29uc3RydWN0b3IiLCJNeUNtcC5vbkFjdGl2YXRlIiwiQXBwQ21wIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sbUJBQW1CO09BQ3hELEVBR0wsV0FBVyxFQUNYLGlCQUFpQixFQUNqQixhQUFhLEVBQ2QsTUFBTSxpQkFBaUI7QUFHeEIsd0JBQXdCO0FBQ3hCO0lBQUFBO1FBRUVDLFFBQUdBLEdBQVdBLEVBQUVBLENBQUNBO0lBS25CQSxDQUFDQTtJQUhDRCxVQUFVQSxDQUFDQSxJQUEwQkEsRUFBRUEsSUFBMEJBO1FBQy9ERSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSw2QkFBNkJBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLFNBQVNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLENBQUNBO0lBQy9GQSxDQUFDQTtBQUNIRixDQUFDQTtBQVBEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsZ0NBQWdDLEVBQUMsQ0FBQzs7VUFPM0U7QUFDRCxnQkFBZ0I7QUFHaEI7QUFpQkFHLENBQUNBO0FBakJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFOzs7Ozs7O0dBT1Q7UUFDRCxVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztLQUNoQyxDQUFDO0lBQ0QsV0FBVyxDQUFDO1FBQ1gsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztRQUM5QyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO0tBQ3RELENBQUM7O1dBRUQ7QUFHRDtJQUNFQyxNQUFNQSxDQUFDQSxTQUFTQSxDQUNaQSxNQUFNQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSwwQ0FBMENBLEVBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ2hHQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlLCBib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbmltcG9ydCB7XG4gIE9uQWN0aXZhdGUsXG4gIENvbXBvbmVudEluc3RydWN0aW9uLFxuICBSb3V0ZUNvbmZpZyxcbiAgUk9VVEVSX0RJUkVDVElWRVMsXG4gIEFQUF9CQVNFX0hSRUZcbn0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcblxuXG4vLyAjZG9jcmVnaW9uIG9uQWN0aXZhdGVcbkBDb21wb25lbnQoe3NlbGVjdG9yOiAnbXktY21wJywgdGVtcGxhdGU6IGA8ZGl2Pm9uQWN0aXZhdGU6IHt7bG9nfX08L2Rpdj5gfSlcbmNsYXNzIE15Q21wIGltcGxlbWVudHMgT25BY3RpdmF0ZSB7XG4gIGxvZzogc3RyaW5nID0gJyc7XG5cbiAgb25BY3RpdmF0ZShuZXh0OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgcHJldjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pIHtcbiAgICB0aGlzLmxvZyA9IGBGaW5pc2hlZCBuYXZpZ2F0aW5nIGZyb20gXCIke3ByZXYgPyBwcmV2LnVybFBhdGggOiAnbnVsbCd9XCIgdG8gXCIke25leHQudXJsUGF0aH1cImA7XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPk15IEFwcDwvaDE+XG4gICAgPG5hdj5cbiAgICAgIDxhIFtyb3V0ZXItbGlua109XCJbJy9Ib21lQ21wJ11cIiBpZD1cImhvbWUtbGlua1wiPk5hdmlnYXRlIEhvbWU8L2E+IHxcbiAgICAgIDxhIFtyb3V0ZXItbGlua109XCJbJy9QYXJhbUNtcCcsIHtwYXJhbTogMX1dXCIgaWQ9XCJwYXJhbS1saW5rXCI+TmF2aWdhdGUgd2l0aCBhIFBhcmFtPC9hPlxuICAgIDwvbmF2PlxuICAgIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbXG4gIHtwYXRoOiAnLycsIGNvbXBvbmVudDogTXlDbXAsIG5hbWU6ICdIb21lQ21wJ30sXG4gIHtwYXRoOiAnLzpwYXJhbScsIGNvbXBvbmVudDogTXlDbXAsIG5hbWU6ICdQYXJhbUNtcCd9XG5dKVxuY2xhc3MgQXBwQ21wIHtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChcbiAgICAgIEFwcENtcCwgW3Byb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZSd9KV0pO1xufVxuIl19