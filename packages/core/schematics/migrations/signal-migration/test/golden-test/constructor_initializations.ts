// tslint:disable

import {Input, Directive} from '@angular/core';

@Directive()
export class MyComp {
  @Input() firstName: string;

  constructor() {
    // TODO: Consider initializations inside the constructor.
    // Those are not migrated right now though, as they are writes.
    this.firstName = 'Initial value';
  }
}
