import {OpaqueToken, Inject, Injectable} from 'angular2/di';
import {int, isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {Content} from '../shadow_dom/content_tag';
import {ShadowDomStrategy} from '../shadow_dom/shadow_dom_strategy';
import {EventManager} from 'angular2/src/render/dom/events/event_manager';

import * as pvModule from './proto_view';
import * as viewModule from './view';
import {NG_BINDING_CLASS_SELECTOR, NG_BINDING_CLASS} from '../util';

// TODO(tbosch): Make this an OpaqueToken as soon as our transpiler supports this!
export const VIEW_POOL_CAPACITY = 'render.ViewFactory.viewPoolCapacity';

@Injectable()
export class ViewFactory {
  _poolCapacityPerProtoView:number;
  _pooledViewsPerProtoView:Map<pvModule.RenderProtoView, List<viewModule.RenderView>>;
  _eventManager:EventManager;
  _shadowDomStrategy:ShadowDomStrategy;

  constructor(@Inject(VIEW_POOL_CAPACITY) poolCapacityPerProtoView,
      eventManager:EventManager, shadowDomStrategy:ShadowDomStrategy) {
    this._poolCapacityPerProtoView = poolCapacityPerProtoView;
    this._pooledViewsPerProtoView = MapWrapper.create();
    this._eventManager = eventManager;
    this._shadowDomStrategy = shadowDomStrategy;
  }

  createInPlaceHostView(hostElementSelector, hostProtoView:pvModule.RenderProtoView):viewModule.RenderView {
    return this._createView(hostProtoView, hostElementSelector);
  }

  getView(protoView:pvModule.RenderProtoView):viewModule.RenderView {
    var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
    if (isPresent(pooledViews) && pooledViews.length > 0) {
      return ListWrapper.removeLast(pooledViews);
    }
    return this._createView(protoView, null);
  }

  returnView(view:viewModule.RenderView) {
    if (view.hydrated) {
      throw new BaseException('View is still hydrated');
    }
    var protoView = view.proto;
    var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
    if (isBlank(pooledViews)) {
      pooledViews = [];
      MapWrapper.set(this._pooledViewsPerProtoView, protoView, pooledViews);
    }
    if (pooledViews.length < this._poolCapacityPerProtoView) {
      ListWrapper.push(pooledViews, view);
    }
  }

  _createView(protoView:pvModule.RenderProtoView, inplaceElement): viewModule.RenderView {
    if (isPresent(protoView.imperativeRendererId)) {
      return new viewModule.RenderView(
        protoView, [], [], [], []
      );
    }

    var rootElementClone = isPresent(inplaceElement) ? inplaceElement : DOM.importIntoDoc(protoView.element);
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
      viewRootNodes = []; // TODO(perf): Should be fixed size, since we could pre-compute in in pvModule.RenderProtoView
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

      // contentTags
      var contentTag = null;
      if (isPresent(binder.contentTagSelector)) {
        contentTag = new Content(element, binder.contentTagSelector);
      }
      contentTags[binderIdx] = contentTag;
    }

    var view = new viewModule.RenderView(
      protoView, viewRootNodes,
      boundTextNodes, boundElements, contentTags
    );

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element = boundElements[binderIdx];

      // static child components
      if (binder.hasStaticComponent()) {
        var childView = this._createView(binder.nestedProtoView, null);
        ViewFactory.setComponentView(this._shadowDomStrategy, view, binderIdx, childView);
      }

      // events
      if (isPresent(binder.eventLocals) && isPresent(binder.localEvents)) {
        for (var i = 0; i < binder.localEvents.length; i++) {
          this._createEventListener(view, element, binderIdx, binder.localEvents[i].name, binder.eventLocals);
        }
      }
    }

    return view;
  }

  _createEventListener(view, element, elementIndex, eventName, eventLocals) {
    this._eventManager.addEventListener(element, eventName, (event) => {
      view.dispatchEvent(elementIndex, eventName, event);
    });
  }

  // This method is used by the ViewFactory and the ViewHydrator
  // TODO(tbosch): change shadow dom emulation so that LightDom
  // instances don't need to be recreated by instead hydrated/dehydrated
  static setComponentView(shadowDomStrategy:ShadowDomStrategy, hostView:viewModule.RenderView, elementIndex:number, componentView:viewModule.RenderView) {
    var element = hostView.boundElements[elementIndex];
    var lightDom = shadowDomStrategy.constructLightDom(hostView, componentView, element);
    shadowDomStrategy.attachTemplate(element, componentView);
    hostView.lightDoms[elementIndex] = lightDom;
    hostView.componentChildViews[elementIndex] = componentView;
  }
}
