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
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { Directive } from 'angular2/src/core/metadata';
import { forwardRef, Host, SkipSelf, Provider, Inject, Optional } from 'angular2/src/core/di';
import { ControlContainer } from './control_container';
import { NgControl } from './ng_control';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { controlPath, composeValidators, composeAsyncValidators, isPropertyUpdated, selectValueAccessor } from './shared';
import { NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
const controlNameBinding = CONST_EXPR(new Provider(NgControl, { useExisting: forwardRef(() => NgControlName) }));
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
 *        <form #f="form" (submit)='onLogIn(f.value)'>
 *          Login <input type='text' ng-control='login' #l="form">
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
export let NgControlName = class extends NgControl {
    constructor(_parent, _validators, _asyncValidators, valueAccessors) {
        super();
        this._parent = _parent;
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        /** @internal */
        this.update = new EventEmitter();
        this._added = false;
        this.valueAccessor = selectValueAccessor(this, valueAccessors);
    }
    onChanges(changes) {
        if (!this._added) {
            this.formDirective.addControl(this);
            this._added = true;
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            this.viewModel = this.model;
            this.formDirective.updateModel(this, this.model);
        }
    }
    onDestroy() { this.formDirective.removeControl(this); }
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        ObservableWrapper.callNext(this.update, newValue);
    }
    get path() { return controlPath(this.name, this._parent); }
    get formDirective() { return this._parent.formDirective; }
    get validator() { return composeValidators(this._validators); }
    get asyncValidator() { return composeAsyncValidators(this._asyncValidators); }
    get control() { return this.formDirective.getControl(this); }
};
NgControlName = __decorate([
    Directive({
        selector: '[ng-control]',
        bindings: [controlNameBinding],
        inputs: ['name: ngControl', 'model: ngModel'],
        outputs: ['update: ngModelChange'],
        exportAs: 'form'
    }),
    __param(0, Host()),
    __param(0, SkipSelf()),
    __param(1, Optional()),
    __param(1, Inject(NG_VALIDATORS)),
    __param(2, Optional()),
    __param(2, Inject(NG_ASYNC_VALIDATORS)),
    __param(3, Optional()),
    __param(3, Inject(NG_VALUE_ACCESSOR)), 
    __metadata('design:paramtypes', [ControlContainer, Array, Array, Array])
], NgControlName);
//# sourceMappingURL=ng_control_name.js.map