import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  standalone: true,
  template: '<ng-template let-a [ngIf]="true">{{this.a}}</ng-template>',
})
export class MyComponent {
  p1!: any;
  a1!: any;
  c1!: any;
}
