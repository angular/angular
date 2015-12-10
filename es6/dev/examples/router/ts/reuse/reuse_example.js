var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { bootstrap, Component, provide } from 'angular2/angular2';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV1c2VfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9yZXVzZS9yZXVzZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIk15Q21wIiwiTXlDbXAuY29uc3RydWN0b3IiLCJNeUNtcC5yb3V0ZXJDYW5SZXVzZSIsIk15Q21wLnJvdXRlck9uUmV1c2UiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sbUJBQW1CO09BQ3hELEVBRUwsV0FBVyxFQUVYLGlCQUFpQixFQUNqQixhQUFhLEVBRWIsV0FBVyxFQUVaLE1BQU0saUJBQWlCO0FBR3hCLHNCQUFzQjtBQUN0QjtJQVVFQSxZQUFZQSxNQUFtQkE7UUFBSUMsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFaEZELGNBQWNBLENBQUNBLElBQTBCQSxFQUFFQSxJQUEwQkEsSUFBSUUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdkZGLGFBQWFBLENBQUNBLElBQTBCQSxFQUFFQSxJQUEwQkE7UUFDbEVHLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ2xDQSxDQUFDQTtBQUNISCxDQUFDQTtBQWpCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFFBQVEsRUFBRTs7O0dBR1Q7S0FDRixDQUFDOztVQVdEO0FBQ0QsZ0JBQWdCO0FBR2hCO0FBZUFJLENBQUNBO0FBZkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixRQUFRLEVBQUU7Ozs7O0dBS1Q7UUFDRCxVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztLQUNoQyxDQUFDO0lBQ0QsV0FBVyxDQUFDO1FBQ1gsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztRQUM5QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO0tBQ3BELENBQUM7O1dBRUQ7QUFHRDtJQUNFQyxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUNOQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSxvQ0FBb0NBLEVBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQy9GQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Ym9vdHN0cmFwLCBDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbmltcG9ydCB7XG4gIENhbkFjdGl2YXRlLFxuICBSb3V0ZUNvbmZpZyxcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICBBUFBfQkFTRV9IUkVGLFxuICBDYW5SZXVzZSxcbiAgUm91dGVQYXJhbXMsXG4gIE9uUmV1c2Vcbn0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcblxuXG4vLyAjZG9jcmVnaW9uIHJldXNlQ21wXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdteS1jbXAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXY+aGVsbG8ge3tuYW1lfX0hPC9kaXY+XG4gICAgPGRpdj5tZXNzYWdlOiA8aW5wdXQgaWQ9XCJtZXNzYWdlXCI+PC9kaXY+XG4gIGBcbn0pXG5jbGFzcyBNeUNtcCBpbXBsZW1lbnRzIENhblJldXNlLFxuICAgIE9uUmV1c2Uge1xuICBuYW1lOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKHBhcmFtczogUm91dGVQYXJhbXMpIHsgdGhpcy5uYW1lID0gcGFyYW1zLmdldCgnbmFtZScpIHx8ICdOT0JPRFknOyB9XG5cbiAgcm91dGVyQ2FuUmV1c2UobmV4dDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIHByZXY6IENvbXBvbmVudEluc3RydWN0aW9uKSB7IHJldHVybiB0cnVlOyB9XG5cbiAgcm91dGVyT25SZXVzZShuZXh0OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgcHJldjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pIHtcbiAgICB0aGlzLm5hbWUgPSBuZXh0LnBhcmFtc1snbmFtZSddO1xuICB9XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5TYXkgaGkgdG8uLi48L2gxPlxuICAgIDxhIFtyb3V0ZXJMaW5rXT1cIlsnL0hvbWVDbXAnLCB7bmFtZTogJ25hb21pJ31dXCIgaWQ9XCJuYW9taS1saW5rXCI+TmFvbWk8L2E+IHxcbiAgICA8YSBbcm91dGVyTGlua109XCJbJy9Ib21lQ21wJywge25hbWU6ICdicmFkJ31dXCIgaWQ9XCJicmFkLWxpbmtcIj5CcmFkPC9hPlxuICAgIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbXG4gIHtwYXRoOiAnLycsIGNvbXBvbmVudDogTXlDbXAsIG5hbWU6ICdIb21lQ21wJ30sXG4gIHtwYXRoOiAnLzpuYW1lJywgY29tcG9uZW50OiBNeUNtcCwgbmFtZTogJ0hvbWVDbXAnfVxuXSlcbmNsYXNzIEFwcENtcCB7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIHJldHVybiBib290c3RyYXAoQXBwQ21wLFxuICAgICAgICAgICAgICAgICAgIFtwcm92aWRlKEFQUF9CQVNFX0hSRUYsIHt1c2VWYWx1ZTogJy9hbmd1bGFyMi9leGFtcGxlcy9yb3V0ZXIvdHMvcmV1c2UnfSldKTtcbn1cbiJdfQ==