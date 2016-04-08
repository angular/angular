import {Component, Injectable, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {OnDeactivate, ComponentInstruction, RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {APP_BASE_HREF} from 'angular2/platform/common';


@Injectable()
class LogService {
  logs: string[] = [];

  addLog(message: string): void { this.logs.push(message); }
}


// #docregion routerOnDeactivate
@Component({selector: 'my-cmp', template: `<div>hello</div>`})
class MyCmp implements OnDeactivate {
  constructor(private logService: LogService) {}

  routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    this.logService.addLog(
        `Navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`);
  }
}
// #enddocregion


@Component({
  selector: 'example-app',
  template: `
    <h1>My App</h1>
    <nav>
      <a [routerLink]="['/HomeCmp']" id="home-link">Navigate Home</a> |
      <a [routerLink]="['/ParamCmp', {param: 1}]" id="param-link">Navigate with a Param</a>
    </nav>
    <router-outlet></router-outlet>
    <div id="log">
      <h2>Log:</h2>
      <p *ngFor="#logItem of logService.logs">{{ logItem }}</p>
    </div>
  `,
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
  {path: '/', component: MyCmp, name: 'HomeCmp'},
  {path: '/:param', component: MyCmp, name: 'ParamCmp'}
])
class AppCmp {
  constructor(public logService: LogService) {}
}


export function main() {
  return bootstrap(AppCmp, [
    provide(APP_BASE_HREF, {useValue: '/angular2/examples/router/ts/on_deactivate'}),
    LogService
  ]);
}
