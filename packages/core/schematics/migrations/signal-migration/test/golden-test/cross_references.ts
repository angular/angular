// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    {{label}}
  `,
  standalone: false,
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
  standalone: false,
})
class Option {
  constructor(public group: Group) {}
}
