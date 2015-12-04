'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var formDirectiveProvider = lang_1.CONST_EXPR(new core_1.Provider(control_container_1.ControlContainer, { useExisting: core_1.forwardRef(function () { return NgForm; }) }));
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
 * The `ng-submit` event signals when the user triggers a form submission.
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
 *       <form #f="form" (ng-submit)="onSubmit(f.value)">
 *         <h3>Control group: credentials</h3>
 *         <div ng-control-group="credentials">
 *           <p>Login: <input type="text" ng-control="login"></p>
 *           <p>Password: <input type="password" ng-control="password"></p>
 *         </div>
 *         <h3>Control group: person</h3>
 *         <div ng-control-group="person">
 *           <p>First name: <input type="text" ng-control="firstName"></p>
 *           <p>Last name: <input type="text" ng-control="lastName"></p>
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
            selector: 'form:not([ng-no-form]):not([ng-form-model]),ng-form,[ng-form]',
            bindings: [formDirectiveProvider],
            host: {
                '(submit)': 'onSubmit()',
            },
            outputs: ['ngSubmit'],
            exportAs: 'form'
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
})(control_container_1.ControlContainer);
exports.NgForm = NgForm;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtLnRzIl0sIm5hbWVzIjpbIk5nRm9ybSIsIk5nRm9ybS5jb25zdHJ1Y3RvciIsIk5nRm9ybS5mb3JtRGlyZWN0aXZlIiwiTmdGb3JtLmNvbnRyb2wiLCJOZ0Zvcm0ucGF0aCIsIk5nRm9ybS5jb250cm9scyIsIk5nRm9ybS5hZGRDb250cm9sIiwiTmdGb3JtLmdldENvbnRyb2wiLCJOZ0Zvcm0ucmVtb3ZlQ29udHJvbCIsIk5nRm9ybS5hZGRDb250cm9sR3JvdXAiLCJOZ0Zvcm0ucmVtb3ZlQ29udHJvbEdyb3VwIiwiTmdGb3JtLmdldENvbnRyb2xHcm91cCIsIk5nRm9ybS51cGRhdGVNb2RlbCIsIk5nRm9ybS5vblN1Ym1pdCIsIk5nRm9ybS5fZmluZENvbnRhaW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNCQUtPLDJCQUEyQixDQUFDLENBQUE7QUFDbkMsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0UscUJBQTZDLDBCQUEwQixDQUFDLENBQUE7QUFDeEUscUJBQXNFLGVBQWUsQ0FBQyxDQUFBO0FBSXRGLGtDQUErQixxQkFBcUIsQ0FBQyxDQUFBO0FBQ3JELHNCQUFxRCxVQUFVLENBQUMsQ0FBQTtBQUNoRSx1QkFBeUYsVUFBVSxDQUFDLENBQUE7QUFDcEcsMkJBQTZELGVBQWUsQ0FBQyxDQUFBO0FBRTdFLElBQU0scUJBQXFCLEdBQ3ZCLGlCQUFVLENBQUMsSUFBSSxlQUFRLENBQUMsb0NBQWdCLEVBQUUsRUFBQyxXQUFXLEVBQUUsaUJBQVUsQ0FBQyxjQUFNLE9BQUEsTUFBTSxFQUFOLENBQU0sQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBRXhGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMERHO0FBQ0g7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V0FBQ0EsV0FBSUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsYUFBTUEsQ0FBQ0EsZ0NBQW1CQSxDQUFDQSxDQUFBQTs7ZUE2RTdEQTtJQUFEQSxhQUFDQTtBQUFEQSxDQUFDQSxBQTNGRCxFQVM0QixvQ0FBZ0IsRUFrRjNDO0FBbEZZLGNBQU0sU0FrRmxCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBQcm9taXNlV3JhcHBlcixcbiAgT2JzZXJ2YWJsZVdyYXBwZXIsXG4gIEV2ZW50RW1pdHRlcixcbiAgUHJvbWlzZUNvbXBsZXRlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7RGlyZWN0aXZlLCBmb3J3YXJkUmVmLCBQcm92aWRlciwgT3B0aW9uYWwsIEluamVjdCwgU2VsZn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi9uZ19jb250cm9sJztcbmltcG9ydCB7Rm9ybX0gZnJvbSAnLi9mb3JtX2ludGVyZmFjZSc7XG5pbXBvcnQge05nQ29udHJvbEdyb3VwfSBmcm9tICcuL25nX2NvbnRyb2xfZ3JvdXAnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7QWJzdHJhY3RDb250cm9sLCBDb250cm9sR3JvdXAsIENvbnRyb2x9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7c2V0VXBDb250cm9sLCBzZXRVcENvbnRyb2xHcm91cCwgY29tcG9zZVZhbGlkYXRvcnMsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnN9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VmFsaWRhdG9ycywgTkdfVkFMSURBVE9SUywgTkdfQVNZTkNfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cbmNvbnN0IGZvcm1EaXJlY3RpdmVQcm92aWRlciA9XG4gICAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoQ29udHJvbENvbnRhaW5lciwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nRm9ybSl9KSk7XG5cbi8qKlxuICogSWYgYE5nRm9ybWAgaXMgYm91bmQgaW4gYSBjb21wb25lbnQsIGA8Zm9ybT5gIGVsZW1lbnRzIGluIHRoYXQgY29tcG9uZW50IHdpbGwgYmVcbiAqIHVwZ3JhZGVkIHRvIHVzZSB0aGUgQW5ndWxhciBmb3JtIHN5c3RlbS5cbiAqXG4gKiAjIyMgVHlwaWNhbCBVc2VcbiAqXG4gKiBJbmNsdWRlIGBGT1JNX0RJUkVDVElWRVNgIGluIHRoZSBgZGlyZWN0aXZlc2Agc2VjdGlvbiBvZiBhIHtAbGluayBWaWV3fSBhbm5vdGF0aW9uXG4gKiB0byB1c2UgYE5nRm9ybWAgYW5kIGl0cyBhc3NvY2lhdGVkIGNvbnRyb2xzLlxuICpcbiAqICMjIyBTdHJ1Y3R1cmVcbiAqXG4gKiBBbiBBbmd1bGFyIGZvcm0gaXMgYSBjb2xsZWN0aW9uIG9mIGBDb250cm9sYHMgaW4gc29tZSBoaWVyYXJjaHkuXG4gKiBgQ29udHJvbGBzIGNhbiBiZSBhdCB0aGUgdG9wIGxldmVsIG9yIGNhbiBiZSBvcmdhbml6ZWQgaW4gYENvbnRyb2xHcm91cGBzXG4gKiBvciBgQ29udHJvbEFycmF5YHMuIFRoaXMgaGllcmFyY2h5IGlzIHJlZmxlY3RlZCBpbiB0aGUgZm9ybSdzIGB2YWx1ZWAsIGFcbiAqIEpTT04gb2JqZWN0IHRoYXQgbWlycm9ycyB0aGUgZm9ybSBzdHJ1Y3R1cmUuXG4gKlxuICogIyMjIFN1Ym1pc3Npb25cbiAqXG4gKiBUaGUgYG5nLXN1Ym1pdGAgZXZlbnQgc2lnbmFscyB3aGVuIHRoZSB1c2VyIHRyaWdnZXJzIGEgZm9ybSBzdWJtaXNzaW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9sdGRnWWo0UDBpWTY0QVI3MUVwTD9wPXByZXZpZXcpKVxuICpcbiAqICBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8cD5TdWJtaXQgdGhlIGZvcm0gdG8gc2VlIHRoZSBkYXRhIG9iamVjdCBBbmd1bGFyIGJ1aWxkczwvcD5cbiAqICAgICAgIDxoMj5OZ0Zvcm0gZGVtbzwvaDI+XG4gKiAgICAgICA8Zm9ybSAjZj1cImZvcm1cIiAobmctc3VibWl0KT1cIm9uU3VibWl0KGYudmFsdWUpXCI+XG4gKiAgICAgICAgIDxoMz5Db250cm9sIGdyb3VwOiBjcmVkZW50aWFsczwvaDM+XG4gKiAgICAgICAgIDxkaXYgbmctY29udHJvbC1ncm91cD1cImNyZWRlbnRpYWxzXCI+XG4gKiAgICAgICAgICAgPHA+TG9naW46IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLWNvbnRyb2w9XCJsb2dpblwiPjwvcD5cbiAqICAgICAgICAgICA8cD5QYXNzd29yZDogPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5nLWNvbnRyb2w9XCJwYXNzd29yZFwiPjwvcD5cbiAqICAgICAgICAgPC9kaXY+XG4gKiAgICAgICAgIDxoMz5Db250cm9sIGdyb3VwOiBwZXJzb248L2gzPlxuICogICAgICAgICA8ZGl2IG5nLWNvbnRyb2wtZ3JvdXA9XCJwZXJzb25cIj5cbiAqICAgICAgICAgICA8cD5GaXJzdCBuYW1lOiA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1jb250cm9sPVwiZmlyc3ROYW1lXCI+PC9wPlxuICogICAgICAgICAgIDxwPkxhc3QgbmFtZTogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctY29udHJvbD1cImxhc3ROYW1lXCI+PC9wPlxuICogICAgICAgICA8L2Rpdj5cbiAqICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCI+U3VibWl0IEZvcm08L2J1dHRvbj5cbiAqICAgICAgIDxwPkZvcm0gZGF0YSBzdWJtaXR0ZWQ6PC9wPlxuICogICAgICAgPC9mb3JtPlxuICogICAgICAgPHByZT57e2RhdGF9fTwvcHJlPlxuICogICAgIDwvZGl2PlxuICogYCxcbiAqICAgZGlyZWN0aXZlczogW0NPUkVfRElSRUNUSVZFUywgRk9STV9ESVJFQ1RJVkVTXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICBjb25zdHJ1Y3RvcigpIHt9XG4gKlxuICogICBkYXRhOiBzdHJpbmc7XG4gKlxuICogICBvblN1Ym1pdChkYXRhKSB7XG4gKiAgICAgdGhpcy5kYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMik7XG4gKiAgIH1cbiAqIH1cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnZm9ybTpub3QoW25nLW5vLWZvcm1dKTpub3QoW25nLWZvcm0tbW9kZWxdKSxuZy1mb3JtLFtuZy1mb3JtXScsXG4gIGJpbmRpbmdzOiBbZm9ybURpcmVjdGl2ZVByb3ZpZGVyXSxcbiAgaG9zdDoge1xuICAgICcoc3VibWl0KSc6ICdvblN1Ym1pdCgpJyxcbiAgfSxcbiAgb3V0cHV0czogWyduZ1N1Ym1pdCddLFxuICBleHBvcnRBczogJ2Zvcm0nXG59KVxuZXhwb3J0IGNsYXNzIE5nRm9ybSBleHRlbmRzIENvbnRyb2xDb250YWluZXIgaW1wbGVtZW50cyBGb3JtIHtcbiAgZm9ybTogQ29udHJvbEdyb3VwO1xuICBuZ1N1Ym1pdCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgdmFsaWRhdG9yczogYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBhc3luY1ZhbGlkYXRvcnM6IGFueVtdKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmZvcm0gPSBuZXcgQ29udHJvbEdyb3VwKHt9LCBudWxsLCBjb21wb3NlVmFsaWRhdG9ycyh2YWxpZGF0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnMoYXN5bmNWYWxpZGF0b3JzKSk7XG4gIH1cblxuICBnZXQgZm9ybURpcmVjdGl2ZSgpOiBGb3JtIHsgcmV0dXJuIHRoaXM7IH1cblxuICBnZXQgY29udHJvbCgpOiBDb250cm9sR3JvdXAgeyByZXR1cm4gdGhpcy5mb3JtOyB9XG5cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gW107IH1cblxuICBnZXQgY29udHJvbHMoKToge1trZXk6IHN0cmluZ106IEFic3RyYWN0Q29udHJvbH0geyByZXR1cm4gdGhpcy5mb3JtLmNvbnRyb2xzOyB9XG5cbiAgYWRkQ29udHJvbChkaXI6IE5nQ29udHJvbCk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnNjaGVkdWxlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9maW5kQ29udGFpbmVyKGRpci5wYXRoKTtcbiAgICAgIHZhciBjdHJsID0gbmV3IENvbnRyb2woKTtcbiAgICAgIHNldFVwQ29udHJvbChjdHJsLCBkaXIpO1xuICAgICAgY29udGFpbmVyLmFkZENvbnRyb2woZGlyLm5hbWUsIGN0cmwpO1xuICAgICAgY3RybC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRDb250cm9sKGRpcjogTmdDb250cm9sKTogQ29udHJvbCB7IHJldHVybiA8Q29udHJvbD50aGlzLmZvcm0uZmluZChkaXIucGF0aCk7IH1cblxuICByZW1vdmVDb250cm9sKGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIuc2NoZWR1bGVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuX2ZpbmRDb250YWluZXIoZGlyLnBhdGgpO1xuICAgICAgaWYgKGlzUHJlc2VudChjb250YWluZXIpKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDb250cm9sKGRpci5uYW1lKTtcbiAgICAgICAgY29udGFpbmVyLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFkZENvbnRyb2xHcm91cChkaXI6IE5nQ29udHJvbEdyb3VwKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIuc2NoZWR1bGVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuX2ZpbmRDb250YWluZXIoZGlyLnBhdGgpO1xuICAgICAgdmFyIGdyb3VwID0gbmV3IENvbnRyb2xHcm91cCh7fSk7XG4gICAgICBzZXRVcENvbnRyb2xHcm91cChncm91cCwgZGlyKTtcbiAgICAgIGNvbnRhaW5lci5hZGRDb250cm9sKGRpci5uYW1lLCBncm91cCk7XG4gICAgICBncm91cC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnNjaGVkdWxlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9maW5kQ29udGFpbmVyKGRpci5wYXRoKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY29udGFpbmVyKSkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ29udHJvbChkaXIubmFtZSk7XG4gICAgICAgIGNvbnRhaW5lci51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCk6IENvbnRyb2xHcm91cCB7XG4gICAgcmV0dXJuIDxDb250cm9sR3JvdXA+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICB9XG5cbiAgdXBkYXRlTW9kZWwoZGlyOiBOZ0NvbnRyb2wsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci5zY2hlZHVsZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB2YXIgY3RybCA9IDxDb250cm9sPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgICAgIGN0cmwudXBkYXRlVmFsdWUodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgb25TdWJtaXQoKTogYm9vbGVhbiB7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5uZ1N1Ym1pdCwgbnVsbCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmluZENvbnRhaW5lcihwYXRoOiBzdHJpbmdbXSk6IENvbnRyb2xHcm91cCB7XG4gICAgcGF0aC5wb3AoKTtcbiAgICByZXR1cm4gTGlzdFdyYXBwZXIuaXNFbXB0eShwYXRoKSA/IHRoaXMuZm9ybSA6IDxDb250cm9sR3JvdXA+dGhpcy5mb3JtLmZpbmQocGF0aCk7XG4gIH1cbn1cbiJdfQ==