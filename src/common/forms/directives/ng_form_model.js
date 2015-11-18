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
var metadata_1 = require('angular2/src/core/metadata');
var di_1 = require('angular2/src/core/di');
var control_container_1 = require('./control_container');
var shared_1 = require('./shared');
var validators_1 = require('../validators');
var formDirectiveProvider = lang_1.CONST_EXPR(new di_1.Provider(control_container_1.ControlContainer, { useExisting: di_1.forwardRef(function () { return NgFormModel; }) }));
/**
 * Binds an existing control group to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jqrVirudY8anJxTMUjTP?p=preview))
 *
 * In this example, we bind the control group to the form element, and we bind the login and
 * password controls to the login and password elements.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormModel Example</h2>
 *       <form [ng-form-model]="loginForm">
 *         <p>Login: <input type="text" ng-control="login"></p>
 *         <p>Password: <input type="password" ng-control="password"></p>
 *       </form>
 *       <p>Value:</p>
 *       <pre>{{value}}</pre>
 *     </div>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginForm: ControlGroup;
 *
 *   constructor() {
 *     this.loginForm = new ControlGroup({
 *       login: new Control(""),
 *       password: new Control("")
 *     });
 *   }
 *
 *   get value(): string {
 *     return JSON.stringify(this.loginForm.value, null, 2);
 *   }
 * }
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form [ng-form-model]='loginForm'>
 *          Login <input type='text' ng-control='login' [(ng-model)]='credentials.login'>
 *          Password <input type='password' ng-control='password'
 *                          [(ng-model)]='credentials.password'>
 *          <button (click)="onLogin()">Login</button>
 *        </form>`
 *      })
 * class LoginComp {
 *  credentials: {login: string, password: string};
 *  loginForm: ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
 *      password: new Control("")
 *    });
 *  }
 *
 *  onLogin(): void {
 *    // this.credentials.login === 'some login'
 *    // this.credentials.password === 'some password'
 *  }
 * }
 *  ```
 */
var NgFormModel = (function (_super) {
    __extends(NgFormModel, _super);
    function NgFormModel(_validators, _asyncValidators) {
        _super.call(this);
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.form = null;
        this.directives = [];
        this.ngSubmit = new async_1.EventEmitter();
    }
    NgFormModel.prototype.onChanges = function (changes) {
        if (collection_1.StringMapWrapper.contains(changes, "form")) {
            var sync = shared_1.composeValidators(this._validators);
            this.form.validator = validators_1.Validators.compose([this.form.validator, sync]);
            var async = shared_1.composeAsyncValidators(this._asyncValidators);
            this.form.asyncValidator = validators_1.Validators.composeAsync([this.form.asyncValidator, async]);
            this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        this._updateDomValue();
    };
    Object.defineProperty(NgFormModel.prototype, "formDirective", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFormModel.prototype, "control", {
        get: function () { return this.form; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFormModel.prototype, "path", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    NgFormModel.prototype.addControl = function (dir) {
        var ctrl = this.form.find(dir.path);
        shared_1.setUpControl(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
        this.directives.push(dir);
    };
    NgFormModel.prototype.getControl = function (dir) { return this.form.find(dir.path); };
    NgFormModel.prototype.removeControl = function (dir) { collection_1.ListWrapper.remove(this.directives, dir); };
    NgFormModel.prototype.addControlGroup = function (dir) {
        var ctrl = this.form.find(dir.path);
        shared_1.setUpControlGroup(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
    };
    NgFormModel.prototype.removeControlGroup = function (dir) { };
    NgFormModel.prototype.getControlGroup = function (dir) {
        return this.form.find(dir.path);
    };
    NgFormModel.prototype.updateModel = function (dir, value) {
        var ctrl = this.form.find(dir.path);
        ctrl.updateValue(value);
    };
    NgFormModel.prototype.onSubmit = function () {
        async_1.ObservableWrapper.callNext(this.ngSubmit, null);
        return false;
    };
    /** @internal */
    NgFormModel.prototype._updateDomValue = function () {
        var _this = this;
        this.directives.forEach(function (dir) {
            var ctrl = _this.form.find(dir.path);
            dir.valueAccessor.writeValue(ctrl.value);
        });
    };
    NgFormModel = __decorate([
        metadata_1.Directive({
            selector: '[ng-form-model]',
            bindings: [formDirectiveProvider],
            inputs: ['form: ng-form-model'],
            host: { '(submit)': 'onSubmit()' },
            outputs: ['ngSubmit'],
            exportAs: 'form'
        }),
        __param(0, di_1.Optional()),
        __param(0, di_1.Inject(validators_1.NG_VALIDATORS)),
        __param(1, di_1.Optional()),
        __param(1, di_1.Inject(validators_1.NG_ASYNC_VALIDATORS)), 
        __metadata('design:paramtypes', [Array, Array])
    ], NgFormModel);
    return NgFormModel;
})(control_container_1.ControlContainer);
exports.NgFormModel = NgFormModel;
//# sourceMappingURL=ng_form_model.js.map