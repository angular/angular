import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <ng-container i18n>
    <div>
      <ng-container i18n>Some content</ng-container>
    </div>
  </ng-container>
`,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}