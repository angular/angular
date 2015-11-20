library angular2.test.core.linker.view_manager_utils_spec;

import "package:angular2/testing_internal.dart"
    show
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
        SpyObject;
import "../spies.dart"
    show
        SpyChangeDetector,
        SpyProtoElementInjector,
        SpyElementInjector,
        SpyPreBuiltObjects;
import "package:angular2/core.dart" show Injector, provide;
import "package:angular2/src/facade/lang.dart" show isBlank, isPresent;
import "package:angular2/src/core/linker/view.dart"
    show AppProtoView, AppView, AppProtoViewMergeInfo, ViewType;
import "package:angular2/src/core/linker/element_binder.dart"
    show ElementBinder;
import "package:angular2/src/core/linker/element_injector.dart"
    show
        DirectiveProvider,
        ElementInjector,
        PreBuiltObjects,
        ProtoElementInjector;
import "package:angular2/src/core/linker/directive_resolver.dart"
    show DirectiveResolver;
import "package:angular2/src/core/metadata.dart" show Component;
import "package:angular2/src/core/linker/view_manager_utils.dart"
    show AppViewManagerUtils;
import "package:angular2/core.dart" show RenderViewWithFragments;

main() {
  // TODO(tbosch): add more tests here!
  describe("AppViewManagerUtils", () {
    AppViewManagerUtils utils;
    beforeEach(() {
      utils = new AppViewManagerUtils();
    });
    AppView createViewWithChildren(AppProtoView pv) {
      var renderViewWithFragments =
          new RenderViewWithFragments(null, [null, null]);
      return utils.createView(pv, renderViewWithFragments, null, null);
    }
    describe("shared hydrate functionality", () {
      it("should hydrate the change detector after hydrating element injectors",
          () {
        var log = new Log();
        var componentProtoView = createComponentPv([createEmptyElBinder()]);
        var hostView = createViewWithChildren(
            createHostPv([createNestedElBinder(componentProtoView)]));
        var componentView = hostView.views[1];
        var spyEi = (componentView.elementInjectors[0] as dynamic);
        spyEi.spy("hydrate").andCallFake(log.fn("hydrate"));
        var spyCd = (componentView.changeDetector as dynamic);
        spyCd.spy("hydrate").andCallFake(log.fn("hydrateCD"));
        utils.hydrateRootHostView(hostView, createInjector());
        expect(log.result()).toEqual("hydrate; hydrateCD");
      });
      it("should set up event listeners", () {
        var dir = new Object();
        var hostPv = createHostPv(
            [createNestedElBinder(createComponentPv()), createEmptyElBinder()]);
        var hostView = createViewWithChildren(hostPv);
        var spyEventAccessor1 = SpyObject.stub({"subscribe": null});
        SpyObject.stub(hostView.elementInjectors[0], {
          "getEventEmitterAccessors": [
            [spyEventAccessor1]
          ],
          "getDirectiveAtIndex": dir
        });
        var spyEventAccessor2 = SpyObject.stub({"subscribe": null});
        SpyObject.stub(hostView.elementInjectors[1], {
          "getEventEmitterAccessors": [
            [spyEventAccessor2]
          ],
          "getDirectiveAtIndex": dir
        });
        utils.hydrateRootHostView(hostView, createInjector());
        expect(spyEventAccessor1.spy("subscribe"))
            .toHaveBeenCalledWith(hostView, 0, dir);
        expect(spyEventAccessor2.spy("subscribe"))
            .toHaveBeenCalledWith(hostView, 1, dir);
      });
      it("should not hydrate element injectors of component views inside of embedded fragments",
          () {
        var hostView = createViewWithChildren(createHostPv([
          createNestedElBinder(createComponentPv([
            createNestedElBinder(createEmbeddedPv([
              createNestedElBinder(createComponentPv([createEmptyElBinder()]))
            ]))
          ]))
        ]));
        utils.hydrateRootHostView(hostView, createInjector());
        expect(hostView.elementInjectors.length).toBe(4);
        expect(((hostView.elementInjectors[3] as dynamic)).spy("hydrate"))
            .not
            .toHaveBeenCalled();
      });
    });
    describe("attachViewInContainer", () {
      var parentView, contextView, childView;
      createViews([numInj = 1]) {
        var childPv = createEmbeddedPv([createEmptyElBinder()]);
        childView = createViewWithChildren(childPv);
        var parentPv = createHostPv([createEmptyElBinder()]);
        parentView = createViewWithChildren(parentPv);
        var binders = [];
        for (var i = 0; i < numInj; i++) {
          binders.add(createEmptyElBinder(i > 0 ? binders[i - 1] : null));
        }
        var contextPv = createHostPv(binders);
        contextView = createViewWithChildren(contextPv);
      }
      it("should not modify the rootElementInjectors at the given context view",
          () {
        createViews();
        utils.attachViewInContainer(
            parentView, 0, contextView, 0, 0, childView);
        expect(contextView.rootElementInjectors.length).toEqual(1);
      });
      it("should link the views rootElementInjectors after the elementInjector at the given context",
          () {
        createViews(2);
        utils.attachViewInContainer(
            parentView, 0, contextView, 1, 0, childView);
        expect(childView.rootElementInjectors[0].spy("link"))
            .toHaveBeenCalledWith(contextView.elementInjectors[0]);
      });
    });
    describe("hydrateViewInContainer", () {
      var parentView, contextView, childView;
      createViews() {
        var parentPv = createHostPv([createEmptyElBinder()]);
        parentView = createViewWithChildren(parentPv);
        var contextPv = createHostPv([createEmptyElBinder()]);
        contextView = createViewWithChildren(contextPv);
        var childPv = createEmbeddedPv([createEmptyElBinder()]);
        childView = createViewWithChildren(childPv);
        utils.attachViewInContainer(
            parentView, 0, contextView, 0, 0, childView);
      }
      it("should instantiate the elementInjectors with the host of the context's elementInjector",
          () {
        createViews();
        utils.hydrateViewInContainer(parentView, 0, contextView, 0, 0, null);
        expect(childView.rootElementInjectors[0].spy("hydrate"))
            .toHaveBeenCalledWith(
                null,
                contextView.elementInjectors[0].getHost(),
                childView.preBuiltObjects[0]);
      });
    });
    describe("hydrateRootHostView", () {
      var hostView;
      createViews() {
        var hostPv = createHostPv([createNestedElBinder(createComponentPv())]);
        hostView = createViewWithChildren(hostPv);
      }
      it("should instantiate the elementInjectors with the given injector and an empty host element injector",
          () {
        var injector = createInjector();
        createViews();
        utils.hydrateRootHostView(hostView, injector);
        expect(hostView.rootElementInjectors[0].spy("hydrate"))
            .toHaveBeenCalledWith(injector, null, hostView.preBuiltObjects[0]);
      });
    });
  });
}

createInjector() {
  return Injector.resolveAndCreate([]);
}

createElementInjector([parent = null]) {
  var host = new SpyElementInjector();
  var elementInjector = new SpyElementInjector();
  var _preBuiltObjects = null;
  var res = SpyObject.stub(elementInjector, {
    "isExportingComponent": false,
    "isExportingElement": false,
    "getEventEmitterAccessors": [],
    "getHostActionAccessors": [],
    "getComponent": new Object(),
    "getHost": host
  });
  res.spy("getNestedView").andCallFake(() => _preBuiltObjects.nestedView);
  res.spy("hydrate").andCallFake((Injector mperativelyCreatedInjector,
      ElementInjector host, PreBuiltObjects preBuiltObjects) {
    _preBuiltObjects = preBuiltObjects;
  });
  res.prop("parent", parent);
  return res;
}

ProtoElementInjector createProtoElInjector(
    [ProtoElementInjector parent = null]) {
  var pei = new SpyProtoElementInjector();
  pei.prop("parent", parent);
  pei.prop("index", 0);
  pei
      .spy("instantiate")
      .andCallFake((parentEli) => createElementInjector(parentEli));
  return (pei as dynamic);
}

createEmptyElBinder([ElementBinder parent = null]) {
  var parentPeli = isPresent(parent) ? parent.protoElementInjector : null;
  return new ElementBinder(
      0, null, 0, createProtoElInjector(parentPeli), null, null);
}

createNestedElBinder(AppProtoView nestedProtoView) {
  var componentProvider = null;
  if (identical(nestedProtoView.type, ViewType.COMPONENT)) {
    var annotation = new DirectiveResolver().resolve(SomeComponent);
    componentProvider =
        DirectiveProvider.createFromType(SomeComponent, annotation);
  }
  return new ElementBinder(
      0, null, 0, createProtoElInjector(), componentProvider, nestedProtoView);
}

_createProtoView(ViewType type, [List<ElementBinder> binders = null]) {
  if (isBlank(binders)) {
    binders = [];
  }
  var res = new AppProtoView(null, [], type, true,
      (_) => new SpyChangeDetector(), new Map<String, dynamic>(), null);
  var mergedElementCount = 0;
  var mergedEmbeddedViewCount = 0;
  var mergedViewCount = 1;
  for (var i = 0; i < binders.length; i++) {
    var binder = binders[i];
    binder.protoElementInjector.index = i;
    mergedElementCount++;
    var nestedPv = binder.nestedProtoView;
    if (isPresent(nestedPv)) {
      mergedElementCount += nestedPv.mergeInfo.elementCount;
      mergedEmbeddedViewCount += nestedPv.mergeInfo.embeddedViewCount;
      mergedViewCount += nestedPv.mergeInfo.viewCount;
      if (identical(nestedPv.type, ViewType.EMBEDDED)) {
        mergedEmbeddedViewCount++;
      }
    }
  }
  var mergeInfo = new AppProtoViewMergeInfo(
      mergedEmbeddedViewCount, mergedElementCount, mergedViewCount);
  res.init(null, binders, 0, mergeInfo, new Map<String, num>());
  return res;
}

createHostPv([List<ElementBinder> binders = null]) {
  return _createProtoView(ViewType.HOST, binders);
}

createComponentPv([List<ElementBinder> binders = null]) {
  return _createProtoView(ViewType.COMPONENT, binders);
}

createEmbeddedPv([List<ElementBinder> binders = null]) {
  return _createProtoView(ViewType.EMBEDDED, binders);
}

@Component(selector: "someComponent")
class SomeComponent {}
