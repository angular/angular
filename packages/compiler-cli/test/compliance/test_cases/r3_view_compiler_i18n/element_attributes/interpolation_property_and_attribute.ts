import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n-title title="Property {{a}}" i18n-attr.title attr.title="Attribute {{b}}"></div>
  `,
})
export class MyComponent {
  a = '';
  b = '';
}
