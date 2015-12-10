var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { bootstrap, provide, Component } from 'angular2/angular2';
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
      Edit <a [router-link]="['/ControlPanelCmp', {id: 1}]" id="user-1-link">User 1</a> |
      Edit <a [router-link]="['/ControlPanelCmp', {id: 2}]" id="user-2-link">User 2</a>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuX2FjdGl2YXRlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9yb3V0ZXIvdHMvY2FuX2FjdGl2YXRlL2Nhbl9hY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbImNoZWNrSWZXZUhhdmVQZXJtaXNzaW9uIiwiQ29udHJvbFBhbmVsQ21wIiwiSG9tZUNtcCIsIkFwcENtcCIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUMsTUFBTSxtQkFBbUI7T0FDeEQsRUFDTCxXQUFXLEVBQ1gsV0FBVyxFQUVYLGFBQWEsRUFDYixpQkFBaUIsRUFDbEIsTUFBTSxpQkFBaUI7QUFFeEIsaUNBQWlDLFdBQWlDO0lBQ2hFQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQTtBQUN6Q0EsQ0FBQ0E7QUFFRCx5QkFBeUI7QUFDekI7QUFHQUMsQ0FBQ0E7QUFIRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUMsQ0FBQztJQUNoRixXQUFXLENBQUMsdUJBQXVCLENBQUM7O29CQUVwQztBQUNELGdCQUFnQjtBQUdoQjtBQVlBQyxDQUFDQTtBQVpEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFVBQVU7UUFDcEIsUUFBUSxFQUFFOzs7Ozs7R0FNVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7O1lBRUQ7QUFHRDtBQWFBQyxDQUFDQTtBQWJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFOzs7R0FHVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7SUFDRCxXQUFXLENBQUM7UUFDWCxFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBQztRQUNqRixFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO0tBQ2pELENBQUM7O1dBRUQ7QUFHRDtJQUNFQyxNQUFNQSxDQUFDQSxTQUFTQSxDQUNaQSxNQUFNQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSwyQ0FBMkNBLEVBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ2pHQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Ym9vdHN0cmFwLCBwcm92aWRlLCBDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbmltcG9ydCB7XG4gIENhbkFjdGl2YXRlLFxuICBSb3V0ZUNvbmZpZyxcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIEFQUF9CQVNFX0hSRUYsXG4gIFJPVVRFUl9ESVJFQ1RJVkVTXG59IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5cbmZ1bmN0aW9uIGNoZWNrSWZXZUhhdmVQZXJtaXNzaW9uKGluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb24ucGFyYW1zWydpZCddID09ICcxJztcbn1cblxuLy8gI2RvY3JlZ2lvbiBjYW5BY3RpdmF0ZVxuQENvbXBvbmVudCh7c2VsZWN0b3I6ICdjb250cm9sLXBhbmVsLWNtcCcsIHRlbXBsYXRlOiBgPGRpdj5TZXR0aW5nczogLi4uPC9kaXY+YH0pXG5AQ2FuQWN0aXZhdGUoY2hlY2tJZldlSGF2ZVBlcm1pc3Npb24pXG5jbGFzcyBDb250cm9sUGFuZWxDbXAge1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2hvbWUtY21wJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDE+V2VsY29tZSBIb21lITwvaDE+XG4gICAgPGRpdj5cbiAgICAgIEVkaXQgPGEgW3JvdXRlci1saW5rXT1cIlsnL0NvbnRyb2xQYW5lbENtcCcsIHtpZDogMX1dXCIgaWQ9XCJ1c2VyLTEtbGlua1wiPlVzZXIgMTwvYT4gfFxuICAgICAgRWRpdCA8YSBbcm91dGVyLWxpbmtdPVwiWycvQ29udHJvbFBhbmVsQ21wJywge2lkOiAyfV1cIiBpZD1cInVzZXItMi1saW5rXCI+VXNlciAyPC9hPlxuICAgIDwvZGl2PlxuICBgLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuY2xhc3MgSG9tZUNtcCB7XG59XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5NeSBBcHA8L2gxPlxuICAgIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbXG4gIHtwYXRoOiAnL3VzZXItc2V0dGluZ3MvOmlkJywgY29tcG9uZW50OiBDb250cm9sUGFuZWxDbXAsIG5hbWU6ICdDb250cm9sUGFuZWxDbXAnfSxcbiAge3BhdGg6ICcvJywgY29tcG9uZW50OiBIb21lQ21wLCBuYW1lOiAnSG9tZUNtcCd9XG5dKVxuY2xhc3MgQXBwQ21wIHtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChcbiAgICAgIEFwcENtcCwgW3Byb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fYWN0aXZhdGUnfSldKTtcbn1cbiJdfQ==