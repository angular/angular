import {DOM} from 'angular2/src/dom/dom_adapter';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {int, isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';

import {ViewContainer} from './view_container';
import {RenderProtoView} from './proto_view';
import {LightDom} from '../shadow_dom/light_dom';
import {Content} from '../shadow_dom/content_tag';

// import {EventDispatcher} from '../../api';

const NG_BINDING_CLASS = 'ng-binding';

/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 */
export class RenderView {
  boundElements:List;
  boundTextNodes:List;
  /// When the view is part of render tree, the DocumentFragment is empty, which is why we need
  /// to keep track of the nodes.
  rootNodes:List;
  // TODO(tbosch): move componentChildViews, viewContainers, contentTags, lightDoms into
  // a single array with records inside
  componentChildViews: List<RenderView>;
  viewContainers: List<ViewContainer>;
  contentTags: List<Content>;
  lightDoms: List<LightDom>;
  hostLightDom: LightDom;
  proto: RenderProtoView;
  hydrated: boolean;
  _eventDispatcher: any/*EventDispatcher*/;
  eventHandlerRemovers: List<Function>;
  /// Host views that were added by an imperative view.
  /// This is a dynamically growing / shrinking array.
  imperativeHostViews: List<RenderView>;

  constructor(
      proto:RenderProtoView, rootNodes:List,
      boundTextNodes: List, boundElements:List, contentTags:List) {
    this.proto = proto;
    this.rootNodes = rootNodes;
    this.boundTextNodes = boundTextNodes;
    this.boundElements = boundElements;
    this.viewContainers = ListWrapper.createFixedSize(boundElements.length);
    this.contentTags = contentTags;
    this.lightDoms = ListWrapper.createFixedSize(boundElements.length);
    ListWrapper.fill(this.lightDoms, null);
    this.componentChildViews = ListWrapper.createFixedSize(boundElements.length);
    this.hostLightDom = null;
    this.hydrated = false;
    this.eventHandlerRemovers = [];
    this.imperativeHostViews = [];
  }

  getDirectParentLightDom(boundElementIndex:number) {
    var binder = this.proto.elementBinders[boundElementIndex];
    var destLightDom = null;
    if (binder.parentIndex !== -1 && binder.distanceToParent === 1) {
      destLightDom = this.lightDoms[binder.parentIndex];
    }
    return destLightDom;
  }

  getOrCreateViewContainer(binderIndex) {
    var vc = this.viewContainers[binderIndex];
    if (isBlank(vc)) {
      vc = new ViewContainer(this, binderIndex);
      this.viewContainers[binderIndex] = vc;
    }
    return vc;
  }

  setElementProperty(elementIndex:number, propertyName:string, value:any) {
    var setter = MapWrapper.get(this.proto.elementBinders[elementIndex].propertySetters, propertyName);
    setter(this.boundElements[elementIndex], value);
  }

  setText(textIndex:number, value:string) {
    DOM.setText(this.boundTextNodes[textIndex], value);
  }

  getViewContainer(index:number):ViewContainer {
    return this.viewContainers[index];
  }

  setEventDispatcher(dispatcher:any/*EventDispatcher*/) {
    this._eventDispatcher = dispatcher;
  }

  dispatchEvent(elementIndex, eventName, event): boolean {
    var allowDefaultBehavior = true;
    if (isPresent(this._eventDispatcher)) {
      var evalLocals = MapWrapper.create();
      MapWrapper.set(evalLocals, '$event', event);
      // TODO(tbosch): reenable this when we are parsing element properties
      // out of action expressions
      // var localValues = this.proto.elementBinders[elementIndex].eventLocals.eval(null, new Locals(null, evalLocals));
      // this._eventDispatcher.dispatchEvent(elementIndex, eventName, localValues);
      allowDefaultBehavior = this._eventDispatcher.dispatchEvent(elementIndex, eventName, evalLocals);
      if (!allowDefaultBehavior) {
        event.preventDefault();
      }
    }
    return allowDefaultBehavior;
  }
}
