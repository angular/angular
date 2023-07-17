import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <ng-container i18n>
    <img src="logo.png" title="Logo" /> is my logo #1
  </ng-container>
  <ng-template i18n>
    <img src="logo.png" title="Logo" /> is my logo #2
  </ng-template>
`,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}