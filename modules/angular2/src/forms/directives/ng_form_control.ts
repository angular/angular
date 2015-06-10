import {CONST_EXPR} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';

import {Directive, Ancestor, onChange} from 'angular2/angular2';
import {FORWARD_REF, Binding} from 'angular2/di';

import {NgControl} from './ng_control';
import {Control} from '../model';
import {setUpControl} from './shared';

const formControlBinding =
    CONST_EXPR(new Binding(NgControl, {toAlias: FORWARD_REF(() => NgFormControl)}));

/**
 * Binds a control to a DOM element.
 *
 * # Example
 *
 * In this example, we bind the control to an input element. When the value of the input element
 * changes, the value of
 * the control will reflect that change. Likewise, if the value of the control changes, the input
 * element reflects that
 * change.
 *
 * Here we use {@link formDirectives}, rather than importing each form directive individually, e.g.
 * `NgControl`, `ControlGroupDirective`. This is just a shorthand for the same end result.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [formDirectives],
 *      template: "<input type='text' [ng-form-control]='loginControl'>"
 *      })
 * class LoginComp {
 *  loginControl:Control;
 *
 *  constructor() {
 *    this.loginControl = new Control('');
 *  }
 * }
 *
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: '[ng-form-control]',
  hostInjector: [formControlBinding],
  properties: ['form: ng-form-control', 'model: ng-model'],
  events: ['ngModel'],
  lifecycle: [onChange],
  exportAs: 'form'
})
export class NgFormControl extends NgControl {
  form: Control;
  ngModel: EventEmitter;
  _added: boolean;
  model: any;

  constructor() {
    super();
    this.ngModel = new EventEmitter();
    this._added = false;
  }

  onChange(c) {
    if (!this._added) {
      setUpControl(this.form, this);
      this.form.updateValidity();
      this._added = true;
    }
    if (StringMapWrapper.contains(c, "model")) {
      this.form.updateValue(this.model);
    }
  }

  get control(): Control { return this.form; }

  get path(): List<string> { return []; }

  viewToModelUpdate(newValue: any): void { ObservableWrapper.callNext(this.ngModel, newValue); }
}
