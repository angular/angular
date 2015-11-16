import {Injectable} from 'angular2/src/core/di';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isArray, CONST_EXPR, Type} from 'angular2/src/facade/lang';
import * as modelModule from './model';


/**
 * Creates a form object from a user-specified configuration.
 *
 * ### Example ([live demo](http://plnkr.co/edit/ENgZo8EuIECZNensZCVr?p=preview))
 *
 * ```typescript
 * @Component({
 *   selector: 'my-app',
 *   viewBindings: [FORM_BINDINGS]
 *   template: `
 *     <form [ng-form-model]="loginForm">
 *       <p>Login <input ng-control="login"></p>
 *       <div ng-control-group="passwordRetry">
 *         <p>Password <input type="password" ng-control="password"></p>
 *         <p>Confirm password <input type="password" ng-control="passwordConfirmation"></p>
 *       </div>
 *     </form>
 *     <h3>Form value:</h3>
 *     <pre>{{value}}</pre>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginForm: ControlGroup;
 *
 *   constructor(builder: FormBuilder) {
 *     this.loginForm = builder.group({
 *       login: ["", Validators.required],
 *       passwordRetry: builder.group({
 *         password: ["", Validators.required],
 *         passwordConfirmation: ["", Validators.required, asyncValidator]
 *       })
 *     });
 *   }
 *
 *   get value(): string {
 *     return JSON.stringify(this.loginForm.value, null, 2);
 *   }
 * }
 * ```
 */
@Injectable()
export class FormBuilder {
  /**
   * Construct a new {@link ControlGroup} with the given map of configuration.
   * Valid keys for the `extra` parameter map are `optionals` and `validator`.
   *
   * See the {@link ControlGroup} constructor for more details.
   */
  group(controlsConfig: {[key: string]: any},
        extra: {[key: string]: any} = null): modelModule.ControlGroup {
    var controls = this._reduceControls(controlsConfig);
    var optionals = isPresent(extra) ? StringMapWrapper.get(extra, "optionals") : null;
    var validator = isPresent(extra) ? StringMapWrapper.get(extra, "validator") : null;
    var asyncValidator = isPresent(extra) ? StringMapWrapper.get(extra, "asyncValidator") : null;
    return new modelModule.ControlGroup(controls, optionals, validator, asyncValidator);
  }
  /**
   * Construct a new {@link Control} with the given `value`,`validator`, and `asyncValidator`.
   */
  control(value: Object, validator: Function = null,
          asyncValidator: Function = null): modelModule.Control {
    return new modelModule.Control(value, validator, asyncValidator);
  }

  /**
   * Construct an array of {@link Control}s from the given `controlsConfig` array of
   * configuration, with the given optional `validator` and `asyncValidator`.
   */
  array(controlsConfig: any[], validator: Function = null,
        asyncValidator: Function = null): modelModule.ControlArray {
    var controls = controlsConfig.map(c => this._createControl(c));
    return new modelModule.ControlArray(controls, validator, asyncValidator);
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
      var asyncValidator = controlConfig.length > 2 ? controlConfig[2] : null;
      return this.control(value, validator, asyncValidator);

    } else {
      return this.control(controlConfig);
    }
  }
}

/**
 * Shorthand set of providers used for building Angular forms.
 *
 * ### Example
 *
 * ```typescript
 * bootstrap(MyApp, [FORM_PROVIDERS]);
 * ```
 */
export const FORM_PROVIDERS: Type[] = CONST_EXPR([FormBuilder]);

/**
 * @deprecated
 */
export const FORM_BINDINGS = FORM_PROVIDERS;
