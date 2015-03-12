import {isPresent} from 'angular2/src/facade/lang';
import {StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {nullValidator, controlGroupValidator} from './validators';

export const VALID = "VALID";
export const INVALID = "INVALID";

//interface IControl {
//  get value():any;
//  validator:Function;
//  get status():string;
//  get valid():boolean;
//  get errors():Map;
//  updateValue(value:any){}
//  setParent(parent){}
//}

export class AbstractControl {
  _value:any;
  _status:string;
  _errors;
  _dirty:boolean;
  _parent:ControlGroup;
  validator:Function;

  constructor(validator:Function = nullValidator) {
    this.validator = validator;
    this._dirty = true;
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
  constructor(value:any, validator:Function = nullValidator) {
    super(validator);
    this._value = value;
  }

  updateValue(value:any) {
    this._value = value;
    this._dirty = true;
    this._updateParent();
  }

  _updateIfNeeded() {
    if (this._dirty) {
      this._dirty = false;
      this._errors = this.validator(this);
      this._status = isPresent(this._errors) ? INVALID : VALID;
    }
  }
}

export class ControlGroup extends AbstractControl {
  controls;
  optionals;

  constructor(controls, optionals = null, validator:Function = controlGroupValidator) {
    super(validator);
    this.controls = controls;
    this.optionals = isPresent(optionals) ? optionals : {};
    this._setParentForControls();
  }

  include(controlName:string) {
    this._dirty = true;
    StringMapWrapper.set(this.optionals, controlName, true);
  }

  exclude(controlName:string) {
    this._dirty = true;
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
    if (this._dirty) {
      this._dirty = false;
      this._value = this._reduceValue();
      this._errors = this.validator(this);
      this._status = isPresent(this._errors) ? INVALID : VALID;
    }
  }

  _reduceValue() {
    var newValue = {};
    StringMapWrapper.forEach(this.controls, (control, name) => {
      if (this._included(name)) {
        newValue[name] = control.value;
      }
    });
    return newValue;
  }

  _controlChanged() {
    this._dirty = true;
    this._updateParent();
  }

  _included(controlName:string):boolean {
    var isOptional = StringMapWrapper.contains(this.optionals, controlName);
    return !isOptional || StringMapWrapper.get(this.optionals, controlName);
  }
}