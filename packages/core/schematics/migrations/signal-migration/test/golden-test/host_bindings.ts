// tslint:disable

import {Component, Input, HostBinding} from '@angular/core';

@Component({
  template: '',
  host: {
    '[id]': 'id',
    '[nested]': 'nested.id',
    '[receiverNarrowing]': 'receiverNarrowing ? receiverNarrowing.id',
    // normal narrowing is irrelevant as we don't type check host bindings.
  },
})
class HostBindingTestCmp {
  @Input() id = 'works';

  // for testing nested expressions.
  nested = this;

  declare receiverNarrowing: this | undefined;

  @HostBinding('[attr.bla]')
  @Input()
  myInput = 'initial';
}

const SHARED = {
  '(click)': 'id',
  '(mousedown)': 'id2',
};

@Component({
  template: '',
  host: SHARED,
})
class HostBindingsShared {
  @Input() id = false;
}

@Component({
  template: '',
  host: SHARED,
})
class HostBindingsShared2 {
  @Input() id = false;
  @Input() id2 = false;
}
