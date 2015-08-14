///<reference path="../dist/docs/typings/angular2/angular2.d.ts"/>
///<reference path="../dist/docs/typings/angular2/router.d.ts"/>

import {Component, bootstrap, BaseView} from 'angular2/angular2';
import {RouteConfig, routerDirectives, routerInjectables} from 'angular2/router';

@Component({
  selector: 'my-app'
})
@BaseView({
  template: '<h1>Hello</h1>',
})
class FooCmp {
}


@Component({
  selector: 'my-app'
})
@BaseView({
	template: '<h1>Hello {{ name }}</h1><router-outlet></router-outlet>',
  directives: routerDirectives
})
@RouteConfig([
  {path: '/home', component: FooCmp}
])
class MyAppComponent {
  name: string;

  constructor() { this.name = 'Alice'; }
}

bootstrap(MyAppComponent, routerInjectables);
