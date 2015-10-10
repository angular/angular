import {StringWrapper, isPresent, isBlank, normalizeBool} from 'angular2/src/core/facade/lang';
import {Observable, EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {StringMapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {Validators} from './validators';

/**
 * Indicates that a Control is valid, i.e. that no errors exist in the input value.
 */
export const VALID = "VALID";

/**
 * Indicates that a Control is invalid, i.e. that an error exists in the input value.
 */
export const INVALID = "INVALID";

export function isControl(control: Object): boolean {
  return control instanceof AbstractControl;
}

function _find(control: AbstractControl, path: Array<string | number>| string) {
  if (isBlank(path)) return null;

  if (!(path instanceof Array)) {
    path = (<string>path).split("/");
  }
  if (path instanceof Array && ListWrapper.isEmpty(path)) return null;

  return ListWrapper.reduce(<Array<string | number>>path, (v, name) => {
    if (v instanceof ControlGroup) {
      return isPresent(v.controls[name]) ? v.controls[name] : null;
    } else if (v instanceof ControlArray) {
      var index = <number>name;
      return isPresent(v.at(index)) ? v.at(index) : null;
    } else {
      return null;
    }
  }, control);
}

/**
 * Omitting from external API doc as this is really an abstract internal concept.
 */
export class AbstractControl {
  /** @internal */
  _value: any;
  /** @internal */
  _status: string;
  /** @internal */
  _errors: {[key: string]: any};
  /** @internal */
  _pristine: boolean = true;
  /** @internal */
  _touched: boolean = false;
  /** @internal */
  _parent: ControlGroup | ControlArray;
  /** @internal */
  _valueChanges: EventEmitter;

  constructor(public validator: Function) {}

  get value(): any { return this._value; }

  get status(): string { return this._status; }

  get valid(): boolean { return this._status === VALID; }

  get errors(): {[key: string]: any} { return this._errors; }

  get pristine(): boolean { return this._pristine; }

  get dirty(): boolean { return !this.pristine; }

  get touched(): boolean { return this._touched; }

  get untouched(): boolean { return !this._touched; }

  get valueChanges(): Observable { return this._valueChanges; }

  markAsTouched(): void { this._touched = true; }

  markAsDirty({onlySelf}: {onlySelf?: boolean} = {}): void {
    onlySelf = normalizeBool(onlySelf);
    this._pristine = false;

    if (isPresent(this._parent) && !onlySelf) {
      this._parent.markAsDirty({onlySelf: onlySelf});
    }
  }

  setParent(parent: ControlGroup | ControlArray): void { this._parent = parent; }

  updateValidity({onlySelf}: {onlySelf?: boolean} = {}): void {
    onlySelf = normalizeBool(onlySelf);

    this._errors = this.validator(this);
    this._status = isPresent(this._errors) ? INVALID : VALID;

    if (isPresent(this._parent) && !onlySelf) {
      this._parent.updateValidity({onlySelf: onlySelf});
    }
  }

  updateValueAndValidity({onlySelf, emitEvent}: {onlySelf?: boolean, emitEvent?: boolean} = {}):
      void {
    onlySelf = normalizeBool(onlySelf);
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

  find(path: Array<string | number>| string): AbstractControl { return _find(this, path); }

  getError(errorCode: string, path: string[] = null): any {
    var control = isPresent(path) && !ListWrapper.isEmpty(path) ? this.find(path) : this;
    if (isPresent(control) && isPresent(control._errors)) {
      return StringMapWrapper.get(control._errors, errorCode);
    } else {
      return null;
    }
  }

  hasError(errorCode: string, path: string[] = null): boolean {
    return isPresent(this.getError(errorCode, path));
  }

  /** @internal */
  _updateValue(): void {}
}

/**
 * Defines a part of a form that cannot be divided into other controls. `Control`s have values and
 * validation state, which is determined by an optional validation function.
 *
 * `Control` is one of the three fundamental building blocks used to define forms in Angular, along
 * with {@link ControlGroup} and {@link ControlArray}.
 *
 * # Usage
 *
 * By default, a `Control` is created for every `<input>` or other form component.
 * With {@link NgFormControl} or {@link NgFormModel} an existing {@link Control} can be
 * bound to a DOM element instead. This `Control` can be configured with a custom
 * validation function.
 *
 * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
 */
export class Control extends AbstractControl {
  /** @internal */
  _onChange: Function;

  constructor(value: any = null, validator: Function = Validators.nullValidator) {
    super(validator);
    this._value = value;
    this.updateValidity({onlySelf: true});
    this._valueChanges = new EventEmitter();
  }

  /**
   * Set the value of the control to `value`.
   *
   * If `onlySelf` is `true`, this change will only affect the validation of this `Control`
   * and not its parent component. If `emitEvent` is `true`, this change will cause a
   * `valueChanges` event on the `Control` to be emitted. Both of these options default to
   * `false`.
   *
   * If `emitModelToViewChange` is `true`, the view will be notified about the new value
   * via an `onChange` event. This is the default behavior if `emitModelToViewChange` is not
   * specified.
   */
  updateValue(value: any,
              {onlySelf, emitEvent, emitModelToViewChange}:
                  {onlySelf?: boolean, emitEvent?: boolean, emitModelToViewChange?: boolean} = {}):
      void {
    emitModelToViewChange = isPresent(emitModelToViewChange) ? emitModelToViewChange : true;
    this._value = value;
    if (isPresent(this._onChange) && emitModelToViewChange) this._onChange(this._value);
    this.updateValueAndValidity({onlySelf: onlySelf, emitEvent: emitEvent});
  }

  /**
   * Register a listener for change events.
   */
  registerOnChange(fn: Function): void { this._onChange = fn; }
}

/**
 * Defines a part of a form, of fixed length, that can contain other controls.
 *
 * A `ControlGroup` aggregates the values and errors of each {@link Control} in the group. Thus, if
 * one of the controls in a group is invalid, the entire group is invalid. Similarly, if a control
 * changes its value, the entire group changes as well.
 *
 * `ControlGroup` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link Control} and {@link ControlArray}. {@link ControlArray} can also contain other
 * controls, but is of variable length.
 *
 * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
 */
export class ControlGroup extends AbstractControl {
  private _optionals: {[key: string]: boolean};

  constructor(public controls: {[key: string]: AbstractControl},
              optionals: {[key: string]: boolean} = null, validator: Function = Validators.group) {
    super(validator);
    this._optionals = isPresent(optionals) ? optionals : {};
    this._valueChanges = new EventEmitter();

    this._setParentForControls();
    this._value = this._reduceValue();
    this.updateValidity({onlySelf: true});
  }

  addControl(name: string, control: AbstractControl): void {
    this.controls[name] = control;
    control.setParent(this);
  }

  removeControl(name: string): void { StringMapWrapper.delete(this.controls, name); }

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

  /** @internal */
  _setParentForControls() {
    StringMapWrapper.forEach(this.controls, (control, name) => { control.setParent(this); });
  }

  /** @internal */
  _updateValue() { this._value = this._reduceValue(); }

  /** @internal */
  _reduceValue() {
    return this._reduceChildren({}, (acc, control, name) => {
      acc[name] = control.value;
      return acc;
    });
  }

  /** @internal */
  _reduceChildren(initValue: any, fn: Function) {
    var res = initValue;
    StringMapWrapper.forEach(this.controls, (control, name) => {
      if (this._included(name)) {
        res = fn(res, control, name);
      }
    });
    return res;
  }

  /** @internal */
  _included(controlName: string): boolean {
    var isOptional = StringMapWrapper.contains(this._optionals, controlName);
    return !isOptional || StringMapWrapper.get(this._optionals, controlName);
  }
}

/**
 * Defines a part of a form, of variable length, that can contain other controls.
 *
 * A `ControlArray` aggregates the values and errors of each {@link Control} in the group. Thus, if
 * one of the controls in a group is invalid, the entire group is invalid. Similarly, if a control
 * changes its value, the entire group changes as well.
 *
 * `ControlArray` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link Control} and {@link ControlGroup}. {@link ControlGroup} can also contain
 * other controls, but is of fixed length.
 *
 * # Adding or removing controls
 *
 * To change the controls in the array, use the `push`, `insert`, or `removeAt` methods
 * in `ControlArray` itself. These methods ensure the controls are properly tracked in the
 * form's hierarchy. Do not modify the array of `AbstractControl`s used to instantiate
 * the `ControlArray` directly, as that will result in strange and unexpected behavior such
 * as broken change detection.
 *
 * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
 */
export class ControlArray extends AbstractControl {
  constructor(public controls: AbstractControl[], validator: Function = Validators.array) {
    super(validator);

    this._valueChanges = new EventEmitter();

    this._setParentForControls();
    this._updateValue();
    this.updateValidity({onlySelf: true});
  }

  /**
   * Get the {@link AbstractControl} at the given `index` in the array.
   */
  at(index: number): AbstractControl { return this.controls[index]; }

  /**
   * Insert a new {@link AbstractControl} at the end of the array.
   */
  push(control: AbstractControl): void {
    this.controls.push(control);
    control.setParent(this);
    this.updateValueAndValidity();
  }

  /**
   * Insert a new {@link AbstractControl} at the given `index` in the array.
   */
  insert(index: number, control: AbstractControl): void {
    ListWrapper.insert(this.controls, index, control);
    control.setParent(this);
    this.updateValueAndValidity();
  }

  /**
   * Remove the control at the given `index` in the array.
   */
  removeAt(index: number): void {
    ListWrapper.removeAt(this.controls, index);
    this.updateValueAndValidity();
  }

  /**
   * Get the length of the control array.
   */
  get length(): number { return this.controls.length; }

  /** @internal */
  _updateValue(): void { this._value = this.controls.map((control) => control.value); }

  /** @internal */
  _setParentForControls(): void {
    this.controls.forEach((control) => { control.setParent(this); });
  }
}
