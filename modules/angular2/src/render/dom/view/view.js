import {DOM} from 'angular2/src/dom/dom_adapter';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {int, isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';

import {ViewContainer} from './view_container';
import {ProtoView} from './proto_view';
import {LightDom} from '../shadow_dom/light_dom';
import {Content} from '../shadow_dom/content_tag';

import {ShadowDomStrategy} from '../shadow_dom/shadow_dom_strategy';

// import {EventDispatcher} from '../../api';

const NG_BINDING_CLASS = 'ng-binding';

/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 */
export class View {
  boundElements:List;
  boundTextNodes:List;
  /// When the view is part of render tree, the DocumentFragment is empty, which is why we need
  /// to keep track of the nodes.
  rootNodes:List;
  // TODO(tbosch): move componentChildViews, viewContainers, contentTags, lightDoms into
  // a single array with records inside
  componentChildViews: List<View>;
  viewContainers: List<ViewContainer>;
  contentTags: List<Content>;
  lightDoms: List<LightDom>;
  proto: ProtoView;
  _hydrated: boolean;
  _eventDispatcher: any/*EventDispatcher*/;

  constructor(
      proto:ProtoView, rootNodes:List,
      boundTextNodes: List, boundElements:List, viewContainers:List, contentTags:List) {
    this.proto = proto;
    this.rootNodes = rootNodes;
    this.boundTextNodes = boundTextNodes;
    this.boundElements = boundElements;
    this.viewContainers = viewContainers;
    this.contentTags = contentTags;
    this.lightDoms = ListWrapper.createFixedSize(boundElements.length);
    ListWrapper.fill(this.lightDoms, null);
    this.componentChildViews = ListWrapper.createFixedSize(boundElements.length);
    this._hydrated = false;
  }

  hydrated() {
    return this._hydrated;
  }

  setElementProperty(elementIndex:number, propertyName:string, value:any) {
    var setter = MapWrapper.get(this.proto.elementBinders[elementIndex].propertySetters, propertyName);
    setter(this.boundElements[elementIndex], value);
  }

  setText(textIndex:number, value:string) {
    DOM.setText(this.boundTextNodes[textIndex], value);
  }

  setComponentView(strategy: ShadowDomStrategy,
      elementIndex:number, childView:View) {
    var element = this.boundElements[elementIndex];
    var lightDom = strategy.constructLightDom(this, childView, element);
    strategy.attachTemplate(element, childView);
    this.lightDoms[elementIndex] = lightDom;
    this.componentChildViews[elementIndex] = childView;
    if (this._hydrated) {
      childView.hydrate(lightDom);
    }
  }

  getViewContainer(index:number):ViewContainer {
    return this.viewContainers[index];
  }

  _getDestLightDom(binderIndex) {
    var binder = this.proto.elementBinders[binderIndex];
    var destLightDom = null;
    if (binder.parentIndex !== -1 && binder.distanceToParent === 1) {
      destLightDom = this.lightDoms[binder.parentIndex];
    }
    return destLightDom;
  }

  /**
   * A dehydrated view is a state of the view that allows it to be moved around
   * the view tree.
   *
   * A dehydrated view has the following properties:
   *
   * - all viewcontainers are empty.
   *
   * A call to hydrate/dehydrate does not attach/detach the view from the view
   * tree.
   */
  hydrate(hostLightDom: LightDom) {
    if (this._hydrated) throw new BaseException('The view is already hydrated.');
    this._hydrated = true;

    // viewContainers and content tags
    for (var i = 0; i < this.viewContainers.length; i++) {
      var vc = this.viewContainers[i];
      var destLightDom = this._getDestLightDom(i);
      if (isPresent(vc)) {
        vc.hydrate(destLightDom, hostLightDom);
      }
      var ct = this.contentTags[i];
      if (isPresent(ct)) {
        ct.hydrate(destLightDom);
      }
    }

    // componentChildViews
    for (var i = 0; i < this.componentChildViews.length; i++) {
      var cv = this.componentChildViews[i];
      if (isPresent(cv)) {
        cv.hydrate(this.lightDoms[i]);
      }
    }

    for (var i = 0; i < this.lightDoms.length; ++i) {
      var lightDom = this.lightDoms[i];
      if (isPresent(lightDom)) {
        lightDom.redistribute();
      }
    }
  }

  dehydrate() {
    // Note: preserve the opposite order of the hydration process.

    // componentChildViews
    for (var i = 0; i < this.componentChildViews.length; i++) {
      var cv = this.componentChildViews[i];
      if (isPresent(cv)) {
        cv.dehydrate();
      }
    }

    // viewContainers and content tags
    if (isPresent(this.viewContainers)) {
      for (var i = 0; i < this.viewContainers.length; i++) {
        var vc = this.viewContainers[i];
        if (isPresent(vc)) {
          vc.dehydrate();
        }
        var ct = this.contentTags[i];
        if (isPresent(ct)) {
          ct.dehydrate();
        }
      }
    }
    this._eventDispatcher = null;
    this._hydrated = false;
  }

  setEventDispatcher(dispatcher:any/*EventDispatcher*/) {
    this._eventDispatcher = dispatcher;
  }

  dispatchEvent(elementIndex, eventName, event) {
    if (isPresent(this._eventDispatcher)) {
      var evalLocals = MapWrapper.create();
      MapWrapper.set(evalLocals, '$event', event);
      // TODO(tbosch): reenable this when we are parsing element properties
      // out of action expressions
      // var localValues = this.proto.elementBinders[elementIndex].eventLocals.eval(null, new Locals(null, evalLocals));
      // this._eventDispatcher.dispatchEvent(elementIndex, eventName, localValues);
      this._eventDispatcher.dispatchEvent(elementIndex, eventName, evalLocals);
    }
  }
}
