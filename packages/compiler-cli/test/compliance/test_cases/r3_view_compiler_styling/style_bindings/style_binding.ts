import {Component, NgModule} from '@angular/core';

@Component({selector: 'my-component', template: `<div [style]="myStyleExp"></div>`})
export class MyComponent {
  myStyleExp = [{color: 'red'}, {color: 'blue', duration: 1000}]
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
