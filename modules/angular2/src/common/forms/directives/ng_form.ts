import {
  PromiseWrapper,
  ObservableWrapper,
  EventEmitter,
  PromiseCompleter
} from 'angular2/src/facade/async';
import {StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, CONST_EXPR} from 'angular2/src/facade/lang';
import {Directive} from 'angular2/src/core/metadata';
import {forwardRef, Provider, Optional, Inject} from 'angular2/src/core/di';
import {NgControl} from './ng_control';
import {Form} from './form_interface';
import {NgControlGroup} from './ng_control_group';
import {ControlContainer} from './control_container';
import {AbstractControl, ControlGroup, Control} from '../model';
import {setUpControl, setUpControlGroup, composeValidators, composeAsyncValidators} from './shared';
import {Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS} from '../validators';

const formDirectiveProvider =
    CONST_EXPR(new Provider(ControlContainer, {useExisting: forwardRef(() => NgForm)}));

/**
 * If `NgForm` is bound in a component, `<form>` elements in that component will be
 * upgraded to use the Angular form system.
 *
 *##Typical Use
 *
 * Include `FORM_DIRECTIVES` in the `directives` section of a {@link View} annotation
 * to use `NgForm` and its associated controls.
 *
 *##Structure
 *
 * An Angular form is a collection of `Control`s in some hierarchy.
 * `Control`s can be at the top level or can be organized in `ControlGroup`s
 * or `ControlArray`s. This hierarchy is reflected in the form's `value`, a
 * JSON object that mirrors the form structure.
 *
 *##Submission
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
@Directive({
  selector: 'form:not([ng-no-form]):not([ng-form-model]),ng-form,[ng-form]',
  bindings: [formDirectiveProvider],
  host: {
    '(submit)': 'onSubmit()',
  },
  outputs: ['ngSubmit'],
  exportAs: 'form'
})
export class NgForm extends ControlContainer implements Form {
  form: ControlGroup;
  ngSubmit = new EventEmitter();

  constructor(@Optional() @Inject(NG_VALIDATORS) validators: any[],
              @Optional() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: any[]) {
    super();
    this.form = new ControlGroup({}, null, composeValidators(validators),
                                 composeAsyncValidators(asyncValidators));
  }

  get formDirective(): Form { return this; }

  get control(): ControlGroup { return this.form; }

  get path(): string[] { return []; }

  get controls(): {[key: string]: AbstractControl} { return this.form.controls; }

  addControl(dir: NgControl): void {
    PromiseWrapper.scheduleMicrotask(() => {
      var container = this._findContainer(dir.path);
      var ctrl = new Control();
      setUpControl(ctrl, dir);
      container.addControl(dir.name, ctrl);
      ctrl.updateValueAndValidity({emitEvent: false});
    });
  }

  getControl(dir: NgControl): Control { return <Control>this.form.find(dir.path); }

  removeControl(dir: NgControl): void {
    PromiseWrapper.scheduleMicrotask(() => {
      var container = this._findContainer(dir.path);
      if (isPresent(container)) {
        container.removeControl(dir.name);
        container.updateValueAndValidity({emitEvent: false});
      }
    });
  }

  addControlGroup(dir: NgControlGroup): void {
    PromiseWrapper.scheduleMicrotask(() => {
      var container = this._findContainer(dir.path);
      var group = new ControlGroup({});
      setUpControlGroup(group, dir);
      container.addControl(dir.name, group);
      group.updateValueAndValidity({emitEvent: false});
    });
  }

  removeControlGroup(dir: NgControlGroup): void {
    PromiseWrapper.scheduleMicrotask(() => {
      var container = this._findContainer(dir.path);
      if (isPresent(container)) {
        container.removeControl(dir.name);
        container.updateValueAndValidity({emitEvent: false});
      }
    });
  }

  getControlGroup(dir: NgControlGroup): ControlGroup {
    return <ControlGroup>this.form.find(dir.path);
  }

  updateModel(dir: NgControl, value: any): void {
    PromiseWrapper.scheduleMicrotask(() => {
      var ctrl = <Control>this.form.find(dir.path);
      ctrl.updateValue(value);
    });
  }

  onSubmit(): boolean {
    ObservableWrapper.callNext(this.ngSubmit, null);
    return false;
  }

  /** @internal */
  _findContainer(path: string[]): ControlGroup {
    path.pop();
    return ListWrapper.isEmpty(path) ? this.form : <ControlGroup>this.form.find(path);
  }
}
