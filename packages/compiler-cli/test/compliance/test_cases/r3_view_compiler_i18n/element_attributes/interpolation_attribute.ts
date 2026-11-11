import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n-attr.title attr.title="{{name}} title"></div>
  `,
})
export class MyComponent {
  name = '';
}
