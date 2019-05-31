import {HostBinding} from '@angular/core';
import {MatFormFieldControl} from '@angular/material/form-field';

class WithoutLabelProp extends MatFormFieldControl<any> {
}

class WithLabelProp extends MatFormFieldControl<any> {
  @HostBinding('class.floating')
  get shouldLabelFloat() {return true;}
}
