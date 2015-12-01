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
//# sourceMappingURL=ng_form_control.js.map