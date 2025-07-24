// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    <div [bla]="{myInput}">
    </div>
  `,
  host: {
    '[style]': '{myInput}',
  },
})
export class TemplateObjectShorthand {
  @Input() myInput = true;
}
