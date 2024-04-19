import {Component, NgModule} from '@angular/core';

@Component({selector: 'my-component', template: `<div [style.background-image]="myImage"></div>`})
export class MyComponent {
  myImage = 'url(foo.jpg)';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
