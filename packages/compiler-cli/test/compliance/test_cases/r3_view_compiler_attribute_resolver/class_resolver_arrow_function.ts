import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `<div (class)="(cn) => cn(size)"></div>`,
})
export class MyComponent {
  size = 'px-2';
}
