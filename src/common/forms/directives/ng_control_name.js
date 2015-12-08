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
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var control_container_1 = require('./control_container');
var ng_control_1 = require('./ng_control');
var control_value_accessor_1 = require('./control_value_accessor');
var shared_1 = require('./shared');
var validators_1 = require('../validators');
var controlNameBinding = lang_1.CONST_EXPR(new core_1.Provider(ng_control_1.NgControl, { useExisting: core_1.forwardRef(function () { return NgControlName; }) }));
/**
 * Creates and binds a control with a specified name to a DOM element.
 *
 * This directive can only be used as a child of {@link NgForm} or {@link NgFormModel}.

 * ### Example
 *
 * In this example, we create the login and password controls.
 * We can work with each control separately: check its validity, get its value, listen to its
 * changes.
 *
 *  ```
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form #f="ngForm" (submit)='onLogIn(f.value)'>
 *          Login <input type='text' ng-control='login' #l="ngForm">
 *          <div *ng-if="!l.valid">Login is invalid</div>
 *
 *          Password <input type='password' ng-control='password'>
 *          <button type='submit'>Log in!</button>
 *        </form>
 *      `})
 * class LoginComp {
 *  onLogIn(value): void {
 *    // value === {login: 'some login', password: 'some password'}
 *  }
 * }
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form (submit)='onLogIn()'>
 *          Login <input type='text' ng-control='login' [(ng-model)]="credentials.login">
 *          Password <input type='password' ng-control='password'
 *                          [(ng-model)]="credentials.password">
 *          <button type='submit'>Log in!</button>
 *        </form>
 *      `})
 * class LoginComp {
 *  credentials: {login:string, password:string};
 *
 *  onLogIn(): void {
 *    // this.credentials.login === "some login"
 *    // this.credentials.password === "some password"
 *  }
 * }
 *  ```
 */
var NgControlName = (function (_super) {
    __extends(NgControlName, _super);
    function NgControlName(_parent, _validators, _asyncValidators, valueAccessors) {
        _super.call(this);
        this._parent = _parent;
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        /** @internal */
        this.update = new async_1.EventEmitter();
        this._added = false;
        this.valueAccessor = shared_1.selectValueAccessor(this, valueAccessors);
    }
    NgControlName.prototype.ngOnChanges = function (changes) {
        if (!this._added) {
            this.formDirective.addControl(this);
            this._added = true;
        }
        if (shared_1.isPropertyUpdated(changes, this.viewModel)) {
            this.viewModel = this.model;
            this.formDirective.updateModel(this, this.model);
        }
    };
    NgControlName.prototype.ngOnDestroy = function () { this.formDirective.removeControl(this); };
    NgControlName.prototype.viewToModelUpdate = function (newValue) {
        this.viewModel = newValue;
        async_1.ObservableWrapper.callEmit(this.update, newValue);
    };
    Object.defineProperty(NgControlName.prototype, "path", {
        get: function () { return shared_1.controlPath(this.name, this._parent); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlName.prototype, "formDirective", {
        get: function () { return this._parent.formDirective; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlName.prototype, "validator", {
        get: function () { return shared_1.composeValidators(this._validators); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlName.prototype, "asyncValidator", {
        get: function () { return shared_1.composeAsyncValidators(this._asyncValidators); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlName.prototype, "control", {
        get: function () { return this.formDirective.getControl(this); },
        enumerable: true,
        configurable: true
    });
    NgControlName = __decorate([
        core_1.Directive({
            selector: '[ng-control]',
            bindings: [controlNameBinding],
            inputs: ['name: ngControl', 'model: ngModel'],
            outputs: ['update: ngModelChange'],
            exportAs: 'ngForm'
        }),
        __param(0, core_1.Host()),
        __param(0, core_1.SkipSelf()),
        __param(1, core_1.Optional()),
        __param(1, core_1.Self()),
        __param(1, core_1.Inject(validators_1.NG_VALIDATORS)),
        __param(2, core_1.Optional()),
        __param(2, core_1.Self()),
        __param(2, core_1.Inject(validators_1.NG_ASYNC_VALIDATORS)),
        __param(3, core_1.Optional()),
        __param(3, core_1.Self()),
        __param(3, core_1.Inject(control_value_accessor_1.NG_VALUE_ACCESSOR)), 
        __metadata('design:paramtypes', [control_container_1.ControlContainer, Array, Array, Array])
    ], NgControlName);
    return NgControlName;
})(ng_control_1.NgControl);
exports.NgControlName = NgControlName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9uYW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9kaXJlY3RpdmVzL25nX2NvbnRyb2xfbmFtZS50cyJdLCJuYW1lcyI6WyJOZ0NvbnRyb2xOYW1lIiwiTmdDb250cm9sTmFtZS5jb25zdHJ1Y3RvciIsIk5nQ29udHJvbE5hbWUubmdPbkNoYW5nZXMiLCJOZ0NvbnRyb2xOYW1lLm5nT25EZXN0cm95IiwiTmdDb250cm9sTmFtZS52aWV3VG9Nb2RlbFVwZGF0ZSIsIk5nQ29udHJvbE5hbWUucGF0aCIsIk5nQ29udHJvbE5hbWUuZm9ybURpcmVjdGl2ZSIsIk5nQ29udHJvbE5hbWUudmFsaWRhdG9yIiwiTmdDb250cm9sTmFtZS5hc3luY1ZhbGlkYXRvciIsIk5nQ29udHJvbE5hbWUuY29udHJvbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUF5QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3BELHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBRTFFLHFCQWFPLGVBQWUsQ0FBQyxDQUFBO0FBRXZCLGtDQUErQixxQkFBcUIsQ0FBQyxDQUFBO0FBQ3JELDJCQUF3QixjQUFjLENBQUMsQ0FBQTtBQUN2Qyx1Q0FBc0QsMEJBQTBCLENBQUMsQ0FBQTtBQUNqRix1QkFNTyxVQUFVLENBQUMsQ0FBQTtBQUVsQiwyQkFBNkQsZUFBZSxDQUFDLENBQUE7QUFHN0UsSUFBTSxrQkFBa0IsR0FDcEIsaUJBQVUsQ0FBQyxJQUFJLGVBQVEsQ0FBQyxzQkFBUyxFQUFFLEVBQUMsV0FBVyxFQUFFLGlCQUFVLENBQUMsY0FBTSxPQUFBLGFBQWEsRUFBYixDQUFhLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUV4Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0RHO0FBQ0g7SUFPbUNBLGlDQUFTQTtJQVExQ0EsdUJBQXdDQSxP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QzdDQSxPQUFPQSxFQUFFQSxDQUFDQSx1QkFBdUJBLENBQUNBO1lBQ2xDQSxRQUFRQSxFQUFFQSxRQUFRQTtTQUNuQkEsQ0FBQ0E7UUFTWUEsV0FBQ0EsV0FBSUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsZUFBUUEsRUFBRUEsQ0FBQUE7UUFDbkJBLFdBQUNBLGVBQVFBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLFdBQUlBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLGFBQU1BLENBQUNBLDBCQUFhQSxDQUFDQSxDQUFBQTtRQUUxQ0EsV0FBQ0EsZUFBUUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsV0FBSUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsYUFBTUEsQ0FBQ0EsZ0NBQW1CQSxDQUFDQSxDQUFBQTtRQUVoREEsV0FBQ0EsZUFBUUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsV0FBSUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsYUFBTUEsQ0FBQ0EsMENBQWlCQSxDQUFDQSxDQUFBQTs7c0JBaUMzREE7SUFBREEsb0JBQUNBO0FBQURBLENBQUNBLEFBckRELEVBT21DLHNCQUFTLEVBOEMzQztBQTlDWSxxQkFBYSxnQkE4Q3pCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5pbXBvcnQge1xuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgU2ltcGxlQ2hhbmdlLFxuICBRdWVyeSxcbiAgRGlyZWN0aXZlLFxuICBmb3J3YXJkUmVmLFxuICBIb3N0LFxuICBTa2lwU2VsZixcbiAgUHJvdmlkZXIsXG4gIEluamVjdCxcbiAgT3B0aW9uYWwsXG4gIFNlbGZcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi9uZ19jb250cm9sJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtcbiAgY29udHJvbFBhdGgsXG4gIGNvbXBvc2VWYWxpZGF0b3JzLFxuICBjb21wb3NlQXN5bmNWYWxpZGF0b3JzLFxuICBpc1Byb3BlcnR5VXBkYXRlZCxcbiAgc2VsZWN0VmFsdWVBY2Nlc3NvclxufSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge0NvbnRyb2x9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7VmFsaWRhdG9ycywgTkdfVkFMSURBVE9SUywgTkdfQVNZTkNfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cblxuY29uc3QgY29udHJvbE5hbWVCaW5kaW5nID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihOZ0NvbnRyb2wsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ0NvbnRyb2xOYW1lKX0pKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuZCBiaW5kcyBhIGNvbnRyb2wgd2l0aCBhIHNwZWNpZmllZCBuYW1lIHRvIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgY2FuIG9ubHkgYmUgdXNlZCBhcyBhIGNoaWxkIG9mIHtAbGluayBOZ0Zvcm19IG9yIHtAbGluayBOZ0Zvcm1Nb2RlbH0uXG5cbiAqICMjIyBFeGFtcGxlXG4gKlxuICogSW4gdGhpcyBleGFtcGxlLCB3ZSBjcmVhdGUgdGhlIGxvZ2luIGFuZCBwYXNzd29yZCBjb250cm9scy5cbiAqIFdlIGNhbiB3b3JrIHdpdGggZWFjaCBjb250cm9sIHNlcGFyYXRlbHk6IGNoZWNrIGl0cyB2YWxpZGl0eSwgZ2V0IGl0cyB2YWx1ZSwgbGlzdGVuIHRvIGl0c1xuICogY2hhbmdlcy5cbiAqXG4gKiAgYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgICAgc2VsZWN0b3I6IFwibG9naW4tY29tcFwiLFxuICogICAgICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTXSxcbiAqICAgICAgdGVtcGxhdGU6IGBcbiAqICAgICAgICA8Zm9ybSAjZj1cIm5nRm9ybVwiIChzdWJtaXQpPSdvbkxvZ0luKGYudmFsdWUpJz5cbiAqICAgICAgICAgIExvZ2luIDxpbnB1dCB0eXBlPSd0ZXh0JyBuZy1jb250cm9sPSdsb2dpbicgI2w9XCJuZ0Zvcm1cIj5cbiAqICAgICAgICAgIDxkaXYgKm5nLWlmPVwiIWwudmFsaWRcIj5Mb2dpbiBpcyBpbnZhbGlkPC9kaXY+XG4gKlxuICogICAgICAgICAgUGFzc3dvcmQgPGlucHV0IHR5cGU9J3Bhc3N3b3JkJyBuZy1jb250cm9sPSdwYXNzd29yZCc+XG4gKiAgICAgICAgICA8YnV0dG9uIHR5cGU9J3N1Ym1pdCc+TG9nIGluITwvYnV0dG9uPlxuICogICAgICAgIDwvZm9ybT5cbiAqICAgICAgYH0pXG4gKiBjbGFzcyBMb2dpbkNvbXAge1xuICogIG9uTG9nSW4odmFsdWUpOiB2b2lkIHtcbiAqICAgIC8vIHZhbHVlID09PSB7bG9naW46ICdzb21lIGxvZ2luJywgcGFzc3dvcmQ6ICdzb21lIHBhc3N3b3JkJ31cbiAqICB9XG4gKiB9XG4gKiAgYGBgXG4gKlxuICogV2UgY2FuIGFsc28gdXNlIG5nLW1vZGVsIHRvIGJpbmQgYSBkb21haW4gbW9kZWwgdG8gdGhlIGZvcm0uXG4gKlxuICogIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgICAgIHNlbGVjdG9yOiBcImxvZ2luLWNvbXBcIixcbiAqICAgICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiAgICAgIHRlbXBsYXRlOiBgXG4gKiAgICAgICAgPGZvcm0gKHN1Ym1pdCk9J29uTG9nSW4oKSc+XG4gKiAgICAgICAgICBMb2dpbiA8aW5wdXQgdHlwZT0ndGV4dCcgbmctY29udHJvbD0nbG9naW4nIFsobmctbW9kZWwpXT1cImNyZWRlbnRpYWxzLmxvZ2luXCI+XG4gKiAgICAgICAgICBQYXNzd29yZCA8aW5wdXQgdHlwZT0ncGFzc3dvcmQnIG5nLWNvbnRyb2w9J3Bhc3N3b3JkJ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgIFsobmctbW9kZWwpXT1cImNyZWRlbnRpYWxzLnBhc3N3b3JkXCI+XG4gKiAgICAgICAgICA8YnV0dG9uIHR5cGU9J3N1Ym1pdCc+TG9nIGluITwvYnV0dG9uPlxuICogICAgICAgIDwvZm9ybT5cbiAqICAgICAgYH0pXG4gKiBjbGFzcyBMb2dpbkNvbXAge1xuICogIGNyZWRlbnRpYWxzOiB7bG9naW46c3RyaW5nLCBwYXNzd29yZDpzdHJpbmd9O1xuICpcbiAqICBvbkxvZ0luKCk6IHZvaWQge1xuICogICAgLy8gdGhpcy5jcmVkZW50aWFscy5sb2dpbiA9PT0gXCJzb21lIGxvZ2luXCJcbiAqICAgIC8vIHRoaXMuY3JlZGVudGlhbHMucGFzc3dvcmQgPT09IFwic29tZSBwYXNzd29yZFwiXG4gKiAgfVxuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmctY29udHJvbF0nLFxuICBiaW5kaW5nczogW2NvbnRyb2xOYW1lQmluZGluZ10sXG4gIGlucHV0czogWyduYW1lOiBuZ0NvbnRyb2wnLCAnbW9kZWw6IG5nTW9kZWwnXSxcbiAgb3V0cHV0czogWyd1cGRhdGU6IG5nTW9kZWxDaGFuZ2UnXSxcbiAgZXhwb3J0QXM6ICduZ0Zvcm0nXG59KVxuZXhwb3J0IGNsYXNzIE5nQ29udHJvbE5hbWUgZXh0ZW5kcyBOZ0NvbnRyb2wgaW1wbGVtZW50cyBPbkNoYW5nZXMsXG4gICAgT25EZXN0cm95IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICB1cGRhdGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIG1vZGVsOiBhbnk7XG4gIHZpZXdNb2RlbDogYW55O1xuICBwcml2YXRlIF9hZGRlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKEBIb3N0KCkgQFNraXBTZWxmKCkgcHJpdmF0ZSBfcGFyZW50OiBDb250cm9sQ29udGFpbmVyLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgcHJpdmF0ZSBfdmFsaWRhdG9yczpcbiAgICAgICAgICAgICAgICAgIC8qIEFycmF5PFZhbGlkYXRvcnxGdW5jdGlvbj4gKi8gYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBwcml2YXRlIF9hc3luY1ZhbGlkYXRvcnM6XG4gICAgICAgICAgICAgICAgICAvKiBBcnJheTxWYWxpZGF0b3J8RnVuY3Rpb24+ICovIGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpXG4gICAgICAgICAgICAgIHZhbHVlQWNjZXNzb3JzOiBDb250cm9sVmFsdWVBY2Nlc3NvcltdKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnZhbHVlQWNjZXNzb3IgPSBzZWxlY3RWYWx1ZUFjY2Vzc29yKHRoaXMsIHZhbHVlQWNjZXNzb3JzKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IHtba2V5OiBzdHJpbmddOiBTaW1wbGVDaGFuZ2V9KSB7XG4gICAgaWYgKCF0aGlzLl9hZGRlZCkge1xuICAgICAgdGhpcy5mb3JtRGlyZWN0aXZlLmFkZENvbnRyb2wodGhpcyk7XG4gICAgICB0aGlzLl9hZGRlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChpc1Byb3BlcnR5VXBkYXRlZChjaGFuZ2VzLCB0aGlzLnZpZXdNb2RlbCkpIHtcbiAgICAgIHRoaXMudmlld01vZGVsID0gdGhpcy5tb2RlbDtcbiAgICAgIHRoaXMuZm9ybURpcmVjdGl2ZS51cGRhdGVNb2RlbCh0aGlzLCB0aGlzLm1vZGVsKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHsgdGhpcy5mb3JtRGlyZWN0aXZlLnJlbW92ZUNvbnRyb2wodGhpcyk7IH1cblxuICB2aWV3VG9Nb2RlbFVwZGF0ZShuZXdWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy52aWV3TW9kZWwgPSBuZXdWYWx1ZTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLnVwZGF0ZSwgbmV3VmFsdWUpO1xuICB9XG5cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gY29udHJvbFBhdGgodGhpcy5uYW1lLCB0aGlzLl9wYXJlbnQpOyB9XG5cbiAgZ2V0IGZvcm1EaXJlY3RpdmUoKTogYW55IHsgcmV0dXJuIHRoaXMuX3BhcmVudC5mb3JtRGlyZWN0aXZlOyB9XG5cbiAgZ2V0IHZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl92YWxpZGF0b3JzKTsgfVxuXG4gIGdldCBhc3luY1ZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX2FzeW5jVmFsaWRhdG9ycyk7IH1cblxuICBnZXQgY29udHJvbCgpOiBDb250cm9sIHsgcmV0dXJuIHRoaXMuZm9ybURpcmVjdGl2ZS5nZXRDb250cm9sKHRoaXMpOyB9XG59XG4iXX0=