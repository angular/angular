import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>
    <ng-template>Content A</ng-template>
  </div>
  <div i18n>
    <ng-template>Content B</ng-template>
  </div>
`,
})
export class MyComponent {
}
