import {PromiseWrapper, ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';
import {StringMapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, CONST_EXPR} from 'angular2/src/facade/lang';
import {Directive} from 'angular2/src/core/annotations/decorators';
import {FORWARD_REF, Binding} from 'angular2/di';
import {NgControl} from './ng_control';
import {Form} from './form_interface';
import {NgControlGroup} from './ng_control_group';
import {ControlContainer} from './control_container';
import {AbstractControl, ControlGroup, Control} from '../model';
import {setUpControl} from './shared';

const formDirectiveBinding =
    CONST_EXPR(new Binding(ControlContainer, {toAlias: FORWARD_REF(() => NgForm)}));

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
