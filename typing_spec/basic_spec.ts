import {Component, View} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';

@Component({
  selector: 'my-app'
})
@View({
	template: '<h1>Hello {{ name }}</h1>'
})
// Component controller
class MyAppComponent {
  name: string;

  constructor() { this.name = 'Alice'; }
}

bootstrap(MyAppComponent);
