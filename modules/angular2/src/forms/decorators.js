import {TemplateConfig, Component, Decorator, NgElement, Ancestor} from 'angular2/core';
import {DOM} from 'angular2/src/facade/dom';
import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {ControlGroup, Control} from './model';

export class ControlDirectiveBase {
  _groupDecorator:ControlGroupDirectiveBase;
  _el:NgElement;
  _controlName:string;

  constructor(groupDecorator, el:NgElement)  {
    this._groupDecorator = groupDecorator;
    this._el = el;
    DOM.on(el.domElement, "change", (_) => this._updateControl());
  }

  set controlName(name:string) {
    this._controlName = name;
    this._groupDecorator.addDirective(this);
    this._updateDOM();
  }

  get controlName() {
    return this._controlName;
  }

  //TODO:vsavkin: Remove it once change detection lifecycle callbacks are available
  isInitialized():boolean {
    return isPresent(this._controlName);
  }

  _updateDOM() {
    // remove it once all DOM write go through a queue
    if (this.isInitialized()) {
      var inputElement:any = this._el.domElement;
      inputElement.value = this._control().value;
    }
  }

  _updateControl() {
    var inputElement:any = this._el.domElement;
    this._control().value = inputElement.value;
  }

  _control() {
    return this._groupDecorator.findControl(this._controlName);
  }
}

class ControlGroupDirectiveBase {
  addDirective(c:ControlNameDirective):void {}
  findControl(name:string):Control {}
}


@Decorator({
  selector: '[control-name]',
  bind: {
    'control-name' : 'controlName'
  }
})
export class ControlNameDirective extends ControlDirectiveBase {
  _groupDecorator:ControlGroupDirective;
  _el:NgElement;
  _controlName:String;

  constructor(@Ancestor() groupDecorator:ControlGroupDirective, el:NgElement) {
  super(groupDecorator, el);
}
}

@Decorator({
  selector: '[control]',
  bind: {
    'control' : 'controlName'
  }
})
export class ControlDirective extends ControlDirectiveBase {
  _groupDecorator:ControlGroupDirective;
  _el:NgElement;
  _controlName:String;

  constructor(@Ancestor() groupDecorator:NewControlGroupDirective, el:NgElement) {
  super(groupDecorator, el);
}
}

@Decorator({
  selector: '[control-group]',
  bind: {
    'control-group' : 'controlGroup'
  }
})
export class ControlGroupDirective extends ControlGroupDirectiveBase {
  _controlGroup:ControlGroup;
  _directives:List<ControlNameDirective>;

  constructor() {
    this._directives = ListWrapper.create();
  }

  set controlGroup(controlGroup:ControlGroup) {
    this._controlGroup = controlGroup;
    ListWrapper.forEach(this._directives, (cd) => cd._updateDOM());
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
    'new-control-group' : 'initData'
  },
  template: new TemplateConfig({
    inline: '<content>'
  })
})
export class NewControlGroupDirective extends ControlGroupDirectiveBase {
  _initData:any;
  _controlGroup:ControlGroup;
  _directives:List<ControlNameDirective>;

  constructor() {
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
      if (cd.isInitialized()) {
        var initControlValue = this._initData[cd.controlName];
        memo[cd.controlName] = new Control(initControlValue);
      }
      return memo;
    }, {});
    return new ControlGroup(controls);
  }

  get value() {
    return this._controlGroup.value;
  }
}
