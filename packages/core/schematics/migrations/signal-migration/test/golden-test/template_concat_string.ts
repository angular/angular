// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: '<h3>' + '{{bla}}' + '</h3>',
})
export class WithConcatTemplate {
  @Input() bla = true;
}
