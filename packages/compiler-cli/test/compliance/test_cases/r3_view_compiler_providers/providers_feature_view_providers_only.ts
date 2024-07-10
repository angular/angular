import {Component, NgModule} from '@angular/core';

abstract class Greeter {
  abstract greet(): string;
}

class GreeterEN implements Greeter {
  greet() {
    return 'Hi';
  }
}

@Component({selector: 'my-component', template: '<div></div>', viewProviders: [GreeterEN]})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
