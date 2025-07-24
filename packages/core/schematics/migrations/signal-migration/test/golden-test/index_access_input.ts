// tslint:disable

import {Component, Input} from '@angular/core';

@Component({template: ''})
class IndexAccessInput {
  @Input() items: string[] = [];

  bla() {
    const {items} = this;

    items[0].charAt(0);
  }
}
