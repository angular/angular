// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    <div *someTemplateDir [style.ok]="justify">
    </div>
  `,
})
export class InlineTmpl {
  @Input() justify: 'start' | 'end' = 'end';
}
