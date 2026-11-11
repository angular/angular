import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `<div (style)="(s) => s(size)"></div><span (attr.style)="resolve($event)"></span>`,
})
export class MyComponent {
  size = 'width: 1px';
  resolve(event: unknown): void {}
}
