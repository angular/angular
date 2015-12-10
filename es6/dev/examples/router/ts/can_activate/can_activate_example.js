var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { provide, Component } from 'angular2/core';
import { bootstrap } from 'angular2/bootstrap';
import { CanActivate, RouteConfig, APP_BASE_HREF, ROUTER_DIRECTIVES } from 'angular2/router';
function checkIfWeHavePermission(instruction) {
    return instruction.params['id'] == '1';
}
// #docregion canActivate
let ControlPanelCmp = class {
};
ControlPanelCmp = __decorate([
    Component({ selector: 'control-panel-cmp', template: `<div>Settings: ...</div>` }),
    CanActivate(checkIfWeHavePermission), 
    __metadata('design:paramtypes', [])
], ControlPanelCmp);
// #enddocregion
let HomeCmp = class {
};
HomeCmp = __decorate([
    Component({
        selector: 'home-cmp',
        template: `
    <h1>Welcome Home!</h1>
    <div>
      Edit <a [routerLink]="['/ControlPanelCmp', {id: 1}]" id="user-1-link">User 1</a> |
      Edit <a [routerLink]="['/ControlPanelCmp', {id: 2}]" id="user-2-link">User 2</a>
    </div>
  `,
        directives: [ROUTER_DIRECTIVES]
    }), 
    __metadata('design:paramtypes', [])
], HomeCmp);
let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My App</h1>
    <router-outlet></router-outlet>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([
        { path: '/user-settings/:id', component: ControlPanelCmp, name: 'ControlPanelCmp' },
        { path: '/', component: HomeCmp, name: 'HomeCmp' }
    ]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/can_activate' })]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuX2FjdGl2YXRlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9yb3V0ZXIvdHMvY2FuX2FjdGl2YXRlL2Nhbl9hY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbImNoZWNrSWZXZUhhdmVQZXJtaXNzaW9uIiwiQ29udHJvbFBhbmVsQ21wIiwiSG9tZUNtcCIsIkFwcENtcCIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0I7T0FDckMsRUFDTCxXQUFXLEVBQ1gsV0FBVyxFQUVYLGFBQWEsRUFDYixpQkFBaUIsRUFDbEIsTUFBTSxpQkFBaUI7QUFFeEIsaUNBQWlDLFdBQWlDO0lBQ2hFQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQTtBQUN6Q0EsQ0FBQ0E7QUFFRCx5QkFBeUI7QUFDekI7QUFHQUMsQ0FBQ0E7QUFIRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUMsQ0FBQztJQUNoRixXQUFXLENBQUMsdUJBQXVCLENBQUM7O29CQUVwQztBQUNELGdCQUFnQjtBQUdoQjtBQVlBQyxDQUFDQTtBQVpEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFVBQVU7UUFDcEIsUUFBUSxFQUFFOzs7Ozs7R0FNVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7O1lBRUQ7QUFHRDtBQWFBQyxDQUFDQTtBQWJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFOzs7R0FHVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7SUFDRCxXQUFXLENBQUM7UUFDWCxFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBQztRQUNqRixFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO0tBQ2pELENBQUM7O1dBRUQ7QUFHRDtJQUNFQyxNQUFNQSxDQUFDQSxTQUFTQSxDQUNaQSxNQUFNQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSwyQ0FBMkNBLEVBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ2pHQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7cHJvdmlkZSwgQ29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9ib290c3RyYXAnO1xuaW1wb3J0IHtcbiAgQ2FuQWN0aXZhdGUsXG4gIFJvdXRlQ29uZmlnLFxuICBDb21wb25lbnRJbnN0cnVjdGlvbixcbiAgQVBQX0JBU0VfSFJFRixcbiAgUk9VVEVSX0RJUkVDVElWRVNcbn0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcblxuZnVuY3Rpb24gY2hlY2tJZldlSGF2ZVBlcm1pc3Npb24oaW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKSB7XG4gIHJldHVybiBpbnN0cnVjdGlvbi5wYXJhbXNbJ2lkJ10gPT0gJzEnO1xufVxuXG4vLyAjZG9jcmVnaW9uIGNhbkFjdGl2YXRlXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogJ2NvbnRyb2wtcGFuZWwtY21wJywgdGVtcGxhdGU6IGA8ZGl2PlNldHRpbmdzOiAuLi48L2Rpdj5gfSlcbkBDYW5BY3RpdmF0ZShjaGVja0lmV2VIYXZlUGVybWlzc2lvbilcbmNsYXNzIENvbnRyb2xQYW5lbENtcCB7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnaG9tZS1jbXAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5XZWxjb21lIEhvbWUhPC9oMT5cbiAgICA8ZGl2PlxuICAgICAgRWRpdCA8YSBbcm91dGVyTGlua109XCJbJy9Db250cm9sUGFuZWxDbXAnLCB7aWQ6IDF9XVwiIGlkPVwidXNlci0xLWxpbmtcIj5Vc2VyIDE8L2E+IHxcbiAgICAgIEVkaXQgPGEgW3JvdXRlckxpbmtdPVwiWycvQ29udHJvbFBhbmVsQ21wJywge2lkOiAyfV1cIiBpZD1cInVzZXItMi1saW5rXCI+VXNlciAyPC9hPlxuICAgIDwvZGl2PlxuICBgLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuY2xhc3MgSG9tZUNtcCB7XG59XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5NeSBBcHA8L2gxPlxuICAgIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbXG4gIHtwYXRoOiAnL3VzZXItc2V0dGluZ3MvOmlkJywgY29tcG9uZW50OiBDb250cm9sUGFuZWxDbXAsIG5hbWU6ICdDb250cm9sUGFuZWxDbXAnfSxcbiAge3BhdGg6ICcvJywgY29tcG9uZW50OiBIb21lQ21wLCBuYW1lOiAnSG9tZUNtcCd9XG5dKVxuY2xhc3MgQXBwQ21wIHtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChcbiAgICAgIEFwcENtcCwgW3Byb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fYWN0aXZhdGUnfSldKTtcbn1cbiJdfQ==