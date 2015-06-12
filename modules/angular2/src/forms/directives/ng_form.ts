import {PromiseWrapper, ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';
import {StringMapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, CONST_EXPR} from 'angular2/src/facade/lang';
import {Directive} from 'angular2/src/core/annotations/decorators';
import {forwardRef, Binding} from 'angular2/di';
import {NgControl} from './ng_control';
import {Form} from './form_interface';
import {NgControlGroup} from './ng_control_group';
import {ControlContainer} from './control_container';
import {AbstractControl, ControlGroup, Control} from '../model';
import {setUpControl} from './shared';

const formDirectiveBinding =
    CONST_EXPR(new Binding(ControlContainer, {toAlias: forwardRef(() => NgForm)}));

/**
 * Creates and binds a form object to a DOM element.
 *
 * # Example
 *
 *  ```
 * @Component({selector: "signup-comp"})
 * @View({
 *      directives: [formDirectives],
 *      template: `
 *              <form #f="form" (submit)='onSignUp(f.value)'>
 *                <div ng-control-group='credentials' #credentials="form">
 *                  Login <input type='text' ng-control='login'>
 *                  Password <input type='password' ng-control='password'>
 *                </div>
 *                <div *ng-if="!credentials.valid">Credentials are invalid</div>
 *
 *                <div ng-control-group='personal'>
 *                  Name <input type='text' ng-control='name'>
 *                </div>
 *                <button type='submit'>Sign Up!</button>
 *              </form>
 *      `})
 * class SignupComp {
 *  onSignUp(value) {
 *    // value === {personal: {name: 'some name'},
 *    //  credentials: {login: 'some login', password: 'some password'}}
 *  }
 * }
 *
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: 'form:not([ng-no-form]):not([ng-form-model]),ng-form,[ng-form]',
  hostInjector: [formDirectiveBinding],
  host: {
    '(submit)': 'onSubmit()',
  },
  events: ['ngSubmit'],
  exportAs: 'form'
})
export class NgForm extends ControlContainer implements Form {
  form: ControlGroup;
  ngSubmit = new EventEmitter();

  constructor() {
    super();
    this.form = new ControlGroup({});
  }

  get formDirective(): Form { return this; }

  get path(): List<string> { return []; }

  get controls(): StringMap<string, AbstractControl> { return this.form.controls; }

  get value(): any { return this.form.value; }

  get errors(): any { return this.form.errors; }

  addControl(dir: NgControl): void {
    this._later(_ => {
      var container = this._findContainer(dir.path);
      var c = new Control("");
      setUpControl(c, dir);
      container.addControl(dir.name, c);
      c.updateValidity();
    });
  }

  getControl(dir: NgControl): Control { return <Control>this.form.find(dir.path); }

  removeControl(dir: NgControl): void {
    this._later(_ => {
      var container = this._findContainer(dir.path);
      if (isPresent(container)) {
        container.removeControl(dir.name);
        container.updateValidity();
      }
    });
  }

  addControlGroup(dir: NgControlGroup): void {
    this._later(_ => {
      var container = this._findContainer(dir.path);
      var c = new ControlGroup({});
      container.addControl(dir.name, c);
      c.updateValidity();
    });
  }

  removeControlGroup(dir: NgControlGroup): void {
    this._later(_ => {
      var container = this._findContainer(dir.path);
      if (isPresent(container)) {
        container.removeControl(dir.name);
        container.updateValidity();
      }
    });
  }

  updateModel(dir: NgControl, value: any): void {
    this._later(_ => {
      var c = <Control>this.form.find(dir.path);
      c.updateValue(value);
    });
  }

  onSubmit() {
    ObservableWrapper.callNext(this.ngSubmit, null);
    return false;
  }

  _findContainer(path: List<string>): ControlGroup {
    ListWrapper.removeLast(path);
    return ListWrapper.isEmpty(path) ? this.form : <ControlGroup>this.form.find(path);
  }

  _later(fn) {
    var c = PromiseWrapper.completer();
    PromiseWrapper.then(c.promise, fn, (_) => {});
    c.resolve(null);
  }
}
