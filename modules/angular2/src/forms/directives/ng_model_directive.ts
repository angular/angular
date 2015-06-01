import {CONST_EXPR} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {StringMapWrapper} from 'angular2/src/facade/collection';

import {Directive, Ancestor, onChange} from 'angular2/angular2';
import {FORWARD_REF, Binding} from 'angular2/di';

import {ControlDirective} from './control_directive';
import {Control} from '../model';
import {setUpControl} from './shared';

const formControlBinding =
    CONST_EXPR(new Binding(ControlDirective, {toAlias: FORWARD_REF(() => NgModelDirective)}));

@Directive({
  selector: '[ng-model]:not([control]):not([form-control])',
  hostInjector: [formControlBinding],
  properties: ['model: ng-model'],
  events: ['ngModel'],
  lifecycle: [onChange]
})
export class NgModelDirective extends ControlDirective {
  control: Control;
  ngModel: EventEmitter;
  model: any;
  _added: boolean;

  constructor() {
    super();
    this.control = new Control("");
    this.ngModel = new EventEmitter();
    this._added = false;
  }

  onChange(c) {
    if (!this._added) {
      setUpControl(this.control, this);
      this.control.updateValidity();
      this._added = true;
    };

    if (StringMapWrapper.contains(c, "model")) {
      this.control.updateValue(this.model);
    }
  }

  get path(): List<string> { return []; }

  viewToModelUpdate(newValue: any): void { ObservableWrapper.callNext(this.ngModel, newValue); }
}
