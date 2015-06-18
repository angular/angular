import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {List, ListWrapper} from 'angular2/src/facade/collection';

import {ElementBinder} from './element_binder';
import {NG_BINDING_CLASS} from '../util';

import {RenderProtoViewRef} from '../../api';

export function resolveInternalDomProtoView(protoViewRef: RenderProtoViewRef): DomProtoView {
  return (<DomProtoViewRef>protoViewRef)._protoView;
}

export class DomProtoViewRef extends RenderProtoViewRef {
  constructor(public _protoView: DomProtoView) { super(); }
}

export class DomProtoView {
  element;
  elementBinders: List<ElementBinder>;
  isTemplateElement: boolean;
  rootBindingOffset: number;
  // the number of content tags seen in this or any child proto view.
  transitiveContentTagCount: number;
  boundTextNodeCount: number;
  rootNodeCount: number;

  constructor({elementBinders, element, transitiveContentTagCount, boundTextNodeCount}) {
    this.element = element;
    this.elementBinders = elementBinders;
    this.transitiveContentTagCount = transitiveContentTagCount;
    this.isTemplateElement = DOM.isTemplateElement(this.element);
    this.rootBindingOffset =
        (isPresent(this.element) && DOM.hasClass(this.element, NG_BINDING_CLASS)) ? 1 : 0;
    this.boundTextNodeCount = boundTextNodeCount;
    this.rootNodeCount =
        this.isTemplateElement ? DOM.childNodes(DOM.content(this.element)).length : 1;
  }
}
