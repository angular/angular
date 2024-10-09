// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    {{label}}
  `,
})
class Group {
  @Input() label!: string;
}

@Component({
  template: `
    @if (true) {
      {{group.label}}
    }

    {{group.label}}
  `,
})
class Option {
  constructor(public group: Group) {}
}
