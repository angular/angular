import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <div ngNonBindable></div>
  `
})
export class MyComponent {
  name = 'John Doe';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
