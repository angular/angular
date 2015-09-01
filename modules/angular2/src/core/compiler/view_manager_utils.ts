import {Injector, Binding, Injectable, ResolvedBinding} from 'angular2/di';
import {ListWrapper, MapWrapper, Map, StringMapWrapper} from 'angular2/src/core/facade/collection';
import * as eli from './element_injector';
import {isPresent, isBlank, BaseException} from 'angular2/src/core/facade/lang';
import * as viewModule from './view';
import {internalView} from './view_ref';
import * as avmModule from './view_manager';
import {ElementRef} from './element_ref';
import {TemplateRef} from './template_ref';
import {Renderer, RenderViewWithFragments} from 'angular2/src/core/render/api';
import {Locals} from 'angular2/src/core/change_detection/change_detection';
import {Pipes} from 'angular2/src/core/pipes/pipes';
import {RenderViewRef, RenderFragmentRef, ViewType} from 'angular2/src/core/render/api';

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

    var elementCount = mergedParentViewProto.mergeMapping.renderElementIndices.length;
    var viewCount = mergedParentViewProto.mergeMapping.nestedViewCountByViewIndex[0] + 1;
    var elementRefs: ElementRef[] = ListWrapper.createFixedSize(elementCount);
    var viewContainers = ListWrapper.createFixedSize(elementCount);
    var preBuiltObjects: eli.PreBuiltObjects[] = ListWrapper.createFixedSize(elementCount);
    var elementInjectors = ListWrapper.createFixedSize(elementCount);
    var views = ListWrapper.createFixedSize(viewCount);

    var elementOffset = 0;
    var textOffset = 0;
    var fragmentIdx = 0;
    for (var viewOffset = 0; viewOffset < viewCount; viewOffset++) {
      var hostElementIndex =
          mergedParentViewProto.mergeMapping.hostElementIndicesByViewIndex[viewOffset];
      var parentView = isPresent(hostElementIndex) ?
                           internalView(elementRefs[hostElementIndex].parentView) :
                           null;
      var protoView =
          isPresent(hostElementIndex) ?
              parentView.proto.elementBinders[hostElementIndex - parentView.elementOffset]
                  .nestedProtoView :
              mergedParentViewProto;
      var renderFragment = null;
      if (viewOffset === 0 || protoView.type === ViewType.EMBEDDED) {
        renderFragment = renderFragments[fragmentIdx++];
      }
      var currentView = new viewModule.AppView(
          renderer, protoView, mergedParentViewProto.mergeMapping, viewOffset, elementOffset,
          textOffset, protoView.protoLocals, renderView, renderFragment);
      views[viewOffset] = currentView;
      var rootElementInjectors = [];
      for (var binderIdx = 0; binderIdx < protoView.elementBinders.length; binderIdx++) {
        var binder = protoView.elementBinders[binderIdx];
        var boundElementIndex = elementOffset + binderIdx;
        var elementInjector = null;

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
        var el = new ElementRef(
            currentView.ref, boundElementIndex,
            mergedParentViewProto.mergeMapping.renderElementIndices[boundElementIndex], renderer);
        elementRefs[el.boundElementIndex] = el;

        // preBuiltObjects
        if (isPresent(elementInjector)) {
          var templateRef = binder.hasEmbeddedProtoView() ? new TemplateRef(el) : null;
          preBuiltObjects[boundElementIndex] =
              new eli.PreBuiltObjects(viewManager, currentView, el, templateRef);
        }
      }
      currentView.init(protoView.protoChangeDetector.instantiate(currentView), elementInjectors,
                       rootElementInjectors, preBuiltObjects, views, elementRefs, viewContainers);
      if (isPresent(parentView) && protoView.type === ViewType.COMPONENT) {
        parentView.changeDetector.addShadowDomChild(currentView.changeDetector);
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
                        atIndex: number, view: viewModule.AppView) {
    if (isBlank(contextView)) {
      contextView = parentView;
      contextBoundElementIndex = boundElementIndex;
    }
    parentView.changeDetector.addChild(view.changeDetector);
    var viewContainer = parentView.viewContainers[boundElementIndex];
    if (isBlank(viewContainer)) {
      viewContainer = new viewModule.AppViewContainer();
      parentView.viewContainers[boundElementIndex] = viewContainer;
    }
    ListWrapper.insert(viewContainer.views, atIndex, view);
    var elementInjector = contextView.elementInjectors[contextBoundElementIndex];

    var sibling;
    if (atIndex == 0) {
      sibling = elementInjector;
    } else {
      sibling = ListWrapper.last(viewContainer.views[atIndex - 1].rootElementInjectors);
    }
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
        if (removeIdx >= 0) {
          ListWrapper.removeAt(parentView.rootElementInjectors, removeIdx);
        }
      }
    }
  }

  hydrateViewInContainer(parentView: viewModule.AppView, boundElementIndex: number,
                         contextView: viewModule.AppView, contextBoundElementIndex: number,
                         atIndex: number, imperativelyCreatedBindings: ResolvedBinding[]) {
    if (isBlank(contextView)) {
      contextView = parentView;
      contextBoundElementIndex = boundElementIndex;
    }
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var view = viewContainer.views[atIndex];
    var elementInjector = contextView.elementInjectors[contextBoundElementIndex];

    var injector = isPresent(imperativelyCreatedBindings) ?
                       Injector.fromResolvedBindings(imperativelyCreatedBindings) :
                       null;
    this._hydrateView(view, injector, elementInjector.getHost(), contextView.context,
                      contextView.locals);
  }

  _hydrateView(initView: viewModule.AppView, imperativelyCreatedInjector: Injector,
               hostElementInjector: eli.ElementInjector, context: Object, parentLocals: Locals) {
    var viewIdx = initView.viewOffset;
    var endViewOffset = viewIdx + initView.mainMergeMapping.nestedViewCountByViewIndex[viewIdx];
    while (viewIdx <= endViewOffset) {
      var currView = initView.views[viewIdx];
      var currProtoView = currView.proto;
      if (currView !== initView && currView.proto.type === ViewType.EMBEDDED) {
        // Don't hydrate components of embedded fragment views.
        viewIdx += initView.mainMergeMapping.nestedViewCountByViewIndex[viewIdx] + 1;
      } else {
        if (currView !== initView) {
          // hydrate a nested component view
          imperativelyCreatedInjector = null;
          parentLocals = null;
          var hostElementIndex = initView.mainMergeMapping.hostElementIndicesByViewIndex[viewIdx];
          hostElementInjector = initView.elementInjectors[hostElementIndex];
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

  _populateViewLocals(view: viewModule.AppView, elementInjector: eli.ElementInjector,
                      boundElementIdx: number): void {
    if (isPresent(elementInjector.getDirectiveVariableBindings())) {
      MapWrapper.forEach(elementInjector.getDirectiveVariableBindings(), (directiveIndex, name) => {
        if (isBlank(directiveIndex)) {
          view.locals.set(name, view.elementRefs[boundElementIdx].nativeElement);
        } else {
          view.locals.set(name, elementInjector.getDirectiveAtIndex(directiveIndex));
        }
      });
    }
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

  dehydrateView(initView: viewModule.AppView) {
    var endViewOffset = initView.viewOffset +
                        initView.mainMergeMapping.nestedViewCountByViewIndex[initView.viewOffset];
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
