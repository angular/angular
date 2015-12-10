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
import { RouteConfig, ROUTER_DIRECTIVES, APP_BASE_HREF, RouteParams } from 'angular2/router';
// #docregion reuseCmp
let MyCmp = class {
    constructor(params) {
        this.name = params.get('name') || 'NOBODY';
    }
    routerCanReuse(next, prev) { return true; }
    routerOnReuse(next, prev) {
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
    <a [routerLink]="['/HomeCmp', {name: 'naomi'}]" id="naomi-link">Naomi</a> |
    <a [routerLink]="['/HomeCmp', {name: 'brad'}]" id="brad-link">Brad</a>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV1c2VfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9yZXVzZS9yZXVzZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIk15Q21wIiwiTXlDbXAuY29uc3RydWN0b3IiLCJNeUNtcC5yb3V0ZXJDYW5SZXVzZSIsIk15Q21wLnJvdXRlck9uUmV1c2UiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxlQUFlO09BQ3pDLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CO09BQ3JDLEVBRUwsV0FBVyxFQUVYLGlCQUFpQixFQUNqQixhQUFhLEVBRWIsV0FBVyxFQUVaLE1BQU0saUJBQWlCO0FBR3hCLHNCQUFzQjtBQUN0QjtJQVVFQSxZQUFZQSxNQUFtQkE7UUFBSUMsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFaEZELGNBQWNBLENBQUNBLElBQTBCQSxFQUFFQSxJQUEwQkEsSUFBSUUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdkZGLGFBQWFBLENBQUNBLElBQTBCQSxFQUFFQSxJQUEwQkE7UUFDbEVHLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ2xDQSxDQUFDQTtBQUNISCxDQUFDQTtBQWpCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFFBQVEsRUFBRTs7O0dBR1Q7S0FDRixDQUFDOztVQVdEO0FBQ0QsZ0JBQWdCO0FBR2hCO0FBZUFJLENBQUNBO0FBZkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixRQUFRLEVBQUU7Ozs7O0dBS1Q7UUFDRCxVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztLQUNoQyxDQUFDO0lBQ0QsV0FBVyxDQUFDO1FBQ1gsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztRQUM5QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO0tBQ3BELENBQUM7O1dBRUQ7QUFHRDtJQUNFQyxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUNOQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSxvQ0FBb0NBLEVBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQy9GQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9ib290c3RyYXAnO1xuaW1wb3J0IHtcbiAgQ2FuQWN0aXZhdGUsXG4gIFJvdXRlQ29uZmlnLFxuICBDb21wb25lbnRJbnN0cnVjdGlvbixcbiAgUk9VVEVSX0RJUkVDVElWRVMsXG4gIEFQUF9CQVNFX0hSRUYsXG4gIENhblJldXNlLFxuICBSb3V0ZVBhcmFtcyxcbiAgT25SZXVzZVxufSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuXG5cbi8vICNkb2NyZWdpb24gcmV1c2VDbXBcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ215LWNtcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdj5oZWxsbyB7e25hbWV9fSE8L2Rpdj5cbiAgICA8ZGl2Pm1lc3NhZ2U6IDxpbnB1dCBpZD1cIm1lc3NhZ2VcIj48L2Rpdj5cbiAgYFxufSlcbmNsYXNzIE15Q21wIGltcGxlbWVudHMgQ2FuUmV1c2UsXG4gICAgT25SZXVzZSB7XG4gIG5hbWU6IHN0cmluZztcbiAgY29uc3RydWN0b3IocGFyYW1zOiBSb3V0ZVBhcmFtcykgeyB0aGlzLm5hbWUgPSBwYXJhbXMuZ2V0KCduYW1lJykgfHwgJ05PQk9EWSc7IH1cblxuICByb3V0ZXJDYW5SZXVzZShuZXh0OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgcHJldjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pIHsgcmV0dXJuIHRydWU7IH1cblxuICByb3V0ZXJPblJldXNlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHRoaXMubmFtZSA9IG5leHQucGFyYW1zWyduYW1lJ107XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPlNheSBoaSB0by4uLjwvaDE+XG4gICAgPGEgW3JvdXRlckxpbmtdPVwiWycvSG9tZUNtcCcsIHtuYW1lOiAnbmFvbWknfV1cIiBpZD1cIm5hb21pLWxpbmtcIj5OYW9taTwvYT4gfFxuICAgIDxhIFtyb3V0ZXJMaW5rXT1cIlsnL0hvbWVDbXAnLCB7bmFtZTogJ2JyYWQnfV1cIiBpZD1cImJyYWQtbGlua1wiPkJyYWQ8L2E+XG4gICAgPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICBgLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuQFJvdXRlQ29uZmlnKFtcbiAge3BhdGg6ICcvJywgY29tcG9uZW50OiBNeUNtcCwgbmFtZTogJ0hvbWVDbXAnfSxcbiAge3BhdGg6ICcvOm5hbWUnLCBjb21wb25lbnQ6IE15Q21wLCBuYW1lOiAnSG9tZUNtcCd9XG5dKVxuY2xhc3MgQXBwQ21wIHtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChBcHBDbXAsXG4gICAgICAgICAgICAgICAgICAgW3Byb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9yZXVzZSd9KV0pO1xufVxuIl19