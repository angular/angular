import { EventEmitter } from 'angular2/src/facade/async';
import { SimpleChange } from 'angular2/src/core/change_detection';
import { OnChanges } from 'angular2/lifecycle_hooks';
import { NgControl } from './ng_control';
import { NgControlGroup } from './ng_control_group';
import { ControlContainer } from './control_container';
import { Form } from './form_interface';
import { Control, ControlGroup } from '../model';
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
export declare class NgFormModel extends ControlContainer implements Form, OnChanges {
    private _validators;
    private _asyncValidators;
    form: ControlGroup;
    directives: NgControl[];
    ngSubmit: EventEmitter<{}>;
    constructor(_validators: any[], _asyncValidators: any[]);
    onChanges(changes: {
        [key: string]: SimpleChange;
    }): void;
    formDirective: Form;
    control: ControlGroup;
    path: string[];
    addControl(dir: NgControl): void;
    getControl(dir: NgControl): Control;
    removeControl(dir: NgControl): void;
    addControlGroup(dir: NgControlGroup): void;
    removeControlGroup(dir: NgControlGroup): void;
    getControlGroup(dir: NgControlGroup): ControlGroup;
    updateModel(dir: NgControl, value: any): void;
    onSubmit(): boolean;
}
