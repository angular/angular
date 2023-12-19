import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  standalone: true,
  template: `<svg:use [attr.xlink:href]="value" #id/>`
})
export class MyComponent {
  value: any;
}
