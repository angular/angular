var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9mb3JtX2J1aWxkZXIudHMiXSwibmFtZXMiOlsiRm9ybUJ1aWxkZXIiLCJGb3JtQnVpbGRlci5ncm91cCIsIkZvcm1CdWlsZGVyLmNvbnRyb2wiLCJGb3JtQnVpbGRlci5hcnJheSIsIkZvcm1CdWlsZGVyLl9yZWR1Y2VDb250cm9scyIsIkZvcm1CdWlsZGVyLl9jcmVhdGVDb250cm9sIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZTtPQUNqQyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3hELEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQU8sTUFBTSwwQkFBMEI7T0FDdEUsS0FBSyxXQUFXLE1BQU0sU0FBUztBQUd0Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUNIO0lBRUVBOzs7OztPQUtHQTtJQUNIQSxLQUFLQSxDQUFDQSxjQUFvQ0EsRUFDcENBLEtBQUtBLEdBQXlCQSxJQUFJQTtRQUN0Q0MsSUFBSUEsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFDcERBLElBQUlBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbkZBLElBQUlBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbkZBLElBQUlBLGNBQWNBLEdBQUdBLFNBQVNBLENBQUNBLEtBQUtB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WjtBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsYUFBYSxjQUFjLEdBQVcsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUVoRTs7R0FFRztBQUNILGFBQWEsYUFBYSxHQUFHLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNBcnJheSwgQ09OU1RfRVhQUiwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCAqIGFzIG1vZGVsTW9kdWxlIGZyb20gJy4vbW9kZWwnO1xuXG5cbi8qKlxuICogQ3JlYXRlcyBhIGZvcm0gb2JqZWN0IGZyb20gYSB1c2VyLXNwZWNpZmllZCBjb25maWd1cmF0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9FTmdabzhFdUlFQ1pOZW5zWkNWcj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgIHZpZXdCaW5kaW5nczogW0ZPUk1fQklORElOR1NdXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGZvcm0gW25nLWZvcm0tbW9kZWxdPVwibG9naW5Gb3JtXCI+XG4gKiAgICAgICA8cD5Mb2dpbiA8aW5wdXQgbmctY29udHJvbD1cImxvZ2luXCI+PC9wPlxuICogICAgICAgPGRpdiBuZy1jb250cm9sLWdyb3VwPVwicGFzc3dvcmRSZXRyeVwiPlxuICogICAgICAgICA8cD5QYXNzd29yZCA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmctY29udHJvbD1cInBhc3N3b3JkXCI+PC9wPlxuICogICAgICAgICA8cD5Db25maXJtIHBhc3N3b3JkIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuZy1jb250cm9sPVwicGFzc3dvcmRDb25maXJtYXRpb25cIj48L3A+XG4gKiAgICAgICA8L2Rpdj5cbiAqICAgICA8L2Zvcm0+XG4gKiAgICAgPGgzPkZvcm0gdmFsdWU6PC9oMz5cbiAqICAgICA8cHJlPnt7dmFsdWV9fTwvcHJlPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICBsb2dpbkZvcm06IENvbnRyb2xHcm91cDtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKGJ1aWxkZXI6IEZvcm1CdWlsZGVyKSB7XG4gKiAgICAgdGhpcy5sb2dpbkZvcm0gPSBidWlsZGVyLmdyb3VwKHtcbiAqICAgICAgIGxvZ2luOiBbXCJcIiwgVmFsaWRhdG9ycy5yZXF1aXJlZF0sXG4gKiAgICAgICBwYXNzd29yZFJldHJ5OiBidWlsZGVyLmdyb3VwKHtcbiAqICAgICAgICAgcGFzc3dvcmQ6IFtcIlwiLCBWYWxpZGF0b3JzLnJlcXVpcmVkXSxcbiAqICAgICAgICAgcGFzc3dvcmRDb25maXJtYXRpb246IFtcIlwiLCBWYWxpZGF0b3JzLnJlcXVpcmVkLCBhc3luY1ZhbGlkYXRvcl1cbiAqICAgICAgIH0pXG4gKiAgICAgfSk7XG4gKiAgIH1cbiAqXG4gKiAgIGdldCB2YWx1ZSgpOiBzdHJpbmcge1xuICogICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmxvZ2luRm9ybS52YWx1ZSwgbnVsbCwgMik7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRm9ybUJ1aWxkZXIge1xuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHtAbGluayBDb250cm9sR3JvdXB9IHdpdGggdGhlIGdpdmVuIG1hcCBvZiBjb25maWd1cmF0aW9uLlxuICAgKiBWYWxpZCBrZXlzIGZvciB0aGUgYGV4dHJhYCBwYXJhbWV0ZXIgbWFwIGFyZSBgb3B0aW9uYWxzYCBhbmQgYHZhbGlkYXRvcmAuXG4gICAqXG4gICAqIFNlZSB0aGUge0BsaW5rIENvbnRyb2xHcm91cH0gY29uc3RydWN0b3IgZm9yIG1vcmUgZGV0YWlscy5cbiAgICovXG4gIGdyb3VwKGNvbnRyb2xzQ29uZmlnOiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICAgICAgZXh0cmE6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gbnVsbCk6IG1vZGVsTW9kdWxlLkNvbnRyb2xHcm91cCB7XG4gICAgdmFyIGNvbnRyb2xzID0gdGhpcy5fcmVkdWNlQ29udHJvbHMoY29udHJvbHNDb25maWcpO1xuICAgIHZhciBvcHRpb25hbHMgPSBpc1ByZXNlbnQoZXh0cmEpID8gU3RyaW5nTWFwV3JhcHBlci5nZXQoZXh0cmEsIFwib3B0aW9uYWxzXCIpIDogbnVsbDtcbiAgICB2YXIgdmFsaWRhdG9yID0gaXNQcmVzZW50KGV4dHJhKSA/IFN0cmluZ01hcFdyYXBwZXIuZ2V0KGV4dHJhLCBcInZhbGlkYXRvclwiKSA6IG51bGw7XG4gICAgdmFyIGFzeW5jVmFsaWRhdG9yID0gaXNQcmVzZW50KGV4dHJhKSA/IFN0cmluZ01hcFdyYXBwZXIuZ2V0KGV4dHJhLCBcImFzeW5jVmFsaWRhdG9yXCIpIDogbnVsbDtcbiAgICByZXR1cm4gbmV3IG1vZGVsTW9kdWxlLkNvbnRyb2xHcm91cChjb250cm9scywgb3B0aW9uYWxzLCB2YWxpZGF0b3IsIGFzeW5jVmFsaWRhdG9yKTtcbiAgfVxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHtAbGluayBDb250cm9sfSB3aXRoIHRoZSBnaXZlbiBgdmFsdWVgLGB2YWxpZGF0b3JgLCBhbmQgYGFzeW5jVmFsaWRhdG9yYC5cbiAgICovXG4gIGNvbnRyb2wodmFsdWU6IE9iamVjdCwgdmFsaWRhdG9yOiBGdW5jdGlvbiA9IG51bGwsXG4gICAgICAgICAgYXN5bmNWYWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCk6IG1vZGVsTW9kdWxlLkNvbnRyb2wge1xuICAgIHJldHVybiBuZXcgbW9kZWxNb2R1bGUuQ29udHJvbCh2YWx1ZSwgdmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0IGFuIGFycmF5IG9mIHtAbGluayBDb250cm9sfXMgZnJvbSB0aGUgZ2l2ZW4gYGNvbnRyb2xzQ29uZmlnYCBhcnJheSBvZlxuICAgKiBjb25maWd1cmF0aW9uLCB3aXRoIHRoZSBnaXZlbiBvcHRpb25hbCBgdmFsaWRhdG9yYCBhbmQgYGFzeW5jVmFsaWRhdG9yYC5cbiAgICovXG4gIGFycmF5KGNvbnRyb2xzQ29uZmlnOiBhbnlbXSwgdmFsaWRhdG9yOiBGdW5jdGlvbiA9IG51bGwsXG4gICAgICAgIGFzeW5jVmFsaWRhdG9yOiBGdW5jdGlvbiA9IG51bGwpOiBtb2RlbE1vZHVsZS5Db250cm9sQXJyYXkge1xuICAgIHZhciBjb250cm9scyA9IGNvbnRyb2xzQ29uZmlnLm1hcChjID0+IHRoaXMuX2NyZWF0ZUNvbnRyb2woYykpO1xuICAgIHJldHVybiBuZXcgbW9kZWxNb2R1bGUuQ29udHJvbEFycmF5KGNvbnRyb2xzLCB2YWxpZGF0b3IsIGFzeW5jVmFsaWRhdG9yKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlZHVjZUNvbnRyb2xzKGNvbnRyb2xzQ29uZmlnOiBhbnkpOiB7W2tleTogc3RyaW5nXTogbW9kZWxNb2R1bGUuQWJzdHJhY3RDb250cm9sfSB7XG4gICAgdmFyIGNvbnRyb2xzOiB7W2tleTogc3RyaW5nXTogbW9kZWxNb2R1bGUuQWJzdHJhY3RDb250cm9sfSA9IHt9O1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChjb250cm9sc0NvbmZpZywgKGNvbnRyb2xDb25maWcsIGNvbnRyb2xOYW1lKSA9PiB7XG4gICAgICBjb250cm9sc1tjb250cm9sTmFtZV0gPSB0aGlzLl9jcmVhdGVDb250cm9sKGNvbnRyb2xDb25maWcpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb250cm9scztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NyZWF0ZUNvbnRyb2woY29udHJvbENvbmZpZzogYW55KTogbW9kZWxNb2R1bGUuQWJzdHJhY3RDb250cm9sIHtcbiAgICBpZiAoY29udHJvbENvbmZpZyBpbnN0YW5jZW9mIG1vZGVsTW9kdWxlLkNvbnRyb2wgfHxcbiAgICAgICAgY29udHJvbENvbmZpZyBpbnN0YW5jZW9mIG1vZGVsTW9kdWxlLkNvbnRyb2xHcm91cCB8fFxuICAgICAgICBjb250cm9sQ29uZmlnIGluc3RhbmNlb2YgbW9kZWxNb2R1bGUuQ29udHJvbEFycmF5KSB7XG4gICAgICByZXR1cm4gY29udHJvbENvbmZpZztcblxuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250cm9sQ29uZmlnKSkge1xuICAgICAgdmFyIHZhbHVlID0gY29udHJvbENvbmZpZ1swXTtcbiAgICAgIHZhciB2YWxpZGF0b3IgPSBjb250cm9sQ29uZmlnLmxlbmd0aCA+IDEgPyBjb250cm9sQ29uZmlnWzFdIDogbnVsbDtcbiAgICAgIHZhciBhc3luY1ZhbGlkYXRvciA9IGNvbnRyb2xDb25maWcubGVuZ3RoID4gMiA/IGNvbnRyb2xDb25maWdbMl0gOiBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMuY29udHJvbCh2YWx1ZSwgdmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY29udHJvbChjb250cm9sQ29uZmlnKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydGhhbmQgc2V0IG9mIHByb3ZpZGVycyB1c2VkIGZvciBidWlsZGluZyBBbmd1bGFyIGZvcm1zLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogYm9vdHN0cmFwKE15QXBwLCBbRk9STV9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgRk9STV9QUk9WSURFUlM6IFR5cGVbXSA9IENPTlNUX0VYUFIoW0Zvcm1CdWlsZGVyXSk7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IEZPUk1fQklORElOR1MgPSBGT1JNX1BST1ZJREVSUztcbiJdfQ==