import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <ng-template i18n>
    Root content
    <ng-container *ngIf="visible">
      Nested content
    </ng-container>
  </ng-template>
`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}