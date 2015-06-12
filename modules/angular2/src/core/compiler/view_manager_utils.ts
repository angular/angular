import {Injector, Binding, Injectable} from 'angular2/di';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import * as eli from './element_injector';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as viewModule from './view';
import * as avmModule from './view_manager';
import {Renderer} from 'angular2/src/render/api';
import {Locals} from 'angular2/change_detection';
import {DirectiveResolver} from './directive_resolver';
import {RenderViewRef} from 'angular2/src/render/api';

@Injectable()
export class AppViewManagerUtils {
  constructor(public _directiveResolver: DirectiveResolver) {}

  getComponentInstance(parentView: viewModule.AppView, boundElementIndex: number): any {
    var binder = parentView.proto.elementBinders[boundElementIndex];
    var eli = parentView.elementInjectors[boundElementIndex];
    if (binder.hasDynamicComponent()) {
      return eli.getDynamicallyLoadedComponent();
    } else {
      return eli.getComponent();
    }
  }

  createView(protoView: viewModule.AppProtoView, renderView: RenderViewRef,
             viewManager: avmModule.AppViewManager, renderer: Renderer): viewModule.AppView {
    var view = new viewModule.AppView(renderer, protoView, protoView.protoLocals);
    // TODO(tbosch): pass RenderViewRef as argument to AppView!
    view.render = renderView;

    var changeDetector = protoView.protoChangeDetector.instantiate(view);

    var binders = protoView.elementBinders;
    var elementInjectors = ListWrapper.createFixedSize(binders.length);
    var rootElementInjectors = [];
    var preBuiltObjects = ListWrapper.createFixedSize(binders.length);
    var componentChildViews = ListWrapper.createFixedSize(binders.length);

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var elementInjector = null;

      // elementInjectors and rootElementInjectors
      var protoElementInjector = binder.protoElementInjector;
      if (isPresent(protoElementInjector)) {
        if (isPresent(protoElementInjector.parent)) {
          var parentElementInjector = elementInjectors[protoElementInjector.parent.index];
          elementInjector = protoElementInjector.instantiate(parentElementInjector);
        } else {
          elementInjector = protoElementInjector.instantiate(null);
          ListWrapper.push(rootElementInjectors, elementInjector);
        }
      }
      elementInjectors[binderIdx] = elementInjector;

      // preBuiltObjects
      if (isPresent(elementInjector)) {
        var embeddedProtoView = binder.hasEmbeddedProtoView() ? binder.nestedProtoView : null;
        preBuiltObjects[binderIdx] = new eli.PreBuiltObjects(viewManager, view, embeddedProtoView);
      }
    }

    view.init(changeDetector, elementInjectors, rootElementInjectors, preBuiltObjects,
              componentChildViews);

    return view;
  }

  attachComponentView(hostView: viewModule.AppView, boundElementIndex: number,
                      componentView: viewModule.AppView) {
    var childChangeDetector = componentView.changeDetector;
    hostView.changeDetector.addShadowDomChild(childChangeDetector);
    hostView.componentChildViews[boundElementIndex] = componentView;
  }

  detachComponentView(hostView: viewModule.AppView, boundElementIndex: number) {
    var componentView = hostView.componentChildViews[boundElementIndex];
    hostView.changeDetector.removeShadowDomChild(componentView.changeDetector);
    hostView.componentChildViews[boundElementIndex] = null;
  }

  hydrateComponentView(hostView: viewModule.AppView, boundElementIndex: number,
                       injector: Injector = null) {
    var elementInjector = hostView.elementInjectors[boundElementIndex];
    var componentView = hostView.componentChildViews[boundElementIndex];
    var component = this.getComponentInstance(hostView, boundElementIndex);
    this._hydrateView(componentView, injector, elementInjector, component, null);
  }

  hydrateRootHostView(hostView: viewModule.AppView, injector: Injector = null) {
    this._hydrateView(hostView, injector, null, new Object(), null);
  }

  attachAndHydrateFreeHostView(parentComponentHostView: viewModule.AppView,
                               parentComponentBoundElementIndex: number,
                               hostView: viewModule.AppView, injector: Injector = null) {
    var hostElementInjector =
        parentComponentHostView.elementInjectors[parentComponentBoundElementIndex];
    var parentView = parentComponentHostView.componentChildViews[parentComponentBoundElementIndex];
    parentView.changeDetector.addChild(hostView.changeDetector);
    ListWrapper.push(parentView.freeHostViews, hostView);
    this._hydrateView(hostView, injector, hostElementInjector, new Object(), null);
  }

  detachFreeHostView(parentView: viewModule.AppView, hostView: viewModule.AppView) {
    parentView.changeDetector.removeChild(hostView.changeDetector);
    ListWrapper.remove(parentView.freeHostViews, hostView);
  }

  attachAndHydrateFreeEmbeddedView(parentView: viewModule.AppView, boundElementIndex: number,
                                   view: viewModule.AppView, injector: Injector = null) {
    parentView.changeDetector.addChild(view.changeDetector);
    var viewContainer = this._getOrCreateViewContainer(parentView, boundElementIndex);
    ListWrapper.push(viewContainer.freeViews, view);
    var elementInjector = parentView.elementInjectors[boundElementIndex];
    for (var i = view.rootElementInjectors.length - 1; i >= 0; i--) {
      view.rootElementInjectors[i].link(elementInjector);
    }
    this._hydrateView(view, injector, elementInjector, parentView.context, parentView.locals);
  }

  detachFreeEmbeddedView(parentView: viewModule.AppView, boundElementIndex: number,
                         view: viewModule.AppView) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    view.changeDetector.remove();
    ListWrapper.remove(viewContainer.freeViews, view);
    for (var i = 0; i < view.rootElementInjectors.length; ++i) {
      view.rootElementInjectors[i].unlink();
    }
  }

  attachViewInContainer(parentView: viewModule.AppView, boundElementIndex: number,
                        contextView: viewModule.AppView, contextBoundElementIndex: number,
                        atIndex: number, view: viewModule.AppView) {
    if (isBlank(contextView)) {
      contextView = parentView;
      contextBoundElementIndex = boundElementIndex;
    }
    parentView.changeDetector.addChild(view.changeDetector);
    var viewContainer = this._getOrCreateViewContainer(parentView, boundElementIndex);
    ListWrapper.insert(viewContainer.views, atIndex, view);
    var sibling;
    if (atIndex == 0) {
      sibling = null;
    } else {
      sibling = ListWrapper.last(viewContainer.views[atIndex - 1].rootElementInjectors)
    }
    var elementInjector = contextView.elementInjectors[contextBoundElementIndex];
    for (var i = view.rootElementInjectors.length - 1; i >= 0; i--) {
      view.rootElementInjectors[i].linkAfter(elementInjector, sibling);
    }
  }

  detachViewInContainer(parentView: viewModule.AppView, boundElementIndex: number,
                        atIndex: number) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    view.changeDetector.remove();
    ListWrapper.removeAt(viewContainer.views, atIndex);
    for (var i = 0; i < view.rootElementInjectors.length; ++i) {
      view.rootElementInjectors[i].unlink();
    }
  }

  hydrateViewInContainer(parentView: viewModule.AppView, boundElementIndex: number,
                         contextView: viewModule.AppView, contextBoundElementIndex: number,
                         atIndex: number, injector: Injector) {
    if (isBlank(contextView)) {
      contextView = parentView;
      contextBoundElementIndex = boundElementIndex;
    }
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    var elementInjector = contextView.elementInjectors[contextBoundElementIndex].getHost();
    this._hydrateView(view, injector, elementInjector, contextView.context, contextView.locals);
  }

  hydrateDynamicComponentInElementInjector(hostView: viewModule.AppView, boundElementIndex: number,
                                           componentBinding: Binding, injector: Injector = null) {
    var elementInjector = hostView.elementInjectors[boundElementIndex];
    if (isPresent(elementInjector.getDynamicallyLoadedComponent())) {
      throw new BaseException(
          `There already is a dynamic component loaded at element ${boundElementIndex}`);
    }
    if (isBlank(injector)) {
      injector = elementInjector.getLightDomAppInjector();
    }
    var annotation = this._directiveResolver.resolve(componentBinding.token);
    var componentDirective = eli.DirectiveBinding.createFromBinding(componentBinding, annotation);
    elementInjector.dynamicallyCreateComponent(componentDirective, injector);
  }

  _hydrateView(view: viewModule.AppView, appInjector: Injector,
               hostElementInjector: eli.ElementInjector, context: Object, parentLocals: Locals) {
    if (isBlank(appInjector)) {
      appInjector = hostElementInjector.getShadowDomAppInjector();
    }
    if (isBlank(appInjector)) {
      appInjector = hostElementInjector.getLightDomAppInjector();
    }
    view.context = context;
    view.locals.parent = parentLocals;

    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; ++i) {
      var binder = binders[i];
      var elementInjector = view.elementInjectors[i];

      if (isPresent(elementInjector)) {
        elementInjector.hydrate(appInjector, hostElementInjector, view.preBuiltObjects[i]);
        this._setUpEventEmitters(view, elementInjector, i);
        this._setUpHostActions(view, elementInjector, i);

        if (isPresent(binder.directiveVariableBindings)) {
          MapWrapper.forEach(binder.directiveVariableBindings, (directiveIndex, name) => {
            if (isBlank(directiveIndex)) {
              view.locals.set(name, elementInjector.getElementRef().domElement);
            } else {
              view.locals.set(name, elementInjector.getDirectiveAtIndex(directiveIndex));
            }
          });
        }
      }
    }
    view.changeDetector.hydrate(view.context, view.locals, view);
  }

  _getOrCreateViewContainer(parentView: viewModule.AppView, boundElementIndex: number) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    if (isBlank(viewContainer)) {
      viewContainer = new viewModule.AppViewContainer();
      parentView.viewContainers[boundElementIndex] = viewContainer;
    }
    return viewContainer;
  }

  _setUpEventEmitters(view: viewModule.AppView, elementInjector: eli.ElementInjector,
                      boundElementIndex: number) {
    var emitters = elementInjector.getEventEmitterAccessors();
    for (var directiveIndex = 0; directiveIndex < emitters.length; ++directiveIndex) {
      var directiveEmitters = emitters[directiveIndex];
      var directive = elementInjector.getDirectiveAtIndex(directiveIndex);

      for (var eventIndex = 0; eventIndex < directiveEmitters.length; ++eventIndex) {
        var eventEmitterAccessor = directiveEmitters[eventIndex];
        eventEmitterAccessor.subscribe(view, boundElementIndex, directive);
      }
    }
  }

  _setUpHostActions(view: viewModule.AppView, elementInjector: eli.ElementInjector,
                    boundElementIndex: number) {
    var hostActions = elementInjector.getHostActionAccessors();
    for (var directiveIndex = 0; directiveIndex < hostActions.length; ++directiveIndex) {
      var directiveHostActions = hostActions[directiveIndex];
      var directive = elementInjector.getDirectiveAtIndex(directiveIndex);

      for (var index = 0; index < directiveHostActions.length; ++index) {
        var hostActionAccessor = directiveHostActions[index];
        hostActionAccessor.subscribe(view, boundElementIndex, directive);
      }
    }
  }

  dehydrateView(view: viewModule.AppView) {
    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; ++i) {
      var elementInjector = view.elementInjectors[i];
      if (isPresent(elementInjector)) {
        elementInjector.dehydrate();
      }
    }
    if (isPresent(view.locals)) {
      view.locals.clearValues();
    }
    view.context = null;
    view.changeDetector.dehydrate();
  }
}
