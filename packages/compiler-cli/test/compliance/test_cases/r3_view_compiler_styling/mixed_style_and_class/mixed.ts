import {Component, NgModule} from '@angular/core';

@Component(
    {
    selector: 'my-component', template: `<div [style]="myStyleExp" [class]="myClassExp"></div>`,
    standalone: false
})
export class MyComponent {
  myStyleExp = [{color: 'red'}, {color: 'blue', duration: 1000}]
  myClassExp = 'foo bar apple';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
