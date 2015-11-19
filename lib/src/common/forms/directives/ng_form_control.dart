library angular2.src.common.forms.directives.ng_form_control;

import "package:angular2/src/facade/collection.dart" show StringMapWrapper;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper;
import "package:angular2/core.dart"
    show OnChanges, SimpleChange, Query, Directive, Provider, Inject, Optional;
import "ng_control.dart" show NgControl;
import "../model.dart" show Control;
import "../validators.dart" show Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS;
import "control_value_accessor.dart"
    show ControlValueAccessor, NG_VALUE_ACCESSOR;
import "shared.dart"
    show
        setUpControl,
        composeValidators,
        composeAsyncValidators,
        isPropertyUpdated,
        selectValueAccessor;

const formControlBinding =
    const Provider(NgControl, useExisting: NgFormControl);

/**
 * Binds an existing [Control] to a DOM element.
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
 * ###ng-model
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
@Directive(
    selector: "[ng-form-control]",
    bindings: const [formControlBinding],
    inputs: const ["form: ngFormControl", "model: ngModel"],
    outputs: const ["update: ngModelChange"],
    exportAs: "form")
class NgFormControl extends NgControl implements OnChanges {
  /* Array<Validator|Function> */ List<dynamic> _validators;
  /* Array<Validator|Function> */ List<dynamic> _asyncValidators;
  Control form;
  var update = new EventEmitter();
  dynamic model;
  dynamic viewModel;
  NgFormControl(
      @Optional() @Inject(NG_VALIDATORS) this._validators,
      @Optional() @Inject(NG_ASYNC_VALIDATORS) this._asyncValidators,
      @Optional()
      @Inject(NG_VALUE_ACCESSOR)
      List<ControlValueAccessor> valueAccessors)
      : super() {
    /* super call moved to initializer */;
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }
  void onChanges(Map<String, SimpleChange> changes) {
    if (this._isControlChanged(changes)) {
      setUpControl(this.form, this);
      this.form.updateValueAndValidity(emitEvent: false);
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      this.form.updateValue(this.model);
      this.viewModel = this.model;
    }
  }

  List<String> get path {
    return [];
  }

  Function get validator {
    return composeValidators(this._validators);
  }

  Function get asyncValidator {
    return composeAsyncValidators(this._asyncValidators);
  }

  Control get control {
    return this.form;
  }

  void viewToModelUpdate(dynamic newValue) {
    this.viewModel = newValue;
    ObservableWrapper.callEmit(this.update, newValue);
  }

  bool _isControlChanged(Map<String, dynamic> changes) {
    return StringMapWrapper.contains(changes, "form");
  }
}
