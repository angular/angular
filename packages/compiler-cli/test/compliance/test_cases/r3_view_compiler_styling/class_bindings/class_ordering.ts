import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `<div
    class="grape"
    [attr.class]="'banana'"
    [class.apple]="yesToApple"
    [class]="myClassExp"
    [class.orange]="yesToOrange"></div>`
})
export class MyComponent {
  myClassExp = {a: true, b: true};
  yesToApple = true;
  yesToOrange = true;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
