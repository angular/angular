import {Injector, Binding, Injectable, ResolvedBinding} from 'angular2/di';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import * as eli from './element_injector';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as viewModule from './view';
import * as avmModule from './view_manager';
import {Renderer} from 'angular2/src/render/api';
import {Locals} from 'angular2/change_detection';
import {RenderViewRef} from 'angular2/src/render/api';

@Injectable()
export class AppViewManagerUtils {
  constructor() {}

  getComponentInstance(parentView: viewModule.AppView, boundElementIndex: number): any {
    var eli = parentView.elementInjectors[boundElementIndex];
    return eli.getComponent();
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
          rootElementInjectors.push(elementInjector);
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

  hydrateComponentView(hostView: viewModule.AppView, boundElementIndex: number) {
    var elementInjector = hostView.elementInjectors[boundElementIndex];
    var componentView = hostView.componentChildViews[boundElementIndex];
    var component = this.getComponentInstance(hostView, boundElementIndex);
    this._hydrateView(componentView, null, elementInjector, component, null);
  }

  hydrateRootHostView(hostView: viewModule.AppView, injector: Injector) {
    this._hydrateView(hostView, injector, null, new Object(), null);
  }

  // Misnomer: this method is attaching next to the view container.
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
      if (isPresent(elementInjector.parent)) {
        view.rootElementInjectors[i].linkAfter(elementInjector.parent, sibling);
      } else {
        contextView.rootElementInjectors.push(view.rootElementInjectors[i]);
      }
    }
  }

  detachViewInContainer(parentView: viewModule.AppView, boundElementIndex: number,
                        atIndex: number) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    view.changeDetector.remove();
    ListWrapper.removeAt(viewContainer.views, atIndex);
    for (var i = 0; i < view.rootElementInjectors.length; ++i) {
      var inj = view.rootElementInjectors[i];
      if (isPresent(inj.parent)) {
        inj.unlink();
      } else {
        var removeIdx = ListWrapper.indexOf(parentView.rootElementInjectors, inj);
        ListWrapper.removeAt(parentView.rootElementInjectors, removeIdx);
      }
    }
  }

  hydrateViewInContainer(parentView: viewModule.AppView, boundElementIndex: number,
                         contextView: viewModule.AppView, contextBoundElementIndex: number,
                         atIndex: number, bindings: ResolvedBinding[]) {
    if (isBlank(contextView)) {
      contextView = parentView;
      contextBoundElementIndex = boundElementIndex;
    }
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    var elementInjector = contextView.elementInjectors[contextBoundElementIndex];

    var injector = isPresent(bindings) ? Injector.fromResolvedBindings(bindings) : null;

    this._hydrateView(view, injector, elementInjector.getHost(), contextView.context,
                      contextView.locals);
  }

  _hydrateView(view: viewModule.AppView, injector: Injector,
               hostElementInjector: eli.ElementInjector, context: Object, parentLocals: Locals) {
    view.context = context;
    view.locals.parent = parentLocals;

    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; ++i) {
      var elementInjector = view.elementInjectors[i];

      if (isPresent(elementInjector)) {
        elementInjector.hydrate(injector, hostElementInjector, view.preBuiltObjects[i]);
        this._populateViewLocals(view, elementInjector);
        this._setUpEventEmitters(view, elementInjector, i);
        this._setUpHostActions(view, elementInjector, i);
      }
    }
    view.changeDetector.hydrate(view.context, view.locals, view);
  }

  _populateViewLocals(view: viewModule.AppView, elementInjector: eli.ElementInjector): void {
    if (isPresent(elementInjector.getDirectiveVariableBindings())) {
      MapWrapper.forEach(elementInjector.getDirectiveVariableBindings(), (directiveIndex, name) => {
        if (isBlank(directiveIndex)) {
          view.locals.set(name, elementInjector.getElementRef().nativeElement);
        } else {
          view.locals.set(name, elementInjector.getDirectiveAtIndex(directiveIndex));
        }
      });
    }
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
