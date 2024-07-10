import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <ng-template *ngIf="visible" i18n-title title="Hello">Test</ng-template>
`
})
export class MyComponent {
  visible = false;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
