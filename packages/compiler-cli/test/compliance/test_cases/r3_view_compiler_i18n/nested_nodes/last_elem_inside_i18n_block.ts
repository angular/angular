import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>{{ bar }}<h1 i18n-title title="{{ baz }}"></h1></div>
  `
})
export class MyComponent {
  bar: any;
  baz: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
