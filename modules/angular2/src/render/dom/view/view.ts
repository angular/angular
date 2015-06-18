import {DOM} from 'angular2/src/dom/dom_adapter';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {isPresent, isBlank, BaseException, stringify} from 'angular2/src/facade/lang';

import {DomProtoView} from './proto_view';
import {LightDom} from '../shadow_dom/light_dom';
import {DomElement} from './element';

import {RenderViewRef, EventDispatcher} from '../../api';
import {camelCaseToDashCase} from '../util';

export function resolveInternalDomView(viewRef: RenderViewRef) {
  return (<DomViewRef>viewRef)._view;
}

export class DomViewRef extends RenderViewRef {
  constructor(public _view: DomView) { super(); }
}

/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 */
export class DomView {
  hostLightDom: LightDom = null;
  shadowRoot = null;
  hydrated: boolean = false;
  eventDispatcher: EventDispatcher = null;
  eventHandlerRemovers: List<Function> = [];

  constructor(public proto: DomProtoView, public rootNodes: List</*node*/ any>,
              public boundTextNodes: List</*node*/ any>, public boundElements: List<DomElement>) {}

  getDirectParentElement(boundElementIndex: number): DomElement {
    var binder = this.proto.elementBinders[boundElementIndex];
    var parent = null;
    if (binder.parentIndex !== -1 && binder.distanceToParent === 1) {
      parent = this.boundElements[binder.parentIndex];
    }
    return parent;
  }

  setElementProperty(elementIndex: number, propertyName: string, value: any) {
    DOM.setProperty(this.boundElements[elementIndex].element, propertyName, value);
  }

  setElementAttribute(elementIndex: number, attributeName: string, value: string) {
    var element = this.boundElements[elementIndex].element;
    var dashCasedAttributeName = camelCaseToDashCase(attributeName);
    if (isPresent(value)) {
      DOM.setAttribute(element, dashCasedAttributeName, stringify(value));
    } else {
      DOM.removeAttribute(element, dashCasedAttributeName);
    }
  }

  setElementClass(elementIndex: number, className: string, isAdd: boolean) {
    var element = this.boundElements[elementIndex].element;
    var dashCasedClassName = camelCaseToDashCase(className);
    if (isAdd) {
      DOM.addClass(element, dashCasedClassName);
    } else {
      DOM.removeClass(element, dashCasedClassName);
    }
  }

  setElementStyle(elementIndex: number, styleName: string, value: string) {
    var element = this.boundElements[elementIndex].element;
    var dashCasedStyleName = camelCaseToDashCase(styleName);
    if (isPresent(value)) {
      DOM.setStyle(element, dashCasedStyleName, stringify(value));
    } else {
      DOM.removeStyle(element, dashCasedStyleName);
    }
  }

  invokeElementMethod(elementIndex: number, methodName: string, args: List<any>) {
    var element = this.boundElements[elementIndex].element;
    DOM.invoke(element, methodName, args);
  }

  setText(textIndex: number, value: string) { DOM.setText(this.boundTextNodes[textIndex], value); }

  dispatchEvent(elementIndex, eventName, event): boolean {
    var allowDefaultBehavior = true;
    if (isPresent(this.eventDispatcher)) {
      var evalLocals = new Map();
      evalLocals.set('$event', event);
      // TODO(tbosch): reenable this when we are parsing element properties
      // out of action expressions
      // var localValues = this.proto.elementBinders[elementIndex].eventLocals.eval(null, new
      // Locals(null, evalLocals));
      // this.eventDispatcher.dispatchEvent(elementIndex, eventName, localValues);
      allowDefaultBehavior =
          this.eventDispatcher.dispatchEvent(elementIndex, eventName, evalLocals);
      if (!allowDefaultBehavior) {
        event.preventDefault();
      }
    }
    return allowDefaultBehavior;
  }
}
