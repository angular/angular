import {Component, NgModule} from '@angular/core';

@Component({selector: 'my-component', template: `<div (click)="onClick($event); 1 == 1"></div>`})
export class MyComponent {
  onClick(event: any) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
