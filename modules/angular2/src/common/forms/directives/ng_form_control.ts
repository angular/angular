import {CONST_EXPR} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {OnChanges} from 'angular2/lifecycle_hooks';
import {SimpleChange} from 'angular2/src/core/change_detection';
import {Query, Directive} from 'angular2/src/core/metadata';
import {forwardRef, Provider, Inject, Optional} from 'angular2/src/core/di';
import {NgControl} from './ng_control';
import {Control} from '../model';
import {Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS} from '../validators';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';
import {
  setUpControl,
  composeValidators,
  composeAsyncValidators,
  isPropertyUpdated,
  selectValueAccessor
} from './shared';

const formControlBinding =
    CONST_EXPR(new Provider(NgControl, {useExisting: forwardRef(() => NgFormControl)}));

/**
 * Binds an existing {@link Control} to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jcQlZ2tTh22BZZ2ucNAT?p=preview))
 *
 * In this example, we bind the control to an input element. When the value of the input element
 * changes, the value of the control will reflect that change. Likewise, if the value of the
 * control changes, the input element reflects that change.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormControl Example</h2>
 *       <form>
 *         <p>Element with existing control: <input type="text"
 * [ng-form-control]="loginControl"></p>
 *         <p>Value of existing control: {{loginControl.value}}</p>
 *       </form>
 *     </div>
 *   `,
 *   directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginControl: Control = new Control('');
 * }
 *  ```
 *
 *##ng-model
 *
 * We can also use `ng-model` to bind a domain model to the form.
 *
 * ### Example ([live demo](http://plnkr.co/edit/yHMLuHO7DNgT8XvtjTDH?p=preview))
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
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
  inputs: ['form: ngFormControl', 'model: ngModel'],
  outputs: ['update: ngModelChange'],
  exportAs: 'form'
})
export class NgFormControl extends NgControl implements OnChanges {
  form: Control;
  update = new EventEmitter();
  model: any;
  viewModel: any;

  constructor(@Optional() @Inject(NG_VALIDATORS) private _validators:
                  /* Array<Validator|Function> */ any[],
              @Optional() @Inject(NG_ASYNC_VALIDATORS) private _asyncValidators:
                  /* Array<Validator|Function> */ any[],
              @Optional() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[]) {
    super();
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }

  onChanges(changes: {[key: string]: SimpleChange}): void {
    if (this._isControlChanged(changes)) {
      setUpControl(this.form, this);
      this.form.updateValueAndValidity({emitEvent: false});
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      this.form.updateValue(this.model);
      this.viewModel = this.model;
    }
  }

  get path(): string[] { return []; }

  get validator(): Function { return composeValidators(this._validators); }

  get asyncValidator(): Function { return composeAsyncValidators(this._asyncValidators); }

  get control(): Control { return this.form; }

  viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    ObservableWrapper.callNext(this.update, newValue);
  }

  private _isControlChanged(changes: {[key: string]: any}): boolean {
    return StringMapWrapper.contains(changes, "form");
  }
}
