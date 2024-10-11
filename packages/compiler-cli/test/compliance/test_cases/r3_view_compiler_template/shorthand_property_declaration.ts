import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    <div (click)="_handleClick({a, b: 2, c})"></div>
  `,
    standalone: false
})
export class MyComponent {
  a = 1;
  c = 3;
  _handleClick(_value: any) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
