import { OnChanges, OnDestroy } from 'angular2/lifecycle_hooks';
import { SimpleChange } from 'angular2/src/core/change_detection';
import { ControlContainer } from './control_container';
import { NgControl } from './ng_control';
import { ControlValueAccessor } from './control_value_accessor';
import { Control } from '../model';
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
export declare class NgControlName extends NgControl implements OnChanges, OnDestroy {
    private _parent;
    private _validators;
    private _asyncValidators;
    model: any;
    viewModel: any;
    private _added;
    constructor(_parent: ControlContainer, _validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    onChanges(changes: {
        [key: string]: SimpleChange;
    }): void;
    onDestroy(): void;
    viewToModelUpdate(newValue: any): void;
    path: string[];
    formDirective: any;
    validator: Function;
    asyncValidator: Function;
    control: Control;
}
