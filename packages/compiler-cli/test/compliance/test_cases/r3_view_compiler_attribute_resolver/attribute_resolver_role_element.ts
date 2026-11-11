import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `<div (attr.role)="resolve($event)"></div>`,
})
export class MyComponent {
  resolve(event: unknown): void {}
}
