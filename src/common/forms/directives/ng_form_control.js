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
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var ng_control_1 = require('./ng_control');
var validators_1 = require('../validators');
var control_value_accessor_1 = require('./control_value_accessor');
var shared_1 = require('./shared');
var formControlBinding = lang_1.CONST_EXPR(new core_1.Provider(ng_control_1.NgControl, { useExisting: core_1.forwardRef(function () { return NgFormControl; }) }));
/**
 * Binds an existing {@link Control} to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jcQlZ2tTh22BZZ2ucNAT?p=preview))
 *
 * In this example, we bind the control to an input element. When the value of the input element
 * changes, the value of the control will reflect that change. Likewise, if the value of the
 * control changes, the input element reflects that change.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormControl Example</h2>
 *       <form>
 *         <p>Element with existing control: <input type="text"
 * [ng-form-control]="loginControl"></p>
 *         <p>Value of existing control: {{loginControl.value}}</p>
 *       </form>
 *     </div>
 *   `,
 *   directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginControl: Control = new Control('');
 * }
 *  ```
 *
 * ###ng-model
 *
 * We can also use `ng-model` to bind a domain model to the form.
 *
 * ### Example ([live demo](http://plnkr.co/edit/yHMLuHO7DNgT8XvtjTDH?p=preview))
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: "<input type='text' [ng-form-control]='loginControl' [(ng-model)]='login'>"
 *      })
 * class LoginComp {
 *  loginControl: Control = new Control('');
 *  login:string;
 * }
 *  ```
 */
var NgFormControl = (function (_super) {
    __extends(NgFormControl, _super);
    function NgFormControl(_validators, _asyncValidators, valueAccessors) {
        _super.call(this);
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.update = new async_1.EventEmitter();
        this.valueAccessor = shared_1.selectValueAccessor(this, valueAccessors);
    }
    NgFormControl.prototype.ngOnChanges = function (changes) {
        if (this._isControlChanged(changes)) {
            shared_1.setUpControl(this.form, this);
            this.form.updateValueAndValidity({ emitEvent: false });
        }
        if (shared_1.isPropertyUpdated(changes, this.viewModel)) {
            this.form.updateValue(this.model);
            this.viewModel = this.model;
        }
    };
    Object.defineProperty(NgFormControl.prototype, "path", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFormControl.prototype, "validator", {
        get: function () { return shared_1.composeValidators(this._validators); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFormControl.prototype, "asyncValidator", {
        get: function () { return shared_1.composeAsyncValidators(this._asyncValidators); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFormControl.prototype, "control", {
        get: function () { return this.form; },
        enumerable: true,
        configurable: true
    });
    NgFormControl.prototype.viewToModelUpdate = function (newValue) {
        this.viewModel = newValue;
        async_1.ObservableWrapper.callEmit(this.update, newValue);
    };
    NgFormControl.prototype._isControlChanged = function (changes) {
        return collection_1.StringMapWrapper.contains(changes, "form");
    };
    NgFormControl = __decorate([
        core_1.Directive({
            selector: '[ng-form-control]',
            bindings: [formControlBinding],
            inputs: ['form: ngFormControl', 'model: ngModel'],
            outputs: ['update: ngModelChange'],
            exportAs: 'form'
        }),
        __param(0, core_1.Optional()),
        __param(0, core_1.Self()),
        __param(0, core_1.Inject(validators_1.NG_VALIDATORS)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Self()),
        __param(1, core_1.Inject(validators_1.NG_ASYNC_VALIDATORS)),
        __param(2, core_1.Optional()),
        __param(2, core_1.Self()),
        __param(2, core_1.Inject(control_value_accessor_1.NG_VALUE_ACCESSOR)), 
        __metadata('design:paramtypes', [Array, Array, Array])
    ], NgFormControl);
    return NgFormControl;
})(ng_control_1.NgControl);
exports.NgFormControl = NgFormControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybV9jb250cm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9kaXJlY3RpdmVzL25nX2Zvcm1fY29udHJvbC50cyJdLCJuYW1lcyI6WyJOZ0Zvcm1Db250cm9sIiwiTmdGb3JtQ29udHJvbC5jb25zdHJ1Y3RvciIsIk5nRm9ybUNvbnRyb2wubmdPbkNoYW5nZXMiLCJOZ0Zvcm1Db250cm9sLnBhdGgiLCJOZ0Zvcm1Db250cm9sLnZhbGlkYXRvciIsIk5nRm9ybUNvbnRyb2wuYXN5bmNWYWxpZGF0b3IiLCJOZ0Zvcm1Db250cm9sLmNvbnRyb2wiLCJOZ0Zvcm1Db250cm9sLnZpZXdUb01vZGVsVXBkYXRlIiwiTmdGb3JtQ29udHJvbC5faXNDb250cm9sQ2hhbmdlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUF5QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3BELDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ2hFLHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBQzFFLHFCQVVPLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZCLDJCQUF3QixjQUFjLENBQUMsQ0FBQTtBQUV2QywyQkFBNkQsZUFBZSxDQUFDLENBQUE7QUFDN0UsdUNBQXNELDBCQUEwQixDQUFDLENBQUE7QUFDakYsdUJBTU8sVUFBVSxDQUFDLENBQUE7QUFFbEIsSUFBTSxrQkFBa0IsR0FDcEIsaUJBQVUsQ0FBQyxJQUFJLGVBQVEsQ0FBQyxzQkFBUyxFQUFFLEVBQUMsV0FBVyxFQUFFLGlCQUFVLENBQUMsY0FBTSxPQUFBLGFBQWEsRUFBYixDQUFhLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUV4Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThDRztBQUNIO0lBT21DQSxpQ0FBU0E7SUFNMUNBLHVCQUErREEsV0FDVkEsRUFDZ0JBLGdCQUNoQkEsRUFFekNBLGNBQXND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QSxDQUFBQTtRQUFDQSxXQUFDQSxhQUFNQSxDQUFDQSxnQ0FBbUJBLENBQUNBLENBQUFBO1FBRWhEQSxXQUFDQSxlQUFRQSxFQUFFQSxDQUFBQTtRQUFDQSxXQUFDQSxXQUFJQSxFQUFFQSxDQUFBQTtRQUFDQSxXQUFDQSxhQUFNQSxDQUFDQSwwQ0FBaUJBLENBQUNBLENBQUFBOztzQkFpQzNEQTtJQUFEQSxvQkFBQ0E7QUFBREEsQ0FBQ0EsQUFsREQsRUFPbUMsc0JBQVMsRUEyQzNDO0FBM0NZLHFCQUFhLGdCQTJDekIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZSxcbiAgUXVlcnksXG4gIERpcmVjdGl2ZSxcbiAgZm9yd2FyZFJlZixcbiAgUHJvdmlkZXIsXG4gIEluamVjdCxcbiAgT3B0aW9uYWwsXG4gIFNlbGZcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi9uZ19jb250cm9sJztcbmltcG9ydCB7Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtcbiAgc2V0VXBDb250cm9sLFxuICBjb21wb3NlVmFsaWRhdG9ycyxcbiAgY29tcG9zZUFzeW5jVmFsaWRhdG9ycyxcbiAgaXNQcm9wZXJ0eVVwZGF0ZWQsXG4gIHNlbGVjdFZhbHVlQWNjZXNzb3Jcbn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBmb3JtQ29udHJvbEJpbmRpbmcgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKE5nQ29udHJvbCwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nRm9ybUNvbnRyb2wpfSkpO1xuXG4vKipcbiAqIEJpbmRzIGFuIGV4aXN0aW5nIHtAbGluayBDb250cm9sfSB0byBhIERPTSBlbGVtZW50LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9qY1FsWjJ0VGgyMkJaWjJ1Y05BVD9wPXByZXZpZXcpKVxuICpcbiAqIEluIHRoaXMgZXhhbXBsZSwgd2UgYmluZCB0aGUgY29udHJvbCB0byBhbiBpbnB1dCBlbGVtZW50LiBXaGVuIHRoZSB2YWx1ZSBvZiB0aGUgaW5wdXQgZWxlbWVudFxuICogY2hhbmdlcywgdGhlIHZhbHVlIG9mIHRoZSBjb250cm9sIHdpbGwgcmVmbGVjdCB0aGF0IGNoYW5nZS4gTGlrZXdpc2UsIGlmIHRoZSB2YWx1ZSBvZiB0aGVcbiAqIGNvbnRyb2wgY2hhbmdlcywgdGhlIGlucHV0IGVsZW1lbnQgcmVmbGVjdHMgdGhhdCBjaGFuZ2UuXG4gKlxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxoMj5OZ0Zvcm1Db250cm9sIEV4YW1wbGU8L2gyPlxuICogICAgICAgPGZvcm0+XG4gKiAgICAgICAgIDxwPkVsZW1lbnQgd2l0aCBleGlzdGluZyBjb250cm9sOiA8aW5wdXQgdHlwZT1cInRleHRcIlxuICogW25nLWZvcm0tY29udHJvbF09XCJsb2dpbkNvbnRyb2xcIj48L3A+XG4gKiAgICAgICAgIDxwPlZhbHVlIG9mIGV4aXN0aW5nIGNvbnRyb2w6IHt7bG9naW5Db250cm9sLnZhbHVlfX08L3A+XG4gKiAgICAgICA8L2Zvcm0+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDT1JFX0RJUkVDVElWRVMsIEZPUk1fRElSRUNUSVZFU11cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgbG9naW5Db250cm9sOiBDb250cm9sID0gbmV3IENvbnRyb2woJycpO1xuICogfVxuICogIGBgYFxuICpcbiAqICMjI25nLW1vZGVsXG4gKlxuICogV2UgY2FuIGFsc28gdXNlIGBuZy1tb2RlbGAgdG8gYmluZCBhIGRvbWFpbiBtb2RlbCB0byB0aGUgZm9ybS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQveUhNTHVITzdETmdUOFh2dGpUREg/cD1wcmV2aWV3KSlcbiAqXG4gKiAgYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgICAgIHNlbGVjdG9yOiBcImxvZ2luLWNvbXBcIixcbiAqICAgICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiAgICAgIHRlbXBsYXRlOiBcIjxpbnB1dCB0eXBlPSd0ZXh0JyBbbmctZm9ybS1jb250cm9sXT0nbG9naW5Db250cm9sJyBbKG5nLW1vZGVsKV09J2xvZ2luJz5cIlxuICogICAgICB9KVxuICogY2xhc3MgTG9naW5Db21wIHtcbiAqICBsb2dpbkNvbnRyb2w6IENvbnRyb2wgPSBuZXcgQ29udHJvbCgnJyk7XG4gKiAgbG9naW46c3RyaW5nO1xuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmctZm9ybS1jb250cm9sXScsXG4gIGJpbmRpbmdzOiBbZm9ybUNvbnRyb2xCaW5kaW5nXSxcbiAgaW5wdXRzOiBbJ2Zvcm06IG5nRm9ybUNvbnRyb2wnLCAnbW9kZWw6IG5nTW9kZWwnXSxcbiAgb3V0cHV0czogWyd1cGRhdGU6IG5nTW9kZWxDaGFuZ2UnXSxcbiAgZXhwb3J0QXM6ICdmb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ0Zvcm1Db250cm9sIGV4dGVuZHMgTmdDb250cm9sIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgZm9ybTogQ29udHJvbDtcbiAgdXBkYXRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBtb2RlbDogYW55O1xuICB2aWV3TW9kZWw6IGFueTtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgcHJpdmF0ZSBfdmFsaWRhdG9yczpcbiAgICAgICAgICAgICAgICAgIC8qIEFycmF5PFZhbGlkYXRvcnxGdW5jdGlvbj4gKi8gYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBwcml2YXRlIF9hc3luY1ZhbGlkYXRvcnM6XG4gICAgICAgICAgICAgICAgICAvKiBBcnJheTxWYWxpZGF0b3J8RnVuY3Rpb24+ICovIGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpXG4gICAgICAgICAgICAgIHZhbHVlQWNjZXNzb3JzOiBDb250cm9sVmFsdWVBY2Nlc3NvcltdKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnZhbHVlQWNjZXNzb3IgPSBzZWxlY3RWYWx1ZUFjY2Vzc29yKHRoaXMsIHZhbHVlQWNjZXNzb3JzKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IHtba2V5OiBzdHJpbmddOiBTaW1wbGVDaGFuZ2V9KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzQ29udHJvbENoYW5nZWQoY2hhbmdlcykpIHtcbiAgICAgIHNldFVwQ29udHJvbCh0aGlzLmZvcm0sIHRoaXMpO1xuICAgICAgdGhpcy5mb3JtLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICB9XG4gICAgaWYgKGlzUHJvcGVydHlVcGRhdGVkKGNoYW5nZXMsIHRoaXMudmlld01vZGVsKSkge1xuICAgICAgdGhpcy5mb3JtLnVwZGF0ZVZhbHVlKHRoaXMubW9kZWwpO1xuICAgICAgdGhpcy52aWV3TW9kZWwgPSB0aGlzLm1vZGVsO1xuICAgIH1cbiAgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIFtdOyB9XG5cbiAgZ2V0IHZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl92YWxpZGF0b3JzKTsgfVxuXG4gIGdldCBhc3luY1ZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX2FzeW5jVmFsaWRhdG9ycyk7IH1cblxuICBnZXQgY29udHJvbCgpOiBDb250cm9sIHsgcmV0dXJuIHRoaXMuZm9ybTsgfVxuXG4gIHZpZXdUb01vZGVsVXBkYXRlKG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdNb2RlbCA9IG5ld1ZhbHVlO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMudXBkYXRlLCBuZXdWYWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIF9pc0NvbnRyb2xDaGFuZ2VkKGNoYW5nZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMoY2hhbmdlcywgXCJmb3JtXCIpO1xuICB9XG59XG4iXX0=