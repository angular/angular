import {Injectable} from 'angular2/di';
import {int, isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';

import * as ldModule from '../shadow_dom/light_dom';
import {EventManager} from '../events/event_manager';
import {ViewFactory} from './view_factory';
import * as vcModule from './view_container';
import * as viewModule from './view';

/**
 * A dehydrated view is a state of the view that allows it to be moved around
 * the view tree.
 *
 * A dehydrated view has the following properties:
 *
 * - all viewcontainers are empty.
 *
 * A call to hydrate/dehydrate is called whenever a view is attached/detached,
 * but it does not do the attach/detach itself.
 */
@Injectable()
export class RenderViewHydrator {
  _eventManager:EventManager;
  _viewFactory:ViewFactory;

  constructor(eventManager:EventManager, viewFactory:ViewFactory) {
    this._eventManager = eventManager;
    this._viewFactory = viewFactory;
  }

  hydrateDynamicComponentView(hostView:viewModule.RenderView, boundElementIndex:number, componentView:viewModule.RenderView) {
    this._viewFactory.setComponentView(hostView, boundElementIndex, componentView);
    var lightDom = hostView.lightDoms[boundElementIndex];
    this._viewHydrateRecurse(componentView, lightDom);
    if (isPresent(lightDom)) {
      lightDom.redistribute();
    }
  }

  dehydrateDynamicComponentView(parentView:viewModule.RenderView, boundElementIndex:number) {
    throw new BaseException('Not supported yet');
    // Something along these lines:
    // var componentView = parentView.componentChildViews[boundElementIndex];
    // vcModule.ViewContainer.removeViewNodes(componentView);
    // parentView.componentChildViews[boundElementIndex] = null;
    // parentView.lightDoms[boundElementIndex] = null;
    // this._viewDehydrateRecurse(componentView);
  }

  hydrateInPlaceHostView(parentView:viewModule.RenderView, hostView:viewModule.RenderView) {
    if (isPresent(parentView)) {
      throw new BaseException('Not supported yet');
    }
    this._viewHydrateRecurse(hostView, null);
  }

  dehydrateInPlaceHostView(parentView:viewModule.RenderView, hostView:viewModule.RenderView) {
    if (isPresent(parentView)) {
      throw new BaseException('Not supported yet');
    }
    this._viewDehydrateRecurse(hostView);
  }

  hydrateViewInViewContainer(viewContainer:vcModule.ViewContainer, view:viewModule.RenderView) {
    this._viewHydrateRecurse(view, viewContainer.parentView.hostLightDom);
  }

  dehydrateViewInViewContainer(viewContainer:vcModule.ViewContainer, view:viewModule.RenderView) {
    this._viewDehydrateRecurse(view);
  }

  _viewHydrateRecurse(view, hostLightDom: ldModule.LightDom) {
    if (view.hydrated) throw new BaseException('The view is already hydrated.');
    view.hydrated = true;
    view.hostLightDom = hostLightDom;

    // content tags
    for (var i = 0; i < view.contentTags.length; i++) {
      var destLightDom = view.getDirectParentLightDom(i);
      var ct = view.contentTags[i];
      if (isPresent(ct)) {
        ct.hydrate(destLightDom);
      }
    }

    // componentChildViews
    for (var i = 0; i < view.componentChildViews.length; i++) {
      var cv = view.componentChildViews[i];
      if (isPresent(cv)) {
        this._viewHydrateRecurse(cv, view.lightDoms[i]);
      }
    }

    for (var i = 0; i < view.lightDoms.length; ++i) {
      var lightDom = view.lightDoms[i];
      if (isPresent(lightDom)) {
        lightDom.redistribute();
      }
    }

    //add global events
    view.eventHandlerRemovers = ListWrapper.create();
    var binders = view.proto.elementBinders;
    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      if (isPresent(binder.globalEvents)) {
        for (var i = 0; i < binder.globalEvents.length; i++) {
          var globalEvent = binder.globalEvents[i];
          var remover = this._createGlobalEventListener(view, binderIdx, globalEvent.name, globalEvent.target, globalEvent.fullName);
          ListWrapper.push(view.eventHandlerRemovers, remover);
        }
      }
    }
  }

  _createGlobalEventListener(view, elementIndex, eventName, eventTarget, fullName): Function {
    return this._eventManager.addGlobalEventListener(eventTarget, eventName, (event) => {
      view.dispatchEvent(elementIndex, fullName, event);
    });
  }

  _viewDehydrateRecurse(view) {
    // Note: preserve the opposite order of the hydration process.

    // componentChildViews
    for (var i = 0; i < view.componentChildViews.length; i++) {
      var cv = view.componentChildViews[i];
      if (isPresent(cv)) {
        this._viewDehydrateRecurse(cv);
        if (view.proto.elementBinders[i].hasDynamicComponent()) {
          vcModule.ViewContainer.removeViewNodes(cv);
          view.lightDoms[i] = null;
          view.componentChildViews[i] = null;
        }
      }
    }

    // viewContainers and content tags
    if (isPresent(view.viewContainers)) {
      for (var i = 0; i < view.viewContainers.length; i++) {
        var vc = view.viewContainers[i];
        if (isPresent(vc)) {
          this._viewContainerDehydrateRecurse(vc);
        }
        var ct = view.contentTags[i];
        if (isPresent(ct)) {
          ct.dehydrate();
        }
      }
    }

    //remove global events
    for (var i = 0; i < view.eventHandlerRemovers.length; i++) {
      view.eventHandlerRemovers[i]();
    }

    view.hostLightDom = null;
    view.eventHandlerRemovers = null;
    view.setEventDispatcher(null);
    view.hydrated = false;
  }

  _viewContainerDehydrateRecurse(viewContainer) {
    for (var i=0; i<viewContainer.views.length; i++) {
      this._viewDehydrateRecurse(viewContainer.views[i]);
    }
    viewContainer.clear();
  }

}
