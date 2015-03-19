import {isPresent} from 'angular2/src/facade/lang';
import {StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {Validators} from './validators';

export const VALID = "VALID";
export const INVALID = "INVALID";

//interface IControl {
//  get value():any;
//  validator:Function;
//  get status():string;
//  get valid():boolean;
//  get errors():Map;
//  get pristine():boolean;
//  get dirty():boolean;
//  updateValue(value:any){}
//  setParent(parent){}
//}

export class AbstractControl {
  _value:any;
  _status:string;
  _errors;
  _updateNeeded:boolean;
  _pristine:boolean;
  _parent:ControlGroup;
  validator:Function;

  constructor(validator:Function) {
    this.validator = validator;
    this._updateNeeded = true;
    this._pristine = true;
  }

  get value() {
    this._updateIfNeeded();
    return this._value;
  }

  get status() {
    this._updateIfNeeded();
    return this._status;
  }

  get valid() {
    this._updateIfNeeded();
    return this._status === VALID;
  }

  get errors() {
    this._updateIfNeeded();
    return this._errors;
  }

  get pristine() {
    this._updateIfNeeded();
    return this._pristine;
  }

  get dirty() {
    return ! this.pristine;
  }

  setParent(parent){
    this._parent = parent;
  }

  _updateIfNeeded() {
  }

  _updateParent() {
    if (isPresent(this._parent)){
      this._parent._controlChanged();
    }
  }
}

export class Control extends AbstractControl {
  constructor(value:any, validator:Function = Validators.nullValidator) {
    super(validator);
    this._value = value;
  }

  updateValue(value:any) {
    this._value = value;
    this._updateNeeded = true;
    this._pristine = false;
    this._updateParent();
  }

  _updateIfNeeded() {
    if (this._updateNeeded) {
      this._updateNeeded = false;
      this._errors = this.validator(this);
      this._status = isPresent(this._errors) ? INVALID : VALID;
    }
  }
}

export class ControlGroup extends AbstractControl {
  controls;
  optionals;

  constructor(controls, optionals = null, validator:Function = Validators.group) {
    super(validator);
    this.controls = controls;
    this.optionals = isPresent(optionals) ? optionals : {};
    this._setParentForControls();
  }

  include(controlName:string) {
    this._updateNeeded = true;
    StringMapWrapper.set(this.optionals, controlName, true);
  }

  exclude(controlName:string) {
    this._updateNeeded = true;
    StringMapWrapper.set(this.optionals, controlName, false);
  }

  contains(controlName:string) {
    var c = StringMapWrapper.contains(this.controls, controlName);
    return c && this._included(controlName);
  }

  _setParentForControls() {
    StringMapWrapper.forEach(this.controls, (control, name) => {
      control.setParent(this);
    });
  }

  _updateIfNeeded() {
    if (this._updateNeeded) {
      this._updateNeeded = false;
      this._value = this._reduceValue();
      this._pristine = this._reducePristine();
      this._errors = this.validator(this);
      this._status = isPresent(this._errors) ? INVALID : VALID;
    }
  }

  _reduceValue() {
    return this._reduceChildren({}, (acc, control, name) => {
      acc[name] = control.value;
      return acc;
    });
  }

  _reducePristine() {
    return this._reduceChildren(true,
      (acc, control, name) => acc && control.pristine);
  }

  _reduceChildren(initValue, fn:Function) {
    var res = initValue;
    StringMapWrapper.forEach(this.controls, (control, name) => {
      if (this._included(name)) {
        res = fn(res, control, name);
      }
    });
    return res;
  }

  _controlChanged() {
    this._updateNeeded = true;
    this._updateParent();
  }

  _included(controlName:string):boolean {
    var isOptional = StringMapWrapper.contains(this.optionals, controlName);
    return !isOptional || StringMapWrapper.get(this.optionals, controlName);
  }
}