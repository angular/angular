import {Template, Component, Decorator, NgElement, Ancestor, onChange} from 'angular2/core';
import {DOM} from 'angular2/src/facade/dom';
import {isBlank, isPresent, CONST} from 'angular2/src/facade/lang';
import {StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {ControlGroup, Control} from './model';
import * as validators from './validators';

class ControlGroupDirectiveBase {
  addDirective(directive):void {}
  findControl(name:string):Control { return null; }
}

@CONST()
export class ControlValueAccessor {
  readValue(el){}
  writeValue(el, value):void {}
}

@CONST()
class DefaultControlValueAccessor extends ControlValueAccessor {
  constructor() {
    super();
  }

  readValue(el) {
    return DOM.getValue(el);
  }

  writeValue(el, value):void {
    DOM.setValue(el,value);
  }
}

@CONST()
class CheckboxControlValueAccessor extends ControlValueAccessor {
  constructor() {
    super();
  }

  readValue(el):boolean {
    return DOM.getChecked(el);
  }

  writeValue(el, value:boolean):void {
    DOM.setChecked(el, value);
  }
}

var controlValueAccessors = {
  "checkbox" : new CheckboxControlValueAccessor(),
  "text" : new DefaultControlValueAccessor()
};

function controlValueAccessorFor(controlType:string):ControlValueAccessor {
  var accessor = StringMapWrapper.get(controlValueAccessors, controlType);
  if (isPresent(accessor)) {
    return accessor;
  } else {
    return StringMapWrapper.get(controlValueAccessors, "text");
  }
}


export class ControlDirectiveBase {
  _groupDecorator:ControlGroupDirectiveBase;
  _el:NgElement;

  controlName:string;
  type:string;
  valueAccessor:ControlValueAccessor;

  validator:Function;

  constructor(groupDecorator, el:NgElement)  {
    this._groupDecorator = groupDecorator;
    this._el = el;
    this.validator = validators.nullValidator;
  }

  _initialize() {
    this._groupDecorator.addDirective(this);

    if (isPresent(this.validator)) {
      var c = this._control();
      c.validator = validators.compose([c.validator, this.validator]);
    }

    if (isBlank(this.valueAccessor)) {
      this.valueAccessor = controlValueAccessorFor(this.type);
    }
    this._updateDomValue();
    DOM.on(this._el.domElement, "change", (_) => this._updateControlValue());
  }

  _updateDomValue() {
    this.valueAccessor.writeValue(this._el.domElement, this._control().value);
  }

  _updateControlValue() {
    this._control().updateValue(this.valueAccessor.readValue(this._el.domElement));
  }

  _control() {
    return this._groupDecorator.findControl(this.controlName);
  }
}

@Decorator({
  lifecycle: [onChange],
  selector: '[control-name]',
  bind: {
    'controlName' : 'control-name',
    'type' : 'type'
  }
})
export class ControlNameDirective extends ControlDirectiveBase {
  constructor(@Ancestor() groupDecorator:ControlGroupDirective, el:NgElement) {
    super(groupDecorator, el);
  }

  onChange(_) {
    this._initialize();
  }
}

@Decorator({
  lifecycle: [onChange],
  selector: '[control]',
  bind: {
    'controlName' : 'control',
    'type' : 'type'
  }
})
export class ControlDirective extends ControlDirectiveBase {
  constructor(@Ancestor() groupDecorator:NewControlGroupDirective, el:NgElement) {
    super(groupDecorator, el);
  }

  onChange(_) {
    this._initialize();
  }
}

@Decorator({
  selector: '[control-group]',
  bind: {
    'controlGroup' : 'control-group'
  }
})
export class ControlGroupDirective extends ControlGroupDirectiveBase {
  _controlGroup:ControlGroup;
  _directives:List<ControlNameDirective>;

  constructor() {
    super();
    this._directives = ListWrapper.create();
  }

  set controlGroup(controlGroup:ControlGroup) {
    this._controlGroup = controlGroup;
    ListWrapper.forEach(this._directives, (cd) => cd._updateDomValue());
  }

  addDirective(c:ControlNameDirective) {
    ListWrapper.push(this._directives, c);
  }

  findControl(name:string):Control {
    return this._controlGroup.controls[name];
  }
}

@Component({
  selector: '[new-control-group]',
  bind: {
    'initData' : 'new-control-group'
  }
})
@Template({inline: '<content>'})
export class NewControlGroupDirective extends ControlGroupDirectiveBase {
  _initData:any;
  _controlGroup:ControlGroup;
  _directives:List<ControlNameDirective>;

  constructor() {
    super();
    this._directives = ListWrapper.create();
  }

  set initData(value) {
    this._initData = value;
  }

  addDirective(c:ControlDirective) {
    ListWrapper.push(this._directives, c);
    this._controlGroup = null;
  }

  findControl(name:string):Control {
    if (isBlank(this._controlGroup)) {
      this._controlGroup = this._createControlGroup();
    }
    return this._controlGroup.controls[name];
  }

  _createControlGroup():ControlGroup {
    var controls = ListWrapper.reduce(this._directives, (memo, cd) => {
      var initControlValue = this._initData[cd.controlName];
      memo[cd.controlName] = new Control(initControlValue);
      return memo;
    }, {});
    return new ControlGroup(controls);
  }

  get value() {
    return this._controlGroup.value;
  }

  get errors() {
    return this._controlGroup.errors;
  }

  get valid() {
    return this._controlGroup.valid;
  }
}

export var FormDirectives = [
  ControlGroupDirective, ControlNameDirective,
  ControlDirective, NewControlGroupDirective
];
