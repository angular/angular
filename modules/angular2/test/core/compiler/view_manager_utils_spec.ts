import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit,
  Log,
  SpyObject
} from 'angular2/test_lib';

import {
  SpyChangeDetector,
  SpyProtoChangeDetector,
  SpyProtoElementInjector,
  SpyElementInjector,
  SpyPreBuiltObjects
} from '../spies';

import {Injector, bind} from 'angular2/di';
import {isBlank, isPresent} from 'angular2/src/core/facade/lang';
import {MapWrapper, ListWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';

import {AppProtoView, AppView, AppProtoViewMergeMapping} from 'angular2/src/core/compiler/view';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {
  DirectiveBinding,
  ElementInjector,
  PreBuiltObjects,
  ProtoElementInjector
} from 'angular2/src/core/compiler/element_injector';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {Component} from 'angular2/metadata';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {
  RenderProtoViewMergeMapping,
  ViewType,
  RenderViewWithFragments
} from 'angular2/src/core/render/render';

export function main() {
  // TODO(tbosch): add more tests here!

  describe('AppViewManagerUtils', () => {

    var utils: AppViewManagerUtils;

    beforeEach(() => { utils = new AppViewManagerUtils(); });

    function createViewWithChildren(pv: AppProtoView): AppView {
      var renderViewWithFragments = new RenderViewWithFragments(null, [null, null]);
      return utils.createView(pv, renderViewWithFragments, null, null);
    }

    describe('shared hydrate functionality', () => {

      it("should hydrate the change detector after hydrating element injectors", () => {
        var log = new Log();

        var componentProtoView = createComponentPv([createEmptyElBinder()]);
        var hostView =
            createViewWithChildren(createHostPv([createNestedElBinder(componentProtoView)]));
        var componentView = hostView.views[1];

        var spyEi = <any>componentView.elementInjectors[0];
        spyEi.spy('hydrate').andCallFake(log.fn('hydrate'));

        var spyCd = <any>componentView.changeDetector;
        spyCd.spy('hydrate').andCallFake(log.fn('hydrateCD'));

        utils.hydrateRootHostView(hostView, createInjector());

        expect(log.result()).toEqual('hydrate; hydrateCD');
      });

      it("should set up event listeners", () => {
        var dir = new Object();

        var hostPv =
            createHostPv([createNestedElBinder(createComponentPv()), createEmptyElBinder()]);
        var hostView = createViewWithChildren(hostPv);
        var spyEventAccessor1 = SpyObject.stub({"subscribe": null});
        SpyObject.stub(
            hostView.elementInjectors[0],
            {'getEventEmitterAccessors': [[spyEventAccessor1]], 'getDirectiveAtIndex': dir});
        var spyEventAccessor2 = SpyObject.stub({"subscribe": null});
        SpyObject.stub(
            hostView.elementInjectors[1],
            {'getEventEmitterAccessors': [[spyEventAccessor2]], 'getDirectiveAtIndex': dir});

        utils.hydrateRootHostView(hostView, createInjector());

        expect(spyEventAccessor1.spy('subscribe')).toHaveBeenCalledWith(hostView, 0, dir);
        expect(spyEventAccessor2.spy('subscribe')).toHaveBeenCalledWith(hostView, 1, dir);
      });

      it("should not hydrate element injectors of component views inside of embedded fragments",
         () => {
           var hostView = createViewWithChildren(createHostPv([
             createNestedElBinder(createComponentPv([
               createNestedElBinder(createEmbeddedPv(
                   [createNestedElBinder(createComponentPv([createEmptyElBinder()]))]))
             ]))
           ]));

           utils.hydrateRootHostView(hostView, createInjector());
           expect(hostView.elementInjectors.length).toBe(4);
           expect((<any>hostView.elementInjectors[3]).spy('hydrate')).not.toHaveBeenCalled();
         });


    });

    describe('attachViewInContainer', () => {
      var parentView, contextView, childView;

      function createViews(numInj = 1) {
        var childPv = createEmbeddedPv([createEmptyElBinder()]);
        childView = createViewWithChildren(childPv);

        var parentPv = createHostPv([createEmptyElBinder()]);
        parentView = createViewWithChildren(parentPv);

        var binders = [];
        for (var i = 0; i < numInj; i++) {
          binders.push(createEmptyElBinder(i > 0 ? binders[i - 1] : null))
        }
        var contextPv = createHostPv(binders);
        contextView = createViewWithChildren(contextPv);
      }

      it('should not modify the rootElementInjectors at the given context view', () => {
        createViews();
        utils.attachViewInContainer(parentView, 0, contextView, 0, 0, childView);
        expect(contextView.rootElementInjectors.length).toEqual(1);
      });

      it('should link the views rootElementInjectors after the elementInjector at the given context',
         () => {
           createViews(2);
           utils.attachViewInContainer(parentView, 0, contextView, 1, 0, childView);
           expect(childView.rootElementInjectors[0].spy('link'))
               .toHaveBeenCalledWith(contextView.elementInjectors[0]);
         });
    });

    describe('hydrateViewInContainer', () => {
      var parentView, contextView, childView;

      function createViews() {
        var parentPv = createHostPv([createEmptyElBinder()]);
        parentView = createViewWithChildren(parentPv);

        var contextPv = createHostPv([createEmptyElBinder()]);
        contextView = createViewWithChildren(contextPv);

        var childPv = createEmbeddedPv([createEmptyElBinder()]);
        childView = createViewWithChildren(childPv);
        utils.attachViewInContainer(parentView, 0, contextView, 0, 0, childView);
      }

      it("should instantiate the elementInjectors with the host of the context's elementInjector",
         () => {
           createViews();

           utils.hydrateViewInContainer(parentView, 0, contextView, 0, 0, null);
           expect(childView.rootElementInjectors[0].spy('hydrate'))
               .toHaveBeenCalledWith(null, contextView.elementInjectors[0].getHost(),
                                     childView.preBuiltObjects[0]);
         });
    });

    describe('hydrateRootHostView', () => {
      var hostView;

      function createViews() {
        var hostPv = createHostPv([createNestedElBinder(createComponentPv())]);
        hostView = createViewWithChildren(hostPv);
      }

      it("should instantiate the elementInjectors with the given injector and an empty host element injector",
         () => {
           var injector = createInjector();
           createViews();

           utils.hydrateRootHostView(hostView, injector);
           expect(hostView.rootElementInjectors[0].spy('hydrate'))
               .toHaveBeenCalledWith(injector, null, hostView.preBuiltObjects[0]);
         });

    });

  });
}


export function createInjector() {
  return Injector.resolveAndCreate([]);
}

function createElementInjector(parent = null) {
  var host = new SpyElementInjector();
  var elementInjector = new SpyElementInjector();
  var res = SpyObject.stub(elementInjector,
                           {
                             'isExportingComponent': false,
                             'isExportingElement': false,
                             'getEventEmitterAccessors': [],
                             'getHostActionAccessors': [],
                             'getComponent': new Object(),
                             'getHost': host
                           },
                           {});
  res.prop('parent', parent);
  return res;
}

export function createProtoElInjector(parent: ProtoElementInjector = null): ProtoElementInjector {
  var pei = new SpyProtoElementInjector();
  pei.prop("parent", parent);
  pei.prop("index", 0);
  pei.spy('instantiate').andCallFake((parentEli) => createElementInjector(parentEli));
  return <any>pei;
}

export function createEmptyElBinder(parent: ElementBinder = null) {
  var parentPeli = isPresent(parent) ? parent.protoElementInjector : null;
  return new ElementBinder(0, null, 0, createProtoElInjector(parentPeli), null);
}

export function createNestedElBinder(nestedProtoView: AppProtoView) {
  var componentBinding = null;
  if (nestedProtoView.type === ViewType.COMPONENT) {
    var annotation = new DirectiveResolver().resolve(SomeComponent);
    componentBinding = DirectiveBinding.createFromType(SomeComponent, annotation);
  }
  var binder = new ElementBinder(0, null, 0, createProtoElInjector(), componentBinding);
  binder.nestedProtoView = nestedProtoView;
  return binder;
}

function countNestedElementBinders(pv: AppProtoView): number {
  var result = pv.elementBinders.length;
  pv.elementBinders.forEach(binder => {
    if (isPresent(binder.nestedProtoView)) {
      result += countNestedElementBinders(binder.nestedProtoView);
    }
  });
  return result;
}

function calcHostElementIndicesByViewIndex(pv: AppProtoView, elementOffset = 0,
                                           target: number[] = null): number[] {
  if (isBlank(target)) {
    target = [null];
  }
  for (var binderIdx = 0; binderIdx < pv.elementBinders.length; binderIdx++) {
    var binder = pv.elementBinders[binderIdx];
    if (isPresent(binder.nestedProtoView)) {
      target.push(elementOffset + binderIdx);
      calcHostElementIndicesByViewIndex(binder.nestedProtoView,
                                        elementOffset + pv.elementBinders.length, target);
      elementOffset += countNestedElementBinders(binder.nestedProtoView);
    }
  }
  return target;
}

function countNestedProtoViews(pv: AppProtoView, target: number[] = null): number[] {
  if (isBlank(target)) {
    target = [];
  }
  target.push(null);
  var resultIndex = target.length - 1;
  var count = 0;
  for (var binderIdx = 0; binderIdx < pv.elementBinders.length; binderIdx++) {
    var binder = pv.elementBinders[binderIdx];
    if (isPresent(binder.nestedProtoView)) {
      var nextResultIndex = target.length;
      countNestedProtoViews(binder.nestedProtoView, target);
      count += target[nextResultIndex] + 1;
    }
  }
  target[resultIndex] = count;
  return target;
}

function _createProtoView(type: ViewType, binders: ElementBinder[] = null) {
  if (isBlank(binders)) {
    binders = [];
  }
  var protoChangeDetector = <any>new SpyProtoChangeDetector();
  protoChangeDetector.spy('instantiate').andReturn(new SpyChangeDetector());
  var res = new AppProtoView(type, null, null, protoChangeDetector, null, null, 0, null);
  res.elementBinders = binders;
  var mappedElementIndices = ListWrapper.createFixedSize(countNestedElementBinders(res));
  for (var i = 0; i < binders.length; i++) {
    var binder = binders[i];
    mappedElementIndices[i] = i;
    binder.protoElementInjector.index = i;
  }
  var hostElementIndicesByViewIndex = calcHostElementIndicesByViewIndex(res);
  if (type === ViewType.EMBEDDED || type === ViewType.HOST) {
    res.mergeMapping = new AppProtoViewMergeMapping(
        new RenderProtoViewMergeMapping(null, hostElementIndicesByViewIndex.length,
                                        mappedElementIndices, mappedElementIndices.length, [],
                                        hostElementIndicesByViewIndex, countNestedProtoViews(res)));
  }
  return res;
}

export function createHostPv(binders: ElementBinder[] = null) {
  return _createProtoView(ViewType.HOST, binders);
}

export function createComponentPv(binders: ElementBinder[] = null) {
  return _createProtoView(ViewType.COMPONENT, binders);
}

export function createEmbeddedPv(binders: ElementBinder[] = null) {
  return _createProtoView(ViewType.EMBEDDED, binders);
}


@Component({selector: 'someComponent'})
class SomeComponent {
}
