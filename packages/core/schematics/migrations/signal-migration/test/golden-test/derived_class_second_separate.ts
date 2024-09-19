// tslint:disable

import {Input} from '@angular/core';
import {DerivedExternalWithInput} from './derived_class_separate_file';

class Derived extends DerivedExternalWithInput {
  // this should be incompatible, because the final superclass
  // within its own batch unit, detected a write that should
  // propagate to this input.
  @Input() override bla = false;
}
