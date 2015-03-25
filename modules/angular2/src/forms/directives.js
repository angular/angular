import {Template, Component, Decorator, Ancestor, onChange, PropertySetter} from 'angular2/angular2';
import {Optional} from 'angular2/di';
import {isBlank, isPresent, isString, CONST} from 'angular2/src/facade/lang';
import {StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {ControlGroup, Control} from './model';
import {Validators} from './validators';

//export interface ControlValueAccessor {
//  writeValue(value):void{}
//  set onChange(fn){}
//}

@Decorator({
  selector: '[control]',
  events: {
    'change' : 'onChange($event.target.value)',
    'input' : 'onChange($event.target.value)'
  }
})
export class DefaultValueAccessor {
  _setValueProperty:Function;
  onChange:Function;

  constructor(@PropertySetter('value') setValueProperty:Function) {
    super();
    this._setValueProperty = setValueProperty;
    this.onChange = (_) => {};
  }

  writeValue(value) {
    this._setValueProperty(value);
  }
}

@Decorator({
  selector: 'input[type=checkbox]', //should be input[type=checkbox][control]
  // change the selector once https://github.com/angular/angular/issues/1025 is fixed
  events: {
    'change' : 'onChange($event.target.checked)'
  }
})
export class CheckboxControlValueAccessor {
  _setCheckedProperty:Function;
  onChange:Function;

  constructor(cd:ControlDirective, @PropertySetter('checked') setCheckedProperty:Function) {
    super();
    this._setCheckedProperty = setCheckedProperty;
    this.onChange = (_) => {};
    cd.valueAccessor = this; //ControlDirective should inject CheckboxControlDirective
  }

  writeValue(value) {
    this._setCheckedProperty(value);
  }
}

@Decorator({
  lifecycle: [onChange],
  selector: '[control]',
  bind: {
    'controlOrName' : 'control'
  }
})
export class ControlDirective {
  _groupDirective:ControlGroupDirective;

  controlOrName:any;
  valueAccessor:any; //ControlValueAccessor

  validator:Function;

  constructor(@Optional() @Ancestor() groupDirective:ControlGroupDirective, valueAccessor:DefaultValueAccessor)  {
    this._groupDirective = groupDirective;
    this.controlOrName = null;
    this.valueAccessor = valueAccessor;
    this.validator = Validators.nullValidator;
  }

  // TODO: vsavkin this should be moved into the constructor once static bindings
  // are implemented
  onChange(_) {
    this._initialize();
  }

  _initialize() {
    if(isPresent(this._groupDirective)) {
      this._groupDirective.addDirective(this);
    }

    var c = this._control();
    c.validator = Validators.compose([c.validator, this.validator]);

    this._updateDomValue();
    this._setUpUpdateControlValue();
  }

  _updateDomValue() {
    this.valueAccessor.writeValue(this._control().value);
  }

  _setUpUpdateControlValue() {
    this.valueAccessor.onChange = (newValue) => this._control().updateValue(newValue);
  }

  _control() {
    if (isString(this.controlOrName)) {
      return this._groupDirective.findControl(this.controlOrName);
    } else {
      return this.controlOrName;
    }
  }
}

@Decorator({
  selector: '[control-group]',
  bind: {
    'controlGroup' : 'control-group'
  }
})
export class ControlGroupDirective {
  _groupDirective:ControlGroupDirective;
  _controlGroupName:string;

  _controlGroup:ControlGroup;
  _directives:List<ControlDirective>;

  constructor(@Optional() @Ancestor() groupDirective:ControlGroupDirective) {
    super();
    this._groupDirective = groupDirective;
    this._directives = ListWrapper.create();
  }

  set controlGroup(controlGroup) {
    if (isString(controlGroup)) {
      this._controlGroupName = controlGroup;
    } else {
      this._controlGroup = controlGroup;
    }
    this._updateDomValue();
  }

  _updateDomValue() {
    ListWrapper.forEach(this._directives, (cd) => cd._updateDomValue());
  }

  addDirective(c:ControlDirective) {
    ListWrapper.push(this._directives, c);
  }

  findControl(name:string):any {
    return this._getControlGroup().controls[name];
  }

  _getControlGroup():ControlGroup {
    if (isPresent(this._controlGroupName)) {
      return this._groupDirective.findControl(this._controlGroupName)
    } else {
      return this._controlGroup;
    }
  }
}

export var FormDirectives = [
  ControlGroupDirective, ControlDirective, CheckboxControlValueAccessor, DefaultValueAccessor
];
