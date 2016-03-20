// TODO(tbosch): clang-format screws this up, see https://github.com/angular/clang-format/issues/11.

// Enable clang-format here again when this is fixed.

// clang-format off
library angular2.test.core.linker.element_spec;

import "package:angular2/testing_internal.dart"
    show
        describe,
        ddescribe,
        it,
        iit,
        xit,
        xdescribe,
        expect,
        beforeEach,
        beforeEachBindings,
        inject,
        AsyncTestCompleter,
        el,
        containsRegexp;
import "../spies.dart"
    show
        SpyView,
        SpyElementRef,
        SpyDirectiveResolver,
        SpyProtoView,
        SpyChangeDetector,
        SpyAppViewManager;
import "package:angular2/src/facade/lang.dart"
    show isBlank, isPresent, stringify, Type;
import "package:angular2/src/core/di.dart" show ResolvedProvider;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper, StringMapWrapper, iterateListLike;
import "package:angular2/src/core/di/type_literal.dart" show TypeLiteral;
import "package:angular2/src/core/linker/element.dart"
    show AppProtoElement, AppElement, DirectiveProvider;
import "package:angular2/src/core/linker/resolved_metadata_cache.dart"
    show ResolvedMetadataCache;
import "package:angular2/src/core/linker/directive_resolver.dart"
    show DirectiveResolver;
import "package:angular2/src/core/metadata.dart"
    show
        Attribute,
        Query,
        ViewQuery,
        ComponentMetadata,
        DirectiveMetadata,
        ViewEncapsulation;
import "package:angular2/core.dart" show OnDestroy, Directive;
import "package:angular2/core.dart"
    show
        provide,
        Injector,
        Provider,
        Optional,
        Inject,
        Injectable,
        Self,
        SkipSelf,
        InjectMetadata,
        Host,
        HostMetadata,
        SkipSelfMetadata;
import "package:angular2/src/core/linker/view_container_ref.dart"
    show ViewContainerRef, ViewContainerRef_;
import "package:angular2/src/core/linker/template_ref.dart"
    show TemplateRef, TemplateRef_;
import "package:angular2/src/core/linker/element_ref.dart" show ElementRef;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show DynamicChangeDetector, ChangeDetectorRef, Parser, Lexer;
import "package:angular2/src/core/change_detection/change_detector_ref.dart"
    show ChangeDetectorRef_;
import "package:angular2/src/core/linker/query_list.dart" show QueryList;
import "package:angular2/src/core/linker/view.dart" show AppView, AppProtoView;
import "package:angular2/src/core/linker/view_type.dart" show ViewType;

@Directive(selector: "")
class SimpleDirective {}

class SimpleService {}

@Directive(selector: "")
class SomeOtherDirective {}

var _constructionCount;

@Directive(selector: "")
class CountingDirective {
  num count;
  CountingDirective() {
    this.count = _constructionCount;
    _constructionCount += 1;
  }
}

@Directive(selector: "")
class FancyCountingDirective extends CountingDirective {
  FancyCountingDirective() : super() {
    /* super call moved to initializer */;
  }
}

@Directive(selector: "")
class NeedsDirective {
  SimpleDirective dependency;
  NeedsDirective(@Self() SimpleDirective dependency) {
    this.dependency = dependency;
  }
}

@Directive(selector: "")
class OptionallyNeedsDirective {
  SimpleDirective dependency;
  OptionallyNeedsDirective(@Self() @Optional() SimpleDirective dependency) {
    this.dependency = dependency;
  }
}

@Directive(selector: "")
class NeeedsDirectiveFromHost {
  SimpleDirective dependency;
  NeeedsDirectiveFromHost(@Host() SimpleDirective dependency) {
    this.dependency = dependency;
  }
}

@Directive(selector: "")
class NeedsDirectiveFromHostShadowDom {
  SimpleDirective dependency;
  NeedsDirectiveFromHostShadowDom(SimpleDirective dependency) {
    this.dependency = dependency;
  }
}

@Directive(selector: "")
class NeedsService {
  dynamic service;
  NeedsService(@Inject("service") service) {
    this.service = service;
  }
}

@Directive(selector: "")
class NeedsServiceFromHost {
  dynamic service;
  NeedsServiceFromHost(@Host() @Inject("service") service) {
    this.service = service;
  }
}

class HasEventEmitter {
  var emitter;
  HasEventEmitter() {
    this.emitter = "emitter";
  }
}

@Directive(selector: "")
class NeedsAttribute {
  var typeAttribute;
  var titleAttribute;
  var fooAttribute;
  NeedsAttribute(
      @Attribute("type") String typeAttribute,
      @Attribute("title") String titleAttribute,
      @Attribute("foo") String fooAttribute) {
    this.typeAttribute = typeAttribute;
    this.titleAttribute = titleAttribute;
    this.fooAttribute = fooAttribute;
  }
}

@Directive(selector: "")
class NeedsAttributeNoType {
  var fooAttribute;
  NeedsAttributeNoType(@Attribute("foo") fooAttribute) {
    this.fooAttribute = fooAttribute;
  }
}

@Directive(selector: "")
class NeedsQuery {
  QueryList<CountingDirective> query;
  NeedsQuery(@Query(CountingDirective) QueryList<CountingDirective> query) {
    this.query = query;
  }
}

@Directive(selector: "")
class NeedsViewQuery {
  QueryList<CountingDirective> query;
  NeedsViewQuery(
      @ViewQuery(CountingDirective) QueryList<CountingDirective> query) {
    this.query = query;
  }
}

@Directive(selector: "")
class NeedsQueryByVarBindings {
  QueryList<dynamic> query;
  NeedsQueryByVarBindings(@Query("one,two") QueryList<dynamic> query) {
    this.query = query;
  }
}

@Directive(selector: "")
class NeedsTemplateRefQuery {
  QueryList<TemplateRef> query;
  NeedsTemplateRefQuery(@Query(TemplateRef) QueryList<TemplateRef> query) {
    this.query = query;
  }
}

@Directive(selector: "")
class NeedsElementRef {
  var elementRef;
  NeedsElementRef(ElementRef ref) {
    this.elementRef = ref;
  }
}

@Directive(selector: "")
class NeedsViewContainer {
  var viewContainer;
  NeedsViewContainer(ViewContainerRef vc) {
    this.viewContainer = vc;
  }
}

@Directive(selector: "")
class NeedsTemplateRef {
  var templateRef;
  NeedsTemplateRef(TemplateRef ref) {
    this.templateRef = ref;
  }
}

@Directive(selector: "")
class OptionallyInjectsTemplateRef {
  var templateRef;
  OptionallyInjectsTemplateRef(@Optional() TemplateRef ref) {
    this.templateRef = ref;
  }
}

@Directive(selector: "")
class DirectiveNeedsChangeDetectorRef {
  ChangeDetectorRef changeDetectorRef;
  DirectiveNeedsChangeDetectorRef(this.changeDetectorRef) {}
}

@Directive(selector: "")
class ComponentNeedsChangeDetectorRef {
  ChangeDetectorRef changeDetectorRef;
  ComponentNeedsChangeDetectorRef(this.changeDetectorRef) {}
}

@Injectable()
class PipeNeedsChangeDetectorRef {
  ChangeDetectorRef changeDetectorRef;
  PipeNeedsChangeDetectorRef(this.changeDetectorRef) {}
}

@Injectable()
class ComponentNeedsGenericParameter {
  List<String> strings;
  ComponentNeedsGenericParameter(this.strings) {}
}

class A_Needs_B {
  A_Needs_B(dep) {}
}

class B_Needs_A {
  B_Needs_A(dep) {}
}

class DirectiveWithDestroy implements OnDestroy {
  num ngOnDestroyCounter;
  DirectiveWithDestroy() {
    this.ngOnDestroyCounter = 0;
  }
  ngOnDestroy() {
    this.ngOnDestroyCounter++;
  }
}

@Directive(selector: "")
class D0 {}

@Directive(selector: "")
class D1 {}

@Directive(selector: "")
class D2 {}

@Directive(selector: "")
class D3 {}

@Directive(selector: "")
class D4 {}

@Directive(selector: "")
class D5 {}

@Directive(selector: "")
class D6 {}

@Directive(selector: "")
class D7 {}

@Directive(selector: "")
class D8 {}

@Directive(selector: "")
class D9 {}

@Directive(selector: "")
class D10 {}

@Directive(selector: "")
class D11 {}

@Directive(selector: "")
class D12 {}

@Directive(selector: "")
class D13 {}

@Directive(selector: "")
class D14 {}

@Directive(selector: "")
class D15 {}

@Directive(selector: "")
class D16 {}

@Directive(selector: "")
class D17 {}

@Directive(selector: "")
class D18 {}

@Directive(selector: "")
class D19 {}

main() {
  // An injector with more than 10 providers will switch to the dynamic strategy
  var dynamicStrategyDirectives = [
    D0,
    D1,
    D2,
    D3,
    D4,
    D5,
    D6,
    D7,
    D8,
    D9,
    D10,
    D11,
    D12,
    D13,
    D14,
    D15,
    D16,
    D17,
    D18,
    D19
  ];
  ResolvedMetadataCache resolvedMetadataCache;
  Map<Type, DirectiveMetadata> mockDirectiveMeta;
  SpyDirectiveResolver directiveResolver;
  AppView dummyView;
  Function dummyViewFactory;
  AppView createView(ViewType type,
      [AppElement containerAppElement = null,
      List<ResolvedProvider> imperativelyCreatedProviders = null,
      Injector rootInjector = null,
      List<Type> pipes = null]) {
    if (isBlank(pipes)) {
      pipes = [];
    }
    var proto = AppProtoView.create(resolvedMetadataCache, type, pipes, {});
    var cd = new SpyChangeDetector();
    cd.prop("ref", new ChangeDetectorRef_((cd as dynamic)));
    var view = new AppView(
        proto,
        null,
        (new SpyAppViewManager() as dynamic),
        [],
        containerAppElement,
        imperativelyCreatedProviders,
        rootInjector,
        (cd as dynamic));
    view.init([], [], [], []);
    return view;
  }
  protoAppElement(index, List<Type> directives,
      [Map<String, String> attributes = null,
      Map<String, num> dirVariableBindings = null]) {
    return AppProtoElement.create(resolvedMetadataCache, index, attributes,
        directives, dirVariableBindings);
  }
  appElement(AppElement parent, List<Type> directives,
      [AppView view = null,
      Function embeddedViewFactory = null,
      Map<String, String> attributes = null,
      Map<String, num> dirVariableBindings = null]) {
    if (isBlank(view)) {
      view = dummyView;
    }
    var proto = protoAppElement(0, directives, attributes, dirVariableBindings);
    var el = new AppElement(proto, view, parent, null, embeddedViewFactory);
    view.appElements.add(el);
    return el;
  }
  parentChildElements(List<Type> parentDirectives, List<Type> childDirectives,
      [AppView view = null]) {
    if (isBlank(view)) {
      view = dummyView;
    }
    var parent = appElement(null, parentDirectives, view);
    var child = appElement(parent, childDirectives, view);
    return child;
  }
  AppElement hostShadowElement(
      List<Type> hostDirectives, List<Type> viewDirectives) {
    var host = appElement(null, hostDirectives);
    var view = createView(ViewType.COMPONENT, host);
    host.attachComponentView(view);
    return appElement(null, viewDirectives, view);
  }
  init() {
    beforeEachBindings(() {
      var delegateDirectiveResolver = new DirectiveResolver();
      directiveResolver = new SpyDirectiveResolver();
      directiveResolver.spy("resolve").andCallFake((directiveType) {
        var result = mockDirectiveMeta[directiveType];
        if (isBlank(result)) {
          result = delegateDirectiveResolver.resolve(directiveType);
        }
        return result;
      });
      return [provide(DirectiveResolver, useValue: directiveResolver)];
    });
    beforeEach(inject([ResolvedMetadataCache], (_metadataCache) {
      mockDirectiveMeta = new Map<Type, DirectiveMetadata>();
      resolvedMetadataCache = _metadataCache;
      dummyView = createView(ViewType.HOST);
      dummyViewFactory = () {};
      _constructionCount = 0;
    }));
  }
  describe("ProtoAppElement", () {
    init();
    describe("inline strategy", () {
      it("should allow for direct access using getProviderAtIndex", () {
        var proto = protoAppElement(0, [SimpleDirective]);
        expect(proto.getProviderAtIndex(0)).toBeAnInstanceOf(DirectiveProvider);
        expect(() => proto.getProviderAtIndex(-1))
            .toThrowError("Index -1 is out-of-bounds.");
        expect(() => proto.getProviderAtIndex(10))
            .toThrowError("Index 10 is out-of-bounds.");
      });
    });
    describe("dynamic strategy", () {
      it("should allow for direct access using getProviderAtIndex", () {
        var proto = protoAppElement(0, dynamicStrategyDirectives);
        expect(proto.getProviderAtIndex(0)).toBeAnInstanceOf(DirectiveProvider);
        expect(() => proto.getProviderAtIndex(-1))
            .toThrowError("Index -1 is out-of-bounds.");
        expect(() =>
                proto.getProviderAtIndex(dynamicStrategyDirectives.length - 1))
            .not
            .toThrow();
        expect(() =>
            proto.getProviderAtIndex(
                dynamicStrategyDirectives.length)).toThrowError(
            '''Index ${ dynamicStrategyDirectives . length} is out-of-bounds.''');
      });
    });
    describe(".create", () {
      it("should collect providers from all directives", () {
        mockDirectiveMeta[SimpleDirective] = new DirectiveMetadata(
            providers: [provide("injectable1", useValue: "injectable1")]);
        mockDirectiveMeta[SomeOtherDirective] = new DirectiveMetadata(
            providers: [provide("injectable2", useValue: "injectable2")]);
        var pel = protoAppElement(0, [SimpleDirective, SomeOtherDirective]);
        expect(pel.getProviderAtIndex(0).key.token).toBe(SimpleDirective);
        expect(pel.getProviderAtIndex(1).key.token).toBe(SomeOtherDirective);
        expect(pel.getProviderAtIndex(2).key.token).toEqual("injectable1");
        expect(pel.getProviderAtIndex(3).key.token).toEqual("injectable2");
      });
      it("should collect view providers from the component", () {
        mockDirectiveMeta[SimpleDirective] = new ComponentMetadata(
            viewProviders: [provide("injectable1", useValue: "injectable1")]);
        var pel = protoAppElement(0, [SimpleDirective]);
        expect(pel.getProviderAtIndex(0).key.token).toBe(SimpleDirective);
        expect(pel.getProviderAtIndex(1).key.token).toEqual("injectable1");
      });
      it("should flatten nested arrays in viewProviders and providers", () {
        mockDirectiveMeta[SimpleDirective] =
            new ComponentMetadata(viewProviders: [
          [
            [provide("view", useValue: "view")]
          ]
        ], providers: [
          [
            [provide("host", useValue: "host")]
          ]
        ]);
        var pel = protoAppElement(0, [SimpleDirective]);
        expect(pel.getProviderAtIndex(0).key.token).toBe(SimpleDirective);
        expect(pel.getProviderAtIndex(1).key.token).toEqual("view");
        expect(pel.getProviderAtIndex(2).key.token).toEqual("host");
      });
      it("should support an arbitrary number of providers", () {
        var pel = protoAppElement(0, dynamicStrategyDirectives);
        expect(pel.getProviderAtIndex(0).key.token).toBe(D0);
        expect(pel.getProviderAtIndex(19).key.token).toBe(D19);
      });
    });
  });
  describe("AppElement", () {
    init();
    [
      {"strategy": "inline", "directives": []},
      {"strategy": "dynamic", "directives": dynamicStrategyDirectives}
    ].forEach((context) {
      var extraDirectives = context["directives"];
      describe('''${ context [ "strategy" ]} strategy''', () {
        describe("injection", () {
          it("should instantiate directives that have no dependencies", () {
            var directives =
                ListWrapper.concat([SimpleDirective], extraDirectives);
            var el = appElement(null, directives);
            expect(el.get(SimpleDirective)).toBeAnInstanceOf(SimpleDirective);
          });
          it("should instantiate directives that depend on an arbitrary number of directives",
              () {
            var directives = ListWrapper
                .concat([SimpleDirective, NeedsDirective], extraDirectives);
            var el = appElement(null, directives);
            var d = el.get(NeedsDirective);
            expect(d).toBeAnInstanceOf(NeedsDirective);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });
          it("should instantiate components that have generic parameters", () {
            mockDirectiveMeta[ComponentNeedsGenericParameter] =
                new ComponentMetadata(providers: [
              provide(new TypeLiteral<List<String>>(),
                  useValue: const ["foo", "bar"])
            ]);
            var el = appElement(
                null,
                ListWrapper
                    .concat([ComponentNeedsGenericParameter], extraDirectives));
            expect(el.get(ComponentNeedsGenericParameter).strings)
                .toEqual(const ["foo", "bar"]);
          });
          it("should instantiate providers that have dependencies with set visibility",
              () {
            mockDirectiveMeta[SimpleDirective] = new ComponentMetadata(
                providers: [provide("injectable1", useValue: "injectable1")]);
            mockDirectiveMeta[SomeOtherDirective] =
                new ComponentMetadata(providers: [
              provide("injectable1", useValue: "new-injectable1"),
              provide("injectable2",
                  useFactory: (val) => '''${ val}-injectable2''',
                  deps: [
                    [new InjectMetadata("injectable1"), new SkipSelfMetadata()]
                  ])
            ]);
            var childInj = parentChildElements(
                ListWrapper.concat([SimpleDirective], extraDirectives),
                [SomeOtherDirective]);
            expect(childInj.get("injectable2"))
                .toEqual("injectable1-injectable2");
          });
          it("should instantiate providers that have dependencies", () {
            var providers = [
              provide("injectable1", useValue: "injectable1"),
              provide("injectable2",
                  useFactory: (val) => '''${ val}-injectable2''',
                  deps: ["injectable1"])
            ];
            mockDirectiveMeta[SimpleDirective] =
                new DirectiveMetadata(providers: providers);
            var el = appElement(
                null, ListWrapper.concat([SimpleDirective], extraDirectives));
            expect(el.get("injectable2")).toEqual("injectable1-injectable2");
          });
          it("should instantiate viewProviders that have dependencies", () {
            var viewProviders = [
              provide("injectable1", useValue: "injectable1"),
              provide("injectable2",
                  useFactory: (val) => '''${ val}-injectable2''',
                  deps: ["injectable1"])
            ];
            mockDirectiveMeta[SimpleDirective] =
                new ComponentMetadata(viewProviders: viewProviders);
            var el = appElement(
                null, ListWrapper.concat([SimpleDirective], extraDirectives));
            expect(el.get("injectable2")).toEqual("injectable1-injectable2");
          });
          it("should instantiate components that depend on viewProviders providers",
              () {
            mockDirectiveMeta[NeedsService] = new ComponentMetadata(
                viewProviders: [provide("service", useValue: "service")]);
            var el = appElement(
                null, ListWrapper.concat([NeedsService], extraDirectives));
            expect(el.get(NeedsService).service).toEqual("service");
          });
          it("should instantiate providers lazily", () {
            var created = false;
            mockDirectiveMeta[SimpleDirective] = new ComponentMetadata(
                providers: [
                  provide("service", useFactory: () => created = true)
                ]);
            var el = appElement(
                null, ListWrapper.concat([SimpleDirective], extraDirectives));
            expect(created).toBe(false);
            el.get("service");
            expect(created).toBe(true);
          });
          it("should instantiate view providers lazily", () {
            var created = false;
            mockDirectiveMeta[SimpleDirective] = new ComponentMetadata(
                viewProviders: [
                  provide("service", useFactory: () => created = true)
                ]);
            var el = appElement(
                null, ListWrapper.concat([SimpleDirective], extraDirectives));
            expect(created).toBe(false);
            el.get("service");
            expect(created).toBe(true);
          });
          it("should not instantiate other directives that depend on viewProviders providers",
              () {
            mockDirectiveMeta[SimpleDirective] = new ComponentMetadata(
                viewProviders: [provide("service", useValue: "service")]);
            expect(() {
              appElement(
                  null,
                  ListWrapper.concat(
                      [SimpleDirective, NeedsService], extraDirectives));
            }).toThrowError(containsRegexp(
                '''No provider for service! (${ stringify ( NeedsService )} -> service)'''));
          });
          it("should instantiate directives that depend on providers of other directives",
              () {
            mockDirectiveMeta[SimpleDirective] = new ComponentMetadata(
                providers: [provide("service", useValue: "hostService")]);
            var shadowInj = hostShadowElement(
                ListWrapper.concat([SimpleDirective], extraDirectives),
                ListWrapper.concat([NeedsService], extraDirectives));
            expect(shadowInj.get(NeedsService).service).toEqual("hostService");
          });
          it("should instantiate directives that depend on view providers of a component",
              () {
            mockDirectiveMeta[SimpleDirective] = new ComponentMetadata(
                viewProviders: [provide("service", useValue: "hostService")]);
            var shadowInj = hostShadowElement(
                ListWrapper.concat([SimpleDirective], extraDirectives),
                ListWrapper.concat([NeedsService], extraDirectives));
            expect(shadowInj.get(NeedsService).service).toEqual("hostService");
          });
          it("should instantiate directives in a root embedded view that depend on view providers of a component",
              () {
            mockDirectiveMeta[SimpleDirective] = new ComponentMetadata(
                viewProviders: [provide("service", useValue: "hostService")]);
            var host = appElement(
                null, ListWrapper.concat([SimpleDirective], extraDirectives));
            var componenetView = createView(ViewType.COMPONENT, host);
            host.attachComponentView(componenetView);
            var anchor = appElement(null, [], componenetView);
            var embeddedView = createView(ViewType.EMBEDDED, anchor);
            var rootEmbeddedEl = appElement(
                null,
                ListWrapper.concat([NeedsService], extraDirectives),
                embeddedView);
            expect(rootEmbeddedEl.get(NeedsService).service)
                .toEqual("hostService");
          });
          it("should instantiate directives that depend on imperatively created injector (bootstrap)",
              () {
            var rootInjector = Injector
                .resolveAndCreate([provide("service", useValue: "appService")]);
            var view = createView(ViewType.HOST, null, null, rootInjector);
            expect(appElement(null, [NeedsService], view)
                    .get(NeedsService)
                    .service)
                .toEqual("appService");
            expect(() => appElement(null, [NeedsServiceFromHost], view))
                .toThrowError();
          });
          it("should instantiate directives that depend on imperatively created providers (root injector)",
              () {
            var imperativelyCreatedProviders =
                Injector.resolve([provide("service", useValue: "appService")]);
            var containerAppElement = appElement(null, []);
            var view = createView(ViewType.HOST, containerAppElement,
                imperativelyCreatedProviders, null);
            expect(appElement(null, [NeedsService], view)
                    .get(NeedsService)
                    .service)
                .toEqual("appService");
            expect(appElement(null, [NeedsServiceFromHost], view)
                    .get(NeedsServiceFromHost)
                    .service)
                .toEqual("appService");
          });
          it(
              "should not instantiate a directive in a view that has a host dependency on providers" +
                  " of the component", () {
            mockDirectiveMeta[SomeOtherDirective] = new DirectiveMetadata(
                providers: [provide("service", useValue: "hostService")]);
            expect(() {
              hostShadowElement(
                  ListWrapper.concat([SomeOtherDirective], extraDirectives),
                  ListWrapper.concat([NeedsServiceFromHost], extraDirectives));
            }).toThrowError(new RegExp("No provider for service!"));
          });
          it(
              "should not instantiate a directive in a view that has a host dependency on providers" +
                  " of a decorator directive", () {
            mockDirectiveMeta[SomeOtherDirective] = new DirectiveMetadata(
                providers: [provide("service", useValue: "hostService")]);
            expect(() {
              hostShadowElement(
                  ListWrapper.concat(
                      [SimpleDirective, SomeOtherDirective], extraDirectives),
                  ListWrapper.concat([NeedsServiceFromHost], extraDirectives));
            }).toThrowError(new RegExp("No provider for service!"));
          });
          it("should get directives", () {
            var child = hostShadowElement(
                ListWrapper.concat(
                    [SomeOtherDirective, SimpleDirective], extraDirectives),
                [NeedsDirectiveFromHostShadowDom]);
            var d = child.get(NeedsDirectiveFromHostShadowDom);
            expect(d).toBeAnInstanceOf(NeedsDirectiveFromHostShadowDom);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });
          it("should get directives from the host", () {
            var child = parentChildElements(
                ListWrapper.concat([SimpleDirective], extraDirectives),
                [NeeedsDirectiveFromHost]);
            var d = child.get(NeeedsDirectiveFromHost);
            expect(d).toBeAnInstanceOf(NeeedsDirectiveFromHost);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });
          it("should throw when a dependency cannot be resolved", () {
            expect(() => appElement(
                null,
                ListWrapper.concat([NeeedsDirectiveFromHost],
                    extraDirectives))).toThrowError(containsRegexp(
                '''No provider for ${ stringify ( SimpleDirective )}! (${ stringify ( NeeedsDirectiveFromHost )} -> ${ stringify ( SimpleDirective )})'''));
          });
          it("should inject null when an optional dependency cannot be resolved",
              () {
            var el = appElement(
                null,
                ListWrapper
                    .concat([OptionallyNeedsDirective], extraDirectives));
            var d = el.get(OptionallyNeedsDirective);
            expect(d.dependency).toEqual(null);
          });
          it("should allow for direct access using getDirectiveAtIndex", () {
            var providers =
                ListWrapper.concat([SimpleDirective], extraDirectives);
            var el = appElement(null, providers);
            var firsIndexOut = providers.length > 10 ? providers.length : 10;
            expect(el.getDirectiveAtIndex(0)).toBeAnInstanceOf(SimpleDirective);
            expect(() => el.getDirectiveAtIndex(-1))
                .toThrowError("Index -1 is out-of-bounds.");
            expect(() => el.getDirectiveAtIndex(firsIndexOut))
                .toThrowError('''Index ${ firsIndexOut} is out-of-bounds.''');
          });
          it("should instantiate directives that depend on the containing component",
              () {
            mockDirectiveMeta[SimpleDirective] = new ComponentMetadata();
            var shadow = hostShadowElement(
                ListWrapper.concat([SimpleDirective], extraDirectives),
                [NeeedsDirectiveFromHost]);
            var d = shadow.get(NeeedsDirectiveFromHost);
            expect(d).toBeAnInstanceOf(NeeedsDirectiveFromHost);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });
          it("should not instantiate directives that depend on other directives in the containing component's ElementInjector",
              () {
            mockDirectiveMeta[SomeOtherDirective] = new ComponentMetadata();
            expect(() {
              hostShadowElement(
                  ListWrapper.concat(
                      [SomeOtherDirective, SimpleDirective], extraDirectives),
                  [NeedsDirective]);
            }).toThrowError(containsRegexp(
                '''No provider for ${ stringify ( SimpleDirective )}! (${ stringify ( NeedsDirective )} -> ${ stringify ( SimpleDirective )})'''));
          });
        });
        describe("static attributes", () {
          it("should be injectable", () {
            var el = appElement(
                null,
                ListWrapper.concat([NeedsAttribute], extraDirectives),
                null,
                null,
                {"type": "text", "title": ""});
            var needsAttribute = el.get(NeedsAttribute);
            expect(needsAttribute.typeAttribute).toEqual("text");
            expect(needsAttribute.titleAttribute).toEqual("");
            expect(needsAttribute.fooAttribute).toEqual(null);
          });
          it("should be injectable without type annotation", () {
            var el = appElement(
                null,
                ListWrapper.concat([NeedsAttributeNoType], extraDirectives),
                null,
                null,
                {"foo": "bar"});
            var needsAttribute = el.get(NeedsAttributeNoType);
            expect(needsAttribute.fooAttribute).toEqual("bar");
          });
        });
        describe("refs", () {
          it("should inject ElementRef", () {
            var el = appElement(
                null, ListWrapper.concat([NeedsElementRef], extraDirectives));
            expect(el.get(NeedsElementRef).elementRef).toBe(el.ref);
          });
          it("should inject ChangeDetectorRef of the component's view into the component via a proxy",
              () {
            mockDirectiveMeta[ComponentNeedsChangeDetectorRef] =
                new ComponentMetadata();
            var host = appElement(
                null,
                ListWrapper.concat(
                    [ComponentNeedsChangeDetectorRef], extraDirectives));
            var view = createView(ViewType.COMPONENT, host);
            host.attachComponentView(view);
            host
                .get(ComponentNeedsChangeDetectorRef)
                .changeDetectorRef
                .markForCheck();
            expect(((view.changeDetector as dynamic))
                    .spy("markPathToRootAsCheckOnce"))
                .toHaveBeenCalled();
          });
          it("should inject ChangeDetectorRef of the containing component into directives",
              () {
            mockDirectiveMeta[DirectiveNeedsChangeDetectorRef] =
                new DirectiveMetadata();
            var view = createView(ViewType.HOST);
            var el = appElement(
                null,
                ListWrapper
                    .concat([DirectiveNeedsChangeDetectorRef], extraDirectives),
                view);
            expect(el.get(DirectiveNeedsChangeDetectorRef).changeDetectorRef)
                .toBe(view.changeDetector.ref);
          });
          it("should inject ViewContainerRef", () {
            var el = appElement(null,
                ListWrapper.concat([NeedsViewContainer], extraDirectives));
            expect(el.get(NeedsViewContainer).viewContainer)
                .toBeAnInstanceOf(ViewContainerRef_);
          });
          it("should inject TemplateRef", () {
            var el = appElement(
                null,
                ListWrapper.concat([NeedsTemplateRef], extraDirectives),
                null,
                dummyViewFactory);
            expect(el.get(NeedsTemplateRef).templateRef.elementRef)
                .toBe(el.ref);
          });
          it("should throw if there is no TemplateRef", () {
            expect(() => appElement(
                null,
                ListWrapper
                    .concat([NeedsTemplateRef], extraDirectives))).toThrowError(
                '''No provider for TemplateRef! (${ stringify ( NeedsTemplateRef )} -> TemplateRef)''');
          });
          it("should inject null if there is no TemplateRef when the dependency is optional",
              () {
            var el = appElement(
                null,
                ListWrapper
                    .concat([OptionallyInjectsTemplateRef], extraDirectives));
            var instance = el.get(OptionallyInjectsTemplateRef);
            expect(instance.templateRef).toBeNull();
          });
        });
        describe("queries", () {
          expectDirectives(QueryList<dynamic> query, type, expectedIndex) {
            var currentCount = 0;
            expect(query.length).toEqual(expectedIndex.length);
            iterateListLike(query, (i) {
              expect(i).toBeAnInstanceOf(type);
              expect(i.count).toBe(expectedIndex[currentCount]);
              currentCount += 1;
            });
          }
          it("should be injectable", () {
            var el = appElement(
                null, ListWrapper.concat([NeedsQuery], extraDirectives));
            expect(el.get(NeedsQuery).query).toBeAnInstanceOf(QueryList);
          });
          it("should contain directives on the same injector", () {
            var el = appElement(
                null,
                ListWrapper
                    .concat([NeedsQuery, CountingDirective], extraDirectives));
            el.ngAfterContentChecked();
            expectDirectives(el.get(NeedsQuery).query, CountingDirective, [0]);
          });
          it("should contain TemplateRefs on the same injector", () {
            var el = appElement(
                null,
                ListWrapper.concat([NeedsTemplateRefQuery], extraDirectives),
                null,
                dummyViewFactory);
            el.ngAfterContentChecked();
            expect(el.get(NeedsTemplateRefQuery).query.first)
                .toBeAnInstanceOf(TemplateRef_);
          });
          it("should contain the element when no directives are bound to the var provider",
              () {
            List<Type> dirs = [NeedsQueryByVarBindings];
            Map<String, num> dirVariableBindings = {"one": null};
            var el = appElement(
                null,
                (new List.from(dirs)..addAll(extraDirectives)),
                null,
                null,
                null,
                dirVariableBindings);
            el.ngAfterContentChecked();
            expect(el.get(NeedsQueryByVarBindings).query.first).toBe(el.ref);
          });
          it(
              "should contain directives on the same injector when querying by variable providers" +
                  "in the order of var providers specified in the query", () {
            List<Type> dirs = [
              NeedsQueryByVarBindings,
              NeedsDirective,
              SimpleDirective
            ];
            Map<String, num> dirVariableBindings = {"one": 2, "two": 1};
            var el = appElement(
                null,
                (new List.from(dirs)..addAll(extraDirectives)),
                null,
                null,
                null,
                dirVariableBindings);
            el.ngAfterContentChecked();
            // NeedsQueryByVarBindings queries "one,two", so SimpleDirective should be before NeedsDirective
            expect(el.get(NeedsQueryByVarBindings).query.first)
                .toBeAnInstanceOf(SimpleDirective);
            expect(el.get(NeedsQueryByVarBindings).query.last)
                .toBeAnInstanceOf(NeedsDirective);
          });
          it("should contain directives on the same and a child injector in construction order",
              () {
            var parent = appElement(null, [NeedsQuery, CountingDirective]);
            appElement(parent,
                ListWrapper.concat([CountingDirective], extraDirectives));
            parent.ngAfterContentChecked();
            expectDirectives(
                parent.get(NeedsQuery).query, CountingDirective, [0, 1]);
          });
        });
      });
    });
  });
}

class ContextWithHandler {
  var handler;
  ContextWithHandler(handler) {
    this.handler = handler;
  }
}
