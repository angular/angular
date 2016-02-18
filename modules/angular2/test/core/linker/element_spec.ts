// TODO(tbosch): clang-format screws this up, see https://github.com/angular/clang-format/issues/11.
// Enable clang-format here again when this is fixed.
// clang-format off
import {
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
  containsRegexp
} from 'angular2/testing_internal';
import {SpyView, SpyElementRef, SpyDirectiveResolver, SpyProtoView, SpyChangeDetector, SpyAppViewManager} from '../spies';
import {isBlank, isPresent, stringify, Type} from 'angular2/src/facade/lang';
import {ResolvedProvider} from 'angular2/src/core/di';
import {
  ListWrapper,
  MapWrapper,
  StringMapWrapper,
  iterateListLike
} from 'angular2/src/facade/collection';
import {
  AppProtoElement,
  AppElement,
  DirectiveProvider
} from 'angular2/src/core/linker/element';
import {ResolvedMetadataCache} from 'angular2/src/core/linker/resolved_metadata_cache';
import {DirectiveResolver} from 'angular2/src/core/linker/directive_resolver';
import {
  Attribute,
  Query,
  ViewQuery,
  ComponentMetadata,
  DirectiveMetadata,
  ViewEncapsulation
} from 'angular2/src/core/metadata';
import {OnDestroy, Directive} from 'angular2/core';
import {provide, Injector, Provider, Optional, Inject, Injectable, Self, SkipSelf, InjectMetadata, Host, HostMetadata, SkipSelfMetadata} from 'angular2/core';
import {ViewContainerRef, ViewContainerRef_} from 'angular2/src/core/linker/view_container_ref';
import {TemplateRef, TemplateRef_} from 'angular2/src/core/linker/template_ref';
import {ElementRef} from 'angular2/src/core/linker/element_ref';
import {DynamicChangeDetector, ChangeDetectorRef, Parser, Lexer} from 'angular2/src/core/change_detection/change_detection';
import {ChangeDetectorRef_} from 'angular2/src/core/change_detection/change_detector_ref';
import {QueryList} from 'angular2/src/core/linker/query_list';
import {AppView, AppProtoView} from "angular2/src/core/linker/view";
import {ViewType} from "angular2/src/core/linker/view_type";

@Directive({selector: ''})
class SimpleDirective {}

class SimpleService {}

@Directive({selector: ''})
class SomeOtherDirective {}

var _constructionCount;
@Directive({selector: ''})
class CountingDirective {
  count: number;
  constructor() {
    this.count = _constructionCount;
    _constructionCount += 1;
  }
}

@Directive({selector: ''})
class FancyCountingDirective extends CountingDirective {
  constructor() { super(); }
}

@Directive({selector: ''})
class NeedsDirective {
  dependency: SimpleDirective;
  constructor(@Self() dependency: SimpleDirective) { this.dependency = dependency; }
}

@Directive({selector: ''})
class OptionallyNeedsDirective {
  dependency: SimpleDirective;
  constructor(@Self() @Optional() dependency: SimpleDirective) { this.dependency = dependency; }
}

@Directive({selector: ''})
class NeeedsDirectiveFromHost {
  dependency: SimpleDirective;
  constructor(@Host() dependency: SimpleDirective) { this.dependency = dependency; }
}

@Directive({selector: ''})
class NeedsDirectiveFromHostShadowDom {
  dependency: SimpleDirective;
  constructor(dependency: SimpleDirective) { this.dependency = dependency; }
}

@Directive({selector: ''})
class NeedsService {
  service: any;
  constructor(@Inject("service") service) { this.service = service; }
}

@Directive({selector: ''})
class NeedsServiceFromHost {
  service: any;
  constructor(@Host() @Inject("service") service) { this.service = service; }
}

class HasEventEmitter {
  emitter;
  constructor() { this.emitter = "emitter"; }
}

@Directive({selector: ''})
class NeedsAttribute {
  typeAttribute;
  titleAttribute;
  fooAttribute;
  constructor(@Attribute('type') typeAttribute: String, @Attribute('title') titleAttribute: String,
              @Attribute('foo') fooAttribute: String) {
    this.typeAttribute = typeAttribute;
    this.titleAttribute = titleAttribute;
    this.fooAttribute = fooAttribute;
  }
}

@Directive({selector: ''})
class NeedsAttributeNoType {
  fooAttribute;
  constructor(@Attribute('foo') fooAttribute) { this.fooAttribute = fooAttribute; }
}

@Directive({selector: ''})
class NeedsQuery {
  query: QueryList<CountingDirective>;
  constructor(@Query(CountingDirective) query: QueryList<CountingDirective>) { this.query = query; }
}

@Directive({selector: ''})
class NeedsViewQuery {
  query: QueryList<CountingDirective>;
  constructor(@ViewQuery(CountingDirective) query: QueryList<CountingDirective>) { this.query = query; }
}

@Directive({selector: ''})
class NeedsQueryByVarBindings {
  query: QueryList<any>;
  constructor(@Query("one,two") query: QueryList<any>) { this.query = query; }
}

@Directive({selector: ''})
class NeedsTemplateRefQuery {
  query: QueryList<TemplateRef>;
  constructor(@Query(TemplateRef) query: QueryList<TemplateRef>) { this.query = query; }
}

@Directive({selector: ''})
class NeedsElementRef {
  elementRef;
  constructor(ref: ElementRef) { this.elementRef = ref; }
}

@Directive({selector: ''})
class NeedsViewContainer {
  viewContainer;
  constructor(vc: ViewContainerRef) { this.viewContainer = vc; }
}

@Directive({selector: ''})
class NeedsTemplateRef {
  templateRef;
  constructor(ref: TemplateRef) { this.templateRef = ref; }
}

@Directive({selector: ''})
class OptionallyInjectsTemplateRef {
  templateRef;
  constructor(@Optional() ref: TemplateRef) { this.templateRef = ref; }
}

@Directive({selector: ''})
class DirectiveNeedsChangeDetectorRef {
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
}

@Directive({selector: ''})
class ComponentNeedsChangeDetectorRef {
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
}

@Injectable()
class PipeNeedsChangeDetectorRef {
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
}

class A_Needs_B {
  constructor(dep) {}
}

class B_Needs_A {
  constructor(dep) {}
}

class DirectiveWithDestroy implements OnDestroy {
  ngOnDestroyCounter: number;

  constructor() { this.ngOnDestroyCounter = 0; }

  ngOnDestroy() { this.ngOnDestroyCounter++; }
}

@Directive({selector: ''})
class D0 {}
@Directive({selector: ''})
class D1 {}
@Directive({selector: ''})
class D2 {}
@Directive({selector: ''})
class D3 {}
@Directive({selector: ''})
class D4 {}
@Directive({selector: ''})
class D5 {}
@Directive({selector: ''})
class D6 {}
@Directive({selector: ''})
class D7 {}
@Directive({selector: ''})
class D8 {}
@Directive({selector: ''})
class D9 {}
@Directive({selector: ''})
class D10 {}
@Directive({selector: ''})
class D11 {}
@Directive({selector: ''})
class D12 {}
@Directive({selector: ''})
class D13 {}
@Directive({selector: ''})
class D14 {}
@Directive({selector: ''})
class D15 {}
@Directive({selector: ''})
class D16 {}
@Directive({selector: ''})
class D17 {}
@Directive({selector: ''})
class D18 {}
@Directive({selector: ''})
class D19 {}

export function main() {
  // An injector with more than 10 providers will switch to the dynamic strategy
  var dynamicStrategyDirectives = [D0, D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15, D16, D17, D18, D19];
  var resolvedMetadataCache:ResolvedMetadataCache;
  var mockDirectiveMeta:Map<Type, DirectiveMetadata>;
  var directiveResolver:SpyDirectiveResolver;
  var dummyView:AppView;
  var dummyViewFactory:Function;

  function createView(type: ViewType, containerAppElement:AppElement = null, imperativelyCreatedProviders: ResolvedProvider[] = null, rootInjector: Injector = null, pipes: Type[] = null):AppView {
    if (isBlank(pipes)) {
      pipes = [];
    }
    var proto = AppProtoView.create(resolvedMetadataCache, type, pipes, {});
    var cd = new SpyChangeDetector();
    cd.prop('ref', new ChangeDetectorRef_(<any>cd));

    var view = new AppView(proto, null, <any>new SpyAppViewManager(), [], containerAppElement, imperativelyCreatedProviders, rootInjector, <any> cd);
    view.init([], [], [], []);
    return view;
  }

  function protoAppElement(index, directives: Type[], attributes: {[key:string]:string} = null, dirVariableBindings:{[key:string]:number} = null) {
    return AppProtoElement.create(resolvedMetadataCache, index, attributes, directives, dirVariableBindings);
  }

  function appElement(parent: AppElement, directives: Type[],
                    view: AppView = null, embeddedViewFactory: Function = null, attributes: {[key:string]:string} = null, dirVariableBindings:{[key:string]:number} = null) {
    if (isBlank(view)) {
      view = dummyView;
    }
    var proto = protoAppElement(0, directives, attributes, dirVariableBindings);
    var el = new AppElement(proto, view, parent, null, embeddedViewFactory);
    view.appElements.push(el);
    return el;
  }

  function parentChildElements(parentDirectives: Type[], childDirectives:Type[], view: AppView = null) {
    if (isBlank(view)) {
      view = dummyView;
    }
    var parent = appElement(null, parentDirectives, view);
    var child = appElement(parent, childDirectives, view);

    return child;
  }

  function hostShadowElement(hostDirectives: Type[],
                               viewDirectives: Type[]): AppElement {
    var host = appElement(null, hostDirectives);
    var view = createView(ViewType.COMPONENT, host);
    host.attachComponentView(view);

    return appElement(null, viewDirectives, view);
  }

  function init() {
    beforeEachBindings(() => {
      var delegateDirectiveResolver = new DirectiveResolver();
      directiveResolver = new SpyDirectiveResolver();
      directiveResolver.spy('resolve').andCallFake( (directiveType) => {
        var result = mockDirectiveMeta.get(directiveType);
        if (isBlank(result)) {
          result = delegateDirectiveResolver.resolve(directiveType);
        }
        return result;
      });
      return [
        provide(DirectiveResolver, {useValue: directiveResolver})
      ];
    });
    beforeEach(inject([ResolvedMetadataCache], (_metadataCache) => {
      mockDirectiveMeta = new Map<Type, DirectiveMetadata>();
      resolvedMetadataCache = _metadataCache;
      dummyView = createView(ViewType.HOST);
      dummyViewFactory = () => {};
      _constructionCount = 0;
    }));
  }

  describe("ProtoAppElement", () => {
    init();

    describe('inline strategy', () => {
      it("should allow for direct access using getProviderAtIndex", () => {
        var proto = protoAppElement(0, [SimpleDirective]);

        expect(proto.getProviderAtIndex(0)).toBeAnInstanceOf(DirectiveProvider);
        expect(() => proto.getProviderAtIndex(-1)).toThrowError('Index -1 is out-of-bounds.');
        expect(() => proto.getProviderAtIndex(10)).toThrowError('Index 10 is out-of-bounds.');
      });
    });

    describe('dynamic strategy', () => {
      it("should allow for direct access using getProviderAtIndex", () => {
        var proto = protoAppElement(0, dynamicStrategyDirectives);

        expect(proto.getProviderAtIndex(0)).toBeAnInstanceOf(DirectiveProvider);
        expect(() => proto.getProviderAtIndex(-1)).toThrowError('Index -1 is out-of-bounds.');
        expect(() => proto.getProviderAtIndex(dynamicStrategyDirectives.length - 1)).not.toThrow();
        expect(() => proto.getProviderAtIndex(dynamicStrategyDirectives.length))
            .toThrowError(`Index ${dynamicStrategyDirectives.length} is out-of-bounds.`);
      });
    });

    describe(".create", () => {
      it("should collect providers from all directives", () => {
        mockDirectiveMeta.set(SimpleDirective, new DirectiveMetadata({providers: [provide('injectable1', {useValue: 'injectable1'})]}));
        mockDirectiveMeta.set(SomeOtherDirective, new DirectiveMetadata({
            providers: [provide('injectable2', {useValue: 'injectable2'})]
          }));
        var pel = protoAppElement( 0, [
          SimpleDirective,
          SomeOtherDirective
        ]);

        expect(pel.getProviderAtIndex(0).key.token).toBe(SimpleDirective);
        expect(pel.getProviderAtIndex(1).key.token).toBe(SomeOtherDirective);
        expect(pel.getProviderAtIndex(2).key.token).toEqual("injectable1");
        expect(pel.getProviderAtIndex(3).key.token).toEqual("injectable2");
      });

      it("should collect view providers from the component", () => {
        mockDirectiveMeta.set(SimpleDirective, new ComponentMetadata({
                              viewProviders: [provide('injectable1', {useValue: 'injectable1'})]
                            }));
        var pel = protoAppElement(0, [SimpleDirective]);

        expect(pel.getProviderAtIndex(0).key.token).toBe(SimpleDirective);
        expect(pel.getProviderAtIndex(1).key.token).toEqual("injectable1");
      });

      it("should flatten nested arrays in viewProviders and providers", () => {
        mockDirectiveMeta.set(SimpleDirective, new ComponentMetadata({
                viewProviders: [[[provide('view', {useValue: 'view'})]]],
                providers: [[[provide('host', {useValue: 'host'})]]]
              }));
        var pel = protoAppElement(0, [SimpleDirective]);

        expect(pel.getProviderAtIndex(0).key.token).toBe(SimpleDirective);
        expect(pel.getProviderAtIndex(1).key.token).toEqual("view");
        expect(pel.getProviderAtIndex(2).key.token).toEqual("host");
      });

      it('should support an arbitrary number of providers', () => {
        var pel = protoAppElement(0, dynamicStrategyDirectives);
        expect(pel.getProviderAtIndex(0).key.token).toBe(D0);
        expect(pel.getProviderAtIndex(19).key.token).toBe(D19);
      });
    });
  });

  describe("AppElement", () => {
    init();

    [{ strategy: 'inline', directives: [] }, { strategy: 'dynamic',
      directives: dynamicStrategyDirectives }].forEach((context) => {

      var extraDirectives = context['directives'];
      describe(`${context['strategy']} strategy`, () => {

        describe("injection", () => {
          it("should instantiate directives that have no dependencies", () => {
            var directives = ListWrapper.concat([SimpleDirective], extraDirectives);
            var el = appElement(null, directives);
            expect(el.get(SimpleDirective)).toBeAnInstanceOf(SimpleDirective);
          });

          it("should instantiate directives that depend on an arbitrary number of directives", () => {
            var directives = ListWrapper.concat([SimpleDirective, NeedsDirective], extraDirectives);
            var el = appElement(null, directives);

            var d = el.get(NeedsDirective);

            expect(d).toBeAnInstanceOf(NeedsDirective);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });

          it("should instantiate providers that have dependencies with set visibility",
             function() {
               mockDirectiveMeta.set(SimpleDirective, new ComponentMetadata({
                  providers: [provide('injectable1', {useValue: 'injectable1'})]
                }));
               mockDirectiveMeta.set(SomeOtherDirective, new ComponentMetadata({
                  providers: [
                    provide('injectable1', {useValue:'new-injectable1'}),
                    provide('injectable2', {useFactory:
                               (val) => `${val}-injectable2`,
                               deps: [[new InjectMetadata('injectable1'), new SkipSelfMetadata()]]})
                  ]
                }));
               var childInj = parentChildElements(
                   ListWrapper.concat([SimpleDirective], extraDirectives),
                   [SomeOtherDirective]
               );
               expect(childInj.get('injectable2')).toEqual('injectable1-injectable2');
             });

          it("should instantiate providers that have dependencies", () => {
            var providers = [
                    provide('injectable1', {useValue: 'injectable1'}),
                    provide('injectable2', {useFactory:
                            (val) => `${val}-injectable2`,
                            deps: ['injectable1']})
                  ];
            mockDirectiveMeta.set(SimpleDirective, new DirectiveMetadata({providers: providers}));
            var el = appElement(null, ListWrapper.concat(
                [SimpleDirective], extraDirectives));

            expect(el.get('injectable2')).toEqual('injectable1-injectable2');
          });

          it("should instantiate viewProviders that have dependencies", () => {
            var viewProviders = [
                    provide('injectable1', {useValue: 'injectable1'}),
                    provide('injectable2', {useFactory:
                      (val) => `${val}-injectable2`,
                            deps: ['injectable1']})
                  ];

            mockDirectiveMeta.set(SimpleDirective, new ComponentMetadata({
                  viewProviders: viewProviders}));
            var el = appElement(null, ListWrapper.concat(
                [SimpleDirective], extraDirectives));
            expect(el.get('injectable2')).toEqual('injectable1-injectable2');
          });

          it("should instantiate components that depend on viewProviders providers", () => {
            mockDirectiveMeta.set(NeedsService, new ComponentMetadata({
              viewProviders: [provide('service', {useValue: 'service'})]
            }));
            var el = appElement(null,
                ListWrapper.concat([NeedsService], extraDirectives));
            expect(el.get(NeedsService).service).toEqual('service');
          });

          it("should instantiate providers lazily", () => {
            var created = false;
            mockDirectiveMeta.set(SimpleDirective, new ComponentMetadata({
              providers: [provide('service', {useFactory: () => created = true})]
            }));
            var el = appElement(null,
                ListWrapper.concat([SimpleDirective],
                                   extraDirectives));

            expect(created).toBe(false);

            el.get('service');

            expect(created).toBe(true);
          });

          it("should instantiate view providers lazily", () => {
            var created = false;
            mockDirectiveMeta.set(SimpleDirective, new ComponentMetadata({
                                     viewProviders: [provide('service', {useFactory: () => created = true})]
                                   }));
            var el = appElement(null,
                ListWrapper.concat([SimpleDirective],
                                   extraDirectives));

            expect(created).toBe(false);

            el.get('service');

            expect(created).toBe(true);
          });

          it("should not instantiate other directives that depend on viewProviders providers",
             () => {
               mockDirectiveMeta.set(SimpleDirective,
               new ComponentMetadata({
                 viewProviders: [provide("service", {useValue: "service"})]
               }));
               expect(() => { appElement(null, ListWrapper.concat([SimpleDirective, NeedsService], extraDirectives)); })
                   .toThrowError(containsRegexp(
                       `No provider for service! (${stringify(NeedsService) } -> service)`));
             });

          it("should instantiate directives that depend on providers of other directives", () => {
            mockDirectiveMeta.set(SimpleDirective, new ComponentMetadata({
                      providers: [provide('service', {useValue: 'hostService'})]})
                    );
            var shadowInj = hostShadowElement(
                ListWrapper.concat([SimpleDirective], extraDirectives),
                ListWrapper.concat([NeedsService], extraDirectives)
            );
            expect(shadowInj.get(NeedsService).service).toEqual('hostService');
          });

          it("should instantiate directives that depend on view providers of a component", () => {
            mockDirectiveMeta.set(SimpleDirective, new ComponentMetadata({
                      viewProviders: [provide('service', {useValue: 'hostService'})]})
                    );
            var shadowInj = hostShadowElement(
                ListWrapper.concat([SimpleDirective], extraDirectives),
                ListWrapper.concat([NeedsService], extraDirectives)
            );
            expect(shadowInj.get(NeedsService).service).toEqual('hostService');
          });

          it("should instantiate directives in a root embedded view that depend on view providers of a component", () => {
            mockDirectiveMeta.set(SimpleDirective, new ComponentMetadata({
                      viewProviders: [provide('service', {useValue: 'hostService'})]})
                    );
            var host = appElement(null, ListWrapper.concat([SimpleDirective], extraDirectives));
            var componenetView = createView(ViewType.COMPONENT, host);
            host.attachComponentView(componenetView);

            var anchor = appElement(null, [], componenetView);
            var embeddedView = createView(ViewType.EMBEDDED, anchor);

            var rootEmbeddedEl = appElement(null, ListWrapper.concat([NeedsService], extraDirectives), embeddedView);
            expect(rootEmbeddedEl.get(NeedsService).service).toEqual('hostService');
          });

          it("should instantiate directives that depend on imperatively created injector (bootstrap)", () => {
            var rootInjector = Injector.resolveAndCreate([
              provide("service", {useValue: 'appService'})
            ]);
            var view = createView(ViewType.HOST, null, null, rootInjector);
            expect(appElement(null, [NeedsService], view).get(NeedsService).service).toEqual('appService');

            expect(() => appElement(null, [NeedsServiceFromHost], view)).toThrowError();
          });

          it("should instantiate directives that depend on imperatively created providers (root injector)", () => {
            var imperativelyCreatedProviders = Injector.resolve([
              provide("service", {useValue: 'appService'})
            ]);
            var containerAppElement = appElement(null, []);
            var view = createView(ViewType.HOST, containerAppElement, imperativelyCreatedProviders, null);
            expect(appElement(null, [NeedsService], view).get(NeedsService).service).toEqual('appService');
            expect(appElement(null, [NeedsServiceFromHost], view).get(NeedsServiceFromHost).service).toEqual('appService');
          });

          it("should not instantiate a directive in a view that has a host dependency on providers"+
            " of the component", () => {
            mockDirectiveMeta.set(SomeOtherDirective, new DirectiveMetadata({
                    providers: [provide('service', {useValue: 'hostService'})]})
                );
            expect(() => {
              hostShadowElement(
                ListWrapper.concat([SomeOtherDirective], extraDirectives),
                ListWrapper.concat([NeedsServiceFromHost], extraDirectives)
              );
            }).toThrowError(new RegExp("No provider for service!"));
          });

          it("should not instantiate a directive in a view that has a host dependency on providers"+
            " of a decorator directive", () => {
            mockDirectiveMeta.set(SomeOtherDirective, new DirectiveMetadata({
                      providers: [provide('service', {useValue: 'hostService'})]}));
            expect(() => {
              hostShadowElement(
                ListWrapper.concat([SimpleDirective, SomeOtherDirective], extraDirectives),
                ListWrapper.concat([NeedsServiceFromHost], extraDirectives)
              );
            }).toThrowError(new RegExp("No provider for service!"));
          });

          it("should get directives", () => {
            var child = hostShadowElement(
                ListWrapper.concat([SomeOtherDirective, SimpleDirective], extraDirectives),
                [NeedsDirectiveFromHostShadowDom]);

            var d = child.get(NeedsDirectiveFromHostShadowDom);

            expect(d).toBeAnInstanceOf(NeedsDirectiveFromHostShadowDom);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });

          it("should get directives from the host", () => {
            var child = parentChildElements(ListWrapper.concat([SimpleDirective], extraDirectives),
                                             [NeeedsDirectiveFromHost]);

            var d = child.get(NeeedsDirectiveFromHost);

            expect(d).toBeAnInstanceOf(NeeedsDirectiveFromHost);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });

          it("should throw when a dependency cannot be resolved", () => {
            expect(() => appElement(null, ListWrapper.concat([NeeedsDirectiveFromHost], extraDirectives)))
                .toThrowError(containsRegexp(
                    `No provider for ${stringify(SimpleDirective) }! (${stringify(NeeedsDirectiveFromHost) } -> ${stringify(SimpleDirective) })`));
          });

          it("should inject null when an optional dependency cannot be resolved", () => {
            var el = appElement(null, ListWrapper.concat([OptionallyNeedsDirective], extraDirectives));
            var d = el.get(OptionallyNeedsDirective);
            expect(d.dependency).toEqual(null);
          });

          it("should allow for direct access using getDirectiveAtIndex", () => {
            var providers =
                ListWrapper.concat([SimpleDirective], extraDirectives);

            var el = appElement(null, providers);

            var firsIndexOut = providers.length > 10 ? providers.length : 10;

            expect(el.getDirectiveAtIndex(0)).toBeAnInstanceOf(SimpleDirective);
            expect(() => el.getDirectiveAtIndex(-1)).toThrowError('Index -1 is out-of-bounds.');
            expect(() => el.getDirectiveAtIndex(firsIndexOut))
                .toThrowError(`Index ${firsIndexOut} is out-of-bounds.`);
          });

          it("should instantiate directives that depend on the containing component", () => {
            mockDirectiveMeta.set(SimpleDirective, new ComponentMetadata());
            var shadow = hostShadowElement(ListWrapper.concat([SimpleDirective], extraDirectives),
                                             [NeeedsDirectiveFromHost]);

            var d = shadow.get(NeeedsDirectiveFromHost);
            expect(d).toBeAnInstanceOf(NeeedsDirectiveFromHost);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });

          it("should not instantiate directives that depend on other directives in the containing component's ElementInjector",
             () => {
               mockDirectiveMeta.set(SomeOtherDirective, new ComponentMetadata());
               expect(() =>
                      {
                        hostShadowElement(
                            ListWrapper.concat([SomeOtherDirective, SimpleDirective], extraDirectives),
                            [NeedsDirective]);
                      })
                   .toThrowError(containsRegexp(
                       `No provider for ${stringify(SimpleDirective) }! (${stringify(NeedsDirective) } -> ${stringify(SimpleDirective) })`));
             });
        });

        describe('static attributes', () => {
          it('should be injectable', () => {
            var el = appElement(null, ListWrapper.concat([NeedsAttribute], extraDirectives), null, null, {
              'type': 'text',
              'title': ''
            });
            var needsAttribute = el.get(NeedsAttribute);

            expect(needsAttribute.typeAttribute).toEqual('text');
            expect(needsAttribute.titleAttribute).toEqual('');
            expect(needsAttribute.fooAttribute).toEqual(null);
          });

          it('should be injectable without type annotation', () => {
            var el = appElement(null, ListWrapper.concat([NeedsAttributeNoType], extraDirectives), null,
                               null, {'foo': 'bar'});
            var needsAttribute = el.get(NeedsAttributeNoType);

            expect(needsAttribute.fooAttribute).toEqual('bar');
          });
        });

        describe("refs", () => {
          it("should inject ElementRef", () => {
            var el = appElement(null, ListWrapper.concat([NeedsElementRef], extraDirectives));
            expect(el.get(NeedsElementRef).elementRef).toBe(el.ref);
          });

          it("should inject ChangeDetectorRef of the component's view into the component via a proxy", () => {
            mockDirectiveMeta.set(ComponentNeedsChangeDetectorRef, new ComponentMetadata());
            var host = appElement(null, ListWrapper.concat([ComponentNeedsChangeDetectorRef], extraDirectives));
            var view = createView(ViewType.COMPONENT, host);
            host.attachComponentView(view);
            host.get(ComponentNeedsChangeDetectorRef).changeDetectorRef.markForCheck();
            expect((<any>view.changeDetector).spy('markPathToRootAsCheckOnce')).toHaveBeenCalled();
          });

          it("should inject ChangeDetectorRef of the containing component into directives", () => {
            mockDirectiveMeta.set(DirectiveNeedsChangeDetectorRef, new DirectiveMetadata());
            var view = createView(ViewType.HOST);
            var el = appElement(null, ListWrapper.concat([DirectiveNeedsChangeDetectorRef], extraDirectives), view);
            expect(el.get(DirectiveNeedsChangeDetectorRef).changeDetectorRef).toBe(view.changeDetector.ref);
          });

          it('should inject ViewContainerRef', () => {
            var el = appElement(null, ListWrapper.concat([NeedsViewContainer], extraDirectives));
            expect(el.get(NeedsViewContainer).viewContainer).toBeAnInstanceOf(ViewContainerRef_);
          });

          it("should inject TemplateRef", () => {
            var el = appElement(null, ListWrapper.concat([NeedsTemplateRef], extraDirectives), null, dummyViewFactory);
            expect(el.get(NeedsTemplateRef).templateRef.elementRef).toBe(el.ref);
          });

          it("should throw if there is no TemplateRef", () => {
            expect(() => appElement(null, ListWrapper.concat([NeedsTemplateRef], extraDirectives)))
                .toThrowError(
                    `No provider for TemplateRef! (${stringify(NeedsTemplateRef) } -> TemplateRef)`);
          });

          it('should inject null if there is no TemplateRef when the dependency is optional', () => {
            var el = appElement(null, ListWrapper.concat([OptionallyInjectsTemplateRef], extraDirectives));
            var instance = el.get(OptionallyInjectsTemplateRef);
            expect(instance.templateRef).toBeNull();
          });
        });

        describe('queries', () => {
          function expectDirectives(query: QueryList<any>, type, expectedIndex) {
            var currentCount = 0;
            expect(query.length).toEqual(expectedIndex.length);
            iterateListLike(query, (i) => {
              expect(i).toBeAnInstanceOf(type);
              expect(i.count).toBe(expectedIndex[currentCount]);
              currentCount += 1;
            });
          }

          it('should be injectable', () => {
            var el =
                appElement(null, ListWrapper.concat([NeedsQuery], extraDirectives));
            expect(el.get(NeedsQuery).query).toBeAnInstanceOf(QueryList);
          });

          it('should contain directives on the same injector', () => {
            var el = appElement(null, ListWrapper.concat([
                NeedsQuery,
                CountingDirective
              ], extraDirectives));

            el.ngAfterContentChecked();

            expectDirectives(el.get(NeedsQuery).query, CountingDirective, [0]);
          });

          it('should contain TemplateRefs on the same injector', () => {
            var el = appElement(null, ListWrapper.concat([
                NeedsTemplateRefQuery
              ], extraDirectives), null, dummyViewFactory);

            el.ngAfterContentChecked();

            expect(el.get(NeedsTemplateRefQuery).query.first).toBeAnInstanceOf(TemplateRef_);
          });

          it('should contain the element when no directives are bound to the var provider', () => {
            var dirs:Type[] = [NeedsQueryByVarBindings];

            var dirVariableBindings:{[key:string]:number} = {
              "one": null // element
            };

            var el = appElement(null, dirs.concat(extraDirectives), null, null, null, dirVariableBindings);

            el.ngAfterContentChecked();

            expect(el.get(NeedsQueryByVarBindings).query.first).toBe(el.ref);
          });

          it('should contain directives on the same injector when querying by variable providers' +
            'in the order of var providers specified in the query', () => {
            var dirs:Type[] = [NeedsQueryByVarBindings, NeedsDirective, SimpleDirective];

            var dirVariableBindings:{[key:string]:number} = {
              "one": 2, // 2 is the index of SimpleDirective
              "two": 1 // 1 is the index of NeedsDirective
            };

            var el = appElement(null, dirs.concat(extraDirectives), null, null, null, dirVariableBindings);

            el.ngAfterContentChecked();

            // NeedsQueryByVarBindings queries "one,two", so SimpleDirective should be before NeedsDirective
            expect(el.get(NeedsQueryByVarBindings).query.first).toBeAnInstanceOf(SimpleDirective);
            expect(el.get(NeedsQueryByVarBindings).query.last).toBeAnInstanceOf(NeedsDirective);
          });

          it('should contain directives on the same and a child injector in construction order', () => {
            var parent = appElement(null, [NeedsQuery, CountingDirective]);
            appElement(parent, ListWrapper.concat([CountingDirective], extraDirectives));

            parent.ngAfterContentChecked();

            expectDirectives(parent.get(NeedsQuery).query, CountingDirective, [0, 1]);
          });
        });
      });
    });
  });
}

class ContextWithHandler {
  handler;
  constructor(handler) { this.handler = handler; }
}