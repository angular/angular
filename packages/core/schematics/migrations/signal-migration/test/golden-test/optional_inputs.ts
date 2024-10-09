// tslint:disable

import {Directive, Input} from '@angular/core';

@Directive()
class OptionalInput {
  @Input() bla?: string;
  @Input() isLegacyHttpOnly? = false;
}
