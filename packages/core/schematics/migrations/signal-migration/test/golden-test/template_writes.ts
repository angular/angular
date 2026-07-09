// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    <input [(ngModel)]="inputA" />
    <input [(ngModel)]="inputB.prop.prop" />
    <input (ngModelChange)="inputC = $event" />
    <input (ngModelChange)="inputD.prop = $event + inputF" />
  `,
  host: {
    '(click)': 'inputE = true',
  },
})
class TwoWayBinding {
  @Input() inputA = '';
  @Input() inputB = {prop: {prop: ''}};
  @Input() inputC = '';
  @Input() inputD = {prop: ''};
  @Input() inputE = false;
  @Input() inputF = '';
}
