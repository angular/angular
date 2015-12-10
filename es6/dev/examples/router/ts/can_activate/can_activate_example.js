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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuX2FjdGl2YXRlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9yb3V0ZXIvdHMvY2FuX2FjdGl2YXRlL2Nhbl9hY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbImNoZWNrSWZXZUhhdmVQZXJtaXNzaW9uIiwiQ29udHJvbFBhbmVsQ21wIiwiSG9tZUNtcCIsIkFwcENtcCIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBQyxNQUFNLG1CQUFtQjtPQUN4RCxFQUNMLFdBQVcsRUFDWCxXQUFXLEVBRVgsYUFBYSxFQUNiLGlCQUFpQixFQUNsQixNQUFNLGlCQUFpQjtBQUV4QixpQ0FBaUMsV0FBaUM7SUFDaEVBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBO0FBQ3pDQSxDQUFDQTtBQUVELHlCQUF5QjtBQUN6QjtBQUdBQyxDQUFDQTtBQUhEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSwwQkFBMEIsRUFBQyxDQUFDO0lBQ2hGLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQzs7b0JBRXBDO0FBQ0QsZ0JBQWdCO0FBR2hCO0FBWUFDLENBQUNBO0FBWkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsVUFBVTtRQUNwQixRQUFRLEVBQUU7Ozs7OztHQU1UO1FBQ0QsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDaEMsQ0FBQzs7WUFFRDtBQUdEO0FBYUFDLENBQUNBO0FBYkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixRQUFRLEVBQUU7OztHQUdUO1FBQ0QsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDaEMsQ0FBQztJQUNELFdBQVcsQ0FBQztRQUNYLEVBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFDO1FBQ2pGLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7S0FDakQsQ0FBQzs7V0FFRDtBQUdEO0lBQ0VDLE1BQU1BLENBQUNBLFNBQVNBLENBQ1pBLE1BQU1BLEVBQUVBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLDJDQUEyQ0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDakdBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtib290c3RyYXAsIHByb3ZpZGUsIENvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuaW1wb3J0IHtcbiAgQ2FuQWN0aXZhdGUsXG4gIFJvdXRlQ29uZmlnLFxuICBDb21wb25lbnRJbnN0cnVjdGlvbixcbiAgQVBQX0JBU0VfSFJFRixcbiAgUk9VVEVSX0RJUkVDVElWRVNcbn0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcblxuZnVuY3Rpb24gY2hlY2tJZldlSGF2ZVBlcm1pc3Npb24oaW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKSB7XG4gIHJldHVybiBpbnN0cnVjdGlvbi5wYXJhbXNbJ2lkJ10gPT0gJzEnO1xufVxuXG4vLyAjZG9jcmVnaW9uIGNhbkFjdGl2YXRlXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogJ2NvbnRyb2wtcGFuZWwtY21wJywgdGVtcGxhdGU6IGA8ZGl2PlNldHRpbmdzOiAuLi48L2Rpdj5gfSlcbkBDYW5BY3RpdmF0ZShjaGVja0lmV2VIYXZlUGVybWlzc2lvbilcbmNsYXNzIENvbnRyb2xQYW5lbENtcCB7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnaG9tZS1jbXAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5XZWxjb21lIEhvbWUhPC9oMT5cbiAgICA8ZGl2PlxuICAgICAgRWRpdCA8YSBbcm91dGVyLWxpbmtdPVwiWycvQ29udHJvbFBhbmVsQ21wJywge2lkOiAxfV1cIiBpZD1cInVzZXItMS1saW5rXCI+VXNlciAxPC9hPiB8XG4gICAgICBFZGl0IDxhIFtyb3V0ZXItbGlua109XCJbJy9Db250cm9sUGFuZWxDbXAnLCB7aWQ6IDJ9XVwiIGlkPVwidXNlci0yLWxpbmtcIj5Vc2VyIDI8L2E+XG4gICAgPC9kaXY+XG4gIGAsXG4gIGRpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU11cbn0pXG5jbGFzcyBIb21lQ21wIHtcbn1cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPk15IEFwcDwvaDE+XG4gICAgPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICBgLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuQFJvdXRlQ29uZmlnKFtcbiAge3BhdGg6ICcvdXNlci1zZXR0aW5ncy86aWQnLCBjb21wb25lbnQ6IENvbnRyb2xQYW5lbENtcCwgbmFtZTogJ0NvbnRyb2xQYW5lbENtcCd9LFxuICB7cGF0aDogJy8nLCBjb21wb25lbnQ6IEhvbWVDbXAsIG5hbWU6ICdIb21lQ21wJ31cbl0pXG5jbGFzcyBBcHBDbXAge1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICByZXR1cm4gYm9vdHN0cmFwKFxuICAgICAgQXBwQ21wLCBbcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL2Nhbl9hY3RpdmF0ZSd9KV0pO1xufVxuIl19