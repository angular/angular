import {Component, Input} from '@angular/core';

import * as directives from './directives';

@Component({
  selector: 'my-cmp',
  template: '<badge />',
  imports: [directives.Badge],
})
export class MyCmp {
  @Input({transform: directives.toNumber}) count = 0;
}
