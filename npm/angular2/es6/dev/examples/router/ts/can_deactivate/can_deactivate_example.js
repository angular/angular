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
import { bootstrap } from 'angular2/platform/browser';
import { RouteConfig, RouteParams, ROUTER_DIRECTIVES } from 'angular2/router';
import { APP_BASE_HREF } from 'angular2/platform/common';
// #docregion routerCanDeactivate
let NoteCmp = class NoteCmp {
    constructor(params) {
        this.id = params.get('id');
    }
    routerCanDeactivate(next, prev) {
        return confirm('Are you sure you want to leave?');
    }
};
NoteCmp = __decorate([
    Component({
        selector: 'note-cmp',
        template: `
    <div>
      <h2>id: {{id}}</h2>
      <textarea cols="40" rows="10"></textarea>
    </div>`
    }), 
    __metadata('design:paramtypes', [RouteParams])
], NoteCmp);
// #enddocregion
let NoteIndexCmp = class NoteIndexCmp {
};
NoteIndexCmp = __decorate([
    Component({
        selector: 'note-index-cmp',
        template: `
    <h1>Your Notes</h1>
    <div>
      Edit <a [routerLink]="['/NoteCmp', {id: 1}]" id="note-1-link">Note 1</a> |
      Edit <a [routerLink]="['/NoteCmp', {id: 2}]" id="note-2-link">Note 2</a>
    </div>
  `,
        directives: [ROUTER_DIRECTIVES]
    }), 
    __metadata('design:paramtypes', [])
], NoteIndexCmp);
let AppCmp = class AppCmp {
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
        { path: '/note/:id', component: NoteCmp, name: 'NoteCmp' },
        { path: '/', component: NoteIndexCmp, name: 'NoteIndexCmp' }
    ]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/can_deactivate' })]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuX2RlYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fZGVhY3RpdmF0ZS9jYW5fZGVhY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7T0FDNUMsRUFFTCxXQUFXLEVBQ1gsV0FBVyxFQUVYLGlCQUFpQixFQUNsQixNQUFNLGlCQUFpQjtPQUNqQixFQUFDLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtBQUV0RCxpQ0FBaUM7QUFTakM7SUFHRSxZQUFZLE1BQW1CO1FBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUVoRSxtQkFBbUIsQ0FBQyxJQUEwQixFQUFFLElBQTBCO1FBQ3hFLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUNwRCxDQUFDO0FBQ0gsQ0FBQztBQWhCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFFBQVEsRUFBRTs7OztXQUlEO0tBQ1YsQ0FBQzs7V0FBQTtBQVVGLGdCQUFnQjtBQWNoQjtBQUNBLENBQUM7QUFaRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsUUFBUSxFQUFFOzs7Ozs7R0FNVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7O2dCQUFBO0FBaUJGO0FBQ0EsQ0FBQztBQWJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFOzs7R0FHVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7SUFDRCxXQUFXLENBQUM7UUFDWCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO1FBQ3hELEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7S0FDM0QsQ0FBQzs7VUFBQTtBQUtGO0lBQ0UsTUFBTSxDQUFDLFNBQVMsQ0FDWixNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUMsUUFBUSxFQUFFLDZDQUE2QyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7cHJvdmlkZSwgQ29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbmltcG9ydCB7XG4gIENhbkRlYWN0aXZhdGUsXG4gIFJvdXRlQ29uZmlnLFxuICBSb3V0ZVBhcmFtcyxcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIFJPVVRFUl9ESVJFQ1RJVkVTXG59IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5pbXBvcnQge0FQUF9CQVNFX0hSRUZ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbic7XG5cbi8vICNkb2NyZWdpb24gcm91dGVyQ2FuRGVhY3RpdmF0ZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbm90ZS1jbXAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXY+XG4gICAgICA8aDI+aWQ6IHt7aWR9fTwvaDI+XG4gICAgICA8dGV4dGFyZWEgY29scz1cIjQwXCIgcm93cz1cIjEwXCI+PC90ZXh0YXJlYT5cbiAgICA8L2Rpdj5gXG59KVxuY2xhc3MgTm90ZUNtcCBpbXBsZW1lbnRzIENhbkRlYWN0aXZhdGUge1xuICBpZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHBhcmFtczogUm91dGVQYXJhbXMpIHsgdGhpcy5pZCA9IHBhcmFtcy5nZXQoJ2lkJyk7IH1cblxuICByb3V0ZXJDYW5EZWFjdGl2YXRlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHJldHVybiBjb25maXJtKCdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbGVhdmU/Jyk7XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdub3RlLWluZGV4LWNtcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPllvdXIgTm90ZXM8L2gxPlxuICAgIDxkaXY+XG4gICAgICBFZGl0IDxhIFtyb3V0ZXJMaW5rXT1cIlsnL05vdGVDbXAnLCB7aWQ6IDF9XVwiIGlkPVwibm90ZS0xLWxpbmtcIj5Ob3RlIDE8L2E+IHxcbiAgICAgIEVkaXQgPGEgW3JvdXRlckxpbmtdPVwiWycvTm90ZUNtcCcsIHtpZDogMn1dXCIgaWQ9XCJub3RlLTItbGlua1wiPk5vdGUgMjwvYT5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbmNsYXNzIE5vdGVJbmRleENtcCB7XG59XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5NeSBBcHA8L2gxPlxuICAgIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbXG4gIHtwYXRoOiAnL25vdGUvOmlkJywgY29tcG9uZW50OiBOb3RlQ21wLCBuYW1lOiAnTm90ZUNtcCd9LFxuICB7cGF0aDogJy8nLCBjb21wb25lbnQ6IE5vdGVJbmRleENtcCwgbmFtZTogJ05vdGVJbmRleENtcCd9XG5dKVxuY2xhc3MgQXBwQ21wIHtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChcbiAgICAgIEFwcENtcCwgW3Byb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fZGVhY3RpdmF0ZSd9KV0pO1xufVxuIl19