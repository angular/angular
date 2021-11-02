import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>Test</div>
  <div i18n>Test</div>
`,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}