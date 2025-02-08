import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div [style.width]="w1"></div>
    <div [style.height]="h1"></div>
    <div [class.active]="a1"></div>
    <div [class.removed]="r1"></div>
  `,
    standalone: false
})
export class MyComponent {
  w1 = '100px';
  h1 = '100px';
  a1 = true;
  r1 = true;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
