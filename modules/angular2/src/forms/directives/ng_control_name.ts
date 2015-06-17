import {CONST_EXPR} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {List, StringMapWrapper, StringMap} from 'angular2/src/facade/collection';

import {Directive, Ancestor, onDestroy, onChange, Query, QueryList} from 'angular2/angular2';
import {forwardRef, Binding, Inject} from 'angular2/di';

import {ControlContainer} from './control_container';
import {NgControl} from './ng_control';
import {NgValidator} from './validators';
import {controlPath, composeNgValidator} from './shared';
import {Control} from '../model';

const controlNameBinding =
    CONST_EXPR(new Binding(NgControl, {toAlias: forwardRef(() => NgControlName)}));

/**
 * Creates and binds a control with a specified name to a DOM element.
 *
 * This directive can only be used as a child of {@link NgForm} or {@link NgFormModel}.

 * # Example
 *
 * In this example, we create the login and password controls.
 * We can work with each control separately: check its validity, get its value, listen to its
 changes.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [formDirectives],
 *      template: `
 *              <form #f="form" (submit)='onLogIn(f.value)'>
 *                Login <input type='text' ng-control='login' #l="form">
 *                <div *ng-if="!l.valid">Login is invalid</div>
 *
 *                Password <input type='password' ng-control='password'>

 *                <button type='submit'>Log in!</button>
 *              </form>
 *      `})
 * class LoginComp {
 *  onLogIn(value) {
 *    // value === {login: 'some login', password: 'some password'}
 *  }
 * }
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [formDirectives],
 *      template: `
 *              <form (submit)='onLogIn()'>
 *                Login <input type='text' ng-control='login' [(ng-model)]="credentials.login">
 *                Password <input type='password' ng-control='password'
 [(ng-model)]="credentials.password">
 *                <button type='submit'>Log in!</button>
 *              </form>
 *      `})
 * class LoginComp {
 *  credentials: {login:string, password:string};
 *
 *  onLogIn() {
 *    // this.credentials.login === "some login"
 *    // this.credentials.password === "some password"
 *  }
 * }
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: '[ng-control]',
  hostInjector: [controlNameBinding],
  properties: ['name: ng-control', 'model: ng-model'],
  events: ['ngModel'],
  lifecycle: [onDestroy, onChange],
  exportAs: 'form'
})
export class NgControlName extends NgControl {
  _parent: ControlContainer;
  ngModel: EventEmitter;
  model: any;
  ngValidators: QueryList<NgValidator>;
  _added: boolean;

  // Scope the query once https://github.com/angular/angular/issues/2603 is fixed
  constructor(@Ancestor() parent: ControlContainer,
              @Query(NgValidator) ngValidators: QueryList<NgValidator>) {
    super();
    this._parent = parent;
    this.ngModel = new EventEmitter();
    this._added = false;
    this.ngValidators = ngValidators;
  }

  onChange(c: StringMap<string, any>) {
    if (!this._added) {
      this.formDirective.addControl(this);
      this._added = true;
    }
    if (StringMapWrapper.contains(c, "model")) {
      this.formDirective.updateModel(this, this.model);
    }
  }

  onDestroy() { this.formDirective.removeControl(this); }

  viewToModelUpdate(newValue: any): void { ObservableWrapper.callNext(this.ngModel, newValue); }

  get path(): List<string> { return controlPath(this.name, this._parent); }

  get formDirective(): any { return this._parent.formDirective; }

  get control(): Control { return this.formDirective.getControl(this); }

  get validator(): Function { return composeNgValidator(this.ngValidators); }
}