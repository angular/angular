import {OpaqueToken, Inject, Injectable} from 'angular2/di';
import {int, isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {Content} from '../shadow_dom/content_tag';
import {ShadowDomStrategy} from '../shadow_dom/shadow_dom_strategy';
import {EventManager} from 'angular2/src/render/dom/events/event_manager';

import * as vcModule from './view_container';
import * as pvModule from './proto_view';
import * as viewModule from './view';
import {NG_BINDING_CLASS_SELECTOR, NG_BINDING_CLASS} from '../util';

// TODO(tbosch): Make this an OpaqueToken as soon as our transpiler supports this!
export const VIEW_POOL_CAPACITY = 'render.ViewFactory.viewPoolCapacity';

@Injectable()
export class ViewFactory {
  _poolCapacity:number;
  _pooledViews:List<viewModule.View>;
  _eventManager:EventManager;
  _shadowDomStrategy:ShadowDomStrategy;

  constructor(@Inject(VIEW_POOL_CAPACITY) capacity, eventManager:EventManager, shadowDomStrategy:ShadowDomStrategy) {
    this._poolCapacity = capacity;
    this._pooledViews = ListWrapper.create();
    this._eventManager = eventManager;
    this._shadowDomStrategy = shadowDomStrategy;
  }

  getView(protoView:pvModule.ProtoView):viewModule.View {
    // TODO(tbosch): benchmark this scanning of views and maybe
    // replace it with a fancy LRU Map/List combination...
    var view;
    for (var i=this._pooledViews.length-1; i>=0; i--) {
      var pooledView = this._pooledViews[i];
      if (pooledView.proto === protoView) {
        view = ListWrapper.removeAt(this._pooledViews, i);
      }
    }
    if (isBlank(view)) {
      view = this._createView(protoView);
    }
    return view;
  }

  returnView(view:viewModule.View) {
    if (view.hydrated()) {
      view.dehydrate();
    }
    ListWrapper.push(this._pooledViews, view);
    while (this._pooledViews.length > this._poolCapacity) {
      ListWrapper.removeAt(this._pooledViews, 0);
    }
  }

  _createView(protoView:pvModule.ProtoView): viewModule.View {
    var rootElementClone = protoView.isRootView ? protoView.element : DOM.importIntoDoc(protoView.element);
    var elementsWithBindingsDynamic;
    if (protoView.isTemplateElement) {
      elementsWithBindingsDynamic = DOM.querySelectorAll(DOM.content(rootElementClone), NG_BINDING_CLASS_SELECTOR);
    } else {
      elementsWithBindingsDynamic = DOM.getElementsByClassName(rootElementClone, NG_BINDING_CLASS);
    }

    var elementsWithBindings = ListWrapper.createFixedSize(elementsWithBindingsDynamic.length);
    for (var binderIdx = 0; binderIdx < elementsWithBindingsDynamic.length; ++binderIdx) {
      elementsWithBindings[binderIdx] = elementsWithBindingsDynamic[binderIdx];
    }

    var viewRootNodes;
    if (protoView.isTemplateElement) {
      var childNode = DOM.firstChild(DOM.content(rootElementClone));
      viewRootNodes = []; // TODO(perf): Should be fixed size, since we could pre-compute in in pvModule.ProtoView
      // Note: An explicit loop is the fastest way to convert a DOM array into a JS array!
      while(childNode != null) {
        ListWrapper.push(viewRootNodes, childNode);
        childNode = DOM.nextSibling(childNode);
      }
    } else {
      viewRootNodes = [rootElementClone];
    }

    var binders = protoView.elementBinders;
    var boundTextNodes = [];
    var boundElements = ListWrapper.createFixedSize(binders.length);
    var viewContainers = ListWrapper.createFixedSize(binders.length);
    var contentTags = ListWrapper.createFixedSize(binders.length);

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element;
      if (binderIdx === 0 && protoView.rootBindingOffset === 1) {
        element = rootElementClone;
      } else {
        element = elementsWithBindings[binderIdx - protoView.rootBindingOffset];
      }
      boundElements[binderIdx] = element;

      // boundTextNodes
      var childNodes = DOM.childNodes(DOM.templateAwareRoot(element));
      var textNodeIndices = binder.textNodeIndices;
      for (var i = 0; i<textNodeIndices.length; i++) {
        ListWrapper.push(boundTextNodes, childNodes[textNodeIndices[i]]);
      }

      // viewContainers
      var viewContainer = null;
      if (isBlank(binder.componentId) && isPresent(binder.nestedProtoView)) {
        viewContainer = new vcModule.ViewContainer(this, element);
      }
      viewContainers[binderIdx] = viewContainer;

      // contentTags
      var contentTag = null;
      if (isPresent(binder.contentTagSelector)) {
        contentTag = new Content(element, binder.contentTagSelector);
      }
      contentTags[binderIdx] = contentTag;
    }

    var view = new viewModule.View(
      protoView, viewRootNodes,
      boundTextNodes, boundElements, viewContainers, contentTags
    );

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element = boundElements[binderIdx];

      // static child components
      if (isPresent(binder.componentId) && isPresent(binder.nestedProtoView)) {
        var childView = this._createView(binder.nestedProtoView);
        view.setComponentView(this._shadowDomStrategy, binderIdx, childView);
      }

      // events
      if (isPresent(binder.eventLocals)) {
        ListWrapper.forEach(binder.eventNames, (eventName) => {
          this._createEventListener(view, element, binderIdx, eventName, binder.eventLocals);
        });
      }
    }

    if (protoView.isRootView) {
      view.hydrate(null);
    }

    return view;
  }

  _createEventListener(view, element, elementIndex, eventName, eventLocals) {
    this._eventManager.addEventListener(element, eventName, (event) => {
      view.dispatchEvent(elementIndex, eventName, event);
    });
  }
}