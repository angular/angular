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
import { bootstrap, Component, provide } from 'angular2/angular2';
import { RouteConfig, ROUTER_DIRECTIVES, APP_BASE_HREF, RouteParams } from 'angular2/router';
// #docregion reuseCmp
let MyCmp = class {
    constructor(params) {
        this.name = params.get('name') || 'NOBODY';
    }
    canReuse(next, prev) { return true; }
    onReuse(next, prev) {
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
    <a [router-link]="['/HomeCmp', {name: 'naomi'}]" id="naomi-link">Naomi</a> |
    <a [router-link]="['/HomeCmp', {name: 'brad'}]" id="brad-link">Brad</a>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV1c2VfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9yZXVzZS9yZXVzZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIk15Q21wIiwiTXlDbXAuY29uc3RydWN0b3IiLCJNeUNtcC5jYW5SZXVzZSIsIk15Q21wLm9uUmV1c2UiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxtQkFBbUI7T0FDeEQsRUFFTCxXQUFXLEVBRVgsaUJBQWlCLEVBQ2pCLGFBQWEsRUFFYixXQUFXLEVBRVosTUFBTSxpQkFBaUI7QUFHeEIsc0JBQXNCO0FBQ3RCO0lBVUVBLFlBQVlBLE1BQW1CQTtRQUFJQyxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUVoRkQsUUFBUUEsQ0FBQ0EsSUFBMEJBLEVBQUVBLElBQTBCQSxJQUFJRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVqRkYsT0FBT0EsQ0FBQ0EsSUFBMEJBLEVBQUVBLElBQTBCQTtRQUM1REcsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDbENBLENBQUNBO0FBQ0hILENBQUNBO0FBakJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsUUFBUSxFQUFFOzs7R0FHVDtLQUNGLENBQUM7O1VBV0Q7QUFDRCxnQkFBZ0I7QUFHaEI7QUFlQUksQ0FBQ0E7QUFmRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFFBQVEsRUFBRTs7Ozs7R0FLVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7SUFDRCxXQUFXLENBQUM7UUFDWCxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO1FBQzlDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7S0FDcEQsQ0FBQzs7V0FFRDtBQUdEO0lBQ0VDLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQ05BLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLG9DQUFvQ0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDL0ZBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtib290c3RyYXAsIENvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuaW1wb3J0IHtcbiAgQ2FuQWN0aXZhdGUsXG4gIFJvdXRlQ29uZmlnLFxuICBDb21wb25lbnRJbnN0cnVjdGlvbixcbiAgUk9VVEVSX0RJUkVDVElWRVMsXG4gIEFQUF9CQVNFX0hSRUYsXG4gIENhblJldXNlLFxuICBSb3V0ZVBhcmFtcyxcbiAgT25SZXVzZVxufSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuXG5cbi8vICNkb2NyZWdpb24gcmV1c2VDbXBcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ215LWNtcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdj5oZWxsbyB7e25hbWV9fSE8L2Rpdj5cbiAgICA8ZGl2Pm1lc3NhZ2U6IDxpbnB1dCBpZD1cIm1lc3NhZ2VcIj48L2Rpdj5cbiAgYFxufSlcbmNsYXNzIE15Q21wIGltcGxlbWVudHMgQ2FuUmV1c2UsXG4gICAgT25SZXVzZSB7XG4gIG5hbWU6IHN0cmluZztcbiAgY29uc3RydWN0b3IocGFyYW1zOiBSb3V0ZVBhcmFtcykgeyB0aGlzLm5hbWUgPSBwYXJhbXMuZ2V0KCduYW1lJykgfHwgJ05PQk9EWSc7IH1cblxuICBjYW5SZXVzZShuZXh0OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgcHJldjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pIHsgcmV0dXJuIHRydWU7IH1cblxuICBvblJldXNlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHRoaXMubmFtZSA9IG5leHQucGFyYW1zWyduYW1lJ107XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPlNheSBoaSB0by4uLjwvaDE+XG4gICAgPGEgW3JvdXRlci1saW5rXT1cIlsnL0hvbWVDbXAnLCB7bmFtZTogJ25hb21pJ31dXCIgaWQ9XCJuYW9taS1saW5rXCI+TmFvbWk8L2E+IHxcbiAgICA8YSBbcm91dGVyLWxpbmtdPVwiWycvSG9tZUNtcCcsIHtuYW1lOiAnYnJhZCd9XVwiIGlkPVwiYnJhZC1saW5rXCI+QnJhZDwvYT5cbiAgICA8cm91dGVyLW91dGxldD48L3JvdXRlci1vdXRsZXQ+XG4gIGAsXG4gIGRpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU11cbn0pXG5AUm91dGVDb25maWcoW1xuICB7cGF0aDogJy8nLCBjb21wb25lbnQ6IE15Q21wLCBuYW1lOiAnSG9tZUNtcCd9LFxuICB7cGF0aDogJy86bmFtZScsIGNvbXBvbmVudDogTXlDbXAsIG5hbWU6ICdIb21lQ21wJ31cbl0pXG5jbGFzcyBBcHBDbXAge1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICByZXR1cm4gYm9vdHN0cmFwKEFwcENtcCxcbiAgICAgICAgICAgICAgICAgICBbcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL3JldXNlJ30pXSk7XG59XG4iXX0=