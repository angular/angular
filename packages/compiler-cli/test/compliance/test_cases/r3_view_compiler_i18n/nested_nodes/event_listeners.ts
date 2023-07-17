import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n (click)="onClick()">Hello</div>
  `
})
export class MyComponent {
  onClick() {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
