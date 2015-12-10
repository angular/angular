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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuX2RlYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9jYW5fZGVhY3RpdmF0ZS9jYW5fZGVhY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIk5vdGVDbXAiLCJOb3RlQ21wLmNvbnN0cnVjdG9yIiwiTm90ZUNtcC5yb3V0ZXJDYW5EZWFjdGl2YXRlIiwiTm90ZUluZGV4Q21wIiwiQXBwQ21wIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sbUJBQW1CO09BQ3hELEVBRUwsV0FBVyxFQUNYLFdBQVcsRUFFWCxpQkFBaUIsRUFDakIsYUFBYSxFQUNkLE1BQU0saUJBQWlCO0FBRXhCLGlDQUFpQztBQUNqQztJQVdFQSxZQUFZQSxNQUFtQkE7UUFBSUMsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFaEVELG1CQUFtQkEsQ0FBQ0EsSUFBMEJBLEVBQUVBLElBQTBCQTtRQUN4RUUsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsaUNBQWlDQSxDQUFDQSxDQUFDQTtJQUNwREEsQ0FBQ0E7QUFDSEYsQ0FBQ0E7QUFoQkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsVUFBVTtRQUNwQixRQUFRLEVBQUU7Ozs7V0FJRDtLQUNWLENBQUM7O1lBU0Q7QUFDRCxnQkFBZ0I7QUFHaEI7QUFZQUcsQ0FBQ0E7QUFaRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsUUFBUSxFQUFFOzs7Ozs7R0FNVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7O2lCQUVEO0FBR0Q7QUFhQUMsQ0FBQ0E7QUFiRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFFBQVEsRUFBRTs7O0dBR1Q7UUFDRCxVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztLQUNoQyxDQUFDO0lBQ0QsV0FBVyxDQUFDO1FBQ1gsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztRQUN4RCxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO0tBQzNELENBQUM7O1dBRUQ7QUFHRDtJQUNFQyxNQUFNQSxDQUFDQSxTQUFTQSxDQUNaQSxNQUFNQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSw2Q0FBNkNBLEVBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ25HQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7cHJvdmlkZSwgYm9vdHN0cmFwLCBDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbmltcG9ydCB7XG4gIENhbkRlYWN0aXZhdGUsXG4gIFJvdXRlQ29uZmlnLFxuICBSb3V0ZVBhcmFtcyxcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICBBUFBfQkFTRV9IUkVGXG59IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5cbi8vICNkb2NyZWdpb24gcm91dGVyQ2FuRGVhY3RpdmF0ZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbm90ZS1jbXAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXY+XG4gICAgICA8aDI+aWQ6IHt7aWR9fTwvaDI+XG4gICAgICA8dGV4dGFyZWEgY29scz1cIjQwXCIgcm93cz1cIjEwXCI+PC90ZXh0YXJlYT5cbiAgICA8L2Rpdj5gXG59KVxuY2xhc3MgTm90ZUNtcCBpbXBsZW1lbnRzIENhbkRlYWN0aXZhdGUge1xuICBpZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHBhcmFtczogUm91dGVQYXJhbXMpIHsgdGhpcy5pZCA9IHBhcmFtcy5nZXQoJ2lkJyk7IH1cblxuICByb3V0ZXJDYW5EZWFjdGl2YXRlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHJldHVybiBjb25maXJtKCdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbGVhdmU/Jyk7XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdub3RlLWluZGV4LWNtcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPllvdXIgTm90ZXM8L2gxPlxuICAgIDxkaXY+XG4gICAgICBFZGl0IDxhIFtyb3V0ZXItbGlua109XCJbJy9Ob3RlQ21wJywge2lkOiAxfV1cIiBpZD1cIm5vdGUtMS1saW5rXCI+Tm90ZSAxPC9hPiB8XG4gICAgICBFZGl0IDxhIFtyb3V0ZXItbGlua109XCJbJy9Ob3RlQ21wJywge2lkOiAyfV1cIiBpZD1cIm5vdGUtMi1saW5rXCI+Tm90ZSAyPC9hPlxuICAgIDwvZGl2PlxuICBgLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuY2xhc3MgTm90ZUluZGV4Q21wIHtcbn1cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPk15IEFwcDwvaDE+XG4gICAgPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICBgLFxuICBkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdXG59KVxuQFJvdXRlQ29uZmlnKFtcbiAge3BhdGg6ICcvbm90ZS86aWQnLCBjb21wb25lbnQ6IE5vdGVDbXAsIG5hbWU6ICdOb3RlQ21wJ30sXG4gIHtwYXRoOiAnLycsIGNvbXBvbmVudDogTm90ZUluZGV4Q21wLCBuYW1lOiAnTm90ZUluZGV4Q21wJ31cbl0pXG5jbGFzcyBBcHBDbXAge1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICByZXR1cm4gYm9vdHN0cmFwKFxuICAgICAgQXBwQ21wLCBbcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL2Nhbl9kZWFjdGl2YXRlJ30pXSk7XG59XG4iXX0=