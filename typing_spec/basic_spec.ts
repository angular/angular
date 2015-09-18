import {Component, bootstrap, View} from 'angular2/angular2'

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
