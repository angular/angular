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
import { bootstrap } from 'angular2/platform/browser';
import { RouteConfig, ROUTER_DIRECTIVES, RouteParams } from 'angular2/router';
import { APP_BASE_HREF } from 'angular2/platform/common';
// #docregion reuseCmp
let MyCmp = class MyCmp {
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
let AppCmp = class AppCmp {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV1c2VfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9yZXVzZS9yZXVzZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7T0FDNUMsRUFFTCxXQUFXLEVBRVgsaUJBQWlCLEVBRWpCLFdBQVcsRUFFWixNQUFNLGlCQUFpQjtPQUNqQixFQUFDLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtBQUd0RCxzQkFBc0I7QUFRdEI7SUFHRSxZQUFZLE1BQW1CO1FBQUksSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQztJQUFDLENBQUM7SUFFaEYsY0FBYyxDQUFDLElBQTBCLEVBQUUsSUFBMEIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUV2RixhQUFhLENBQUMsSUFBMEIsRUFBRSxJQUEwQjtRQUNsRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztBQUNILENBQUM7QUFqQkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsUUFBUTtRQUNsQixRQUFRLEVBQUU7OztHQUdUO0tBQ0YsQ0FBQzs7U0FBQTtBQVlGLGdCQUFnQjtBQWlCaEI7QUFDQSxDQUFDO0FBZkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixRQUFRLEVBQUU7Ozs7O0dBS1Q7UUFDRCxVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztLQUNoQyxDQUFDO0lBQ0QsV0FBVyxDQUFDO1FBQ1gsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztRQUM5QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO0tBQ3BELENBQUM7O1VBQUE7QUFLRjtJQUNFLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUNOLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFDLFFBQVEsRUFBRSxvQ0FBb0MsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9GLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5pbXBvcnQge1xuICBDYW5BY3RpdmF0ZSxcbiAgUm91dGVDb25maWcsXG4gIENvbXBvbmVudEluc3RydWN0aW9uLFxuICBST1VURVJfRElSRUNUSVZFUyxcbiAgQ2FuUmV1c2UsXG4gIFJvdXRlUGFyYW1zLFxuICBPblJldXNlXG59IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5pbXBvcnQge0FQUF9CQVNFX0hSRUZ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbic7XG5cblxuLy8gI2RvY3JlZ2lvbiByZXVzZUNtcFxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbXktY21wJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2PmhlbGxvIHt7bmFtZX19ITwvZGl2PlxuICAgIDxkaXY+bWVzc2FnZTogPGlucHV0IGlkPVwibWVzc2FnZVwiPjwvZGl2PlxuICBgXG59KVxuY2xhc3MgTXlDbXAgaW1wbGVtZW50cyBDYW5SZXVzZSxcbiAgICBPblJldXNlIHtcbiAgbmFtZTogc3RyaW5nO1xuICBjb25zdHJ1Y3RvcihwYXJhbXM6IFJvdXRlUGFyYW1zKSB7IHRoaXMubmFtZSA9IHBhcmFtcy5nZXQoJ25hbWUnKSB8fCAnTk9CT0RZJzsgfVxuXG4gIHJvdXRlckNhblJldXNlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikgeyByZXR1cm4gdHJ1ZTsgfVxuXG4gIHJvdXRlck9uUmV1c2UobmV4dDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIHByZXY6IENvbXBvbmVudEluc3RydWN0aW9uKSB7XG4gICAgdGhpcy5uYW1lID0gbmV4dC5wYXJhbXNbJ25hbWUnXTtcbiAgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDE+U2F5IGhpIHRvLi4uPC9oMT5cbiAgICA8YSBbcm91dGVyTGlua109XCJbJy9Ib21lQ21wJywge25hbWU6ICduYW9taSd9XVwiIGlkPVwibmFvbWktbGlua1wiPk5hb21pPC9hPiB8XG4gICAgPGEgW3JvdXRlckxpbmtdPVwiWycvSG9tZUNtcCcsIHtuYW1lOiAnYnJhZCd9XVwiIGlkPVwiYnJhZC1saW5rXCI+QnJhZDwvYT5cbiAgICA8cm91dGVyLW91dGxldD48L3JvdXRlci1vdXRsZXQ+XG4gIGAsXG4gIGRpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU11cbn0pXG5AUm91dGVDb25maWcoW1xuICB7cGF0aDogJy8nLCBjb21wb25lbnQ6IE15Q21wLCBuYW1lOiAnSG9tZUNtcCd9LFxuICB7cGF0aDogJy86bmFtZScsIGNvbXBvbmVudDogTXlDbXAsIG5hbWU6ICdIb21lQ21wJ31cbl0pXG5jbGFzcyBBcHBDbXAge1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICByZXR1cm4gYm9vdHN0cmFwKEFwcENtcCxcbiAgICAgICAgICAgICAgICAgICBbcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL3JldXNlJ30pXSk7XG59XG4iXX0=