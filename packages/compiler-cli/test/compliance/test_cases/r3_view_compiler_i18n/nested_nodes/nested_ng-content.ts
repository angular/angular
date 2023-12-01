import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  standalone: true,
  template: `
  <div i18n>
    <ng-content select="special"></ng-content>
    <ng-content></ng-content>
  </div>
`,
})
export class MyComponent {
}
