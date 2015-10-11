import {Injectable} from 'angular2/src/core/di';
import {StringMapWrapper} from 'angular2/src/core/facade/collection';
import {isPresent, isArray} from 'angular2/src/core/facade/lang';
import * as modelModule from './model';


/**
 * Creates a form object from a user-specified configuration.
 *
 * # Example
 *
 * ```
 * import {Component, bootstrap} from 'angular2/angular2';
 * import {FormBuilder, Validators, FORM_DIRECTIVES, ControlGroup} from 'angular2/core';
 *
 * @Component({
 *   selector: 'login-comp',
 *   viewProviders: [FormBuilder],
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
 *   directives: [FORM_DIRECTIVES]
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
 * bootstrap(LoginComp);
 * ```
 *
 * This example creates a {@link ControlGroup} that consists of a `login` {@link Control}, and a
 * nested {@link ControlGroup} that defines a `password` and a `passwordConfirmation`
 * {@link Control}:
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
 */
@Injectable()
export class FormBuilder {
  group(controlsConfig: {[key: string]: any},
        extra: {[key: string]: any} = null): modelModule.ControlGroup {
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

  array(controlsConfig: any[], validator: Function = null): modelModule.ControlArray {
    var controls = controlsConfig.map(c => this._createControl(c));
    if (isPresent(validator)) {
      return new modelModule.ControlArray(controls, validator);
    } else {
      return new modelModule.ControlArray(controls);
    }
  }

  /** @internal */
  _reduceControls(controlsConfig: any): {[key: string]: modelModule.AbstractControl} {
    var controls: {[key: string]: modelModule.AbstractControl} = {};
    StringMapWrapper.forEach(controlsConfig, (controlConfig, controlName) => {
      controls[controlName] = this._createControl(controlConfig);
    });
    return controls;
  }

  /** @internal */
  _createControl(controlConfig: any): modelModule.AbstractControl {
    if (controlConfig instanceof modelModule.Control ||
        controlConfig instanceof modelModule.ControlGroup ||
        controlConfig instanceof modelModule.ControlArray) {
      return controlConfig;

    } else if (isArray(controlConfig)) {
      var value = controlConfig[0];
      var validator = controlConfig.length > 1 ? controlConfig[1] : null;
      return this.control(value, validator);

    } else {
      return this.control(controlConfig);
    }
  }
}
