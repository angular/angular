import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '<ng-template let-a [ngIf]="true">{{a}}</ng-template>',
})
export class MyComponent {
  p1!: any;
  a1!: any;
  c1!: any;
}
