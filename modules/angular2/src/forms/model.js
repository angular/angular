import {isPresent} from 'angular2/src/facade/lang';
import {StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {nullValidator, controlGroupValidator} from './validators';

export const VALID = "VALID";
export const INVALID = "INVALID";

//interface IControl {
//  get value():any;
//  validator:Function;
//  get status():string;
//  get errors():Map;
//  get active():boolean {}
//  updateValue(value:any){}
//  setParent(parent){}
//}

export class Control {
  _value:any;
  _status:string;
  _errors;
  _updated:boolean;
  _parent:ControlGroup;
  validator:Function;

  constructor(value:any, validator:Function = nullValidator) {
    this._value = value;
    this.validator = validator;
    this._updated = true;
  }

  updateValue(value:any) {
    this._value = value;
    this._updated = true;
    this._updateParent();
  }

  get active():boolean {
    return true;
  }

  get value() {
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
    if (this._updated) {
      this._updated = false;
      this._errors = this.validator(this);
      this._status = isPresent(this._errors) ? INVALID : VALID;
    }
  }

  _updateParent() {
    if (isPresent(this._parent)){
      this._parent._controlChanged();
    }
  }
}

export class ControlGroup {
  _value:any;
  _status:string;
  _errors;
  _updated:boolean;
  validator:Function;
  controls;

  constructor(controls, validator:Function = controlGroupValidator) {
    this.controls = controls;
    this.validator = validator;
    this._updated = true;
    this._setParentForControls();
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

  _setParentForControls() {
    StringMapWrapper.forEach(this.controls, (control, name) => {
      control.setParent(this);
    });
  }

  _updateIfNeeded() {
    if (this._updated) {
      this._updated = false;
      this._value = this._reduceValue();
      this._errors = this.validator(this);
      this._status = isPresent(this._errors) ? INVALID : VALID;
    }
  }

  _reduceValue() {
    var newValue = {};
    StringMapWrapper.forEach(this.controls, (control, name) => {
      if (control.active) {
        newValue[name] = control.value;
      }
    });
    return newValue;
  }

  _controlChanged() {
    this._updated = true;
  }
}

export class OptionalControl {
  _control:Control;
  _cond:boolean;

  constructor(control:Control, cond:boolean) {
    super();
    this._control = control;
    this._cond = cond;
  }

  get active():boolean {
    return this._cond;
  }

  get value() {
    return this._control.value;
  }

  get status() {
    return this._control.status;
  }

  get errors() {
    return this._control.errors;
  }

  set validator(v) {
    this._control.validator = v;
  }

  get validator() {
    return this._control.validator;
  }

  set cond(value:boolean){
    this._cond = value;
    this._control._updateParent();
  }

  get cond():boolean{
    return this._cond;
  }

  updateValue(value:any){
    this._control.updateValue(value);
  }

  setParent(parent){
    this._control.setParent(parent);
  }
}