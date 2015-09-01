import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';

import {QueryList} from 'angular2/core';
import {Query, Directive, LifecycleEvent} from 'angular2/metadata';
import {forwardRef, Binding} from 'angular2/di';

import {NgControl} from './ng_control';
import {Control} from '../model';
import {NgValidator} from './validators';
import {setUpControl, composeNgValidator, isPropertyUpdated} from './shared';

const formControlBinding =
    CONST_EXPR(new Binding(NgControl, {toAlias: forwardRef(() => NgFormControl)}));

/**
 * Binds an existing control to a DOM element.
 *
 * # Example
 *
 * In this example, we bind the control to an input element. When the value of the input element
 * changes, the value of
 * the control will reflect that change. Likewise, if the value of the control changes, the input
 * element reflects that
 * change.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
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
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: "<input type='text' [ng-form-control]='loginControl' [(ng-model)]='login'>"
 *      })
 * class LoginComp {
 *  loginControl:Control;
 *  login:string;
 *
 *  constructor() {
 *    this.loginControl = new Control('');
 *  }
 * }
 *  ```
 */
@Directive({
  selector: '[ng-form-control]',
  bindings: [formControlBinding],
  properties: ['form: ngFormControl', 'model: ngModel'],
  events: ['update: ngModel'],
  lifecycle: [LifecycleEvent.OnChanges],
  exportAs: 'form'
})
export class NgFormControl extends NgControl {
  form: Control;
  update = new EventEmitter();
  _added = false;
  model: any;
  viewModel: any;
  ngValidators: QueryList<NgValidator>;

  // Scope the query once https://github.com/angular/angular/issues/2603 is fixed
  constructor(@Query(NgValidator) ngValidators: QueryList<NgValidator>) {
    super();
    this.ngValidators = ngValidators;
  }

  onChanges(c: StringMap<string, any>) {
    if (!this._added) {
      setUpControl(this.form, this);
      this.form.updateValidity();
      this._added = true;
    }
    if (isPropertyUpdated(c, this.viewModel)) {
      this.form.updateValue(this.model);
    }
  }

  get path(): string[] { return []; }

  get control(): Control { return this.form; }

  get validator(): Function { return composeNgValidator(this.ngValidators); }

  viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    ObservableWrapper.callNext(this.update, newValue);
  }
}
