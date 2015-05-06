import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {List} from 'angular2/src/facade/collection';

import {ElementBinder} from './element_binder';
import {NG_BINDING_CLASS} from '../util';

import {RenderProtoViewRef} from '../../api';

export function resolveInternalDomProtoView(protoViewRef:RenderProtoViewRef) {
  var domProtoViewRef:DomProtoViewRef = protoViewRef;
  return domProtoViewRef._protoView;
}

export class DomProtoViewRef extends RenderProtoViewRef {
  _protoView:DomProtoView;
  constructor(protoView:DomProtoView) {
    super();
    this._protoView = protoView;
  }
}

export class DomProtoView {
  element;
  elementBinders:List<ElementBinder>;
  isTemplateElement:boolean;
  rootBindingOffset:int;

  constructor({
    elementBinders,
    element
  }) {
    this.element = element;
    this.elementBinders = elementBinders;
    this.isTemplateElement = DOM.isTemplateElement(this.element);
    this.rootBindingOffset = (isPresent(this.element) && DOM.hasClass(this.element, NG_BINDING_CLASS)) ? 1 : 0;
  }
}
