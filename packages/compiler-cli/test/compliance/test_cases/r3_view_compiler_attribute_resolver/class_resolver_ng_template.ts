import {ClassCallback, ClassResolveEvent, Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <ng-template (class)="resolve"></ng-template>
    <ng-template (attr.class)="capture($event)"></ng-template>
  `,
})
export class MyComponent {
  resolve: ClassCallback = (cn) => cn();
  capture(event: ClassResolveEvent): void {}
}
