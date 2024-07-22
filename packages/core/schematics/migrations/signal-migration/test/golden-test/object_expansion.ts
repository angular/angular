// tslint:disable

import {Component, Input} from '@angular/core';

@Component({})
export class ObjectExpansion {
  @Input() bla: string = '';

  expansion() {
    const {bla} = this;

    bla.charAt(0);
  }
}
