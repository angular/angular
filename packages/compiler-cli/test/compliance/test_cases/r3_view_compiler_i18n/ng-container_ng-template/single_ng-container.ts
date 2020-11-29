import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <ng-container i18n>Some content: {{ valueA | uppercase }}</ng-container>
`,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}