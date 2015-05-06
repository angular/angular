import {DOM} from 'angular2/src/dom/dom_adapter';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {int, isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';

import {DomViewContainer} from './view_container';
import {DomProtoView} from './proto_view';
import {LightDom} from '../shadow_dom/light_dom';
import {Content} from '../shadow_dom/content_tag';

import {RenderViewRef} from '../../api';

// TODO(tbosch): enable this again!
// import {EventDispatcher} from '../../api';

export function resolveInternalDomView(viewRef:RenderViewRef) {
  var domViewRef:DomViewRef = viewRef;
  return domViewRef._view;
}

export class DomViewRef extends RenderViewRef {
  _view:DomView;
  constructor(view:DomView) {
    super();
    this._view = view;
  }
}


const NG_BINDING_CLASS = 'ng-binding';

/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 */
export class DomView {
  boundElements:List;
  boundTextNodes:List;
  /// When the view is part of render tree, the DocumentFragment is empty, which is why we need
  /// to keep track of the nodes.
  rootNodes:List;
  // TODO(tbosch): move componentChildViews, viewContainers, contentTags, lightDoms into
  // a single array with records inside
  viewContainers: List<DomViewContainer>;
  contentTags: List<Content>;
  lightDoms: List<LightDom>;
  hostLightDom: LightDom;
  shadowRoot;
  proto: DomProtoView;
  hydrated: boolean;
  eventDispatcher: any/*EventDispatcher*/;
  eventHandlerRemovers: List<Function>;

  constructor(
      proto:DomProtoView, rootNodes:List,
      boundTextNodes: List, boundElements:List, contentTags:List) {
    this.proto = proto;
    this.rootNodes = rootNodes;
    this.boundTextNodes = boundTextNodes;
    this.boundElements = boundElements;
    this.viewContainers = ListWrapper.createFixedSize(boundElements.length);
    this.contentTags = contentTags;
    this.lightDoms = ListWrapper.createFixedSize(boundElements.length);
    this.hostLightDom = null;
    this.hydrated = false;
    this.eventHandlerRemovers = [];
    this.eventDispatcher = null;
    this.shadowRoot = null;
  }

  getDirectParentLightDom(boundElementIndex:number) {
    var binder = this.proto.elementBinders[boundElementIndex];
    var destLightDom = null;
    if (binder.parentIndex !== -1 && binder.distanceToParent === 1) {
      destLightDom = this.lightDoms[binder.parentIndex];
    }
    return destLightDom;
  }

  setElementProperty(elementIndex:number, propertyName:string, value:any) {
    var setter = MapWrapper.get(this.proto.elementBinders[elementIndex].propertySetters, propertyName);
    setter(this.boundElements[elementIndex], value);
  }

  setText(textIndex:number, value:string) {
    DOM.setText(this.boundTextNodes[textIndex], value);
  }

  dispatchEvent(elementIndex, eventName, event): boolean {
    var allowDefaultBehavior = true;
    if (isPresent(this.eventDispatcher)) {
      var evalLocals = MapWrapper.create();
      MapWrapper.set(evalLocals, '$event', event);
      // TODO(tbosch): reenable this when we are parsing element properties
      // out of action expressions
      // var localValues = this.proto.elementBinders[elementIndex].eventLocals.eval(null, new Locals(null, evalLocals));
      // this.eventDispatcher.dispatchEvent(elementIndex, eventName, localValues);
      allowDefaultBehavior = this.eventDispatcher.dispatchEvent(elementIndex, eventName, evalLocals);
      if (!allowDefaultBehavior) {
        event.preventDefault();
      }
    }
    return allowDefaultBehavior;
  }
}
