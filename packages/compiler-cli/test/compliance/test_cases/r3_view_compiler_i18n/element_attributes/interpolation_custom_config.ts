import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n-title="m|d" title="intro {% valueA | uppercase %}"></div>
  `,
  interpolation: ['{%', '%}'],
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}