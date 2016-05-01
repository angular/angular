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
import { RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';
import { APP_BASE_HREF } from 'angular2/platform/common';
// #docregion routerOnActivate
let ChildCmp = class ChildCmp {
};
ChildCmp = __decorate([
    Component({ template: `Child` }), 
    __metadata('design:paramtypes', [])
], ChildCmp);
let ParentCmp = class ParentCmp {
    constructor() {
        this.log = '';
    }
    routerOnActivate(next, prev) {
        this.log = `Finished navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`;
        return new Promise(resolve => {
            // The ChildCmp gets instantiated only when the Promise is resolved
            setTimeout(() => resolve(null), 1000);
        });
    }
};
ParentCmp = __decorate([
    Component({
        template: `
    <h2>Parent</h2> (<router-outlet></router-outlet>)
    <p>{{log}}</p>`,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([{ path: '/child', name: 'Child', component: ChildCmp }]), 
    __metadata('design:paramtypes', [])
], ParentCmp);
// #enddocregion
export let AppCmp = class AppCmp {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My app</h1>

    <nav>
      <a [routerLink]="['Parent', 'Child']">Child</a>
    </nav>
    <router-outlet></router-outlet>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([{ path: '/parent/...', name: 'Parent', component: ParentCmp }]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/on_activate' })]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZS9vbl9hY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7T0FDNUMsRUFBbUMsV0FBVyxFQUFFLGlCQUFpQixFQUFDLE1BQU0saUJBQWlCO09BQ3pGLEVBQUMsYUFBYSxFQUFDLE1BQU0sMEJBQTBCO0FBRXRELDhCQUE4QjtBQUU5QjtBQUNBLENBQUM7QUFGRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQzs7WUFBQTtBQVcvQjtJQUFBO1FBQ0UsUUFBRyxHQUFXLEVBQUUsQ0FBQztJQVVuQixDQUFDO0lBUkMsZ0JBQWdCLENBQUMsSUFBMEIsRUFBRSxJQUEwQjtRQUNyRSxJQUFJLENBQUMsR0FBRyxHQUFHLDZCQUE2QixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLFNBQVMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDO1FBRTdGLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPO1lBQ3hCLG1FQUFtRTtZQUNuRSxVQUFVLENBQUMsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0FBQ0gsQ0FBQztBQWxCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRTs7bUJBRU87UUFDakIsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDaEMsQ0FBQztJQUNELFdBQVcsQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDOzthQUFBO0FBYXBFLGdCQUFnQjtBQWdCaEI7QUFDQSxDQUFDO0FBZEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixRQUFRLEVBQUU7Ozs7Ozs7R0FPVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7SUFDRCxXQUFXLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQzs7VUFBQTtBQUkzRTtJQUNFLE1BQU0sQ0FBQyxTQUFTLENBQ1osTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFDLFFBQVEsRUFBRSwwQ0FBMEMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5pbXBvcnQge09uQWN0aXZhdGUsIENvbXBvbmVudEluc3RydWN0aW9uLCBSb3V0ZUNvbmZpZywgUk9VVEVSX0RJUkVDVElWRVN9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5pbXBvcnQge0FQUF9CQVNFX0hSRUZ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbic7XG5cbi8vICNkb2NyZWdpb24gcm91dGVyT25BY3RpdmF0ZVxuQENvbXBvbmVudCh7dGVtcGxhdGU6IGBDaGlsZGB9KVxuY2xhc3MgQ2hpbGRDbXAge1xufVxuXG5AQ29tcG9uZW50KHtcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDI+UGFyZW50PC9oMj4gKDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD4pXG4gICAgPHA+e3tsb2d9fTwvcD5gLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuQFJvdXRlQ29uZmlnKFt7cGF0aDogJy9jaGlsZCcsIG5hbWU6ICdDaGlsZCcsIGNvbXBvbmVudDogQ2hpbGRDbXB9XSlcbmNsYXNzIFBhcmVudENtcCBpbXBsZW1lbnRzIE9uQWN0aXZhdGUge1xuICBsb2c6IHN0cmluZyA9ICcnO1xuXG4gIHJvdXRlck9uQWN0aXZhdGUobmV4dDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIHByZXY6IENvbXBvbmVudEluc3RydWN0aW9uKSB7XG4gICAgdGhpcy5sb2cgPSBgRmluaXNoZWQgbmF2aWdhdGluZyBmcm9tIFwiJHtwcmV2ID8gcHJldi51cmxQYXRoIDogJ251bGwnfVwiIHRvIFwiJHtuZXh0LnVybFBhdGh9XCJgO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgLy8gVGhlIENoaWxkQ21wIGdldHMgaW5zdGFudGlhdGVkIG9ubHkgd2hlbiB0aGUgUHJvbWlzZSBpcyByZXNvbHZlZFxuICAgICAgc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKG51bGwpLCAxMDAwKTtcbiAgICB9KTtcbiAgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDE+TXkgYXBwPC9oMT5cblxuICAgIDxuYXY+XG4gICAgICA8YSBbcm91dGVyTGlua109XCJbJ1BhcmVudCcsICdDaGlsZCddXCI+Q2hpbGQ8L2E+XG4gICAgPC9uYXY+XG4gICAgPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICBgLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuQFJvdXRlQ29uZmlnKFt7cGF0aDogJy9wYXJlbnQvLi4uJywgbmFtZTogJ1BhcmVudCcsIGNvbXBvbmVudDogUGFyZW50Q21wfV0pXG5leHBvcnQgY2xhc3MgQXBwQ21wIHtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIHJldHVybiBib290c3RyYXAoXG4gICAgICBBcHBDbXAsIFtwcm92aWRlKEFQUF9CQVNFX0hSRUYsIHt1c2VWYWx1ZTogJy9hbmd1bGFyMi9leGFtcGxlcy9yb3V0ZXIvdHMvb25fYWN0aXZhdGUnfSldKTtcbn1cbiJdfQ==