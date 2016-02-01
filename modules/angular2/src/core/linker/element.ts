import {
  isPresent,
  isBlank,
  Type,
  stringify,
  CONST_EXPR,
  StringWrapper
} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {
  Injector,
  Key,
  Dependency,
  provide,
  Provider,
  ResolvedProvider,
  NoProviderError,
  AbstractProviderError,
  CyclicDependencyError,
  resolveForwardRef,
  Injectable
} from 'angular2/src/core/di';
import {mergeResolvedProviders} from 'angular2/src/core/di/provider';
import {
  UNDEFINED,
  ProtoInjector,
  Visibility,
  InjectorInlineStrategy,
  InjectorDynamicStrategy,
  ProviderWithVisibility,
  DependencyProvider
} from 'angular2/src/core/di/injector';
import {resolveProvider, ResolvedFactory, ResolvedProvider_} from 'angular2/src/core/di/provider';

import {AttributeMetadata, QueryMetadata} from '../metadata/di';

import {AppView} from './view';
import {ViewType} from './view_type';
import {ElementRef_} from './element_ref';

import {ViewContainerRef} from './view_container_ref';
import {ElementRef} from './element_ref';
import {Renderer} from 'angular2/src/core/render/api';
import {TemplateRef, TemplateRef_} from './template_ref';
import {DirectiveMetadata, ComponentMetadata} from '../metadata/directives';
import {
  ChangeDetector,
  ChangeDetectorRef
} from 'angular2/src/core/change_detection/change_detection';
import {QueryList} from './query_list';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {SetterFn} from 'angular2/src/core/reflection/types';
import {AfterViewChecked} from 'angular2/src/core/linker/interfaces';
import {PipeProvider} from 'angular2/src/core/pipes/pipe_provider';

import {ViewContainerRef_} from "./view_container_ref";
import {ResolvedMetadataCache} from './resolved_metadata_cache';

var _staticKeys;

export class StaticKeys {
  templateRefId: number;
  viewContainerId: number;
  changeDetectorRefId: number;
  elementRefId: number;
  rendererId: number;

  constructor() {
    this.templateRefId = Key.get(TemplateRef).id;
    this.viewContainerId = Key.get(ViewContainerRef).id;
    this.changeDetectorRefId = Key.get(ChangeDetectorRef).id;
    this.elementRefId = Key.get(ElementRef).id;
    this.rendererId = Key.get(Renderer).id;
  }

  static instance(): StaticKeys {
    if (isBlank(_staticKeys)) _staticKeys = new StaticKeys();
    return _staticKeys;
  }
}

export class DirectiveDependency extends Dependency {
  constructor(key: Key, optional: boolean, lowerBoundVisibility: Object,
              upperBoundVisibility: Object, properties: any[], public attributeName: string,
              public queryDecorator: QueryMetadata) {
    super(key, optional, lowerBoundVisibility, upperBoundVisibility, properties);
    this._verify();
  }

  /** @internal */
  _verify(): void {
    var count = 0;
    if (isPresent(this.queryDecorator)) count++;
    if (isPresent(this.attributeName)) count++;
    if (count > 1)
      throw new BaseException(
          'A directive injectable can contain only one of the following @Attribute or @Query.');
  }

  static createFrom(d: Dependency): DirectiveDependency {
    return new DirectiveDependency(
        d.key, d.optional, d.lowerBoundVisibility, d.upperBoundVisibility, d.properties,
        DirectiveDependency._attributeName(d.properties), DirectiveDependency._query(d.properties));
  }

  /** @internal */
  static _attributeName(properties: any[]): string {
    var p = <AttributeMetadata>properties.find(p => p instanceof AttributeMetadata);
    return isPresent(p) ? p.attributeName : null;
  }

  /** @internal */
  static _query(properties: any[]): QueryMetadata {
    return <QueryMetadata>properties.find(p => p instanceof QueryMetadata);
  }
}

export class DirectiveProvider extends ResolvedProvider_ {
  constructor(key: Key, factory: Function, deps: Dependency[], public isComponent: boolean,
              public providers: ResolvedProvider[], public viewProviders: ResolvedProvider[],
              public queries: QueryMetadataWithSetter[]) {
    super(key, [new ResolvedFactory(factory, deps)], false);
  }

  get displayName(): string { return this.key.displayName; }

  static createFromType(type: Type, meta: DirectiveMetadata): DirectiveProvider {
    var provider = new Provider(type, {useClass: type});
    if (isBlank(meta)) {
      meta = new DirectiveMetadata();
    }
    var rb = resolveProvider(provider);
    var rf = rb.resolvedFactories[0];
    var deps: DirectiveDependency[] = rf.dependencies.map(DirectiveDependency.createFrom);
    var isComponent = meta instanceof ComponentMetadata;
    var resolvedProviders = isPresent(meta.providers) ? Injector.resolve(meta.providers) : null;
    var resolvedViewProviders = meta instanceof ComponentMetadata && isPresent(meta.viewProviders) ?
                                    Injector.resolve(meta.viewProviders) :
                                    null;
    var queries = [];
    if (isPresent(meta.queries)) {
      StringMapWrapper.forEach(meta.queries, (meta, fieldName) => {
        var setter = reflector.setter(fieldName);
        queries.push(new QueryMetadataWithSetter(setter, meta));
      });
    }
    // queries passed into the constructor.
    // TODO: remove this after constructor queries are no longer supported
    deps.forEach(d => {
      if (isPresent(d.queryDecorator)) {
        queries.push(new QueryMetadataWithSetter(null, d.queryDecorator));
      }
    });
    return new DirectiveProvider(rb.key, rf.factory, deps, isComponent, resolvedProviders,
                                 resolvedViewProviders, queries);
  }
}

export class QueryMetadataWithSetter {
  constructor(public setter: SetterFn, public metadata: QueryMetadata) {}
}


function setProvidersVisibility(providers: ResolvedProvider[], visibility: Visibility,
                                result: Map<number, Visibility>) {
  for (var i = 0; i < providers.length; i++) {
    result.set(providers[i].key.id, visibility);
  }
}

export class AppProtoElement {
  protoInjector: ProtoInjector;

  static create(metadataCache: ResolvedMetadataCache, index: number,
                attributes: {[key: string]: string}, directiveTypes: Type[],
                directiveVariableBindings: {[key: string]: number}): AppProtoElement {
    var componentDirProvider = null;
    var mergedProvidersMap: Map<number, ResolvedProvider> = new Map<number, ResolvedProvider>();
    var providerVisibilityMap: Map<number, Visibility> = new Map<number, Visibility>();
    var providers = ListWrapper.createGrowableSize(directiveTypes.length);

    var protoQueryRefs = [];
    for (var i = 0; i < directiveTypes.length; i++) {
      var dirProvider = metadataCache.getResolvedDirectiveMetadata(directiveTypes[i]);
      providers[i] = new ProviderWithVisibility(
          dirProvider, dirProvider.isComponent ? Visibility.PublicAndPrivate : Visibility.Public);

      if (dirProvider.isComponent) {
        componentDirProvider = dirProvider;
      } else {
        if (isPresent(dirProvider.providers)) {
          mergeResolvedProviders(dirProvider.providers, mergedProvidersMap);
          setProvidersVisibility(dirProvider.providers, Visibility.Public, providerVisibilityMap);
        }
      }
      if (isPresent(dirProvider.viewProviders)) {
        mergeResolvedProviders(dirProvider.viewProviders, mergedProvidersMap);
        setProvidersVisibility(dirProvider.viewProviders, Visibility.Private,
                               providerVisibilityMap);
      }
      for (var queryIdx = 0; queryIdx < dirProvider.queries.length; queryIdx++) {
        var q = dirProvider.queries[queryIdx];
        protoQueryRefs.push(new ProtoQueryRef(i, q.setter, q.metadata));
      }
    }
    if (isPresent(componentDirProvider) && isPresent(componentDirProvider.providers)) {
      // directive providers need to be prioritized over component providers
      mergeResolvedProviders(componentDirProvider.providers, mergedProvidersMap);
      setProvidersVisibility(componentDirProvider.providers, Visibility.Public,
                             providerVisibilityMap);
    }
    mergedProvidersMap.forEach((provider, _) => {
      providers.push(
          new ProviderWithVisibility(provider, providerVisibilityMap.get(provider.key.id)));
    });

    return new AppProtoElement(isPresent(componentDirProvider), index, attributes, providers,
                               protoQueryRefs, directiveVariableBindings);
  }

  constructor(public firstProviderIsComponent: boolean, public index: number,
              public attributes: {[key: string]: string}, pwvs: ProviderWithVisibility[],
              public protoQueryRefs: ProtoQueryRef[],
              public directiveVariableBindings: {[key: string]: number}) {
    var length = pwvs.length;
    if (length > 0) {
      this.protoInjector = new ProtoInjector(pwvs);
    } else {
      this.protoInjector = null;
      this.protoQueryRefs = [];
    }
  }

  getProviderAtIndex(index: number): any { return this.protoInjector.getProviderAtIndex(index); }
}

class _Context {
  constructor(public element: any, public componentElement: any, public injector: any) {}
}

export class InjectorWithHostBoundary {
  constructor(public injector: Injector, public hostInjectorBoundary: boolean) {}
}

export class AppElement implements DependencyProvider, ElementRef, AfterViewChecked {
  static getViewParentInjector(parentViewType: ViewType, containerAppElement: AppElement,
                               imperativelyCreatedProviders: ResolvedProvider[],
                               rootInjector: Injector): InjectorWithHostBoundary {
    var parentInjector;
    var hostInjectorBoundary;
    switch (parentViewType) {
      case ViewType.COMPONENT:
        parentInjector = containerAppElement._injector;
        hostInjectorBoundary = true;
        break;
      case ViewType.EMBEDDED:
        parentInjector = isPresent(containerAppElement.proto.protoInjector) ?
                             containerAppElement._injector.parent :
                             containerAppElement._injector;
        hostInjectorBoundary = containerAppElement._injector.hostBoundary;
        break;
      case ViewType.HOST:
        if (isPresent(containerAppElement)) {
          // host view is attached to a container
          parentInjector = isPresent(containerAppElement.proto.protoInjector) ?
                               containerAppElement._injector.parent :
                               containerAppElement._injector;
          if (isPresent(imperativelyCreatedProviders)) {
            var imperativeProvidersWithVisibility = imperativelyCreatedProviders.map(
                p => new ProviderWithVisibility(p, Visibility.Public));
            // The imperative injector is similar to having an element between
            // the dynamic-loaded component and its parent => no boundary between
            // the component and imperativelyCreatedInjector.
            parentInjector = new Injector(new ProtoInjector(imperativeProvidersWithVisibility),
                                          parentInjector, true, null, null);
            hostInjectorBoundary = false;
          } else {
            hostInjectorBoundary = containerAppElement._injector.hostBoundary;
          }
        } else {
          // bootstrap
          parentInjector = rootInjector;
          hostInjectorBoundary = true;
        }
        break;
    }
    return new InjectorWithHostBoundary(parentInjector, hostInjectorBoundary);
  }

  public nestedViews: AppView[] = null;
  public componentView: AppView = null;

  private _queryStrategy: _QueryStrategy;
  private _injector: Injector;
  private _strategy: _ElementDirectiveStrategy;
  public ref: ElementRef_;

  constructor(public proto: AppProtoElement, public parentView: AppView, public parent: AppElement,
              public nativeElement: any, public embeddedViewFactory: Function) {
    this.ref = new ElementRef_(this);
    var parentInjector = isPresent(parent) ? parent._injector : parentView.parentInjector;
    if (isPresent(this.proto.protoInjector)) {
      var isBoundary;
      if (isPresent(parent) && isPresent(parent.proto.protoInjector)) {
        isBoundary = false;
      } else {
        isBoundary = parentView.hostInjectorBoundary;
      }
      this._queryStrategy = this._buildQueryStrategy();
      this._injector = new Injector(this.proto.protoInjector, parentInjector, isBoundary, this,
                                    () => this._debugContext());

      // we couple ourselves to the injector strategy to avoid polymorphic calls
      var injectorStrategy = <any>this._injector.internalStrategy;
      this._strategy = injectorStrategy instanceof InjectorInlineStrategy ?
                           new ElementDirectiveInlineStrategy(injectorStrategy, this) :
                           new ElementDirectiveDynamicStrategy(injectorStrategy, this);
      this._strategy.init();
    } else {
      this._queryStrategy = null;
      this._injector = parentInjector;
      this._strategy = null;
    }
  }

  attachComponentView(componentView: AppView) { this.componentView = componentView; }

  private _debugContext(): any {
    var c = this.parentView.getDebugContext(this, null, null);
    return isPresent(c) ? new _Context(c.element, c.componentElement, c.injector) : null;
  }

  hasVariableBinding(name: string): boolean {
    var vb = this.proto.directiveVariableBindings;
    return isPresent(vb) && StringMapWrapper.contains(vb, name);
  }

  getVariableBinding(name: string): any {
    var index = this.proto.directiveVariableBindings[name];
    return isPresent(index) ? this.getDirectiveAtIndex(<number>index) : this.getElementRef();
  }

  get(token: any): any { return this._injector.get(token); }

  hasDirective(type: Type): boolean { return isPresent(this._injector.getOptional(type)); }

  getComponent(): any { return isPresent(this._strategy) ? this._strategy.getComponent() : null; }

  getInjector(): Injector { return this._injector; }

  getElementRef(): ElementRef { return this.ref; }

  getViewContainerRef(): ViewContainerRef { return new ViewContainerRef_(this); }

  getTemplateRef(): TemplateRef {
    if (isPresent(this.embeddedViewFactory)) {
      return new TemplateRef_(this.ref);
    }
    return null;
  }

  getDependency(injector: Injector, provider: ResolvedProvider, dep: Dependency): any {
    if (provider instanceof DirectiveProvider) {
      var dirDep = <DirectiveDependency>dep;

      if (isPresent(dirDep.attributeName)) return this._buildAttribute(dirDep);

      if (isPresent(dirDep.queryDecorator))
        return this._queryStrategy.findQuery(dirDep.queryDecorator).list;

      if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
        // We provide the component's view change detector to components and
        // the surrounding component's change detector to directives.
        if (this.proto.firstProviderIsComponent) {
          // Note: The component view is not yet created when
          // this method is called!
          return new _ComponentViewChangeDetectorRef(this);
        } else {
          return this.parentView.changeDetector.ref;
        }
      }

      if (dirDep.key.id === StaticKeys.instance().elementRefId) {
        return this.getElementRef();
      }

      if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
        return this.getViewContainerRef();
      }

      if (dirDep.key.id === StaticKeys.instance().templateRefId) {
        var tr = this.getTemplateRef();
        if (isBlank(tr) && !dirDep.optional) {
          throw new NoProviderError(null, dirDep.key);
        }
        return tr;
      }

      if (dirDep.key.id === StaticKeys.instance().rendererId) {
        return this.parentView.renderer;
      }

    } else if (provider instanceof PipeProvider) {
      if (dep.key.id === StaticKeys.instance().changeDetectorRefId) {
        // We provide the component's view change detector to components and
        // the surrounding component's change detector to directives.
        if (this.proto.firstProviderIsComponent) {
          // Note: The component view is not yet created when
          // this method is called!
          return new _ComponentViewChangeDetectorRef(this);
        } else {
          return this.parentView.changeDetector;
        }
      }
    }

    return UNDEFINED;
  }

  private _buildAttribute(dep: DirectiveDependency): string {
    var attributes = this.proto.attributes;
    if (isPresent(attributes) && StringMapWrapper.contains(attributes, dep.attributeName)) {
      return attributes[dep.attributeName];
    } else {
      return null;
    }
  }

  addDirectivesMatchingQuery(query: QueryMetadata, list: any[]): void {
    var templateRef = this.getTemplateRef();
    if (query.selector === TemplateRef && isPresent(templateRef)) {
      list.push(templateRef);
    }
    if (this._strategy != null) {
      this._strategy.addDirectivesMatchingQuery(query, list);
    }
  }

  private _buildQueryStrategy(): _QueryStrategy {
    if (this.proto.protoQueryRefs.length === 0) {
      return _emptyQueryStrategy;
    } else if (this.proto.protoQueryRefs.length <=
               InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES) {
      return new InlineQueryStrategy(this);
    } else {
      return new DynamicQueryStrategy(this);
    }
  }


  getDirectiveAtIndex(index: number): any { return this._injector.getAt(index); }

  ngAfterViewChecked(): void {
    if (isPresent(this._queryStrategy)) this._queryStrategy.updateViewQueries();
  }

  ngAfterContentChecked(): void {
    if (isPresent(this._queryStrategy)) this._queryStrategy.updateContentQueries();
  }

  traverseAndSetQueriesAsDirty(): void {
    var inj: AppElement = this;
    while (isPresent(inj)) {
      inj._setQueriesAsDirty();
      if (isBlank(inj.parent) && inj.parentView.proto.type === ViewType.EMBEDDED) {
        inj = inj.parentView.containerAppElement;
      } else {
        inj = inj.parent;
      }
    }
  }

  private _setQueriesAsDirty(): void {
    if (isPresent(this._queryStrategy)) {
      this._queryStrategy.setContentQueriesAsDirty();
    }
    if (this.parentView.proto.type === ViewType.COMPONENT) {
      this.parentView.containerAppElement._queryStrategy.setViewQueriesAsDirty();
    }
  }
}

interface _QueryStrategy {
  setContentQueriesAsDirty(): void;
  setViewQueriesAsDirty(): void;
  updateContentQueries(): void;
  updateViewQueries(): void;
  findQuery(query: QueryMetadata): QueryRef;
}

class _EmptyQueryStrategy implements _QueryStrategy {
  setContentQueriesAsDirty(): void {}
  setViewQueriesAsDirty(): void {}
  updateContentQueries(): void {}
  updateViewQueries(): void {}
  findQuery(query: QueryMetadata): QueryRef {
    throw new BaseException(`Cannot find query for directive ${query}.`);
  }
}

var _emptyQueryStrategy = new _EmptyQueryStrategy();

class InlineQueryStrategy implements _QueryStrategy {
  static NUMBER_OF_SUPPORTED_QUERIES = 3;

  query0: QueryRef;
  query1: QueryRef;
  query2: QueryRef;

  constructor(ei: AppElement) {
    var protoRefs = ei.proto.protoQueryRefs;
    if (protoRefs.length > 0) this.query0 = new QueryRef(protoRefs[0], ei);
    if (protoRefs.length > 1) this.query1 = new QueryRef(protoRefs[1], ei);
    if (protoRefs.length > 2) this.query2 = new QueryRef(protoRefs[2], ei);
  }

  setContentQueriesAsDirty(): void {
    if (isPresent(this.query0) && !this.query0.isViewQuery) this.query0.dirty = true;
    if (isPresent(this.query1) && !this.query1.isViewQuery) this.query1.dirty = true;
    if (isPresent(this.query2) && !this.query2.isViewQuery) this.query2.dirty = true;
  }

  setViewQueriesAsDirty(): void {
    if (isPresent(this.query0) && this.query0.isViewQuery) this.query0.dirty = true;
    if (isPresent(this.query1) && this.query1.isViewQuery) this.query1.dirty = true;
    if (isPresent(this.query2) && this.query2.isViewQuery) this.query2.dirty = true;
  }

  updateContentQueries() {
    if (isPresent(this.query0) && !this.query0.isViewQuery) {
      this.query0.update();
    }
    if (isPresent(this.query1) && !this.query1.isViewQuery) {
      this.query1.update();
    }
    if (isPresent(this.query2) && !this.query2.isViewQuery) {
      this.query2.update();
    }
  }

  updateViewQueries() {
    if (isPresent(this.query0) && this.query0.isViewQuery) {
      this.query0.update();
    }
    if (isPresent(this.query1) && this.query1.isViewQuery) {
      this.query1.update();
    }
    if (isPresent(this.query2) && this.query2.isViewQuery) {
      this.query2.update();
    }
  }

  findQuery(query: QueryMetadata): QueryRef {
    if (isPresent(this.query0) && this.query0.protoQueryRef.query === query) {
      return this.query0;
    }
    if (isPresent(this.query1) && this.query1.protoQueryRef.query === query) {
      return this.query1;
    }
    if (isPresent(this.query2) && this.query2.protoQueryRef.query === query) {
      return this.query2;
    }
    throw new BaseException(`Cannot find query for directive ${query}.`);
  }
}

class DynamicQueryStrategy implements _QueryStrategy {
  queries: QueryRef[];

  constructor(ei: AppElement) {
    this.queries = ei.proto.protoQueryRefs.map(p => new QueryRef(p, ei));
  }

  setContentQueriesAsDirty(): void {
    for (var i = 0; i < this.queries.length; ++i) {
      var q = this.queries[i];
      if (!q.isViewQuery) q.dirty = true;
    }
  }

  setViewQueriesAsDirty(): void {
    for (var i = 0; i < this.queries.length; ++i) {
      var q = this.queries[i];
      if (q.isViewQuery) q.dirty = true;
    }
  }

  updateContentQueries() {
    for (var i = 0; i < this.queries.length; ++i) {
      var q = this.queries[i];
      if (!q.isViewQuery) {
        q.update();
      }
    }
  }

  updateViewQueries() {
    for (var i = 0; i < this.queries.length; ++i) {
      var q = this.queries[i];
      if (q.isViewQuery) {
        q.update();
      }
    }
  }

  findQuery(query: QueryMetadata): QueryRef {
    for (var i = 0; i < this.queries.length; ++i) {
      var q = this.queries[i];
      if (q.protoQueryRef.query === query) {
        return q;
      }
    }
    throw new BaseException(`Cannot find query for directive ${query}.`);
  }
}

interface _ElementDirectiveStrategy {
  getComponent(): any;
  isComponentKey(key: Key): boolean;
  addDirectivesMatchingQuery(q: QueryMetadata, res: any[]): void;
  init(): void;
}

/**
 * Strategy used by the `ElementInjector` when the number of providers is 10 or less.
 * In such a case, inlining fields is beneficial for performances.
 */
class ElementDirectiveInlineStrategy implements _ElementDirectiveStrategy {
  constructor(public injectorStrategy: InjectorInlineStrategy, public _ei: AppElement) {}

  init(): void {
    var i = this.injectorStrategy;
    var p = i.protoStrategy;
    i.resetConstructionCounter();

    if (p.provider0 instanceof DirectiveProvider && isPresent(p.keyId0) && i.obj0 === UNDEFINED)
      i.obj0 = i.instantiateProvider(p.provider0, p.visibility0);
    if (p.provider1 instanceof DirectiveProvider && isPresent(p.keyId1) && i.obj1 === UNDEFINED)
      i.obj1 = i.instantiateProvider(p.provider1, p.visibility1);
    if (p.provider2 instanceof DirectiveProvider && isPresent(p.keyId2) && i.obj2 === UNDEFINED)
      i.obj2 = i.instantiateProvider(p.provider2, p.visibility2);
    if (p.provider3 instanceof DirectiveProvider && isPresent(p.keyId3) && i.obj3 === UNDEFINED)
      i.obj3 = i.instantiateProvider(p.provider3, p.visibility3);
    if (p.provider4 instanceof DirectiveProvider && isPresent(p.keyId4) && i.obj4 === UNDEFINED)
      i.obj4 = i.instantiateProvider(p.provider4, p.visibility4);
    if (p.provider5 instanceof DirectiveProvider && isPresent(p.keyId5) && i.obj5 === UNDEFINED)
      i.obj5 = i.instantiateProvider(p.provider5, p.visibility5);
    if (p.provider6 instanceof DirectiveProvider && isPresent(p.keyId6) && i.obj6 === UNDEFINED)
      i.obj6 = i.instantiateProvider(p.provider6, p.visibility6);
    if (p.provider7 instanceof DirectiveProvider && isPresent(p.keyId7) && i.obj7 === UNDEFINED)
      i.obj7 = i.instantiateProvider(p.provider7, p.visibility7);
    if (p.provider8 instanceof DirectiveProvider && isPresent(p.keyId8) && i.obj8 === UNDEFINED)
      i.obj8 = i.instantiateProvider(p.provider8, p.visibility8);
    if (p.provider9 instanceof DirectiveProvider && isPresent(p.keyId9) && i.obj9 === UNDEFINED)
      i.obj9 = i.instantiateProvider(p.provider9, p.visibility9);
  }

  getComponent(): any { return this.injectorStrategy.obj0; }

  isComponentKey(key: Key): boolean {
    return this._ei.proto.firstProviderIsComponent && isPresent(key) &&
           key.id === this.injectorStrategy.protoStrategy.keyId0;
  }

  addDirectivesMatchingQuery(query: QueryMetadata, list: any[]): void {
    var i = this.injectorStrategy;
    var p = i.protoStrategy;
    if (isPresent(p.provider0) && p.provider0.key.token === query.selector) {
      if (i.obj0 === UNDEFINED) i.obj0 = i.instantiateProvider(p.provider0, p.visibility0);
      list.push(i.obj0);
    }
    if (isPresent(p.provider1) && p.provider1.key.token === query.selector) {
      if (i.obj1 === UNDEFINED) i.obj1 = i.instantiateProvider(p.provider1, p.visibility1);
      list.push(i.obj1);
    }
    if (isPresent(p.provider2) && p.provider2.key.token === query.selector) {
      if (i.obj2 === UNDEFINED) i.obj2 = i.instantiateProvider(p.provider2, p.visibility2);
      list.push(i.obj2);
    }
    if (isPresent(p.provider3) && p.provider3.key.token === query.selector) {
      if (i.obj3 === UNDEFINED) i.obj3 = i.instantiateProvider(p.provider3, p.visibility3);
      list.push(i.obj3);
    }
    if (isPresent(p.provider4) && p.provider4.key.token === query.selector) {
      if (i.obj4 === UNDEFINED) i.obj4 = i.instantiateProvider(p.provider4, p.visibility4);
      list.push(i.obj4);
    }
    if (isPresent(p.provider5) && p.provider5.key.token === query.selector) {
      if (i.obj5 === UNDEFINED) i.obj5 = i.instantiateProvider(p.provider5, p.visibility5);
      list.push(i.obj5);
    }
    if (isPresent(p.provider6) && p.provider6.key.token === query.selector) {
      if (i.obj6 === UNDEFINED) i.obj6 = i.instantiateProvider(p.provider6, p.visibility6);
      list.push(i.obj6);
    }
    if (isPresent(p.provider7) && p.provider7.key.token === query.selector) {
      if (i.obj7 === UNDEFINED) i.obj7 = i.instantiateProvider(p.provider7, p.visibility7);
      list.push(i.obj7);
    }
    if (isPresent(p.provider8) && p.provider8.key.token === query.selector) {
      if (i.obj8 === UNDEFINED) i.obj8 = i.instantiateProvider(p.provider8, p.visibility8);
      list.push(i.obj8);
    }
    if (isPresent(p.provider9) && p.provider9.key.token === query.selector) {
      if (i.obj9 === UNDEFINED) i.obj9 = i.instantiateProvider(p.provider9, p.visibility9);
      list.push(i.obj9);
    }
  }
}

/**
 * Strategy used by the `ElementInjector` when the number of bindings is 11 or more.
 * In such a case, there are too many fields to inline (see ElementInjectorInlineStrategy).
 */
class ElementDirectiveDynamicStrategy implements _ElementDirectiveStrategy {
  constructor(public injectorStrategy: InjectorDynamicStrategy, public _ei: AppElement) {}

  init(): void {
    var inj = this.injectorStrategy;
    var p = inj.protoStrategy;
    inj.resetConstructionCounter();

    for (var i = 0; i < p.keyIds.length; i++) {
      if (p.providers[i] instanceof DirectiveProvider && isPresent(p.keyIds[i]) &&
          inj.objs[i] === UNDEFINED) {
        inj.objs[i] = inj.instantiateProvider(p.providers[i], p.visibilities[i]);
      }
    }
  }

  getComponent(): any { return this.injectorStrategy.objs[0]; }

  isComponentKey(key: Key): boolean {
    var p = this.injectorStrategy.protoStrategy;
    return this._ei.proto.firstProviderIsComponent && isPresent(key) && key.id === p.keyIds[0];
  }

  addDirectivesMatchingQuery(query: QueryMetadata, list: any[]): void {
    var ist = this.injectorStrategy;
    var p = ist.protoStrategy;

    for (var i = 0; i < p.providers.length; i++) {
      if (p.providers[i].key.token === query.selector) {
        if (ist.objs[i] === UNDEFINED) {
          ist.objs[i] = ist.instantiateProvider(p.providers[i], p.visibilities[i]);
        }
        list.push(ist.objs[i]);
      }
    }
  }
}

export class ProtoQueryRef {
  constructor(public dirIndex: number, public setter: SetterFn, public query: QueryMetadata) {}

  get usesPropertySyntax(): boolean { return isPresent(this.setter); }
}

export class QueryRef {
  public list: QueryList<any>;
  public dirty: boolean;

  constructor(public protoQueryRef: ProtoQueryRef, private originator: AppElement) {
    this.list = new QueryList<any>();
    this.dirty = true;
  }

  get isViewQuery(): boolean { return this.protoQueryRef.query.isViewQuery; }

  update(): void {
    if (!this.dirty) return;
    this._update();
    this.dirty = false;

    // TODO delete the check once only field queries are supported
    if (this.protoQueryRef.usesPropertySyntax) {
      var dir = this.originator.getDirectiveAtIndex(this.protoQueryRef.dirIndex);
      if (this.protoQueryRef.query.first) {
        this.protoQueryRef.setter(dir, this.list.length > 0 ? this.list.first : null);
      } else {
        this.protoQueryRef.setter(dir, this.list);
      }
    }

    this.list.notifyOnChanges();
  }

  private _update(): void {
    var aggregator = [];
    if (this.protoQueryRef.query.isViewQuery) {
      // intentionally skipping originator for view queries.
      var nestedView = this.originator.componentView;
      if (isPresent(nestedView)) this._visitView(nestedView, aggregator);
    } else {
      this._visit(this.originator, aggregator);
    }
    this.list.reset(aggregator);
  };

  private _visit(inj: AppElement, aggregator: any[]): void {
    var view = inj.parentView;
    var startIdx = inj.proto.index;
    for (var i = startIdx; i < view.appElements.length; i++) {
      var curInj = view.appElements[i];
      // The first injector after inj, that is outside the subtree rooted at
      // inj has to have a null parent or a parent that is an ancestor of inj.
      if (i > startIdx && (isBlank(curInj.parent) || curInj.parent.proto.index < startIdx)) {
        break;
      }

      if (!this.protoQueryRef.query.descendants &&
          !(curInj.parent == this.originator || curInj == this.originator))
        continue;

      // We visit the view container(VC) views right after the injector that contains
      // the VC. Theoretically, that might not be the right order if there are
      // child injectors of said injector. Not clear whether if such case can
      // even be constructed with the current apis.
      this._visitInjector(curInj, aggregator);
      this._visitViewContainerViews(curInj.nestedViews, aggregator);
    }
  }

  private _visitInjector(inj: AppElement, aggregator: any[]) {
    if (this.protoQueryRef.query.isVarBindingQuery) {
      this._aggregateVariableBinding(inj, aggregator);
    } else {
      this._aggregateDirective(inj, aggregator);
    }
  }

  private _visitViewContainerViews(views: AppView[], aggregator: any[]) {
    if (isPresent(views)) {
      for (var j = 0; j < views.length; j++) {
        this._visitView(views[j], aggregator);
      }
    }
  }

  private _visitView(view: AppView, aggregator: any[]) {
    for (var i = 0; i < view.appElements.length; i++) {
      var inj = view.appElements[i];
      this._visitInjector(inj, aggregator);
      this._visitViewContainerViews(inj.nestedViews, aggregator);
    }
  }

  private _aggregateVariableBinding(inj: AppElement, aggregator: any[]): void {
    var vb = this.protoQueryRef.query.varBindings;
    for (var i = 0; i < vb.length; ++i) {
      if (inj.hasVariableBinding(vb[i])) {
        aggregator.push(inj.getVariableBinding(vb[i]));
      }
    }
  }

  private _aggregateDirective(inj: AppElement, aggregator: any[]): void {
    inj.addDirectivesMatchingQuery(this.protoQueryRef.query, aggregator);
  }
}

class _ComponentViewChangeDetectorRef extends ChangeDetectorRef {
  constructor(private _appElement: AppElement) { super(); }

  markForCheck(): void { this._appElement.componentView.changeDetector.ref.markForCheck(); }
  detach(): void { this._appElement.componentView.changeDetector.ref.detach(); }
  detectChanges(): void { this._appElement.componentView.changeDetector.ref.detectChanges(); }
  checkNoChanges(): void { this._appElement.componentView.changeDetector.ref.checkNoChanges(); }
  reattach(): void { this._appElement.componentView.changeDetector.ref.reattach(); }
}
