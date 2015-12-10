var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/core';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isPresent, isArray, CONST_EXPR } from 'angular2/src/facade/lang';
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
export let FormBuilder = class {
    /**
     * Construct a new {@link ControlGroup} with the given map of configuration.
     * Valid keys for the `extra` parameter map are `optionals` and `validator`.
     *
     * See the {@link ControlGroup} constructor for more details.
     */
    group(controlsConfig, extra = null) {
        var controls = this._reduceControls(controlsConfig);
        var optionals = isPresent(extra) ? StringMapWrapper.get(extra, "optionals") : null;
        var validator = isPresent(extra) ? StringMapWrapper.get(extra, "validator") : null;
        var asyncValidator = isPresent(extra) ? StringMapWrapper.get(extra, "asyncValidator") : null;
        return new modelModule.ControlGroup(controls, optionals, validator, asyncValidator);
    }
    /**
     * Construct a new {@link Control} with the given `value`,`validator`, and `asyncValidator`.
     */
    control(value, validator = null, asyncValidator = null) {
        return new modelModule.Control(value, validator, asyncValidator);
    }
    /**
     * Construct an array of {@link Control}s from the given `controlsConfig` array of
     * configuration, with the given optional `validator` and `asyncValidator`.
     */
    array(controlsConfig, validator = null, asyncValidator = null) {
        var controls = controlsConfig.map(c => this._createControl(c));
        return new modelModule.ControlArray(controls, validator, asyncValidator);
    }
    /** @internal */
    _reduceControls(controlsConfig) {
        var controls = {};
        StringMapWrapper.forEach(controlsConfig, (controlConfig, controlName) => {
            controls[controlName] = this._createControl(controlConfig);
        });
        return controls;
    }
    /** @internal */
    _createControl(controlConfig) {
        if (controlConfig instanceof modelModule.Control ||
            controlConfig instanceof modelModule.ControlGroup ||
            controlConfig instanceof modelModule.ControlArray) {
            return controlConfig;
        }
        else if (isArray(controlConfig)) {
            var value = controlConfig[0];
            var validator = controlConfig.length > 1 ? controlConfig[1] : null;
            var asyncValidator = controlConfig.length > 2 ? controlConfig[2] : null;
            return this.control(value, validator, asyncValidator);
        }
        else {
            return this.control(controlConfig);
        }
    }
};
FormBuilder = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], FormBuilder);
/**
 * Shorthand set of providers used for building Angular forms.
 *
 * ### Example
 *
 * ```typescript
 * bootstrap(MyApp, [FORM_PROVIDERS]);
 * ```
 */
export const FORM_PROVIDERS = CONST_EXPR([FormBuilder]);
/**
 * @deprecated
 */
export const FORM_BINDINGS = FORM_PROVIDERS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9mb3JtX2J1aWxkZXIudHMiXSwibmFtZXMiOlsiRm9ybUJ1aWxkZXIiLCJGb3JtQnVpbGRlci5ncm91cCIsIkZvcm1CdWlsZGVyLmNvbnRyb2wiLCJGb3JtQnVpbGRlci5hcnJheSIsIkZvcm1CdWlsZGVyLl9yZWR1Y2VDb250cm9scyIsIkZvcm1CdWlsZGVyLl9jcmVhdGVDb250cm9sIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FDakMsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUN4RCxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFPLE1BQU0sMEJBQTBCO09BQ3RFLEtBQUssV0FBVyxNQUFNLFNBQVM7QUFHdEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Q0c7QUFDSDtJQUVFQTs7Ozs7T0FLR0E7SUFDSEEsS0FBS0EsQ0FBQ0EsY0FBb0NBLEVBQ3BDQSxLQUFLQSxHQUF5QkEsSUFBSUE7UUFDdENDLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO1FBQ3BEQSxJQUFJQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxnQkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ25GQSxJQUFJQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxnQkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ25GQSxJQUFJQSxjQUFjQSxHQUFHQSxTQUFTQSxDQUFDQSxLQUFLQSxD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QUFFRDs7Ozs7Ozs7R0FRRztBQUNILGFBQWEsY0FBYyxHQUFXLFVBQVUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFFaEU7O0dBRUc7QUFDSCxhQUFhLGFBQWEsR0FBRyxjQUFjLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQXJyYXksIENPTlNUX0VYUFIsIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQgKiBhcyBtb2RlbE1vZHVsZSBmcm9tICcuL21vZGVsJztcblxuXG4vKipcbiAqIENyZWF0ZXMgYSBmb3JtIG9iamVjdCBmcm9tIGEgdXNlci1zcGVjaWZpZWQgY29uZmlndXJhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvRU5nWm84RXVJRUNaTmVuc1pDVnI/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICogICB2aWV3QmluZGluZ3M6IFtGT1JNX0JJTkRJTkdTXVxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxmb3JtIFtuZy1mb3JtLW1vZGVsXT1cImxvZ2luRm9ybVwiPlxuICogICAgICAgPHA+TG9naW4gPGlucHV0IG5nLWNvbnRyb2w9XCJsb2dpblwiPjwvcD5cbiAqICAgICAgIDxkaXYgbmctY29udHJvbC1ncm91cD1cInBhc3N3b3JkUmV0cnlcIj5cbiAqICAgICAgICAgPHA+UGFzc3dvcmQgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5nLWNvbnRyb2w9XCJwYXNzd29yZFwiPjwvcD5cbiAqICAgICAgICAgPHA+Q29uZmlybSBwYXNzd29yZCA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmctY29udHJvbD1cInBhc3N3b3JkQ29uZmlybWF0aW9uXCI+PC9wPlxuICogICAgICAgPC9kaXY+XG4gKiAgICAgPC9mb3JtPlxuICogICAgIDxoMz5Gb3JtIHZhbHVlOjwvaDM+XG4gKiAgICAgPHByZT57e3ZhbHVlfX08L3ByZT5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU11cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgbG9naW5Gb3JtOiBDb250cm9sR3JvdXA7XG4gKlxuICogICBjb25zdHJ1Y3RvcihidWlsZGVyOiBGb3JtQnVpbGRlcikge1xuICogICAgIHRoaXMubG9naW5Gb3JtID0gYnVpbGRlci5ncm91cCh7XG4gKiAgICAgICBsb2dpbjogW1wiXCIsIFZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICogICAgICAgcGFzc3dvcmRSZXRyeTogYnVpbGRlci5ncm91cCh7XG4gKiAgICAgICAgIHBhc3N3b3JkOiBbXCJcIiwgVmFsaWRhdG9ycy5yZXF1aXJlZF0sXG4gKiAgICAgICAgIHBhc3N3b3JkQ29uZmlybWF0aW9uOiBbXCJcIiwgVmFsaWRhdG9ycy5yZXF1aXJlZCwgYXN5bmNWYWxpZGF0b3JdXG4gKiAgICAgICB9KVxuICogICAgIH0pO1xuICogICB9XG4gKlxuICogICBnZXQgdmFsdWUoKTogc3RyaW5nIHtcbiAqICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5sb2dpbkZvcm0udmFsdWUsIG51bGwsIDIpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEZvcm1CdWlsZGVyIHtcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB7QGxpbmsgQ29udHJvbEdyb3VwfSB3aXRoIHRoZSBnaXZlbiBtYXAgb2YgY29uZmlndXJhdGlvbi5cbiAgICogVmFsaWQga2V5cyBmb3IgdGhlIGBleHRyYWAgcGFyYW1ldGVyIG1hcCBhcmUgYG9wdGlvbmFsc2AgYW5kIGB2YWxpZGF0b3JgLlxuICAgKlxuICAgKiBTZWUgdGhlIHtAbGluayBDb250cm9sR3JvdXB9IGNvbnN0cnVjdG9yIGZvciBtb3JlIGRldGFpbHMuXG4gICAqL1xuICBncm91cChjb250cm9sc0NvbmZpZzoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgICAgIGV4dHJhOiB7W2tleTogc3RyaW5nXTogYW55fSA9IG51bGwpOiBtb2RlbE1vZHVsZS5Db250cm9sR3JvdXAge1xuICAgIHZhciBjb250cm9scyA9IHRoaXMuX3JlZHVjZUNvbnRyb2xzKGNvbnRyb2xzQ29uZmlnKTtcbiAgICB2YXIgb3B0aW9uYWxzID0gaXNQcmVzZW50KGV4dHJhKSA/IFN0cmluZ01hcFdyYXBwZXIuZ2V0KGV4dHJhLCBcIm9wdGlvbmFsc1wiKSA6IG51bGw7XG4gICAgdmFyIHZhbGlkYXRvciA9IGlzUHJlc2VudChleHRyYSkgPyBTdHJpbmdNYXBXcmFwcGVyLmdldChleHRyYSwgXCJ2YWxpZGF0b3JcIikgOiBudWxsO1xuICAgIHZhciBhc3luY1ZhbGlkYXRvciA9IGlzUHJlc2VudChleHRyYSkgPyBTdHJpbmdNYXBXcmFwcGVyLmdldChleHRyYSwgXCJhc3luY1ZhbGlkYXRvclwiKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBtb2RlbE1vZHVsZS5Db250cm9sR3JvdXAoY29udHJvbHMsIG9wdGlvbmFscywgdmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG4gIH1cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB7QGxpbmsgQ29udHJvbH0gd2l0aCB0aGUgZ2l2ZW4gYHZhbHVlYCxgdmFsaWRhdG9yYCwgYW5kIGBhc3luY1ZhbGlkYXRvcmAuXG4gICAqL1xuICBjb250cm9sKHZhbHVlOiBPYmplY3QsIHZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsLFxuICAgICAgICAgIGFzeW5jVmFsaWRhdG9yOiBGdW5jdGlvbiA9IG51bGwpOiBtb2RlbE1vZHVsZS5Db250cm9sIHtcbiAgICByZXR1cm4gbmV3IG1vZGVsTW9kdWxlLkNvbnRyb2wodmFsdWUsIHZhbGlkYXRvciwgYXN5bmNWYWxpZGF0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhbiBhcnJheSBvZiB7QGxpbmsgQ29udHJvbH1zIGZyb20gdGhlIGdpdmVuIGBjb250cm9sc0NvbmZpZ2AgYXJyYXkgb2ZcbiAgICogY29uZmlndXJhdGlvbiwgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9uYWwgYHZhbGlkYXRvcmAgYW5kIGBhc3luY1ZhbGlkYXRvcmAuXG4gICAqL1xuICBhcnJheShjb250cm9sc0NvbmZpZzogYW55W10sIHZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsLFxuICAgICAgICBhc3luY1ZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsKTogbW9kZWxNb2R1bGUuQ29udHJvbEFycmF5IHtcbiAgICB2YXIgY29udHJvbHMgPSBjb250cm9sc0NvbmZpZy5tYXAoYyA9PiB0aGlzLl9jcmVhdGVDb250cm9sKGMpKTtcbiAgICByZXR1cm4gbmV3IG1vZGVsTW9kdWxlLkNvbnRyb2xBcnJheShjb250cm9scywgdmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWR1Y2VDb250cm9scyhjb250cm9sc0NvbmZpZzogYW55KToge1trZXk6IHN0cmluZ106IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbH0ge1xuICAgIHZhciBjb250cm9sczoge1trZXk6IHN0cmluZ106IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbH0gPSB7fTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goY29udHJvbHNDb25maWcsIChjb250cm9sQ29uZmlnLCBjb250cm9sTmFtZSkgPT4ge1xuICAgICAgY29udHJvbHNbY29udHJvbE5hbWVdID0gdGhpcy5fY3JlYXRlQ29udHJvbChjb250cm9sQ29uZmlnKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29udHJvbHM7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jcmVhdGVDb250cm9sKGNvbnRyb2xDb25maWc6IGFueSk6IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbCB7XG4gICAgaWYgKGNvbnRyb2xDb25maWcgaW5zdGFuY2VvZiBtb2RlbE1vZHVsZS5Db250cm9sIHx8XG4gICAgICAgIGNvbnRyb2xDb25maWcgaW5zdGFuY2VvZiBtb2RlbE1vZHVsZS5Db250cm9sR3JvdXAgfHxcbiAgICAgICAgY29udHJvbENvbmZpZyBpbnN0YW5jZW9mIG1vZGVsTW9kdWxlLkNvbnRyb2xBcnJheSkge1xuICAgICAgcmV0dXJuIGNvbnRyb2xDb25maWc7XG5cbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoY29udHJvbENvbmZpZykpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGNvbnRyb2xDb25maWdbMF07XG4gICAgICB2YXIgdmFsaWRhdG9yID0gY29udHJvbENvbmZpZy5sZW5ndGggPiAxID8gY29udHJvbENvbmZpZ1sxXSA6IG51bGw7XG4gICAgICB2YXIgYXN5bmNWYWxpZGF0b3IgPSBjb250cm9sQ29uZmlnLmxlbmd0aCA+IDIgPyBjb250cm9sQ29uZmlnWzJdIDogbnVsbDtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRyb2wodmFsdWUsIHZhbGlkYXRvciwgYXN5bmNWYWxpZGF0b3IpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRyb2woY29udHJvbENvbmZpZyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogU2hvcnRoYW5kIHNldCBvZiBwcm92aWRlcnMgdXNlZCBmb3IgYnVpbGRpbmcgQW5ndWxhciBmb3Jtcy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGJvb3RzdHJhcChNeUFwcCwgW0ZPUk1fUFJPVklERVJTXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IEZPUk1fUFJPVklERVJTOiBUeXBlW10gPSBDT05TVF9FWFBSKFtGb3JtQnVpbGRlcl0pO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBjb25zdCBGT1JNX0JJTkRJTkdTID0gRk9STV9QUk9WSURFUlM7XG4iXX0=