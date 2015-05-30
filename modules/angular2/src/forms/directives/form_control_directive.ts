import {CONST_EXPR} from 'angular2/src/facade/lang';
import {Directive, Ancestor, onChange} from 'angular2/angular2';
import {FORWARD_REF, Binding} from 'angular2/di';

import {ControlDirective} from './control_directive';
import {Control} from '../model';
import {setUpControl} from './shared';

const formControlBinding =
    CONST_EXPR(new Binding(ControlDirective, {toAlias: FORWARD_REF(() => FormControlDirective)}));

@Directive({
  selector: '[form-control]',
  hostInjector: [formControlBinding],
  properties: ['control: form-control'],
  lifecycle: [onChange]
})
export class FormControlDirective extends ControlDirective {
  control: Control;

  onChange(_) {
    setUpControl(this.control, this);
    this.control.updateValidity();
  }
}
