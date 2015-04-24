import {isPresent} from 'angular2/src/facade/lang';
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

/**
 * Omitting from external API doc as this is really an abstract internal concept.
 */
class AbstractControl {
  _value:any;
  _status:string;
  _errors:StringMap;
  _pristine:boolean;
  _parent:any; /* ControlGroup | ControlArray */
  validator:Function;

  _valueChanges:EventEmitter;

  constructor(validator:Function) {
    this.validator = validator;
    this._pristine = true;
  }

  get value():any {
    return this._value;
  }

  get status():string {
    return this._status;
  }

  get valid():boolean {
    return this._status === VALID;
  }

  get errors():StringMap {
    return this._errors;
  }

  get pristine():boolean {
    return this._pristine;
  }

  get dirty():boolean {
    return ! this.pristine;
  }

  get valueChanges():Observable {
    return this._valueChanges;
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

/**
 * Defines a part of a form that cannot be divided into other controls.
 *
 * `Control` is one of the three fundamental building blocks used to define forms in Angular, along with 
 * {@link ControlGroup} and {@link ControlArray}.
 *
 * @exportedAs angular2/forms
 */
export class Control extends AbstractControl {
  constructor(value:any, validator:Function = Validators.nullValidator) {
    super(validator);
    this._setValueErrorsStatus(value);
    this._valueChanges = new EventEmitter();
  }

  updateValue(value:any):void {
    this._setValueErrorsStatus(value);
    this._pristine = false;

    ObservableWrapper.callNext(this._valueChanges, this._value);

    this._updateParent();
  }

  _setValueErrorsStatus(value)  {
    this._value = value;
    this._errors = this.validator(this);
    this._status = isPresent(this._errors) ? INVALID : VALID;
  }
}

/**
 * Defines a part of a form, of fixed length, that can contain other controls.
 *
 * A ControlGroup aggregates the values and errors of each {@link Control} in the group. Thus, if one of the controls 
 * in a group is invalid, the entire group is invalid. Similarly, if a control changes its value, the entire group 
 * changes as well.
 *
 * `ControlGroup` is one of the three fundamental building blocks used to define forms in Angular, along with 
 * {@link Control} and {@link ControlArray}. {@link ControlArray} can also contain other controls, but is of variable 
 * length.
 *
 * @exportedAs angular2/forms
 */
export class ControlGroup extends AbstractControl {
  controls:StringMap;
  _optionals:StringMap;

  constructor(controls:StringMap, optionals:StringMap = null, validator:Function = Validators.group) {
    super(validator);
    this.controls = controls;
    this._optionals = isPresent(optionals) ? optionals : {};

    this._valueChanges = new EventEmitter();

    this._setParentForControls();
    this._setValueErrorsStatus();
  }

  include(controlName:string):void {
    StringMapWrapper.set(this._optionals, controlName, true);
    this._updateValue();
  }

  exclude(controlName:string):void {
    StringMapWrapper.set(this._optionals, controlName, false);
    this._updateValue();
  }

  contains(controlName:string):boolean {
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

    ObservableWrapper.callNext(this._valueChanges, this._value);

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

  _reduceChildren(initValue:any, fn:Function) {
    var res = initValue;
    StringMapWrapper.forEach(this.controls, (control, name) => {
      if (this._included(name)) {
        res = fn(res, control, name);
      }
    });
    return res;
  }

  _included(controlName:string):boolean {
    var isOptional = StringMapWrapper.contains(this._optionals, controlName);
    return !isOptional || StringMapWrapper.get(this._optionals, controlName);
  }
}

/**
 * Defines a part of a form, of variable length, that can contain other controls.
 *
 * A `ControlArray` aggregates the values and errors of each {@link Control} in the group. Thus, if one of the controls 
 * in a group is invalid, the entire group is invalid. Similarly, if a control changes its value, the entire group 
 * changes as well.
 *
 * `ControlArray` is one of the three fundamental building blocks used to define forms in Angular, along with 
 * {@link Control} and {@link ControlGroup}. {@link ControlGroup} can also contain other controls, but is of fixed 
 * length.
 *
 * @exportedAs angular2/forms
 */
export class ControlArray extends AbstractControl {
  controls:List;

  constructor(controls:List<AbstractControl>, validator:Function = Validators.array) {
    super(validator);
    this.controls = controls;

    this._valueChanges = new EventEmitter();

    this._setParentForControls();
    this._setValueErrorsStatus();
  }

  at(index:number):AbstractControl {
    return this.controls[index];
  }

  push(control:AbstractControl):void {
    ListWrapper.push(this.controls, control);
    control.setParent(this);
    this._updateValue();
  }

  insert(index:number, control:AbstractControl):void {
    ListWrapper.insert(this.controls, index, control);
    control.setParent(this);
    this._updateValue();
  }

  removeAt(index:number):void {
    ListWrapper.removeAt(this.controls, index);
    this._updateValue();
  }

  get length():number {
    return this.controls.length;
  }

  _updateValue() {
    this._setValueErrorsStatus();
    this._pristine = false;

    ObservableWrapper.callNext(this._valueChanges, this._value);

    this._updateParent();
  }

  _setParentForControls() {
    ListWrapper.forEach(this.controls, (control) => {
      control.setParent(this);
    });
  }

  _setValueErrorsStatus()  {
    this._value = ListWrapper.map(this.controls, (c) => c.value);
    this._errors = this.validator(this);
    this._status = isPresent(this._errors) ? INVALID : VALID;
  }
}
