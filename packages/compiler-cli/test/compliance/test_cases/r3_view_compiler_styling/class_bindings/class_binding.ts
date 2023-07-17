import {Component, NgModule} from '@angular/core';

@Component({selector: 'my-component', template: `<div [class]="myClassExp"></div>`})
export class MyComponent {
  myClassExp = {'foo': true}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
