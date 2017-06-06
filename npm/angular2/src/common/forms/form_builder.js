'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var modelModule = require('./model');
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
 *     <form [ngFormModel]="loginForm">
 *       <p>Login <input ngControl="login"></p>
 *       <div ngControlGroup="passwordRetry">
 *         <p>Password <input type="password" ngControl="password"></p>
 *         <p>Confirm password <input type="password" ngControl="passwordConfirmation"></p>
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
var FormBuilder = (function () {
    function FormBuilder() {
    }
    /**
     * Construct a new {@link ControlGroup} with the given map of configuration.
     * Valid keys for the `extra` parameter map are `optionals` and `validator`.
     *
     * See the {@link ControlGroup} constructor for more details.
     */
    FormBuilder.prototype.group = function (controlsConfig, extra) {
        if (extra === void 0) { extra = null; }
        var controls = this._reduceControls(controlsConfig);
        var optionals = (lang_1.isPresent(extra) ? collection_1.StringMapWrapper.get(extra, "optionals") : null);
        var validator = lang_1.isPresent(extra) ? collection_1.StringMapWrapper.get(extra, "validator") : null;
        var asyncValidator = lang_1.isPresent(extra) ? collection_1.StringMapWrapper.get(extra, "asyncValidator") : null;
        return new modelModule.ControlGroup(controls, optionals, validator, asyncValidator);
    };
    /**
     * Construct a new {@link Control} with the given `value`,`validator`, and `asyncValidator`.
     */
    FormBuilder.prototype.control = function (value, validator, asyncValidator) {
        if (validator === void 0) { validator = null; }
        if (asyncValidator === void 0) { asyncValidator = null; }
        return new modelModule.Control(value, validator, asyncValidator);
    };
    /**
     * Construct an array of {@link Control}s from the given `controlsConfig` array of
     * configuration, with the given optional `validator` and `asyncValidator`.
     */
    FormBuilder.prototype.array = function (controlsConfig, validator, asyncValidator) {
        var _this = this;
        if (validator === void 0) { validator = null; }
        if (asyncValidator === void 0) { asyncValidator = null; }
        var controls = controlsConfig.map(function (c) { return _this._createControl(c); });
        return new modelModule.ControlArray(controls, validator, asyncValidator);
    };
    /** @internal */
    FormBuilder.prototype._reduceControls = function (controlsConfig) {
        var _this = this;
        var controls = {};
        collection_1.StringMapWrapper.forEach(controlsConfig, function (controlConfig, controlName) {
            controls[controlName] = _this._createControl(controlConfig);
        });
        return controls;
    };
    /** @internal */
    FormBuilder.prototype._createControl = function (controlConfig) {
        if (controlConfig instanceof modelModule.Control ||
            controlConfig instanceof modelModule.ControlGroup ||
            controlConfig instanceof modelModule.ControlArray) {
            return controlConfig;
        }
        else if (lang_1.isArray(controlConfig)) {
            var value = controlConfig[0];
            var validator = controlConfig.length > 1 ? controlConfig[1] : null;
            var asyncValidator = controlConfig.length > 2 ? controlConfig[2] : null;
            return this.control(value, validator, asyncValidator);
        }
        else {
            return this.control(controlConfig);
        }
    };
    FormBuilder = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], FormBuilder);
    return FormBuilder;
}());
exports.FormBuilder = FormBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9mb3JtX2J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6QywyQkFBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNsRSxJQUFZLFdBQVcsV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUl2Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUVIO0lBQUE7SUE4REEsQ0FBQztJQTdEQzs7Ozs7T0FLRztJQUNILDJCQUFLLEdBQUwsVUFBTSxjQUFvQyxFQUNwQyxLQUFrQztRQUFsQyxxQkFBa0MsR0FBbEMsWUFBa0M7UUFDdEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRCxJQUFJLFNBQVMsR0FBNkIsQ0FDdEMsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyw2QkFBZ0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3hFLElBQUksU0FBUyxHQUFnQixnQkFBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLDZCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2hHLElBQUksY0FBYyxHQUNkLGdCQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsNkJBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM1RSxNQUFNLENBQUMsSUFBSSxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFDRDs7T0FFRztJQUNILDZCQUFPLEdBQVAsVUFBUSxLQUFhLEVBQUUsU0FBNkIsRUFDNUMsY0FBdUM7UUFEeEIseUJBQTZCLEdBQTdCLGdCQUE2QjtRQUM1Qyw4QkFBdUMsR0FBdkMscUJBQXVDO1FBQzdDLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsMkJBQUssR0FBTCxVQUFNLGNBQXFCLEVBQUUsU0FBNkIsRUFDcEQsY0FBdUM7UUFEN0MsaUJBSUM7UUFKNEIseUJBQTZCLEdBQTdCLGdCQUE2QjtRQUNwRCw4QkFBdUMsR0FBdkMscUJBQXVDO1FBQzNDLElBQUksUUFBUSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDL0QsTUFBTSxDQUFDLElBQUksV0FBVyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIscUNBQWUsR0FBZixVQUFnQixjQUN5QjtRQUR6QyxpQkFPQztRQUxDLElBQUksUUFBUSxHQUFpRCxFQUFFLENBQUM7UUFDaEUsNkJBQWdCLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxVQUFDLGFBQWtCLEVBQUUsV0FBbUI7WUFDL0UsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEtBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0QsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsb0NBQWMsR0FBZCxVQUFlLGFBQWtCO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLGFBQWEsWUFBWSxXQUFXLENBQUMsT0FBTztZQUM1QyxhQUFhLFlBQVksV0FBVyxDQUFDLFlBQVk7WUFDakQsYUFBYSxZQUFZLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFFdkIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLFNBQVMsR0FBZ0IsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNoRixJQUFJLGNBQWMsR0FBcUIsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMxRixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRXhELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7SUFDSCxDQUFDO0lBOURIO1FBQUMsaUJBQVUsRUFBRTs7bUJBQUE7SUErRGIsa0JBQUM7QUFBRCxDQUFDLEFBOURELElBOERDO0FBOURZLG1CQUFXLGNBOER2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0FycmF5LCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0ICogYXMgbW9kZWxNb2R1bGUgZnJvbSAnLi9tb2RlbCc7XG5pbXBvcnQge1ZhbGlkYXRvckZuLCBBc3luY1ZhbGlkYXRvckZufSBmcm9tICcuL2RpcmVjdGl2ZXMvdmFsaWRhdG9ycyc7XG5cblxuLyoqXG4gKiBDcmVhdGVzIGEgZm9ybSBvYmplY3QgZnJvbSBhIHVzZXItc3BlY2lmaWVkIGNvbmZpZ3VyYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0VOZ1pvOEV1SUVDWk5lbnNaQ1ZyP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktYXBwJyxcbiAqICAgdmlld0JpbmRpbmdzOiBbRk9STV9CSU5ESU5HU11cbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8Zm9ybSBbbmdGb3JtTW9kZWxdPVwibG9naW5Gb3JtXCI+XG4gKiAgICAgICA8cD5Mb2dpbiA8aW5wdXQgbmdDb250cm9sPVwibG9naW5cIj48L3A+XG4gKiAgICAgICA8ZGl2IG5nQ29udHJvbEdyb3VwPVwicGFzc3dvcmRSZXRyeVwiPlxuICogICAgICAgICA8cD5QYXNzd29yZCA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmdDb250cm9sPVwicGFzc3dvcmRcIj48L3A+XG4gKiAgICAgICAgIDxwPkNvbmZpcm0gcGFzc3dvcmQgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5nQ29udHJvbD1cInBhc3N3b3JkQ29uZmlybWF0aW9uXCI+PC9wPlxuICogICAgICAgPC9kaXY+XG4gKiAgICAgPC9mb3JtPlxuICogICAgIDxoMz5Gb3JtIHZhbHVlOjwvaDM+XG4gKiAgICAgPHByZT57e3ZhbHVlfX08L3ByZT5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU11cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgbG9naW5Gb3JtOiBDb250cm9sR3JvdXA7XG4gKlxuICogICBjb25zdHJ1Y3RvcihidWlsZGVyOiBGb3JtQnVpbGRlcikge1xuICogICAgIHRoaXMubG9naW5Gb3JtID0gYnVpbGRlci5ncm91cCh7XG4gKiAgICAgICBsb2dpbjogW1wiXCIsIFZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICogICAgICAgcGFzc3dvcmRSZXRyeTogYnVpbGRlci5ncm91cCh7XG4gKiAgICAgICAgIHBhc3N3b3JkOiBbXCJcIiwgVmFsaWRhdG9ycy5yZXF1aXJlZF0sXG4gKiAgICAgICAgIHBhc3N3b3JkQ29uZmlybWF0aW9uOiBbXCJcIiwgVmFsaWRhdG9ycy5yZXF1aXJlZCwgYXN5bmNWYWxpZGF0b3JdXG4gKiAgICAgICB9KVxuICogICAgIH0pO1xuICogICB9XG4gKlxuICogICBnZXQgdmFsdWUoKTogc3RyaW5nIHtcbiAqICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5sb2dpbkZvcm0udmFsdWUsIG51bGwsIDIpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEZvcm1CdWlsZGVyIHtcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB7QGxpbmsgQ29udHJvbEdyb3VwfSB3aXRoIHRoZSBnaXZlbiBtYXAgb2YgY29uZmlndXJhdGlvbi5cbiAgICogVmFsaWQga2V5cyBmb3IgdGhlIGBleHRyYWAgcGFyYW1ldGVyIG1hcCBhcmUgYG9wdGlvbmFsc2AgYW5kIGB2YWxpZGF0b3JgLlxuICAgKlxuICAgKiBTZWUgdGhlIHtAbGluayBDb250cm9sR3JvdXB9IGNvbnN0cnVjdG9yIGZvciBtb3JlIGRldGFpbHMuXG4gICAqL1xuICBncm91cChjb250cm9sc0NvbmZpZzoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgICAgIGV4dHJhOiB7W2tleTogc3RyaW5nXTogYW55fSA9IG51bGwpOiBtb2RlbE1vZHVsZS5Db250cm9sR3JvdXAge1xuICAgIHZhciBjb250cm9scyA9IHRoaXMuX3JlZHVjZUNvbnRyb2xzKGNvbnRyb2xzQ29uZmlnKTtcbiAgICB2YXIgb3B0aW9uYWxzID0gPHtba2V5OiBzdHJpbmddOiBib29sZWFufT4oXG4gICAgICAgIGlzUHJlc2VudChleHRyYSkgPyBTdHJpbmdNYXBXcmFwcGVyLmdldChleHRyYSwgXCJvcHRpb25hbHNcIikgOiBudWxsKTtcbiAgICB2YXIgdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IGlzUHJlc2VudChleHRyYSkgPyBTdHJpbmdNYXBXcmFwcGVyLmdldChleHRyYSwgXCJ2YWxpZGF0b3JcIikgOiBudWxsO1xuICAgIHZhciBhc3luY1ZhbGlkYXRvcjogQXN5bmNWYWxpZGF0b3JGbiA9XG4gICAgICAgIGlzUHJlc2VudChleHRyYSkgPyBTdHJpbmdNYXBXcmFwcGVyLmdldChleHRyYSwgXCJhc3luY1ZhbGlkYXRvclwiKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBtb2RlbE1vZHVsZS5Db250cm9sR3JvdXAoY29udHJvbHMsIG9wdGlvbmFscywgdmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG4gIH1cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB7QGxpbmsgQ29udHJvbH0gd2l0aCB0aGUgZ2l2ZW4gYHZhbHVlYCxgdmFsaWRhdG9yYCwgYW5kIGBhc3luY1ZhbGlkYXRvcmAuXG4gICAqL1xuICBjb250cm9sKHZhbHVlOiBPYmplY3QsIHZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSBudWxsLFxuICAgICAgICAgIGFzeW5jVmFsaWRhdG9yOiBBc3luY1ZhbGlkYXRvckZuID0gbnVsbCk6IG1vZGVsTW9kdWxlLkNvbnRyb2wge1xuICAgIHJldHVybiBuZXcgbW9kZWxNb2R1bGUuQ29udHJvbCh2YWx1ZSwgdmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGFuIGFycmF5IG9mIHtAbGluayBDb250cm9sfXMgZnJvbSB0aGUgZ2l2ZW4gYGNvbnRyb2xzQ29uZmlnYCBhcnJheSBvZlxuICAgKiBjb25maWd1cmF0aW9uLCB3aXRoIHRoZSBnaXZlbiBvcHRpb25hbCBgdmFsaWRhdG9yYCBhbmQgYGFzeW5jVmFsaWRhdG9yYC5cbiAgICovXG4gIGFycmF5KGNvbnRyb2xzQ29uZmlnOiBhbnlbXSwgdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IG51bGwsXG4gICAgICAgIGFzeW5jVmFsaWRhdG9yOiBBc3luY1ZhbGlkYXRvckZuID0gbnVsbCk6IG1vZGVsTW9kdWxlLkNvbnRyb2xBcnJheSB7XG4gICAgdmFyIGNvbnRyb2xzID0gY29udHJvbHNDb25maWcubWFwKGMgPT4gdGhpcy5fY3JlYXRlQ29udHJvbChjKSk7XG4gICAgcmV0dXJuIG5ldyBtb2RlbE1vZHVsZS5Db250cm9sQXJyYXkoY29udHJvbHMsIHZhbGlkYXRvciwgYXN5bmNWYWxpZGF0b3IpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVkdWNlQ29udHJvbHMoY29udHJvbHNDb25maWc6IHtbazogc3RyaW5nXTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFueX0pOiB7W2tleTogc3RyaW5nXTogbW9kZWxNb2R1bGUuQWJzdHJhY3RDb250cm9sfSB7XG4gICAgdmFyIGNvbnRyb2xzOiB7W2tleTogc3RyaW5nXTogbW9kZWxNb2R1bGUuQWJzdHJhY3RDb250cm9sfSA9IHt9O1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChjb250cm9sc0NvbmZpZywgKGNvbnRyb2xDb25maWc6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29udHJvbHNbY29udHJvbE5hbWVdID0gdGhpcy5fY3JlYXRlQ29udHJvbChjb250cm9sQ29uZmlnKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29udHJvbHM7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jcmVhdGVDb250cm9sKGNvbnRyb2xDb25maWc6IGFueSk6IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbCB7XG4gICAgaWYgKGNvbnRyb2xDb25maWcgaW5zdGFuY2VvZiBtb2RlbE1vZHVsZS5Db250cm9sIHx8XG4gICAgICAgIGNvbnRyb2xDb25maWcgaW5zdGFuY2VvZiBtb2RlbE1vZHVsZS5Db250cm9sR3JvdXAgfHxcbiAgICAgICAgY29udHJvbENvbmZpZyBpbnN0YW5jZW9mIG1vZGVsTW9kdWxlLkNvbnRyb2xBcnJheSkge1xuICAgICAgcmV0dXJuIGNvbnRyb2xDb25maWc7XG5cbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoY29udHJvbENvbmZpZykpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGNvbnRyb2xDb25maWdbMF07XG4gICAgICB2YXIgdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IGNvbnRyb2xDb25maWcubGVuZ3RoID4gMSA/IGNvbnRyb2xDb25maWdbMV0gOiBudWxsO1xuICAgICAgdmFyIGFzeW5jVmFsaWRhdG9yOiBBc3luY1ZhbGlkYXRvckZuID0gY29udHJvbENvbmZpZy5sZW5ndGggPiAyID8gY29udHJvbENvbmZpZ1syXSA6IG51bGw7XG4gICAgICByZXR1cm4gdGhpcy5jb250cm9sKHZhbHVlLCB2YWxpZGF0b3IsIGFzeW5jVmFsaWRhdG9yKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250cm9sKGNvbnRyb2xDb25maWcpO1xuICAgIH1cbiAgfVxufVxuIl19