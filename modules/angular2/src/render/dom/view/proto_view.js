import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {List, Map, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

import {ElementBinder} from './element_binder';
import {NG_BINDING_CLASS} from '../util';

export class RenderProtoView {
  element;
  elementBinders:List<ElementBinder>;
  isTemplateElement:boolean;
  rootBindingOffset:int;
  imperativeRendererId:string;

  constructor({
    elementBinders,
    element,
    imperativeRendererId
  }) {
    this.element = element;
    this.elementBinders = elementBinders;
    this.imperativeRendererId = imperativeRendererId;
    if (isPresent(imperativeRendererId)) {
      this.rootBindingOffset = 0;
      this.isTemplateElement = false;
    } else {
      this.isTemplateElement = DOM.isTemplateElement(this.element);
      this.rootBindingOffset = (isPresent(this.element) && DOM.hasClass(this.element, NG_BINDING_CLASS)) ? 1 : 0;
    }
  }

  mergeChildComponentProtoViews(componentProtoViews:List<RenderProtoView>) {
    var componentProtoViewIndex = 0;
    for (var i=0; i<this.elementBinders.length; i++) {
      var eb = this.elementBinders[i];
      if (isPresent(eb.componentId)) {
        eb.nestedProtoView = componentProtoViews[componentProtoViewIndex];
        componentProtoViewIndex++;
      }
    }
  }
}
