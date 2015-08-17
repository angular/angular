///<reference path="../dist/docs/typings/angular2/angular2.d.ts"/>

import {Component, bootstrap, BaseView} from 'angular2/angular2'

@Component({
  selector: 'my-app'
})
@BaseView({
	template: '<h1>Hello {{ name }}</h1>'
})
// Component controller
class MyAppComponent {
  name: string;

  constructor() { this.name = 'Alice'; }
}

bootstrap(MyAppComponent);
