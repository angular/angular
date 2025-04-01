// tslint:disable

import {Input} from '@angular/core';
import {Base2, Base3} from './derived_class';

class DerivedExternal extends Base2 {
  override bla = false;
}

export class DerivedExternalWithInput extends Base3 {
  @Input() override bla = true;
}
