// tslint:disable

import {Component, Input} from '@angular/core';

interface Config {
  bla?: string;
}

@Component({
  template: `
    <span [id]="config.bla">
      Test
    </span>
  `,
  standalone: false,
})
export class NestedTemplatePropAccess {
  @Input() config: Config = {};
}
