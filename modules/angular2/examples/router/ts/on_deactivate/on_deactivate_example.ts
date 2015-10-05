import {Component, View, Injectable, NgFor, bind, bootstrap} from 'angular2/angular2';
import {
  OnDeactivate,
  ComponentInstruction,
  RouteConfig,
  routerBindings,
  ROUTER_DIRECTIVES,
  APP_BASE_HREF
} from 'angular2/router';


@Injectable()
class LogService {
  logs: string[] = [];

  addLog(message: string): void { this.logs.push(message); }
}


// #docregion onDeactivate
@Component({selector: 'my-cmp'})
@View({template: `<div>hello</div>`})
class MyCmp implements OnDeactivate {
  constructor(private logService: LogService) {}

  onDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    this.logService.addLog(
        `Navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`);
  }
}
// #enddocregion


@Component({selector: 'example-app'})
@View({
  template: `
    <h1>My App</h1>
    <nav>
      <a [router-link]="['/HomeCmp']" id="home-link">Navigate Home</a> |
      <a [router-link]="['/ParamCmp', {param: 1}]" id="param-link">Navigate with a Param</a>
    </nav>
    <router-outlet></router-outlet>
    <div id="log">
      <h2>Log:</h2>
      <p *ng-for="#logItem of logService.logs">{{ logItem }}</p>
    </div>
  `,
  directives: [ROUTER_DIRECTIVES, NgFor]
})
@RouteConfig([
  {path: '/', component: MyCmp, as: 'HomeCmp'},
  {path: '/:param', component: MyCmp, as: 'ParamCmp'}
])
class AppCmp {
  constructor(public logService: LogService) {}
}


export function main() {
  return bootstrap(AppCmp, [
    routerBindings(AppCmp),
    bind(APP_BASE_HREF).toValue('/angular2/examples/router/ts/on_deactivate'),
    LogService
  ]);
}
