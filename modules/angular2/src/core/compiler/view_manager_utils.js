import {Injectable, Injector, Binding} from 'angular2/di';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import * as eli from './element_injector';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {NgElement} from 'angular2/src/core/compiler/ng_element';
import * as viewModule from './view';
import * as avmModule from './view_manager';
import {Renderer} from 'angular2/src/render/api';
import {BindingPropagationConfig, Locals} from 'angular2/change_detection';
import {DirectiveMetadataReader} from './directive_metadata_reader';

@Injectable()
export class AppViewManagerUtils {
  _metadataReader:DirectiveMetadataReader;

  constructor(metadataReader:DirectiveMetadataReader) {
    this._metadataReader = metadataReader;
  }

  createView(protoView:viewModule.AppProtoView, viewManager:avmModule.AppViewManager, renderer:Renderer): viewModule.AppView {
    var view = new viewModule.AppView(renderer, protoView, protoView.protoLocals);
    var changeDetector = protoView.protoChangeDetector.instantiate(view, protoView.bindings,
      protoView.getVariableBindings(), protoView.getdirectiveRecords());

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
        var defaultProtoView = isPresent(binder.viewportDirective) ? binder.nestedProtoView : null;
        preBuiltObjects[binderIdx] = new eli.PreBuiltObjects(viewManager, view, new NgElement(view, binderIdx), defaultProtoView);
      }
    }

    view.init(changeDetector, elementInjectors, rootElementInjectors,
      preBuiltObjects, componentChildViews);

    return view;
  }

  attachComponentView(hostView:viewModule.AppView, boundElementIndex:number,
      componentView:viewModule.AppView) {
    var childChangeDetector = componentView.changeDetector;
    hostView.changeDetector.addShadowDomChild(childChangeDetector);
    hostView.componentChildViews[boundElementIndex] = componentView;
  }

  detachComponentView(hostView:viewModule.AppView, boundElementIndex:number) {
    var componentView = hostView.componentChildViews[boundElementIndex];
    hostView.changeDetector.removeShadowDomChild(componentView.changeDetector);
    hostView.componentChildViews[boundElementIndex] = null;
  }

  hydrateComponentView(hostView:viewModule.AppView, boundElementIndex:number, injector:Injector = null) {
    var elementInjector = hostView.elementInjectors[boundElementIndex];
    var componentView = hostView.componentChildViews[boundElementIndex];
    var binder = hostView.proto.elementBinders[boundElementIndex];
    var component;
    if (binder.hasDynamicComponent()) {
      component = elementInjector.getDynamicallyLoadedComponent();
    } else {
      component = elementInjector.getComponent();
    }
    this._hydrateView(
      componentView, injector, elementInjector, component, null
    );
  }

  attachAndHydrateInPlaceHostView(parentComponentHostView:viewModule.AppView, parentComponentBoundElementIndex:number,
      hostView:viewModule.AppView, injector:Injector = null) {
    var hostElementInjector = null;
    if (isPresent(parentComponentHostView)) {
      hostElementInjector = parentComponentHostView.elementInjectors[parentComponentBoundElementIndex];
      var parentView = parentComponentHostView.componentChildViews[parentComponentBoundElementIndex];
      parentView.changeDetector.addChild(hostView.changeDetector);
      ListWrapper.push(parentView.imperativeHostViews, hostView);
    }
    this._hydrateView(hostView, injector, hostElementInjector, new Object(), null);
  }

  detachInPlaceHostView(parentView:viewModule.AppView,
      hostView:viewModule.AppView) {
    if (isPresent(parentView)) {
      parentView.changeDetector.removeChild(hostView.changeDetector);
      ListWrapper.remove(parentView.imperativeHostViews, hostView);
    }
  }

  attachViewInContainer(parentView:viewModule.AppView, boundElementIndex:number, atIndex:number, view:viewModule.AppView) {
    parentView.changeDetector.addChild(view.changeDetector);
    var viewContainer = parentView.viewContainers[boundElementIndex];
    if (isBlank(viewContainer)) {
      viewContainer = new viewModule.AppViewContainer();
      parentView.viewContainers[boundElementIndex] = viewContainer;
    }
    ListWrapper.insert(viewContainer.views, atIndex, view);
    var sibling;
    if (atIndex == 0) {
      sibling = null;
    } else {
      sibling = ListWrapper.last(viewContainer.views[atIndex - 1].rootElementInjectors)
    }
    var elementInjector = parentView.elementInjectors[boundElementIndex];
    for (var i = view.rootElementInjectors.length - 1; i >= 0; i--) {
      view.rootElementInjectors[i].linkAfter(elementInjector, sibling);
    }
  }

  detachViewInContainer(parentView:viewModule.AppView, boundElementIndex:number, atIndex:number) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    view.changeDetector.remove();
    ListWrapper.removeAt(viewContainer.views, atIndex);
    for (var i = 0; i < view.rootElementInjectors.length; ++i) {
      view.rootElementInjectors[i].unlink();
    }
  }

  hydrateViewInContainer(parentView:viewModule.AppView, boundElementIndex:number, atIndex:number, injector:Injector) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    var elementInjector = parentView.elementInjectors[boundElementIndex];
    this._hydrateView(view, injector, elementInjector, parentView.context, parentView.locals);
  }

  hydrateDynamicComponentInElementInjector(hostView:viewModule.AppView, boundElementIndex:number,
      componentBinding:Binding, injector:Injector = null) {
    var elementInjector = hostView.elementInjectors[boundElementIndex];
    if (isPresent(elementInjector.getDynamicallyLoadedComponent())) {
      throw new BaseException(`There already is a dynamic component loaded at element ${boundElementIndex}`);
    }
    if (isBlank(injector)) {
      injector = elementInjector.getLightDomAppInjector();
    }
    var annotation = this._metadataReader.read(componentBinding.token).annotation;
    var componentDirective = eli.DirectiveBinding.createFromBinding(componentBinding, annotation);
    var shadowDomAppInjector = this._createShadowDomAppInjector(componentDirective, injector);
    elementInjector.dynamicallyCreateComponent(componentDirective, shadowDomAppInjector);
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

  _hydrateView(view:viewModule.AppView, appInjector:Injector, hostElementInjector:eli.ElementInjector, context: Object, parentLocals:Locals) {
    if (isBlank(appInjector)) {
      appInjector = hostElementInjector.getShadowDomAppInjector();
    }
    if (isBlank(appInjector)) {
      appInjector = hostElementInjector.getLightDomAppInjector();
    }
    view.context = context;
    view.locals.parent = parentLocals;
    view.changeDetector.hydrate(view.context, view.locals, view);

    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; ++i) {
      var elementInjector = view.elementInjectors[i];
      if (isPresent(elementInjector)) {
        var componentDirective = view.proto.elementBinders[i].componentDirective;
        var shadowDomAppInjector = null;
        if (isPresent(componentDirective)) {
          shadowDomAppInjector = this._createShadowDomAppInjector(componentDirective, appInjector);
        } else {
          shadowDomAppInjector = null;
        }
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
    }

  }

  _setUpEventEmitters(view:viewModule.AppView, elementInjector:eli.ElementInjector, boundElementIndex:number) {
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

  dehydrateView(view:viewModule.AppView) {
    var binders = view.proto.elementBinders;
    for (var i = 0; i < binders.length; ++i) {
      var elementInjector = view.elementInjectors[i];
      if (isPresent(elementInjector)) {
        elementInjector.clearDirectives();
      }
    }
    if (isPresent(view.locals)) {
      view.locals.clearValues();
    }
    view.context = null;
    view.changeDetector.dehydrate();
  }

}