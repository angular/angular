import {StringWrapper, isPresent, isBlank} from 'angular2/src/facade/lang';
import {Observable, EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {StringMap, StringMapWrapper, ListWrapper, List} from 'angular2/src/facade/collection';
import {Validators} from './validators';

/**
 * Indicates that a Control is valid, i.e. that no errors exist in the input value.
 *
 * @exportedAs angular2/forms
 */
export const VALID = "VALID";

/**
 * Indicates that a Control is invalid, i.e. that an error exists in the input value.
 *
 * @exportedAs angular2/forms
 */
export const INVALID = "INVALID";

export function isControl(c: Object): boolean {
  return c instanceof AbstractControl;
}

function _find(c: AbstractControl, path: List<string | number>| string) {
  if (isBlank(path)) return null;
  if (!(path instanceof List)) {
    path = StringWrapper.split(<string>path, new RegExp("/"));
  }
  if (ListWrapper.isEmpty(path)) return null;

  return ListWrapper.reduce(<List<string | number>>path, (v, name) => {
    if (v instanceof ControlGroup) {
      return isPresent(v.controls[name]) ? v.controls[name] : null;
    } else if (v instanceof ControlArray) {
      var index = <number>name;
      return isPresent(v.at(index)) ? v.at(index) : null;
    } else {
      return null;
    }
  }, c);
}

/**
 * Omitting from external API doc as this is really an abstract internal concept.
 */
export class AbstractControl {
  _value: any;
  _status: string;
  _errors: StringMap<string, any>;
  _pristine: boolean;
  _touched: boolean;
  _parent: ControlGroup | ControlArray;
  validator: Function;

  _valueChanges: EventEmitter;

  constructor(validator: Function) {
    this.validator = validator;
    this._pristine = true;
    this._touched = false;
  }

  get value(): any { return this._value; }

  get status(): string { return this._status; }

  get valid(): boolean { return this._status === VALID; }

  get errors(): StringMap<string, any> { return this._errors; }

  get pristine(): boolean { return this._pristine; }

  get dirty(): boolean { return !this.pristine; }

  get touched(): boolean { return this._touched; }

  get untouched(): boolean { return !this._touched; }

  get valueChanges(): Observable { return this._valueChanges; }

  markAsTouched(): void { this._touched = true; }

  markAsDirty({onlySelf}: {onlySelf?: boolean} = {}): void {
    onlySelf = isPresent(onlySelf) ? onlySelf : false;

    this._pristine = false;
    if (isPresent(this._parent) && !onlySelf) {
      this._parent.markAsDirty({onlySelf: onlySelf});
    }
  }

  setParent(parent) { this._parent = parent; }

  updateValidity({onlySelf}: {onlySelf?: boolean} = {}): void {
    onlySelf = isPresent(onlySelf) ? onlySelf : false;

    this._errors = this.validator(this);
    this._status = isPresent(this._errors) ? INVALID : VALID;

    if (isPresent(this._parent) && !onlySelf) {
      this._parent.updateValidity({onlySelf: onlySelf});
    }
  }

  updateValueAndValidity({onlySelf, emitEvent}: {onlySelf?: boolean,
                                                 emitEvent?: boolean} = {}): void {
    onlySelf = isPresent(onlySelf) ? onlySelf : false;
    emitEvent = isPresent(emitEvent) ? emitEvent : true;

    this._updateValue();

    if (emitEvent) {
      ObservableWrapper.callNext(this._valueChanges, this._value);
    }

    this._errors = this.validator(this);
    this._status = isPresent(this._errors) ? INVALID : VALID;
    if (isPresent(this._parent) && !onlySelf) {
      this._parent.updateValueAndValidity({onlySelf: onlySelf, emitEvent: emitEvent});
    }
  }

  find(path: List<string | number>| string): AbstractControl { return _find(this, path); }

  getError(errorCode: string, path: List<string> = null) {
    var c = isPresent(path) && !ListWrapper.isEmpty(path) ? this.find(path) : this;
    if (isPresent(c) && isPresent(c._errors)) {
      return StringMapWrapper.get(c._errors, errorCode);
    } else {
      return null;
    }
  }

  hasError(errorCode: string, path: List<string> = null) {
    return isPresent(this.getError(errorCode, path));
  }

  _updateValue(): void {}
}

/**
 * Defines a part of a form that cannot be divided into other controls.
 *
 * `Control` is one of the three fundamental building blocks used to define forms in Angular, along
 * with
 * {@link ControlGroup} and {@link ControlArray}.
 *
 * @exportedAs angular2/forms
 */
export class Control extends AbstractControl {
  _onChange: Function;

  constructor(value: any, validator: Function = Validators.nullValidator) {
    super(validator);
    this._value = value;
    this.updateValidity({onlySelf: true});
    this._valueChanges = new EventEmitter();
  }

  updateValue(value: any,
              {onlySelf, emitEvent}: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    this._value = value;
    if (isPresent(this._onChange)) this._onChange(this._value);
    this.updateValueAndValidity({onlySelf: onlySelf, emitEvent: emitEvent});
  }

  registerOnChange(fn: Function): void { this._onChange = fn; }
}

/**
 * Defines a part of a form, of fixed length, that can contain other controls.
 *
 * A ControlGroup aggregates the values and errors of each {@link Control} in the group. Thus, if
 * one of the controls
 * in a group is invalid, the entire group is invalid. Similarly, if a control changes its value,
 * the entire group
 * changes as well.
 *
 * `ControlGroup` is one of the three fundamental building blocks used to define forms in Angular,
 * along with
 * {@link Control} and {@link ControlArray}. {@link ControlArray} can also contain other controls,
 * but is of variable
 * length.
 *
 * @exportedAs angular2/forms
 */
export class ControlGroup extends AbstractControl {
  controls: StringMap<string, AbstractControl>;
  _optionals: StringMap<string, boolean>;

  constructor(controls: StringMap<String, AbstractControl>,
              optionals: StringMap<String, boolean> = null,
              validator: Function = Validators.group) {
    super(validator);
    this.controls = controls;
    this._optionals = isPresent(optionals) ? optionals : {};

    this._valueChanges = new EventEmitter();

    this._setParentForControls();
    this._value = this._reduceValue();
    this.updateValidity({onlySelf: true});
  }

  addControl(name: string, c: AbstractControl) {
    this.controls[name] = c;
    c.setParent(this);
  }

  removeControl(name: string) { StringMapWrapper.delete(this.controls, name); }

  include(controlName: string): void {
    StringMapWrapper.set(this._optionals, controlName, true);
    this.updateValueAndValidity();
  }

  exclude(controlName: string): void {
    StringMapWrapper.set(this._optionals, controlName, false);
    this.updateValueAndValidity();
  }

  contains(controlName: string): boolean {
    var c = StringMapWrapper.contains(this.controls, controlName);
    return c && this._included(controlName);
  }

  _setParentForControls() {
    StringMapWrapper.forEach(this.controls, (control, name) => { control.setParent(this); });
  }

  _updateValue() { this._value = this._reduceValue(); }

  _reduceValue() {
    return this._reduceChildren({}, (acc, control, name) => {
      acc[name] = control.value;
      return acc;
    });
  }

  _reduceChildren(initValue: any, fn: Function) {
    var res = initValue;
    StringMapWrapper.forEach(this.controls, (control, name) => {
      if (this._included(name)) {
        res = fn(res, control, name);
      }
    });
    return res;
  }

  _included(controlName: string): boolean {
    var isOptional = StringMapWrapper.contains(this._optionals, controlName);
    return !isOptional || StringMapWrapper.get(this._optionals, controlName);
  }
}

/**
 * Defines a part of a form, of variable length, that can contain other controls.
 *
 * A `ControlArray` aggregates the values and errors of each {@link Control} in the group. Thus, if
 * one of the controls
 * in a group is invalid, the entire group is invalid. Similarly, if a control changes its value,
 * the entire group
 * changes as well.
 *
 * `ControlArray` is one of the three fundamental building blocks used to define forms in Angular,
 * along with
 * {@link Control} and {@link ControlGroup}. {@link ControlGroup} can also contain other controls,
 * but is of fixed
 * length.
 *
 * @exportedAs angular2/forms
 */
export class ControlArray extends AbstractControl {
  controls: List<AbstractControl>;

  constructor(controls: List<AbstractControl>, validator: Function = Validators.array) {
    super(validator);
    this.controls = controls;

    this._valueChanges = new EventEmitter();

    this._setParentForControls();
    this._updateValue();
    this.updateValidity({onlySelf: true});
  }

  at(index: number): AbstractControl { return this.controls[index]; }

  push(control: AbstractControl): void {
    ListWrapper.push(this.controls, control);
    control.setParent(this);
    this.updateValueAndValidity();
  }

  insert(index: number, control: AbstractControl): void {
    ListWrapper.insert(this.controls, index, control);
    control.setParent(this);
    this.updateValueAndValidity();
  }

  removeAt(index: number): void {
    ListWrapper.removeAt(this.controls, index);
    this.updateValueAndValidity();
  }

  get length(): number { return this.controls.length; }

  _updateValue() { this._value = ListWrapper.map(this.controls, (c) => c.value); }

  _setParentForControls() {
    ListWrapper.forEach(this.controls, (control) => { control.setParent(this); });
  }
}
