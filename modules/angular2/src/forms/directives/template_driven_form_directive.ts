import {PromiseWrapper, ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';
import {StringMapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, CONST_EXPR} from 'angular2/src/facade/lang';
import {Directive} from 'angular2/src/core/annotations/decorators';
import {FORWARD_REF, Binding} from 'angular2/di';
import {ControlDirective} from './control_directive';
import {FormDirective} from './form_directive';
import {ControlGroupDirective} from './control_group_directive';
import {ControlContainerDirective} from './control_container_directive';
import {AbstractControl, ControlGroup, Control} from '../model';
import {setUpControl} from './shared';

const formDirectiveBinding = CONST_EXPR(new Binding(
    ControlContainerDirective, {toAlias: FORWARD_REF(() => TemplateDrivenFormDirective)}));

@Directive({
  selector: 'form:not([ng-no-form]):not([ng-form-model]),ng-form,[ng-form]',
  hostInjector: [formDirectiveBinding],
  host: {
    '(submit)': 'onSubmit()',
  },
  events: ['ngSubmit'],
  exportAs: 'form'
})
export class TemplateDrivenFormDirective extends ControlContainerDirective implements
    FormDirective {
  form: ControlGroup;
  ngSubmit = new EventEmitter();

  constructor() {
    super();
    this.form = new ControlGroup({});
  }

  get formDirective(): FormDirective { return this; }

  get path(): List<string> { return []; }

  get controls(): StringMap<string, AbstractControl> { return this.form.controls; }

  get value(): any { return this.form.value; }

  get errors(): any { return this.form.errors; }

  addControl(dir: ControlDirective): void {
    this._later(_ => {
      var container = this._findContainer(dir.path);
      var c = new Control("");
      setUpControl(c, dir);
      container.addControl(dir.name, c);
      c.updateValidity();
    });
  }

  getControl(dir: ControlDirective): Control { return <Control>this.form.find(dir.path); }

  removeControl(dir: ControlDirective): void {
    this._later(_ => {
      var container = this._findContainer(dir.path);
      if (isPresent(container)) {
        container.removeControl(dir.name);
        container.updateValidity();
      }
    });
  }

  addControlGroup(dir: ControlGroupDirective): void {
    this._later(_ => {
      var container = this._findContainer(dir.path);
      var c = new ControlGroup({});
      container.addControl(dir.name, c);
      c.updateValidity();
    });
  }

  removeControlGroup(dir: ControlGroupDirective): void {
    this._later(_ => {
      var container = this._findContainer(dir.path);
      if (isPresent(container)) {
        container.removeControl(dir.name);
        container.updateValidity();
      }
    });
  }

  updateModel(dir: ControlDirective, value: any): void {
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
