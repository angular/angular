///<reference path="../dist/docs/typings/angular2/angular2.d.ts"/>
///<reference path="../dist/docs/typings/angular2/router.d.ts"/>

import {Component, bootstrap, View} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_BINDINGS} from 'angular2/router';

@Component({
  selector: 'my-app'
})
@View({
  template: '<h1>Hello</h1>',
})
class FooCmp {
}


@Component({
  selector: 'my-app'
})
@View({
	template: '<h1>Hello {{ name }}</h1><router-outlet></router-outlet>',
  directives: ROUTER_DIRECTIVES
})
@RouteConfig([
  {path: '/home', component: FooCmp}
])
class MyAppComponent {
  name: string;

  constructor() { this.name = 'Alice'; }
}

bootstrap(MyAppComponent, ROUTER_BINDINGS);
