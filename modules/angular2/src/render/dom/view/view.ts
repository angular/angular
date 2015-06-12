import {DOM} from 'angular2/src/dom/dom_adapter';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {Locals} from 'angular2/change_detection';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';

import {DomProtoView} from './proto_view';
import {LightDom} from '../shadow_dom/light_dom';
import {DomElement} from './element';

import {RenderViewRef, EventDispatcher} from '../../api';

export function resolveInternalDomView(viewRef: RenderViewRef) {
  return (<DomViewRef>viewRef)._view;
}

export class DomViewRef extends RenderViewRef {
  constructor(public _view: DomView) { super(); }
}


const NG_BINDING_CLASS = 'ng-binding';

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
    var setter =
        MapWrapper.get(this.proto.elementBinders[elementIndex].propertySetters, propertyName);
    setter(this.boundElements[elementIndex].element, value);
  }

  callAction(elementIndex: number, actionExpression: string, actionArgs: any) {
    var binder = this.proto.elementBinders[elementIndex];
    var hostAction = MapWrapper.get(binder.hostActions, actionExpression);
    hostAction.eval(this.boundElements[elementIndex].element, this._localsWithAction(actionArgs));
  }

  _localsWithAction(action: Object): Locals {
    var map = MapWrapper.create();
    MapWrapper.set(map, '$action', action);
    return new Locals(null, map);
  }

  setText(textIndex: number, value: string) { DOM.setText(this.boundTextNodes[textIndex], value); }

  dispatchEvent(elementIndex, eventName, event): boolean {
    var allowDefaultBehavior = true;
    if (isPresent(this.eventDispatcher)) {
      var evalLocals = MapWrapper.create();
      MapWrapper.set(evalLocals, '$event', event);
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
