import {bootstrap, Component, provide} from 'angular2/angular2';
import {
  CanActivate,
  RouteConfig,
  ComponentInstruction,
  ROUTER_DIRECTIVES,
  APP_BASE_HREF,
  CanReuse,
  RouteParams,
  OnReuse
} from 'angular2/router';


// #docregion reuseCmp
@Component({
  selector: 'my-cmp',
  template: `
    <div>hello {{name}}!</div>
    <div>message: <input id="message"></div>
  `
})
class MyCmp implements CanReuse,
    OnReuse {
  name: string;
  constructor(params: RouteParams) { this.name = params.get('name') || 'NOBODY'; }

  canReuse(next: ComponentInstruction, prev: ComponentInstruction) { return true; }

  onReuse(next: ComponentInstruction, prev: ComponentInstruction) {
    this.name = next.params['name'];
  }
}
// #enddocregion


@Component({
  selector: 'example-app',
  template: `
    <h1>Say hi to...</h1>
    <a [router-link]="['/HomeCmp', {name: 'naomi'}]" id="naomi-link">Naomi</a> |
    <a [router-link]="['/HomeCmp', {name: 'brad'}]" id="brad-link">Brad</a>
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
  {path: '/', component: MyCmp, name: 'HomeCmp'},
  {path: '/:name', component: MyCmp, name: 'HomeCmp'}
])
class AppCmp {
}


export function main() {
  return bootstrap(AppCmp,
                   [provide(APP_BASE_HREF, {useValue: '/angular2/examples/router/ts/reuse'})]);
}
