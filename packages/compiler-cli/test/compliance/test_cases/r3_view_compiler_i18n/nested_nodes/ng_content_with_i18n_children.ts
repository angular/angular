import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <ng-content>
      <span i18n="@@MY_ID">a <b>b</b> c</span>
    </ng-content>
  `,
})
export class MyComponent {}
