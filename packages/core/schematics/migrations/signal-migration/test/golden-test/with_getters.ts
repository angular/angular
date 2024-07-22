// tslint:disable

import {Input} from '@angular/core';

export class WithSettersAndGetters {
  @Input()
  set onlySetter(newValue: any) {
    this._bla = newValue;
    if (newValue === 0) {
      console.log('test');
    }
  }
  private _bla: any;

  @Input()
  get accessor(): string {
    return '';
  }
  set accessor(newValue: string) {
    this._accessor = newValue;
  }
  private _accessor: string = '';

  @Input() simpleInput!: string;
}
