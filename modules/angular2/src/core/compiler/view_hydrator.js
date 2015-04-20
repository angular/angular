import {Injectable, Inject, OpaqueToken, Injector} from 'angular2/di';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import * as eli from './element_injector';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as vcModule from './view_container';
import * as viewModule from './view';
import {BindingPropagationConfig, Locals} from 'angular2/change_detection';

import * as renderApi from 'angular2/src/render/api';

/**
 * A dehydrated view is a state of the view that allows it to be moved around
 * the view tree, without incurring the cost of recreating the underlying
 * injectors and watch records.
 *
 * A dehydrated view has the following properties:
 *
 * - all element injectors are empty.
 * - all appInjectors are released.
 * - all viewcontainers are empty.
 * - all context locals are set to null.
 * - the view context is null.
 *
 * A call to hydrate/dehydrate is called whenever a view is attached/detached,
 * but it does not do the attach/detach itself.
 */
@Injectable()
export class AppViewHydrator {
  _renderer:renderApi.Renderer;

  constructor(renderer:renderApi.Renderer) {
    this._renderer = renderer;
  }

  hydrateDynamicComponentView(hostView:viewModule.AppView, boundElementIndex:number,
      componentView:viewModule.AppView, componentDirective:eli.DirectiveBinding, injector:Injector) {
    var binder = hostView.proto.elementBinders[boundElementIndex];
    if (!binder.hasDynamicComponent()) {
      throw new BaseException(`There is no dynamic component directive at element ${boundElementIndex}`);
    }
    if (isPresent(hostView.componentChildViews[boundElementIndex])) {
      throw new BaseException(`There already is a bound component at element ${boundElementIndex}`);
    }
    var hostElementInjector = hostView.elementInjectors[boundElementIndex];
    if (isBlank(injector)) {
      injector = hostElementInjector.getLightDomAppInjector();
    }

    // shadowDomAppInjector
    var shadowDomAppInjector = this._createShadowDomAppInjector(componentDirective, injector);
    // Needed to make rtts-assert happy in unit tests...
    if (isBlank(shadowDomAppInjector)) {
      shadowDomAppInjector = null;
    }
    // create component instance
    var component = hostElementInjector.dynamicallyCreateComponent(componentDirective, shadowDomAppInjector);

    // componentView
    hostView.componentChildViews[boundElementIndex] = componentView;
    hostView.changeDetector.addShadowDomChild(componentView.changeDetector);

    // render views
    var renderViewRefs = this._renderer.createDynamicComponentView(hostView.render, boundElementIndex, componentView.proto.render);

    this._viewHydrateRecurse(
      componentView, renderViewRefs, 0, shadowDomAppInjector, hostElementInjector, component, null
    );
  }

  dehydrateDynamicComponentView(parentView:viewModule.AppView, boundElementIndex:number) {
    throw new BaseException('Not yet implemented!');
    // Something along these lines:
    // var binder = parentView.proto.elementBinders[boundElementIndex];
    // if (!binder.hasDynamicComponent()) {
    //   throw new BaseException(`There is no dynamic component directive at element ${boundElementIndex}`);
    // }
    // var componentView = parentView.componentChildViews[boundElementIndex];
    // if (isBlank(componentView)) {
    //   throw new BaseException(`There is no bound component at element ${boundElementIndex}`);
    // }
    // this._viewDehydrateRecurse(componentView);
    // parentView.changeDetector.removeShadowDomChild(componentView.changeDetector);
    // this._renderer.destroyDynamicComponentChildView(parentView.render, boundElementIndex);
    // parentView.componentChildViews[boundElementIndex] = null;
  }

  hydrateInPlaceHostView(parentView:viewModule.AppView, hostElementSelector, hostView:viewModule.AppView, injector:Injector) {
    var parentRenderViewRef = null;
    if (isPresent(parentView)) {
      // Needed for user views
      throw new BaseException('Not yet supported');
    }
    var binder = hostView.proto.elementBinders[0];
    var shadowDomAppInjector = this._createShadowDomAppInjector(binder.componentDirective, injector);

    // render views
    var renderViewRefs = this._renderer.createInPlaceHostView(parentRenderViewRef, hostElementSelector, hostView.proto.render);

    this._viewHydrateRecurse(
      hostView, renderViewRefs, 0, shadowDomAppInjector, null, new Object(), null
    );
  }

  dehydrateInPlaceHostView(parentView:viewModule.AppView, hostView:viewModule.AppView) {
    var parentRenderViewRef = null;
    if (isPresent(parentView)) {
      // Needed for user views
      throw new BaseException('Not yet supported');
    }
    var render = hostView.render;
    this._viewDehydrateRecurse(hostView);
    this._renderer.destroyInPlaceHostView(parentRenderViewRef, render);
  }

  hydrateViewInViewContainer(viewContainer:vcModule.ViewContainer, atIndex:number, view:viewModule.AppView, injector:Injector = null) {
    if (!viewContainer.hydrated()) throw new BaseException(
        'Cannot create views on a dehydrated ViewContainer');
    if (isBlank(injector)) {
      injector = viewContainer.elementInjector.getLightDomAppInjector();
    }
    var renderViewRefs = this._renderer.createViewInContainer(viewContainer.getRender(), atIndex, view.proto.render);
    viewContainer.parentView.changeDetector.addChild(view.changeDetector);
    this._viewHydrateRecurse(view, renderViewRefs, 0, injector, viewContainer.elementInjector.getHost(),
      viewContainer.parentView.context, viewContainer.parentView.locals);
  }

  dehydrateViewInViewContainer(viewContainer:vcModule.ViewContainer, atIndex:number, view:viewModule.AppView) {
    view.changeDetector.remove();
    this._viewDehydrateRecurse(view);
    this._renderer.destroyViewInContainer(viewContainer.getRender(), atIndex);
  }

  _viewHydrateRecurse(
      view:viewModule.AppView,
      renderComponentViewRefs:List<renderApi.ViewRef>,
      renderComponentIndex:number,
      appInjector: Injector, hostElementInjector: eli.ElementInjector,
      context: Object, locals:Locals):number {
    if (view.hydrated()) throw new BaseException('The view is already hydrated.');

    view.render = renderComponentViewRefs[renderComponentIndex++];

    view.context = context;
    view.locals.parent = locals;

    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; ++i) {
      var componentDirective = binders[i].componentDirective;
      var shadowDomAppInjector = null;

      // shadowDomAppInjector
      if (isPresent(componentDirective)) {
        shadowDomAppInjector = this._createShadowDomAppInjector(componentDirective, appInjector);
      } else {
        shadowDomAppInjector = null;
      }

      // elementInjectors
      var elementInjector = view.elementInjectors[i];
      if (isPresent(elementInjector)) {
        elementInjector.instantiateDirectives(appInjector, hostElementInjector, shadowDomAppInjector, view.preBuiltObjects[i]);
        this._setUpEventEmitters(view, elementInjector, i);

        // The exporting of $implicit is a special case. Since multiple elements will all export
        // the different values as $implicit, directly assign $implicit bindings to the variable
        // name.
        var exportImplicitName = elementInjector.getExportImplicitName();
        if (elementInjector.isExportingComponent()) {
          view.locals.set(exportImplicitName, elementInjector.getComponent());
        } else if (elementInjector.isExportingElement()) {
          view.locals.set(exportImplicitName, elementInjector.getNgElement().domElement);
        }
      }

      if (binders[i].hasStaticComponent()) {
        renderComponentIndex = this._viewHydrateRecurse(
          view.componentChildViews[i],
          renderComponentViewRefs,
          renderComponentIndex,
          shadowDomAppInjector,
          elementInjector,
          elementInjector.getComponent(),
          null
        );
      }
    }
    view.changeDetector.hydrate(view.context, view.locals, view);
    view.renderer.setEventDispatcher(view.render, view);
    return renderComponentIndex;
  }

  _setUpEventEmitters(view:viewModule.AppView, elementInjector:eli.ElementInjector, boundElementIndex:number) {
    var emitters = elementInjector.getEventEmitterAccessors();
    for(var directiveIndex = 0; directiveIndex < emitters.length; ++directiveIndex) {
      var directiveEmitters = emitters[directiveIndex];
      var directive = elementInjector.getDirectiveAtIndex(directiveIndex);

      for (var eventIndex = 0; eventIndex < directiveEmitters.length; ++eventIndex) {
        var eventEmitterAccessor = directiveEmitters[eventIndex];
        eventEmitterAccessor.subscribe(view, boundElementIndex, directive);
      }
    }
  }

  /**
   * This should only be called by View or ViewContainer.
   */
  _viewDehydrateRecurse(view:viewModule.AppView) {
    // Note: preserve the opposite order of the hydration process.

    // componentChildViews
    for (var i = 0; i < view.componentChildViews.length; i++) {
      var componentView = view.componentChildViews[i];
      if (isPresent(componentView)) {
        this._viewDehydrateRecurse(componentView);
        var binder = view.proto.elementBinders[i];
        if (binder.hasDynamicComponent()) {
          view.componentChildViews[i] = null;
          view.changeDetector.removeShadowDomChild(componentView.changeDetector);
        }
      }
    }

    // elementInjectors
    for (var i = 0; i < view.elementInjectors.length; i++) {
      if (isPresent(view.elementInjectors[i])) {
        view.elementInjectors[i].clearDirectives();
      }
    }

    // viewContainers
    if (isPresent(view.viewContainers)) {
      for (var i = 0; i < view.viewContainers.length; i++) {
        var vc = view.viewContainers[i];
        if (isPresent(vc)) {
          this._viewContainerDehydrateRecurse(vc);
        }
      }
    }

    view.render = null;

    if (isPresent(view.locals)) {
      view.locals.clearValues();
    }
    view.context = null;
    view.changeDetector.dehydrate();
  }

  _createShadowDomAppInjector(componentDirective, appInjector) {
    var shadowDomAppInjector = null;

    // shadowDomAppInjector
    var injectables = componentDirective.resolvedInjectables;
    if (isPresent(injectables)) {
      shadowDomAppInjector = appInjector.createChildFromResolved(injectables);
    } else {
      shadowDomAppInjector = appInjector;
    }
    return shadowDomAppInjector;
  }

  /**
   * This should only be called by View or ViewContainer.
   */
  _viewContainerDehydrateRecurse(viewContainer:vcModule.ViewContainer) {
    for (var i=0; i<viewContainer.length; i++) {
      var view = viewContainer.get(i);
      view.changeDetector.remove();
      this._viewDehydrateRecurse(view);
    }
    // Note: We don't call clear here,
    // as we don't want to change the render side
    // as the render side does its own recursion.
    viewContainer.internalClearWithoutRender();
  }

}
