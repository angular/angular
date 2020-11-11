import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `<div
    [ternary]="cond ? [a] : [0]"
    [pipe]="value | pipe:1:2"
    [and]="cond && [b]"
    [or]="cond || [c]"
  ></div>`
})
export class MyComponent {
  id = 'one';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
