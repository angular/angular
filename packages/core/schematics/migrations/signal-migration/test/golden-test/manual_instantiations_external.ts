// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  standalone: false,
})
export class ManualInstantiation {
  @Input() bla: string = '';
}
