import {isPresent} from 'angular2/src/facade/lang';
import {StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {nullValidator, controlGroupValidator} from './validators';

export const VALID = "VALID";
export const INVALID = "INVALID";

export class Control {
  value:any;
  validator:Function;
  status:string;
  errors;
  _parent:ControlGroup;

  constructor(value:any, validator:Function = nullValidator) {
    this.value = value;
    this.validator = validator;
    this._updateStatus();
  }

  updateValue(value:any) {
    this.value = value;
    this._updateStatus();
    this._updateParent();
  }

  get valid() {
    return this.status === VALID;
  }

  _updateStatus() {
    this.errors = this.validator(this);
    this.status = isPresent(this.errors) ? INVALID : VALID;
  }

  _updateParent() {
    if (isPresent(this._parent)){
      this._parent._controlChanged();
    }
  }
}

export class ControlGroup {
  controls;
  validator:Function;
  status:string;
  errors;

  constructor(controls, validator:Function = controlGroupValidator) {
    this.controls = controls;
    this.validator = validator;
    this._setParentForControls();
    this._updateStatus();
  }

  get value() {
    var res = {};
    StringMapWrapper.forEach(this.controls, (control, name) => {
      res[name] = control.value;
    });
    return res;
  }

  get valid() {
    return this.status === VALID;
  }

  _setParentForControls() {
    StringMapWrapper.forEach(this.controls, (control, name) => {
      control._parent = this;
    });
  }

  _updateStatus() {
    this.errors = this.validator(this);
    this.status = isPresent(this.errors) ? INVALID : VALID;
  }

  _controlChanged() {
    this._updateStatus();
  }
}
