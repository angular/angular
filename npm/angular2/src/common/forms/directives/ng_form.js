'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var control_container_1 = require('./control_container');
var model_1 = require('../model');
var shared_1 = require('./shared');
var validators_1 = require('../validators');
exports.formDirectiveProvider = 
/*@ts2dart_const*/ /* @ts2dart_Provider */ {
    provide: control_container_1.ControlContainer,
    useExisting: core_1.forwardRef(function () { return NgForm; })
};
/**
 * If `NgForm` is bound in a component, `<form>` elements in that component will be
 * upgraded to use the Angular form system.
 *
 * ### Typical Use
 *
 * Include `FORM_DIRECTIVES` in the `directives` section of a {@link View} annotation
 * to use `NgForm` and its associated controls.
 *
 * ### Structure
 *
 * An Angular form is a collection of `Control`s in some hierarchy.
 * `Control`s can be at the top level or can be organized in `ControlGroup`s
 * or `ControlArray`s. This hierarchy is reflected in the form's `value`, a
 * JSON object that mirrors the form structure.
 *
 * ### Submission
 *
 * The `ngSubmit` event signals when the user triggers a form submission.
 *
 * ### Example ([live demo](http://plnkr.co/edit/ltdgYj4P0iY64AR71EpL?p=preview))
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <p>Submit the form to see the data object Angular builds</p>
 *       <h2>NgForm demo</h2>
 *       <form #f="ngForm" (ngSubmit)="onSubmit(f.value)">
 *         <h3>Control group: credentials</h3>
 *         <div ngControlGroup="credentials">
 *           <p>Login: <input type="text" ngControl="login"></p>
 *           <p>Password: <input type="password" ngControl="password"></p>
 *         </div>
 *         <h3>Control group: person</h3>
 *         <div ngControlGroup="person">
 *           <p>First name: <input type="text" ngControl="firstName"></p>
 *           <p>Last name: <input type="text" ngControl="lastName"></p>
 *         </div>
 *         <button type="submit">Submit Form</button>
 *       <p>Form data submitted:</p>
 *       </form>
 *       <pre>{{data}}</pre>
 *     </div>
 * `,
 *   directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
 * })
 * export class App {
 *   constructor() {}
 *
 *   data: string;
 *
 *   onSubmit(data) {
 *     this.data = JSON.stringify(data, null, 2);
 *   }
 * }
 *  ```
 */
var NgForm = (function (_super) {
    __extends(NgForm, _super);
    function NgForm(validators, asyncValidators) {
        _super.call(this);
        this.ngSubmit = new async_1.EventEmitter();
        this.form = new model_1.ControlGroup({}, null, shared_1.composeValidators(validators), shared_1.composeAsyncValidators(asyncValidators));
    }
    Object.defineProperty(NgForm.prototype, "formDirective", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForm.prototype, "control", {
        get: function () { return this.form; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForm.prototype, "path", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForm.prototype, "controls", {
        get: function () { return this.form.controls; },
        enumerable: true,
        configurable: true
    });
    NgForm.prototype.addControl = function (dir) {
        var _this = this;
        async_1.PromiseWrapper.scheduleMicrotask(function () {
            var container = _this._findContainer(dir.path);
            var ctrl = new model_1.Control();
            shared_1.setUpControl(ctrl, dir);
            container.addControl(dir.name, ctrl);
            ctrl.updateValueAndValidity({ emitEvent: false });
        });
    };
    NgForm.prototype.getControl = function (dir) { return this.form.find(dir.path); };
    NgForm.prototype.removeControl = function (dir) {
        var _this = this;
        async_1.PromiseWrapper.scheduleMicrotask(function () {
            var container = _this._findContainer(dir.path);
            if (lang_1.isPresent(container)) {
                container.removeControl(dir.name);
                container.updateValueAndValidity({ emitEvent: false });
            }
        });
    };
    NgForm.prototype.addControlGroup = function (dir) {
        var _this = this;
        async_1.PromiseWrapper.scheduleMicrotask(function () {
            var container = _this._findContainer(dir.path);
            var group = new model_1.ControlGroup({});
            shared_1.setUpControlGroup(group, dir);
            container.addControl(dir.name, group);
            group.updateValueAndValidity({ emitEvent: false });
        });
    };
    NgForm.prototype.removeControlGroup = function (dir) {
        var _this = this;
        async_1.PromiseWrapper.scheduleMicrotask(function () {
            var container = _this._findContainer(dir.path);
            if (lang_1.isPresent(container)) {
                container.removeControl(dir.name);
                container.updateValueAndValidity({ emitEvent: false });
            }
        });
    };
    NgForm.prototype.getControlGroup = function (dir) {
        return this.form.find(dir.path);
    };
    NgForm.prototype.updateModel = function (dir, value) {
        var _this = this;
        async_1.PromiseWrapper.scheduleMicrotask(function () {
            var ctrl = _this.form.find(dir.path);
            ctrl.updateValue(value);
        });
    };
    NgForm.prototype.onSubmit = function () {
        async_1.ObservableWrapper.callEmit(this.ngSubmit, null);
        return false;
    };
    /** @internal */
    NgForm.prototype._findContainer = function (path) {
        path.pop();
        return collection_1.ListWrapper.isEmpty(path) ? this.form : this.form.find(path);
    };
    NgForm = __decorate([
        core_1.Directive({
            selector: 'form:not([ngNoForm]):not([ngFormModel]),ngForm,[ngForm]',
            bindings: [exports.formDirectiveProvider],
            host: {
                '(submit)': 'onSubmit()',
            },
            outputs: ['ngSubmit'],
            exportAs: 'ngForm'
        }),
        __param(0, core_1.Optional()),
        __param(0, core_1.Self()),
        __param(0, core_1.Inject(validators_1.NG_VALIDATORS)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Self()),
        __param(1, core_1.Inject(validators_1.NG_ASYNC_VALIDATORS)), 
        __metadata('design:paramtypes', [Array, Array])
    ], NgForm);
    return NgForm;
}(control_container_1.ControlContainer));
exports.NgForm = NgForm;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNCQUtPLDJCQUEyQixDQUFDLENBQUE7QUFDbkMsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0UscUJBQWlDLDBCQUEwQixDQUFDLENBQUE7QUFDNUQscUJBQXNFLGVBQWUsQ0FBQyxDQUFBO0FBSXRGLGtDQUErQixxQkFBcUIsQ0FBQyxDQUFBO0FBQ3JELHNCQUFxRCxVQUFVLENBQUMsQ0FBQTtBQUNoRSx1QkFBeUYsVUFBVSxDQUFDLENBQUE7QUFDcEcsMkJBQTZELGVBQWUsQ0FBQyxDQUFBO0FBRWhFLDZCQUFxQjtBQUM5QixrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FBQztJQUN6QyxPQUFPLEVBQUUsb0NBQWdCO0lBQ3pCLFdBQVcsRUFBRSxpQkFBVSxDQUFDLGNBQU0sT0FBQSxNQUFNLEVBQU4sQ0FBTSxDQUFDO0NBQ3RDLENBQUM7QUFFTjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBERztBQVVIO0lBQTRCLDBCQUFnQjtJQUkxQyxnQkFBdUQsVUFBaUIsRUFDWCxlQUFzQjtRQUNqRixpQkFBTyxDQUFDO1FBSlYsYUFBUSxHQUFHLElBQUksb0JBQVksRUFBRSxDQUFDO1FBSzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxvQkFBWSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsMEJBQWlCLENBQUMsVUFBVSxDQUFDLEVBQ3ZDLCtCQUFzQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVELHNCQUFJLGlDQUFhO2FBQWpCLGNBQTRCLE1BQU0s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Q0FBQzttQkFDekMsZUFBUSxFQUFFO21CQUFFLFdBQUksRUFBRTttQkFBRSxhQUFNLENBQUMsZ0NBQW1CLENBQUM7O2NBTjVEO0lBbUZGLGFBQUM7QUFBRCxDQUFDLEFBbEZELENBQTRCLG9DQUFnQixHQWtGM0M7QUFsRlksY0FBTSxTQWtGbEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFByb21pc2VXcmFwcGVyLFxuICBPYnNlcnZhYmxlV3JhcHBlcixcbiAgRXZlbnRFbWl0dGVyLFxuICBQcm9taXNlQ29tcGxldGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtEaXJlY3RpdmUsIGZvcndhcmRSZWYsIFByb3ZpZGVyLCBPcHRpb25hbCwgSW5qZWN0LCBTZWxmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtGb3JtfSBmcm9tICcuL2Zvcm1faW50ZXJmYWNlJztcbmltcG9ydCB7TmdDb250cm9sR3JvdXB9IGZyb20gJy4vbmdfY29udHJvbF9ncm91cCc7XG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtBYnN0cmFjdENvbnRyb2wsIENvbnRyb2xHcm91cCwgQ29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtzZXRVcENvbnRyb2wsIHNldFVwQ29udHJvbEdyb3VwLCBjb21wb3NlVmFsaWRhdG9ycywgY29tcG9zZUFzeW5jVmFsaWRhdG9yc30gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuZXhwb3J0IGNvbnN0IGZvcm1EaXJlY3RpdmVQcm92aWRlcjogYW55ID1cbiAgICAvKkB0czJkYXJ0X2NvbnN0Ki8gLyogQHRzMmRhcnRfUHJvdmlkZXIgKi8ge1xuICAgICAgcHJvdmlkZTogQ29udHJvbENvbnRhaW5lcixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nRm9ybSlcbiAgICB9O1xuXG4vKipcbiAqIElmIGBOZ0Zvcm1gIGlzIGJvdW5kIGluIGEgY29tcG9uZW50LCBgPGZvcm0+YCBlbGVtZW50cyBpbiB0aGF0IGNvbXBvbmVudCB3aWxsIGJlXG4gKiB1cGdyYWRlZCB0byB1c2UgdGhlIEFuZ3VsYXIgZm9ybSBzeXN0ZW0uXG4gKlxuICogIyMjIFR5cGljYWwgVXNlXG4gKlxuICogSW5jbHVkZSBgRk9STV9ESVJFQ1RJVkVTYCBpbiB0aGUgYGRpcmVjdGl2ZXNgIHNlY3Rpb24gb2YgYSB7QGxpbmsgVmlld30gYW5ub3RhdGlvblxuICogdG8gdXNlIGBOZ0Zvcm1gIGFuZCBpdHMgYXNzb2NpYXRlZCBjb250cm9scy5cbiAqXG4gKiAjIyMgU3RydWN0dXJlXG4gKlxuICogQW4gQW5ndWxhciBmb3JtIGlzIGEgY29sbGVjdGlvbiBvZiBgQ29udHJvbGBzIGluIHNvbWUgaGllcmFyY2h5LlxuICogYENvbnRyb2xgcyBjYW4gYmUgYXQgdGhlIHRvcCBsZXZlbCBvciBjYW4gYmUgb3JnYW5pemVkIGluIGBDb250cm9sR3JvdXBgc1xuICogb3IgYENvbnRyb2xBcnJheWBzLiBUaGlzIGhpZXJhcmNoeSBpcyByZWZsZWN0ZWQgaW4gdGhlIGZvcm0ncyBgdmFsdWVgLCBhXG4gKiBKU09OIG9iamVjdCB0aGF0IG1pcnJvcnMgdGhlIGZvcm0gc3RydWN0dXJlLlxuICpcbiAqICMjIyBTdWJtaXNzaW9uXG4gKlxuICogVGhlIGBuZ1N1Ym1pdGAgZXZlbnQgc2lnbmFscyB3aGVuIHRoZSB1c2VyIHRyaWdnZXJzIGEgZm9ybSBzdWJtaXNzaW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9sdGRnWWo0UDBpWTY0QVI3MUVwTD9wPXByZXZpZXcpKVxuICpcbiAqICBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8cD5TdWJtaXQgdGhlIGZvcm0gdG8gc2VlIHRoZSBkYXRhIG9iamVjdCBBbmd1bGFyIGJ1aWxkczwvcD5cbiAqICAgICAgIDxoMj5OZ0Zvcm0gZGVtbzwvaDI+XG4gKiAgICAgICA8Zm9ybSAjZj1cIm5nRm9ybVwiIChuZ1N1Ym1pdCk9XCJvblN1Ym1pdChmLnZhbHVlKVwiPlxuICogICAgICAgICA8aDM+Q29udHJvbCBncm91cDogY3JlZGVudGlhbHM8L2gzPlxuICogICAgICAgICA8ZGl2IG5nQ29udHJvbEdyb3VwPVwiY3JlZGVudGlhbHNcIj5cbiAqICAgICAgICAgICA8cD5Mb2dpbjogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmdDb250cm9sPVwibG9naW5cIj48L3A+XG4gKiAgICAgICAgICAgPHA+UGFzc3dvcmQ6IDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuZ0NvbnRyb2w9XCJwYXNzd29yZFwiPjwvcD5cbiAqICAgICAgICAgPC9kaXY+XG4gKiAgICAgICAgIDxoMz5Db250cm9sIGdyb3VwOiBwZXJzb248L2gzPlxuICogICAgICAgICA8ZGl2IG5nQ29udHJvbEdyb3VwPVwicGVyc29uXCI+XG4gKiAgICAgICAgICAgPHA+Rmlyc3QgbmFtZTogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmdDb250cm9sPVwiZmlyc3ROYW1lXCI+PC9wPlxuICogICAgICAgICAgIDxwPkxhc3QgbmFtZTogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmdDb250cm9sPVwibGFzdE5hbWVcIj48L3A+XG4gKiAgICAgICAgIDwvZGl2PlxuICogICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIj5TdWJtaXQgRm9ybTwvYnV0dG9uPlxuICogICAgICAgPHA+Rm9ybSBkYXRhIHN1Ym1pdHRlZDo8L3A+XG4gKiAgICAgICA8L2Zvcm0+XG4gKiAgICAgICA8cHJlPnt7ZGF0YX19PC9wcmU+XG4gKiAgICAgPC9kaXY+XG4gKiBgLFxuICogICBkaXJlY3RpdmVzOiBbQ09SRV9ESVJFQ1RJVkVTLCBGT1JNX0RJUkVDVElWRVNdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge31cbiAqXG4gKiAgIGRhdGE6IHN0cmluZztcbiAqXG4gKiAgIG9uU3VibWl0KGRhdGEpIHtcbiAqICAgICB0aGlzLmRhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKTtcbiAqICAgfVxuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdmb3JtOm5vdChbbmdOb0Zvcm1dKTpub3QoW25nRm9ybU1vZGVsXSksbmdGb3JtLFtuZ0Zvcm1dJyxcbiAgYmluZGluZ3M6IFtmb3JtRGlyZWN0aXZlUHJvdmlkZXJdLFxuICBob3N0OiB7XG4gICAgJyhzdWJtaXQpJzogJ29uU3VibWl0KCknLFxuICB9LFxuICBvdXRwdXRzOiBbJ25nU3VibWl0J10sXG4gIGV4cG9ydEFzOiAnbmdGb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ0Zvcm0gZXh0ZW5kcyBDb250cm9sQ29udGFpbmVyIGltcGxlbWVudHMgRm9ybSB7XG4gIGZvcm06IENvbnRyb2xHcm91cDtcbiAgbmdTdWJtaXQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgYXN5bmNWYWxpZGF0b3JzOiBhbnlbXSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5mb3JtID0gbmV3IENvbnRyb2xHcm91cCh7fSwgbnVsbCwgY29tcG9zZVZhbGlkYXRvcnModmFsaWRhdG9ycyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKGFzeW5jVmFsaWRhdG9ycykpO1xuICB9XG5cbiAgZ2V0IGZvcm1EaXJlY3RpdmUoKTogRm9ybSB7IHJldHVybiB0aGlzOyB9XG5cbiAgZ2V0IGNvbnRyb2woKTogQ29udHJvbEdyb3VwIHsgcmV0dXJuIHRoaXMuZm9ybTsgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIFtdOyB9XG5cbiAgZ2V0IGNvbnRyb2xzKCk6IHtba2V5OiBzdHJpbmddOiBBYnN0cmFjdENvbnRyb2x9IHsgcmV0dXJuIHRoaXMuZm9ybS5jb250cm9sczsgfVxuXG4gIGFkZENvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci5zY2hlZHVsZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5fZmluZENvbnRhaW5lcihkaXIucGF0aCk7XG4gICAgICB2YXIgY3RybCA9IG5ldyBDb250cm9sKCk7XG4gICAgICBzZXRVcENvbnRyb2woY3RybCwgZGlyKTtcbiAgICAgIGNvbnRhaW5lci5hZGRDb250cm9sKGRpci5uYW1lLCBjdHJsKTtcbiAgICAgIGN0cmwudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q29udHJvbChkaXI6IE5nQ29udHJvbCk6IENvbnRyb2wgeyByZXR1cm4gPENvbnRyb2w+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpOyB9XG5cbiAgcmVtb3ZlQ29udHJvbChkaXI6IE5nQ29udHJvbCk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnNjaGVkdWxlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9maW5kQ29udGFpbmVyKGRpci5wYXRoKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY29udGFpbmVyKSkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ29udHJvbChkaXIubmFtZSk7XG4gICAgICAgIGNvbnRhaW5lci51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBhZGRDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnNjaGVkdWxlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9maW5kQ29udGFpbmVyKGRpci5wYXRoKTtcbiAgICAgIHZhciBncm91cCA9IG5ldyBDb250cm9sR3JvdXAoe30pO1xuICAgICAgc2V0VXBDb250cm9sR3JvdXAoZ3JvdXAsIGRpcik7XG4gICAgICBjb250YWluZXIuYWRkQ29udHJvbChkaXIubmFtZSwgZ3JvdXApO1xuICAgICAgZ3JvdXAudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlQ29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci5zY2hlZHVsZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5fZmluZENvbnRhaW5lcihkaXIucGF0aCk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNvbnRhaW5lcikpIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNvbnRyb2woZGlyLm5hbWUpO1xuICAgICAgICBjb250YWluZXIudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApOiBDb250cm9sR3JvdXAge1xuICAgIHJldHVybiA8Q29udHJvbEdyb3VwPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgfVxuXG4gIHVwZGF0ZU1vZGVsKGRpcjogTmdDb250cm9sLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIuc2NoZWR1bGVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdmFyIGN0cmwgPSA8Q29udHJvbD50aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gICAgICBjdHJsLnVwZGF0ZVZhbHVlKHZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uU3VibWl0KCk6IGJvb2xlYW4ge1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMubmdTdWJtaXQsIG51bGwpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpbmRDb250YWluZXIocGF0aDogc3RyaW5nW10pOiBDb250cm9sR3JvdXAge1xuICAgIHBhdGgucG9wKCk7XG4gICAgcmV0dXJuIExpc3RXcmFwcGVyLmlzRW1wdHkocGF0aCkgPyB0aGlzLmZvcm0gOiA8Q29udHJvbEdyb3VwPnRoaXMuZm9ybS5maW5kKHBhdGgpO1xuICB9XG59XG4iXX0=