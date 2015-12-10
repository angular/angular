var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { provide, bootstrap, Component } from 'angular2/angular2';
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
      Edit <a [router-link]="['/NoteCmp', {id: 1}]" id="note-1-link">Note 1</a> |
      Edit <a [router-link]="['/NoteCmp', {id: 2}]" id="note-2-link">Note 2</a>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuX2RlYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fZGVhY3RpdmF0ZS9jYW5fZGVhY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIk5vdGVDbXAiLCJOb3RlQ21wLmNvbnN0cnVjdG9yIiwiTm90ZUNtcC5yb3V0ZXJDYW5EZWFjdGl2YXRlIiwiTm90ZUluZGV4Q21wIiwiQXBwQ21wIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBQyxNQUFNLG1CQUFtQjtPQUN4RCxFQUVMLFdBQVcsRUFDWCxXQUFXLEVBRVgsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDZCxNQUFNLGlCQUFpQjtBQUV4QixpQ0FBaUM7QUFDakM7SUFXRUEsWUFBWUEsTUFBbUJBO1FBQUlDLElBQUlBLENBQUNBLEVBQUVBLEdBQUdBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0lBRWhFRCxtQkFBbUJBLENBQUNBLElBQTBCQSxFQUFFQSxJQUEwQkE7UUFDeEVFLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLGlDQUFpQ0EsQ0FBQ0EsQ0FBQ0E7SUFDcERBLENBQUNBO0FBQ0hGLENBQUNBO0FBaEJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFVBQVU7UUFDcEIsUUFBUSxFQUFFOzs7O1dBSUQ7S0FDVixDQUFDOztZQVNEO0FBQ0QsZ0JBQWdCO0FBR2hCO0FBWUFHLENBQUNBO0FBWkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLFFBQVEsRUFBRTs7Ozs7O0dBTVQ7UUFDRCxVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztLQUNoQyxDQUFDOztpQkFFRDtBQUdEO0FBYUFDLENBQUNBO0FBYkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixRQUFRLEVBQUU7OztHQUdUO1FBQ0QsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDaEMsQ0FBQztJQUNELFdBQVcsQ0FBQztRQUNYLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7UUFDeEQsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztLQUMzRCxDQUFDOztXQUVEO0FBR0Q7SUFDRUMsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FDWkEsTUFBTUEsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsRUFBRUEsRUFBQ0EsUUFBUUEsRUFBRUEsNkNBQTZDQSxFQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNuR0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Byb3ZpZGUsIGJvb3RzdHJhcCwgQ29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG5pbXBvcnQge1xuICBDYW5EZWFjdGl2YXRlLFxuICBSb3V0ZUNvbmZpZyxcbiAgUm91dGVQYXJhbXMsXG4gIENvbXBvbmVudEluc3RydWN0aW9uLFxuICBST1VURVJfRElSRUNUSVZFUyxcbiAgQVBQX0JBU0VfSFJFRlxufSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuXG4vLyAjZG9jcmVnaW9uIHJvdXRlckNhbkRlYWN0aXZhdGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25vdGUtY21wJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2PlxuICAgICAgPGgyPmlkOiB7e2lkfX08L2gyPlxuICAgICAgPHRleHRhcmVhIGNvbHM9XCI0MFwiIHJvd3M9XCIxMFwiPjwvdGV4dGFyZWE+XG4gICAgPC9kaXY+YFxufSlcbmNsYXNzIE5vdGVDbXAgaW1wbGVtZW50cyBDYW5EZWFjdGl2YXRlIHtcbiAgaWQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwYXJhbXM6IFJvdXRlUGFyYW1zKSB7IHRoaXMuaWQgPSBwYXJhbXMuZ2V0KCdpZCcpOyB9XG5cbiAgcm91dGVyQ2FuRGVhY3RpdmF0ZShuZXh0OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgcHJldjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pIHtcbiAgICByZXR1cm4gY29uZmlybSgnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGxlYXZlPycpO1xuICB9XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbm90ZS1pbmRleC1jbXAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5Zb3VyIE5vdGVzPC9oMT5cbiAgICA8ZGl2PlxuICAgICAgRWRpdCA8YSBbcm91dGVyLWxpbmtdPVwiWycvTm90ZUNtcCcsIHtpZDogMX1dXCIgaWQ9XCJub3RlLTEtbGlua1wiPk5vdGUgMTwvYT4gfFxuICAgICAgRWRpdCA8YSBbcm91dGVyLWxpbmtdPVwiWycvTm90ZUNtcCcsIHtpZDogMn1dXCIgaWQ9XCJub3RlLTItbGlua1wiPk5vdGUgMjwvYT5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbmNsYXNzIE5vdGVJbmRleENtcCB7XG59XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5NeSBBcHA8L2gxPlxuICAgIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAgYCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbXG4gIHtwYXRoOiAnL25vdGUvOmlkJywgY29tcG9uZW50OiBOb3RlQ21wLCBuYW1lOiAnTm90ZUNtcCd9LFxuICB7cGF0aDogJy8nLCBjb21wb25lbnQ6IE5vdGVJbmRleENtcCwgbmFtZTogJ05vdGVJbmRleENtcCd9XG5dKVxuY2xhc3MgQXBwQ21wIHtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChcbiAgICAgIEFwcENtcCwgW3Byb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fZGVhY3RpdmF0ZSd9KV0pO1xufVxuIl19