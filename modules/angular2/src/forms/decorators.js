import {Decorator, NgElement, Ancestor} from 'angular2/core';
import {DOM} from 'angular2/src/facade/dom';
import {isPresent} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {ControlGroup, Control} from './model';

@Decorator({
  selector: '[control-name]',
  bind: {
    'control-name' : 'controlName'
  }
})
export class ControlDecorator {
  _groupDecorator:ControlGroupDecorator;
  _el:NgElement;
  _controlName:String;

  constructor(@Ancestor() groupDecorator:ControlGroupDecorator, el:NgElement) {
    this._groupDecorator = groupDecorator;
    groupDecorator.addControlDecorator(this);

    this._el = el;
    DOM.on(el.domElement, "change", (_) => this._updateControl());
  }

  set controlName(name:string) {
    this._controlName = name;
    this._updateDOM();
  }

  _updateDOM() {
    // remove it once all DOM write go throuh a queue
    if (isPresent(this._controlName)) {
      var inputElem: any = this._el.domElement;
      inputElem.value = this._control().value;
    }
  }

  _updateControl() {
    var inputElem: any = this._el.domElement;
    this._control().value = inputElem.value;
  }

  _control() {
    return this._groupDecorator.findControl(this._controlName);
  }
}

@Decorator({
  selector: '[control-group]',
  bind: {
    'control-group' : 'controlGroup'
  }
})
export class ControlGroupDecorator {
  _controlGroup:ControlGroup;
  _controlDecorators:List<ControlDecorator>;

  constructor() {
    this._controlDecorators = ListWrapper.create();
  }

  set controlGroup(controlGroup:ControlGroup) {
    this._controlGroup = controlGroup;
    ListWrapper.forEach(this._controlDecorators, (cd) => cd._updateDOM());
  }

  addControlDecorator(c:ControlDecorator) {
    ListWrapper.push(this._controlDecorators, c);
  }

  findControl(name:string):Control {
    return this._controlGroup.controls[name];
  }
}
