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
})
export class NestedTemplatePropAccess {
  @Input() config: Config = {};
}
