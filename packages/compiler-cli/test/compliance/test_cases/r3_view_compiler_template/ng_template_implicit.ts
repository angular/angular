import {Component, NO_ERRORS_SCHEMA} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '<ng-template let-a [ngIf]="true">{{a}}</ng-template>',
  schemas: [NO_ERRORS_SCHEMA],
})
export class MyComponent {
  p1!: any;
  a1!: any;
  c1!: any;
}
