'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
        var optionals = lang_1.isPresent(extra) ? collection_1.StringMapWrapper.get(extra, "optionals") : null;
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
})();
exports.FormBuilder = FormBuilder;
/**
 * Shorthand set of providers used for building Angular forms.
 *
 * ### Example
 *
 * ```typescript
 * bootstrap(MyApp, [FORM_PROVIDERS]);
 * ```
 */
exports.FORM_PROVIDERS = lang_1.CONST_EXPR([FormBuilder]);
/**
 * @deprecated
 */
exports.FORM_BINDINGS = exports.FORM_PROVIDERS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9mb3JtX2J1aWxkZXIudHMiXSwibmFtZXMiOlsiRm9ybUJ1aWxkZXIiLCJGb3JtQnVpbGRlci5jb25zdHJ1Y3RvciIsIkZvcm1CdWlsZGVyLmdyb3VwIiwiRm9ybUJ1aWxkZXIuY29udHJvbCIsIkZvcm1CdWlsZGVyLmFycmF5IiwiRm9ybUJ1aWxkZXIuX3JlZHVjZUNvbnRyb2xzIiwiRm9ybUJ1aWxkZXIuX2NyZWF0ZUNvbnRyb2wiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6QywyQkFBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSxxQkFBbUQsMEJBQTBCLENBQUMsQ0FBQTtBQUM5RSxJQUFZLFdBQVcsV0FBTSxTQUFTLENBQUMsQ0FBQTtBQUd2Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUNIO0lBQUFBO0lBNERBQyxDQUFDQTtJQTFEQ0Q7Ozs7O09BS0dBO0lBQ0hBLDJCQUFLQSxHQUFMQSxVQUFNQSxjQUFvQ0EsRUFDcENBLEtBQWtDQTtRQUFsQ0UscUJBQWtDQSxHQUFsQ0EsWUFBa0NBO1FBQ3RDQSxJQUFJQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUNwREEsSUFBSUEsU0FBU0EsR0FBR0EsZ0JBQVNBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLDZCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbkZBLElBQUlBLFNBQVNBLEdBQUdBLGdCQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSw2QkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLEdBQUdBLElBQUlB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QUFDQSxLQUFLQSxFQUFFQSxTQUFTQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUV4REEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDckNBLENBQUNBO0lBQ0hBLENBQUNBO0lBM0RITjtRQUFDQSxpQkFBVUEsRUFBRUE7O29CQTREWkE7SUFBREEsa0JBQUNBO0FBQURBLENBQUNBLEFBNURELElBNERDO0FBM0RZLG1CQUFXLGNBMkR2QixDQUFBO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDVSxzQkFBYyxHQUFXLGlCQUFVLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBRWhFOztHQUVHO0FBQ1UscUJBQWEsR0FBRyxzQkFBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0FycmF5LCBDT05TVF9FWFBSLCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0ICogYXMgbW9kZWxNb2R1bGUgZnJvbSAnLi9tb2RlbCc7XG5cblxuLyoqXG4gKiBDcmVhdGVzIGEgZm9ybSBvYmplY3QgZnJvbSBhIHVzZXItc3BlY2lmaWVkIGNvbmZpZ3VyYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0VOZ1pvOEV1SUVDWk5lbnNaQ1ZyP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktYXBwJyxcbiAqICAgdmlld0JpbmRpbmdzOiBbRk9STV9CSU5ESU5HU11cbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8Zm9ybSBbbmctZm9ybS1tb2RlbF09XCJsb2dpbkZvcm1cIj5cbiAqICAgICAgIDxwPkxvZ2luIDxpbnB1dCBuZy1jb250cm9sPVwibG9naW5cIj48L3A+XG4gKiAgICAgICA8ZGl2IG5nLWNvbnRyb2wtZ3JvdXA9XCJwYXNzd29yZFJldHJ5XCI+XG4gKiAgICAgICAgIDxwPlBhc3N3b3JkIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuZy1jb250cm9sPVwicGFzc3dvcmRcIj48L3A+XG4gKiAgICAgICAgIDxwPkNvbmZpcm0gcGFzc3dvcmQgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5nLWNvbnRyb2w9XCJwYXNzd29yZENvbmZpcm1hdGlvblwiPjwvcD5cbiAqICAgICAgIDwvZGl2PlxuICogICAgIDwvZm9ybT5cbiAqICAgICA8aDM+Rm9ybSB2YWx1ZTo8L2gzPlxuICogICAgIDxwcmU+e3t2YWx1ZX19PC9wcmU+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIGxvZ2luRm9ybTogQ29udHJvbEdyb3VwO1xuICpcbiAqICAgY29uc3RydWN0b3IoYnVpbGRlcjogRm9ybUJ1aWxkZXIpIHtcbiAqICAgICB0aGlzLmxvZ2luRm9ybSA9IGJ1aWxkZXIuZ3JvdXAoe1xuICogICAgICAgbG9naW46IFtcIlwiLCBWYWxpZGF0b3JzLnJlcXVpcmVkXSxcbiAqICAgICAgIHBhc3N3b3JkUmV0cnk6IGJ1aWxkZXIuZ3JvdXAoe1xuICogICAgICAgICBwYXNzd29yZDogW1wiXCIsIFZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICogICAgICAgICBwYXNzd29yZENvbmZpcm1hdGlvbjogW1wiXCIsIFZhbGlkYXRvcnMucmVxdWlyZWQsIGFzeW5jVmFsaWRhdG9yXVxuICogICAgICAgfSlcbiAqICAgICB9KTtcbiAqICAgfVxuICpcbiAqICAgZ2V0IHZhbHVlKCk6IHN0cmluZyB7XG4gKiAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMubG9naW5Gb3JtLnZhbHVlLCBudWxsLCAyKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBGb3JtQnVpbGRlciB7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcge0BsaW5rIENvbnRyb2xHcm91cH0gd2l0aCB0aGUgZ2l2ZW4gbWFwIG9mIGNvbmZpZ3VyYXRpb24uXG4gICAqIFZhbGlkIGtleXMgZm9yIHRoZSBgZXh0cmFgIHBhcmFtZXRlciBtYXAgYXJlIGBvcHRpb25hbHNgIGFuZCBgdmFsaWRhdG9yYC5cbiAgICpcbiAgICogU2VlIHRoZSB7QGxpbmsgQ29udHJvbEdyb3VwfSBjb25zdHJ1Y3RvciBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKi9cbiAgZ3JvdXAoY29udHJvbHNDb25maWc6IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgICAgICBleHRyYToge1trZXk6IHN0cmluZ106IGFueX0gPSBudWxsKTogbW9kZWxNb2R1bGUuQ29udHJvbEdyb3VwIHtcbiAgICB2YXIgY29udHJvbHMgPSB0aGlzLl9yZWR1Y2VDb250cm9scyhjb250cm9sc0NvbmZpZyk7XG4gICAgdmFyIG9wdGlvbmFscyA9IGlzUHJlc2VudChleHRyYSkgPyBTdHJpbmdNYXBXcmFwcGVyLmdldChleHRyYSwgXCJvcHRpb25hbHNcIikgOiBudWxsO1xuICAgIHZhciB2YWxpZGF0b3IgPSBpc1ByZXNlbnQoZXh0cmEpID8gU3RyaW5nTWFwV3JhcHBlci5nZXQoZXh0cmEsIFwidmFsaWRhdG9yXCIpIDogbnVsbDtcbiAgICB2YXIgYXN5bmNWYWxpZGF0b3IgPSBpc1ByZXNlbnQoZXh0cmEpID8gU3RyaW5nTWFwV3JhcHBlci5nZXQoZXh0cmEsIFwiYXN5bmNWYWxpZGF0b3JcIikgOiBudWxsO1xuICAgIHJldHVybiBuZXcgbW9kZWxNb2R1bGUuQ29udHJvbEdyb3VwKGNvbnRyb2xzLCBvcHRpb25hbHMsIHZhbGlkYXRvciwgYXN5bmNWYWxpZGF0b3IpO1xuICB9XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcge0BsaW5rIENvbnRyb2x9IHdpdGggdGhlIGdpdmVuIGB2YWx1ZWAsYHZhbGlkYXRvcmAsIGFuZCBgYXN5bmNWYWxpZGF0b3JgLlxuICAgKi9cbiAgY29udHJvbCh2YWx1ZTogT2JqZWN0LCB2YWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCxcbiAgICAgICAgICBhc3luY1ZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsKTogbW9kZWxNb2R1bGUuQ29udHJvbCB7XG4gICAgcmV0dXJuIG5ldyBtb2RlbE1vZHVsZS5Db250cm9sKHZhbHVlLCB2YWxpZGF0b3IsIGFzeW5jVmFsaWRhdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYW4gYXJyYXkgb2Yge0BsaW5rIENvbnRyb2x9cyBmcm9tIHRoZSBnaXZlbiBgY29udHJvbHNDb25maWdgIGFycmF5IG9mXG4gICAqIGNvbmZpZ3VyYXRpb24sIHdpdGggdGhlIGdpdmVuIG9wdGlvbmFsIGB2YWxpZGF0b3JgIGFuZCBgYXN5bmNWYWxpZGF0b3JgLlxuICAgKi9cbiAgYXJyYXkoY29udHJvbHNDb25maWc6IGFueVtdLCB2YWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCxcbiAgICAgICAgYXN5bmNWYWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCk6IG1vZGVsTW9kdWxlLkNvbnRyb2xBcnJheSB7XG4gICAgdmFyIGNvbnRyb2xzID0gY29udHJvbHNDb25maWcubWFwKGMgPT4gdGhpcy5fY3JlYXRlQ29udHJvbChjKSk7XG4gICAgcmV0dXJuIG5ldyBtb2RlbE1vZHVsZS5Db250cm9sQXJyYXkoY29udHJvbHMsIHZhbGlkYXRvciwgYXN5bmNWYWxpZGF0b3IpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVkdWNlQ29udHJvbHMoY29udHJvbHNDb25maWc6IGFueSk6IHtba2V5OiBzdHJpbmddOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2x9IHtcbiAgICB2YXIgY29udHJvbHM6IHtba2V5OiBzdHJpbmddOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2x9ID0ge307XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGNvbnRyb2xzQ29uZmlnLCAoY29udHJvbENvbmZpZywgY29udHJvbE5hbWUpID0+IHtcbiAgICAgIGNvbnRyb2xzW2NvbnRyb2xOYW1lXSA9IHRoaXMuX2NyZWF0ZUNvbnRyb2woY29udHJvbENvbmZpZyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbnRyb2xzO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY3JlYXRlQ29udHJvbChjb250cm9sQ29uZmlnOiBhbnkpOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2wge1xuICAgIGlmIChjb250cm9sQ29uZmlnIGluc3RhbmNlb2YgbW9kZWxNb2R1bGUuQ29udHJvbCB8fFxuICAgICAgICBjb250cm9sQ29uZmlnIGluc3RhbmNlb2YgbW9kZWxNb2R1bGUuQ29udHJvbEdyb3VwIHx8XG4gICAgICAgIGNvbnRyb2xDb25maWcgaW5zdGFuY2VvZiBtb2RlbE1vZHVsZS5Db250cm9sQXJyYXkpIHtcbiAgICAgIHJldHVybiBjb250cm9sQ29uZmlnO1xuXG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGNvbnRyb2xDb25maWcpKSB7XG4gICAgICB2YXIgdmFsdWUgPSBjb250cm9sQ29uZmlnWzBdO1xuICAgICAgdmFyIHZhbGlkYXRvciA9IGNvbnRyb2xDb25maWcubGVuZ3RoID4gMSA/IGNvbnRyb2xDb25maWdbMV0gOiBudWxsO1xuICAgICAgdmFyIGFzeW5jVmFsaWRhdG9yID0gY29udHJvbENvbmZpZy5sZW5ndGggPiAyID8gY29udHJvbENvbmZpZ1syXSA6IG51bGw7XG4gICAgICByZXR1cm4gdGhpcy5jb250cm9sKHZhbHVlLCB2YWxpZGF0b3IsIGFzeW5jVmFsaWRhdG9yKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250cm9sKGNvbnRyb2xDb25maWcpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFNob3J0aGFuZCBzZXQgb2YgcHJvdmlkZXJzIHVzZWQgZm9yIGJ1aWxkaW5nIEFuZ3VsYXIgZm9ybXMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBib290c3RyYXAoTXlBcHAsIFtGT1JNX1BST1ZJREVSU10pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBGT1JNX1BST1ZJREVSUzogVHlwZVtdID0gQ09OU1RfRVhQUihbRm9ybUJ1aWxkZXJdKTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgY29uc3QgRk9STV9CSU5ESU5HUyA9IEZPUk1fUFJPVklERVJTO1xuIl19