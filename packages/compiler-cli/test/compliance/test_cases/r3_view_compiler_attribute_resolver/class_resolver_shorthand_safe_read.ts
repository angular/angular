import {ClassCallback, Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div (class)="choice?.classes"></div>
    <span (attr.class)="$event.resolve((choice?.classes)($event.resolver))"></span>
  `,
})
export class MyComponent {
  choice: {classes: ClassCallback} | null = null;
}
