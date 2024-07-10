import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>{% valueA %}</div>
  `,
  interpolation: ['{%', '%}'],
})
export class MyComponent {
  valueA = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
