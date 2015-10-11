import {bootstrap, bind, Component, View} from 'angular2/angular2';
import {
  CanActivate,
  RouteConfig,
  routerBindings,
  ComponentInstruction,
  APP_BASE_HREF,
  ROUTER_DIRECTIVES
} from 'angular2/router';

function checkIfWeHavePermission(instruction: ComponentInstruction) {
  return instruction.params['id'] == '1';
}

// #docregion canActivate
@Component({selector: 'control-panel-cmp'})
@View({template: `<div>Settings: ...</div>`})
@CanActivate(checkIfWeHavePermission)
class ControlPanelCmp {
}
// #enddocregion


@Component({selector: 'home-cmp'})
@View({
  template: `
    <h1>Welcome Home!</h1>
    <div>
      Edit <a [router-link]="['/ControlPanelCmp', {id: 1}]" id="user-1-link">User 1</a> |
      Edit <a [router-link]="['/ControlPanelCmp', {id: 2}]" id="user-2-link">User 2</a>
    </div>
  `,
  directives: [ROUTER_DIRECTIVES]
})
class HomeCmp {
}


@Component({selector: 'example-app'})
@View({
  template: `
    <h1>My App</h1>
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
  {path: '/user-settings/:id', component: ControlPanelCmp, as: 'ControlPanelCmp'},
  {path: '/', component: HomeCmp, as: 'HomeCmp'}
])
class AppCmp {
}


export function main() {
  return bootstrap(AppCmp, [
    routerBindings(AppCmp),
    bind(APP_BASE_HREF).toValue('/angular2/examples/router/ts/can_activate')
  ]);
}
