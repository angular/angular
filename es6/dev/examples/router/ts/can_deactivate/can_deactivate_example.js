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
import { RouteConfig, RouteParams, ROUTER_DIRECTIVES, APP_BASE_HREF } from 'angular2/router';
// #docregion routerCanDeactivate
let NoteCmp = class {
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
let NoteIndexCmp = class {
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
        { path: '/note/:id', component: NoteCmp, name: 'NoteCmp' },
        { path: '/', component: NoteIndexCmp, name: 'NoteIndexCmp' }
    ]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/can_deactivate' })]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuX2RlYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fZGVhY3RpdmF0ZS9jYW5fZGVhY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIk5vdGVDbXAiLCJOb3RlQ21wLmNvbnN0cnVjdG9yIiwiTm90ZUNtcC5yb3V0ZXJDYW5EZWFjdGl2YXRlIiwiTm90ZUluZGV4Q21wIiwiQXBwQ21wIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sZUFBZTtPQUN6QyxFQUFDLFNBQVMsRUFBQyxNQUFNLG9CQUFvQjtPQUNyQyxFQUVMLFdBQVcsRUFDWCxXQUFXLEVBRVgsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDZCxNQUFNLGlCQUFpQjtBQUV4QixpQ0FBaUM7QUFDakM7SUFXRUEsWUFBWUEsTUFBbUJBO1FBQUlDLElBQUlBLENBQUNBLEVBQUVBLEdBQUdBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0lBRWhFRCxtQkFBbUJBLENBQUNBLElBQTBCQSxFQUFFQSxJQUEwQkE7UUFDeEVFLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLGlDQUFpQ0EsQ0FBQ0EsQ0FBQ0E7SUFDcERBLENBQUNBO0FBQ0hGLENBQUNBO0FBaEJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFVBQVU7UUFDcEIsUUFBUSxFQUFFOzs7O1dBSUQ7S0FDVixDQUFDOztZQVNEO0FBQ0QsZ0JBQWdCO0FBR2hCO0FBWUFHLENBQUNBO0FBWkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLFFBQVEsRUFBRTs7Ozs7O0dBTVQ7UUFDRCxVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztLQUNoQyxDQUFDOztpQkFFRDtBQUdEO0FBYUFDLENBQUNBO0FBYkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixRQUFRLEVBQUU7OztHQUdUO1FBQ0QsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDaEMsQ0FBQztJQUNELFdBQVcsQ0FBQztRQUNYLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7UUFDeEQsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztLQUMzRCxDQUFDOztXQUVEO0FBR0Q7SUFDRUMsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FDWkEsTUFBTUEsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsRUFBRUEsRUFBQ0EsUUFBUUEsRUFBRUEsNkNBQTZDQSxFQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNuR0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Byb3ZpZGUsIENvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvYm9vdHN0cmFwJztcbmltcG9ydCB7XG4gIENhbkRlYWN0aXZhdGUsXG4gIFJvdXRlQ29uZmlnLFxuICBSb3V0ZVBhcmFtcyxcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICBBUFBfQkFTRV9IUkVGXG59IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5cbi8vICNkb2NyZWdpb24gcm91dGVyQ2FuRGVhY3RpdmF0ZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbm90ZS1jbXAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXY+XG4gICAgICA8aDI+aWQ6IHt7aWR9fTwvaDI+XG4gICAgICA8dGV4dGFyZWEgY29scz1cIjQwXCIgcm93cz1cIjEwXCI+PC90ZXh0YXJlYT5cbiAgICA8L2Rpdj5gXG59KVxuY2xhc3MgTm90ZUNtcCBpbXBsZW1lbnRzIENhbkRlYWN0aXZhdGUge1xuICBpZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHBhcmFtczogUm91dGVQYXJhbXMpIHsgdGhpcy5pZCA9IHBhcmFtcy5nZXQoJ2lkJyk7IH1cblxuICByb3V0ZXJDYW5EZWFjdGl2YXRlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHJldHVybiBjb25maXJtKCdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbGVhdmU/Jyk7XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdub3RlLWluZGV4LWNtcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPllvdXIgTm90ZXM8L2gxPlxuICAgIDxkaXY+XG4gICAgICBFZGl0IDxhIFtyb3V0ZXJMaW5rXT1cIlsnL05vdGVDbXAnLCB7aWQ6IDF9XVwiIGlkPVwibm90ZS0xLWxpbmtcIj5Ob3RlIDE8L2E+IHxcbiAgICAgIEVkaXQgPGEgW3JvdXRlckxpbmtdPVwiWycvTm90ZUNtcCcsIHtpZDogMn1dXCIgaWQ9XCJub3RlLTItbGlua1wiPk5vdGUgMjwvYT5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbmNsYXNzIE5vdGVJbmRleENtcCB7XG59XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5NeSBBcHA8L2gxPlxuICAgIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbXG4gIHtwYXRoOiAnL25vdGUvOmlkJywgY29tcG9uZW50OiBOb3RlQ21wLCBuYW1lOiAnTm90ZUNtcCd9LFxuICB7cGF0aDogJy8nLCBjb21wb25lbnQ6IE5vdGVJbmRleENtcCwgbmFtZTogJ05vdGVJbmRleENtcCd9XG5dKVxuY2xhc3MgQXBwQ21wIHtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChcbiAgICAgIEFwcENtcCwgW3Byb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fZGVhY3RpdmF0ZSd9KV0pO1xufVxuIl19