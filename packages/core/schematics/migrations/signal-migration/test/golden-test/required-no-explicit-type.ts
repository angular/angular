// tslint:disable

import {Input} from '@angular/core';
import {COMPLEX_VAR} from './required-no-explicit-type-extra';

export const CONST = {field: true};

export class RequiredNoExplicitType {
  @Input({required: true}) someInputNumber = 0;
  @Input({required: true}) someInput = true;
  @Input({required: true}) withConstInitialVal = CONST;

  // typing this explicitly now would require same imports as from the `-extra` file.
  @Input({required: true}) complexVal = COMPLEX_VAR;
}
