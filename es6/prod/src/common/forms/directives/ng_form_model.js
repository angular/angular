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
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { ObservableWrapper, EventEmitter } from 'angular2/src/facade/async';
import { Directive } from 'angular2/src/core/metadata';
import { forwardRef, Provider, Inject, Optional } from 'angular2/src/core/di';
import { ControlContainer } from './control_container';
import { setUpControl, setUpControlGroup, composeValidators, composeAsyncValidators } from './shared';
import { Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
const formDirectiveProvider = CONST_EXPR(new Provider(ControlContainer, { useExisting: forwardRef(() => NgFormModel) }));
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
export let NgFormModel = class extends ControlContainer {
    constructor(_validators, _asyncValidators) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.form = null;
        this.directives = [];
        this.ngSubmit = new EventEmitter();
    }
    onChanges(changes) {
        if (StringMapWrapper.contains(changes, "form")) {
            var sync = composeValidators(this._validators);
            this.form.validator = Validators.compose([this.form.validator, sync]);
            var async = composeAsyncValidators(this._asyncValidators);
            this.form.asyncValidator = Validators.composeAsync([this.form.asyncValidator, async]);
            this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        this._updateDomValue();
    }
    get formDirective() { return this; }
    get control() { return this.form; }
    get path() { return []; }
    addControl(dir) {
        var ctrl = this.form.find(dir.path);
        setUpControl(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
        this.directives.push(dir);
    }
    getControl(dir) { return this.form.find(dir.path); }
    removeControl(dir) { ListWrapper.remove(this.directives, dir); }
    addControlGroup(dir) {
        var ctrl = this.form.find(dir.path);
        setUpControlGroup(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
    }
    removeControlGroup(dir) { }
    getControlGroup(dir) {
        return this.form.find(dir.path);
    }
    updateModel(dir, value) {
        var ctrl = this.form.find(dir.path);
        ctrl.updateValue(value);
    }
    onSubmit() {
        ObservableWrapper.callNext(this.ngSubmit, null);
        return false;
    }
    /** @internal */
    _updateDomValue() {
        this.directives.forEach(dir => {
            var ctrl = this.form.find(dir.path);
            dir.valueAccessor.writeValue(ctrl.value);
        });
    }
};
NgFormModel = __decorate([
    Directive({
        selector: '[ng-form-model]',
        bindings: [formDirectiveProvider],
        inputs: ['form: ng-form-model'],
        host: { '(submit)': 'onSubmit()' },
        outputs: ['ngSubmit'],
        exportAs: 'form'
    }),
    __param(0, Optional()),
    __param(0, Inject(NG_VALIDATORS)),
    __param(1, Optional()),
    __param(1, Inject(NG_ASYNC_VALIDATORS)), 
    __metadata('design:paramtypes', [Array, Array])
], NgFormModel);
//# sourceMappingURL=ng_form_model.js.map