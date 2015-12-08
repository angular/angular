library angular2.src.common.forms.directives.ng_form_model;

import "package:angular2/src/facade/collection.dart"
    show ListWrapper, StringMapWrapper;
import "package:angular2/src/facade/async.dart"
    show ObservableWrapper, EventEmitter;
import "package:angular2/core.dart"
    show SimpleChange, OnChanges, Directive, Provider, Inject, Optional, Self;
import "ng_control.dart" show NgControl;
import "ng_control_group.dart" show NgControlGroup;
import "control_container.dart" show ControlContainer;
import "form_interface.dart" show Form;
import "../model.dart" show Control, ControlGroup;
import "shared.dart"
    show
        setUpControl,
        setUpControlGroup,
        composeValidators,
        composeAsyncValidators;
import "../validators.dart" show Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS;

const formDirectiveProvider =
    const Provider(ControlContainer, useExisting: NgFormModel);

/**
 * Binds an existing control group to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jqrVirudY8anJxTMUjTP?p=preview))
 *
 * In this example, we bind the control group to the form element, and we bind the login and
 * password controls to the login and password elements.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormModel Example</h2>
 *       <form [ng-form-model]="loginForm">
 *         <p>Login: <input type="text" ng-control="login"></p>
 *         <p>Password: <input type="password" ng-control="password"></p>
 *       </form>
 *       <p>Value:</p>
 *       <pre>{{value}}</pre>
 *     </div>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginForm: ControlGroup;
 *
 *   constructor() {
 *     this.loginForm = new ControlGroup({
 *       login: new Control(""),
 *       password: new Control("")
 *     });
 *   }
 *
 *   get value(): string {
 *     return JSON.stringify(this.loginForm.value, null, 2);
 *   }
 * }
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form [ng-form-model]='loginForm'>
 *          Login <input type='text' ng-control='login' [(ng-model)]='credentials.login'>
 *          Password <input type='password' ng-control='password'
 *                          [(ng-model)]='credentials.password'>
 *          <button (click)="onLogin()">Login</button>
 *        </form>`
 *      })
 * class LoginComp {
 *  credentials: {login: string, password: string};
 *  loginForm: ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
 *      password: new Control("")
 *    });
 *  }
 *
 *  onLogin(): void {
 *    // this.credentials.login === 'some login'
 *    // this.credentials.password === 'some password'
 *  }
 * }
 *  ```
 */
@Directive(
    selector: "[ng-form-model]",
    bindings: const [formDirectiveProvider],
    inputs: const ["form: ng-form-model"],
    host: const {"(submit)": "onSubmit()"},
    outputs: const ["ngSubmit"],
    exportAs: "form")
class NgFormModel extends ControlContainer implements Form, OnChanges {
  List<dynamic> _validators;
  List<dynamic> _asyncValidators;
  ControlGroup form = null;
  List<NgControl> directives = [];
  var ngSubmit = new EventEmitter();
  NgFormModel(@Optional() @Self() @Inject(NG_VALIDATORS) this._validators,
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) this._asyncValidators)
      : super() {
    /* super call moved to initializer */;
  }
  void ngOnChanges(Map<String, SimpleChange> changes) {
    if (StringMapWrapper.contains(changes, "form")) {
      var sync = composeValidators(this._validators);
      this.form.validator = Validators.compose([this.form.validator, sync]);
      var async = composeAsyncValidators(this._asyncValidators);
      this.form.asyncValidator =
          Validators.composeAsync([this.form.asyncValidator, async]);
      this.form.updateValueAndValidity(onlySelf: true, emitEvent: false);
    }
    this._updateDomValue();
  }

  Form get formDirective {
    return this;
  }

  ControlGroup get control {
    return this.form;
  }

  List<String> get path {
    return [];
  }

  void addControl(NgControl dir) {
    dynamic ctrl = this.form.find(dir.path);
    setUpControl(ctrl, dir);
    ctrl.updateValueAndValidity(emitEvent: false);
    this.directives.add(dir);
  }

  Control getControl(NgControl dir) {
    return (this.form.find(dir.path) as Control);
  }

  void removeControl(NgControl dir) {
    ListWrapper.remove(this.directives, dir);
  }

  addControlGroup(NgControlGroup dir) {
    dynamic ctrl = this.form.find(dir.path);
    setUpControlGroup(ctrl, dir);
    ctrl.updateValueAndValidity(emitEvent: false);
  }

  removeControlGroup(NgControlGroup dir) {}
  ControlGroup getControlGroup(NgControlGroup dir) {
    return (this.form.find(dir.path) as ControlGroup);
  }

  void updateModel(NgControl dir, dynamic value) {
    var ctrl = (this.form.find(dir.path) as Control);
    ctrl.updateValue(value);
  }

  bool onSubmit() {
    ObservableWrapper.callEmit(this.ngSubmit, null);
    return false;
  }

  /** @internal */
  _updateDomValue() {
    this.directives.forEach((dir) {
      dynamic ctrl = this.form.find(dir.path);
      dir.valueAccessor.writeValue(ctrl.value);
    });
  }
}
