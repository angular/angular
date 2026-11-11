import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `<div attr.title="Hi {{name}}" i18n-attr.title (attr.title)="resolve($event)"></div>`,
})
export class MyComponent {
  name = '';
  resolve(event: unknown): void {}
}
