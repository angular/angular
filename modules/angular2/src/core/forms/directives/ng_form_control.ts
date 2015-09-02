import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {OnChanges} from 'angular2/lifecycle_hooks';
import {Query, Directive} from 'angular2/src/core/metadata';
import {forwardRef, Binding, Inject, Optional} from 'angular2/src/core/di';
import {NgControl} from './ng_control';
import {Control} from '../model';
import {Validators, NG_VALIDATORS} from '../validators';
import {setUpControl, isPropertyUpdated} from './shared';

const formControlBinding =
    CONST_EXPR(new Binding(NgControl, {toAlias: forwardRef(() => NgFormControl)}));

/**
 * Binds an existing control to a DOM element.
 *
 * # Example
 *
 * In this example, we bind the control to an input element. When the value of the input element
 * changes, the value of the control will reflect that change. Likewise, if the value of the
 * control changes, the input element reflects that change.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: "<input type='text' [ng-form-control]='loginControl'>"
 *      })
 * class LoginComp {
 *  loginControl: Control = new Control('');;
 * }
 *
 *  ```
 *
 * We can also use `ng-model` to bind a domain model to the form.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: "<input type='text' [ng-form-control]='loginControl' [(ng-model)]='login'>"
 *      })
 * class LoginComp {
 *  loginControl: Control = new Control('');
 *  login:string;
 * }
 *  ```
 */
@Directive({
  selector: '[ng-form-control]',
  bindings: [formControlBinding],
  properties: ['form: ngFormControl', 'model: ngModel'],
  events: ['update: ngModel'],
  exportAs: 'form'
})
export class NgFormControl extends NgControl implements OnChanges {
  form: Control;
  update = new EventEmitter();
  _added = false;
  model: any;
  viewModel: any;
  validators: Function[];

  constructor(@Optional() @Inject(NG_VALIDATORS) validators: Function[]) {
    super();
    this.validators = validators;
  }

  onChanges(changes: StringMap<string, any>): void {
    if (!this._added) {
      setUpControl(this.form, this);
      this.form.updateValidity();
      this._added = true;
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      this.form.updateValue(this.model);
      this.viewModel = this.model;
    }
  }

  get path(): string[] { return []; }

  get control(): Control { return this.form; }

  get validator(): Function { return Validators.compose(this.validators); }

  viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    ObservableWrapper.callNext(this.update, newValue);
  }
}
