// tslint:disable

import {Input, Directive} from '@angular/core';

@Directive()
export class NonNullAssertions {
  // We can't remove `undefined` from the type here. It's unclear
  // whether it was just used as a workaround for required inputs, or
  // it was actually meant to be part of the type.
  @Input({required: true}) name?: string;

  click() {
    this.name!.charAt(0);
  }
}
