// tslint:disable

import {Input, Directive} from '@angular/core';

@Directive()
export class Narrowing {
  @Input() name: string | undefined = undefined;

  narrowingArrowFn() {
    [this].map((x) => x.name && x.name.charAt(0));
  }

  narrowingArrowFnMultiLineWrapped() {
    [this].map(
      (x) =>
        x.name &&
        x.name.includes(
          'A super long string to ensure this is wrapped and we can test formatting.',
        ),
    );
  }

  narrowingObjectExpansion() {
    [this].map(({name}) => name && name.charAt(0));
  }

  narrowingNormalThenObjectExpansion() {
    if (this.name) {
      const {charAt} = this.name;
      charAt(0);
    }
  }
}
