import {Component, provide, bootstrap} from 'angular2/angular2';
import {
  OnActivate,
  ComponentInstruction,
  RouteConfig,
  ROUTER_DIRECTIVES,
  APP_BASE_HREF
} from 'angular2/router';


// #docregion onActivate
@Component({selector: 'my-cmp', template: `<div>onActivate: {{log}}</div>`})
class MyCmp implements OnActivate {
  log: string = '';

  onActivate(next: ComponentInstruction, prev: ComponentInstruction) {
    this.log = `Finished navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`;
  }
}
// #enddocregion


@Component({
  selector: 'example-app',
  template: `
    <h1>My App</h1>
    <nav>
      <a [router-link]="['/HomeCmp']" id="home-link">Navigate Home</a> |
      <a [router-link]="['/ParamCmp', {param: 1}]" id="param-link">Navigate with a Param</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
  {path: '/', component: MyCmp, name: 'HomeCmp'},
  {path: '/:param', component: MyCmp, name: 'ParamCmp'}
])
class AppCmp {
}


export function main() {
  return bootstrap(
      AppCmp, [provide(APP_BASE_HREF, {useValue: '/angular2/examples/router/ts/on_activate'})]);
}
