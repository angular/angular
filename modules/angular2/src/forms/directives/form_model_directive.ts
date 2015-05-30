import {CONST_EXPR} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {Directive, onChange} from 'angular2/angular2';
import {FORWARD_REF, Binding} from 'angular2/di';
import {ControlDirective} from './control_directive';
import {ControlGroupDirective} from './control_group_directive';
import {ControlContainerDirective} from './control_container_directive';
import {FormDirective} from './form_directive';
import {ControlGroup} from '../model';
import {setUpControl} from './shared';

const formDirectiveBinding = CONST_EXPR(
    new Binding(ControlContainerDirective, {toAlias: FORWARD_REF(() => FormModelDirective)}));

@Directive({
  selector: '[form-model]',
  hostInjector: [formDirectiveBinding],
  properties: ['form: form-model'],
  lifecycle: [onChange]
})
export class FormModelDirective extends ControlContainerDirective implements FormDirective {
  form: ControlGroup = null;
  directives: List<ControlDirective>;

  constructor() {
    super();
    this.directives = [];
  }

  onChange(_) { this._updateDomValue(); }

  get formDirective(): FormDirective { return this; }

  get path(): List<string> { return []; }

  addControl(dir: ControlDirective): void {
    var c: any = this.form.find(dir.path);
    setUpControl(c, dir);
    c.updateValidity();
    ListWrapper.push(this.directives, dir);
  }

  removeControl(dir: ControlDirective): void { ListWrapper.remove(this.directives, dir); }

  addControlGroup(dir: ControlGroupDirective) {}

  removeControlGroup(dir: ControlGroupDirective) {}

  _updateDomValue() {
    ListWrapper.forEach(this.directives, dir => {
      var c: any = this.form.find(dir.path);
      dir.valueAccessor.writeValue(c.value);
    });
  }
}