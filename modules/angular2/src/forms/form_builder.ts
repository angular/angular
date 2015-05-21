import {StringMapWrapper, ListWrapper, List} from 'angular2/src/facade/collection';
import {isPresent} from 'angular2/src/facade/lang';
import * as modelModule from './model';


/**
 * Creates a form object from a user-specified configuration.
 *
 * # Example
 *
 * ```
 * import {Component, View, bootstrap} from 'angular2/angular2';
 * import {FormBuilder, Validators, formDirectives, ControlGroup} from 'angular2/forms';
 *
 * @Component({
 *   selector: 'login-comp',
 *   appInjector: [
 *     FormBuilder
 *   ]
 * })
 * @View({
 *   template: `
 *     <form [control-group]="loginForm">
 *       Login <input control="login">
 *
 *       <div control-group="passwordRetry">
 *         Password <input type="password" control="password">
 *         Confirm password <input type="password" control="passwordConfirmation">
 *       </div>
 *     </form>
 *   `,
 *   directives: [
 *     formDirectives
 *   ]
 * })
 * class LoginComp {
 *   loginForm: ControlGroup;
 *
 *   constructor(builder: FormBuilder) {
 *     this.loginForm = builder.group({
 *       login: ["", Validators.required],
 *
 *       passwordRetry: builder.group({
 *         password: ["", Validators.required],
 *         passwordConfirmation: ["", Validators.required]
 *       })
 *     });
 *   }
 * }
 *
 * bootstrap(LoginComp)
 * ```
 *
 * This example creates a {@link ControlGroup} that consists of a `login` {@link Control}, and a
 * nested
 * {@link ControlGroup} that defines a `password` and a `passwordConfirmation` {@link Control}:
 *
 * ```
 *  var loginForm = builder.group({
 *    login: ["", Validators.required],
 *
 *    passwordRetry: builder.group({
 *      password: ["", Validators.required],
 *      passwordConfirmation: ["", Validators.required]
 *    })
 *  });
 *
 *  ```
 * @exportedAs angular2/forms
 */
export class FormBuilder {
  group(controlsConfig: StringMap<string, any>,
        extra: StringMap<string, any> = null): modelModule.ControlGroup {
    var controls = this._reduceControls(controlsConfig);
    var optionals = isPresent(extra) ? StringMapWrapper.get(extra, "optionals") : null;
    var validator = isPresent(extra) ? StringMapWrapper.get(extra, "validator") : null;

    if (isPresent(validator)) {
      return new modelModule.ControlGroup(controls, optionals, validator);
    } else {
      return new modelModule.ControlGroup(controls, optionals);
    }
  }

  control(value: Object, validator: Function = null): modelModule.Control {
    if (isPresent(validator)) {
      return new modelModule.Control(value, validator);
    } else {
      return new modelModule.Control(value);
    }
  }

  array(controlsConfig: List<any>, validator: Function = null): modelModule.ControlArray {
    var controls = ListWrapper.map(controlsConfig, (c) => this._createControl(c));
    if (isPresent(validator)) {
      return new modelModule.ControlArray(controls, validator);
    } else {
      return new modelModule.ControlArray(controls);
    }
  }

  _reduceControls(controlsConfig: any): StringMap<string, modelModule.AbstractControl> {
    var controls = {};
    StringMapWrapper.forEach(controlsConfig, (controlConfig, controlName) => {
      controls[controlName] = this._createControl(controlConfig);
    });
    return controls;
  }

  _createControl(controlConfig: any): modelModule.AbstractControl {
    if (controlConfig instanceof modelModule.Control || controlConfig instanceof
                                     modelModule.ControlGroup || controlConfig instanceof
                                         modelModule.ControlArray) {
      return controlConfig;

    } else if (ListWrapper.isList(controlConfig)) {
      var value = ListWrapper.get(controlConfig, 0);
      var validator = controlConfig.length > 1 ? controlConfig[1] : null;
      return this.control(value, validator);

    } else {
      return this.control(controlConfig);
    }
  }
}
