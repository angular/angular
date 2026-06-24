// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    <input [(ngModel)]="inputA" />
    <div (click)="inputB = false">
    </div>
  `,
  host: {
    '(click)': 'inputC = true',
  },
})
class TwoWayBinding {
  @Input() inputA = '';
  @Input() inputB = true;
  @Input() inputC = false;
  @Input() inputD = false;
}
