import {Injector, Provider, Injectable, ResolvedProvider} from 'angular2/src/core/di';
import {ListWrapper, MapWrapper, Map, StringMapWrapper} from 'angular2/src/facade/collection';
import * as eli from './element_injector';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import * as viewModule from './view';
import * as avmModule from './view_manager';
import {ElementRef, ElementRef_} from './element_ref';
import {TemplateRef, TemplateRef_} from './template_ref';
import {Renderer, RenderViewWithFragments} from 'angular2/src/core/render/api';
import {Locals} from 'angular2/src/core/change_detection/change_detection';
import {Pipes} from 'angular2/src/core/pipes/pipes';

@Injectable()
export class AppViewManagerUtils {
  constructor() {}

  getComponentInstance(parentView: viewModule.AppView, boundElementIndex: number): any {
    var eli = parentView.elementInjectors[boundElementIndex];
    return eli.getComponent();
  }

  createView(mergedParentViewProto: viewModule.AppProtoView,
             renderViewWithFragments: RenderViewWithFragments,
             viewManager: avmModule.AppViewManager, renderer: Renderer): viewModule.AppView {
    var renderFragments = renderViewWithFragments.fragmentRefs;
    var renderView = renderViewWithFragments.viewRef;

    var elementCount = mergedParentViewProto.mergeInfo.elementCount;
    var viewCount = mergedParentViewProto.mergeInfo.viewCount;
    var elementRefs: ElementRef[] = ListWrapper.createFixedSize(elementCount);
    var viewContainers = ListWrapper.createFixedSize(elementCount);
    var preBuiltObjects: eli.PreBuiltObjects[] = ListWrapper.createFixedSize(elementCount);
    var elementInjectors: eli.ElementInjector[] = ListWrapper.createFixedSize(elementCount);
    var views = ListWrapper.createFixedSize(viewCount);

    var elementOffset = 0;
    var textOffset = 0;
    var fragmentIdx = 0;
    var containerElementIndicesByViewIndex: number[] = ListWrapper.createFixedSize(viewCount);
    for (var viewOffset = 0; viewOffset < viewCount; viewOffset++) {
      var containerElementIndex = containerElementIndicesByViewIndex[viewOffset];
      var containerElementInjector =
          isPresent(containerElementIndex) ? elementInjectors[containerElementIndex] : null;
      var parentView =
          isPresent(containerElementInjector) ? preBuiltObjects[containerElementIndex].view : null;
      var protoView =
          isPresent(containerElementIndex) ?
              parentView.proto.elementBinders[containerElementIndex - parentView.elementOffset]
                  .nestedProtoView :
              mergedParentViewProto;
      var renderFragment = null;
      if (viewOffset === 0 || protoView.type === viewModule.ViewType.EMBEDDED) {
        renderFragment = renderFragments[fragmentIdx++];
      }
      var currentView = new viewModule.AppView(renderer, protoView, viewOffset, elementOffset,
                                               textOffset, protoView.protoLocals, renderView,
                                               renderFragment, containerElementInjector);
      views[viewOffset] = currentView;
      if (isPresent(containerElementIndex)) {
        preBuiltObjects[containerElementIndex].nestedView = currentView;
      }
      var rootElementInjectors = [];
      var nestedViewOffset = viewOffset + 1;
      for (var binderIdx = 0; binderIdx < protoView.elementBinders.length; binderIdx++) {
        var binder = protoView.elementBinders[binderIdx];
        var boundElementIndex = elementOffset + binderIdx;
        var elementInjector = null;

        if (isPresent(binder.nestedProtoView) && binder.nestedProtoView.isMergable) {
          containerElementIndicesByViewIndex[nestedViewOffset] = boundElementIndex;
          nestedViewOffset += binder.nestedProtoView.mergeInfo.viewCount;
        }

        // elementInjectors and rootElementInjectors
        var protoElementInjector = binder.protoElementInjector;
        if (isPresent(protoElementInjector)) {
          if (isPresent(protoElementInjector.parent)) {
            var parentElementInjector =
                elementInjectors[elementOffset + protoElementInjector.parent.index];
            elementInjector = protoElementInjector.instantiate(parentElementInjector);
          } else {
            elementInjector = protoElementInjector.instantiate(null);
            rootElementInjectors.push(elementInjector);
          }
        }
        elementInjectors[boundElementIndex] = elementInjector;

        // elementRefs
        var el = new ElementRef_(currentView.ref, boundElementIndex, renderer);
        elementRefs[el.boundElementIndex] = el;

        // preBuiltObjects
        if (isPresent(elementInjector)) {
          var templateRef = isPresent(binder.nestedProtoView) &&
                                    binder.nestedProtoView.type === viewModule.ViewType.EMBEDDED ?
                                new TemplateRef_(el) :
                                null;
          preBuiltObjects[boundElementIndex] =
              new eli.PreBuiltObjects(viewManager, currentView, el, templateRef);
        }
      }
      currentView.init(protoView.changeDetectorFactory(currentView), elementInjectors,
                       rootElementInjectors, preBuiltObjects, views, elementRefs, viewContainers);
      if (isPresent(parentView) && protoView.type === viewModule.ViewType.COMPONENT) {
        parentView.changeDetector.addViewChild(currentView.changeDetector);
      }
      elementOffset += protoView.elementBinders.length;
      textOffset += protoView.textBindingCount;
    }
    return views[0];
  }

  hydrateRootHostView(hostView: viewModule.AppView, injector: Injector) {
    this._hydrateView(hostView, injector, null, new Object(), null);
  }

  // Misnomer: this method is attaching next to the view container.
  attachViewInContainer(parentView: viewModule.AppView, boundElementIndex: number,
                        contextView: viewModule.AppView, contextBoundElementIndex: number,
                        index: number, view: viewModule.AppView) {
    if (isBlank(contextView)) {
      contextView = parentView;
      contextBoundElementIndex = boundElementIndex;
    }
    parentView.changeDetector.addContentChild(view.changeDetector);
    var viewContainer = parentView.viewContainers[boundElementIndex];
    if (isBlank(viewContainer)) {
      viewContainer = new viewModule.AppViewContainer();
      parentView.viewContainers[boundElementIndex] = viewContainer;
    }
    ListWrapper.insert(viewContainer.views, index, view);
    var elementInjector = contextView.elementInjectors[contextBoundElementIndex];

    for (var i = view.rootElementInjectors.length - 1; i >= 0; i--) {
      if (isPresent(elementInjector.parent)) {
        view.rootElementInjectors[i].link(elementInjector.parent);
      }
    }
    elementInjector.traverseAndSetQueriesAsDirty();
  }

  detachViewInContainer(parentView: viewModule.AppView, boundElementIndex: number, index: number) {
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[index];

    parentView.elementInjectors[boundElementIndex].traverseAndSetQueriesAsDirty();

    view.changeDetector.remove();
    ListWrapper.removeAt(viewContainer.views, index);
    for (var i = 0; i < view.rootElementInjectors.length; ++i) {
      var inj = view.rootElementInjectors[i];
      inj.unlink();
    }
  }


  hydrateViewInContainer(parentView: viewModule.AppView, boundElementIndex: number,
                         contextView: viewModule.AppView, contextBoundElementIndex: number,
                         index: number, imperativelyCreatedProviders: ResolvedProvider[]) {
    if (isBlank(contextView)) {
      contextView = parentView;
      contextBoundElementIndex = boundElementIndex;
    }
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[index];
    var elementInjector = contextView.elementInjectors[contextBoundElementIndex];

    var injector = isPresent(imperativelyCreatedProviders) ?
                       Injector.fromResolvedProviders(imperativelyCreatedProviders) :
                       null;
    this._hydrateView(view, injector, elementInjector.getHost(), contextView.context,
                      contextView.locals);
  }

  /** @internal */
  _hydrateView(initView: viewModule.AppView, imperativelyCreatedInjector: Injector,
               hostElementInjector: eli.ElementInjector, context: Object, parentLocals: Locals) {
    var viewIdx = initView.viewOffset;
    var endViewOffset = viewIdx + initView.proto.mergeInfo.viewCount - 1;
    while (viewIdx <= endViewOffset) {
      var currView = initView.views[viewIdx];
      var currProtoView = currView.proto;
      if (currView !== initView && currView.proto.type === viewModule.ViewType.EMBEDDED) {
        // Don't hydrate components of embedded fragment views.
        viewIdx += currView.proto.mergeInfo.viewCount;
      } else {
        if (currView !== initView) {
          // hydrate a nested component view
          imperativelyCreatedInjector = null;
          parentLocals = null;
          hostElementInjector = currView.containerElementInjector;
          context = hostElementInjector.getComponent();
        }
        currView.context = context;
        currView.locals.parent = parentLocals;
        var binders = currProtoView.elementBinders;
        for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
          var boundElementIndex = binderIdx + currView.elementOffset;
          var elementInjector = initView.elementInjectors[boundElementIndex];

          if (isPresent(elementInjector)) {
            elementInjector.hydrate(imperativelyCreatedInjector, hostElementInjector,
                                    currView.preBuiltObjects[boundElementIndex]);
            this._populateViewLocals(currView, elementInjector, boundElementIndex);
            this._setUpEventEmitters(currView, elementInjector, boundElementIndex);
          }
        }
        var pipes = isPresent(hostElementInjector) ?
                        new Pipes(currView.proto.pipes, hostElementInjector.getInjector()) :
                        null;
        currView.changeDetector.hydrate(currView.context, currView.locals, currView, pipes);
        viewIdx++;
      }
    }
  }

  /** @internal */
  _populateViewLocals(view: viewModule.AppView, elementInjector: eli.ElementInjector,
                      boundElementIdx: number): void {
    if (isPresent(elementInjector.getDirectiveVariableBindings())) {
      elementInjector.getDirectiveVariableBindings().forEach((directiveIndex, name) => {
        if (isBlank(directiveIndex)) {
          view.locals.set(name, view.elementRefs[boundElementIdx].nativeElement);
        } else {
          view.locals.set(name, elementInjector.getDirectiveAtIndex(directiveIndex));
        }
      });
    }
  }

  /** @internal */
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

  dehydrateView(initView: viewModule.AppView) {
    var endViewOffset = initView.viewOffset + initView.proto.mergeInfo.viewCount - 1;
    for (var viewIdx = initView.viewOffset; viewIdx <= endViewOffset; viewIdx++) {
      var currView = initView.views[viewIdx];
      if (currView.hydrated()) {
        if (isPresent(currView.locals)) {
          currView.locals.clearValues();
        }
        currView.context = null;
        currView.changeDetector.dehydrate();
        var binders = currView.proto.elementBinders;
        for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
          var eli = initView.elementInjectors[currView.elementOffset + binderIdx];
          if (isPresent(eli)) {
            eli.dehydrate();
          }
        }
      }
    }
  }
}
