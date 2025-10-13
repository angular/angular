// tslint:disable

import {Input} from '@angular/core';

export class TestComponent {
  @Input() fnDisplay = (item: any) => item;
  @Input() fnEquals = (a: any, b: any) => this.fnDisplay(a) === this.fnDisplay(b);
}
