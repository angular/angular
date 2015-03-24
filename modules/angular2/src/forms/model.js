import {isPresent} from 'angular2/src/facade/lang';
import {Observable, ObservableWrapper} from 'angular2/src/facade/async';
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
  _pristine:boolean;
  _parent:ControlGroup;
  validator:Function;

  constructor(validator:Function) {
    this.validator = validator;
    this._pristine = true;
  }

  get value() {
    return this._value;
  }

  get status() {
    return this._status;
  }

  get valid() {
    return this._status === VALID;
  }

  get errors() {
    return this._errors;
  }

  get pristine() {
    return this._pristine;
  }

  get dirty() {
    return ! this.pristine;
  }

  setParent(parent){
    this._parent = parent;
  }

  _updateParent() {
    if (isPresent(this._parent)){
      this._parent._updateValue();
    }
  }
}

export class Control extends AbstractControl {
  valueChanges:Observable;
  _valueChangesController;

  constructor(value:any, validator:Function = Validators.nullValidator) {
    super(validator);
    this._setValueErrorsStatus(value);

    this._valueChangesController = ObservableWrapper.createController();
    this.valueChanges = ObservableWrapper.createObservable(this._valueChangesController);
  }

  updateValue(value:any) {
    this._setValueErrorsStatus(value);
    this._pristine = false;

    ObservableWrapper.callNext(this._valueChangesController, this._value);

    this._updateParent();
  }

  _setValueErrorsStatus(value)  {
    this._value = value;
    this._errors = this.validator(this);
    this._status = isPresent(this._errors) ? INVALID : VALID;
  }
}

export class ControlGroup extends AbstractControl {
  controls;
  optionals;

  valueChanges:Observable;
  _valueChangesController;

  constructor(controls, optionals = null, validator:Function = Validators.group) {
    super(validator);
    this.controls = controls;
    this.optionals = isPresent(optionals) ? optionals : {};

    this._valueChangesController = ObservableWrapper.createController();
    this.valueChanges = ObservableWrapper.createObservable(this._valueChangesController);

    this._setParentForControls();
    this._setValueErrorsStatus();
  }

  include(controlName:string) {
    StringMapWrapper.set(this.optionals, controlName, true);
    this._updateValue();
  }

  exclude(controlName:string) {
    StringMapWrapper.set(this.optionals, controlName, false);
    this._updateValue();
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

  _updateValue() {
    this._setValueErrorsStatus();
    this._pristine = false;

    ObservableWrapper.callNext(this._valueChangesController, this._value);

    this._updateParent();
  }

  _setValueErrorsStatus()  {
    this._value = this._reduceValue();
    this._errors = this.validator(this);
    this._status = isPresent(this._errors) ? INVALID : VALID;
  }

  _reduceValue() {
    return this._reduceChildren({}, (acc, control, name) => {
      acc[name] = control.value;
      return acc;
    });
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

  _included(controlName:string):boolean {
    var isOptional = StringMapWrapper.contains(this.optionals, controlName);
    return !isOptional || StringMapWrapper.get(this.optionals, controlName);
  }
}