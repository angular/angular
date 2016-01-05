library angular2.src.core.linker.element;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, Type, stringify, StringWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper, StringMapWrapper;
import "package:angular2/src/core/di.dart"
    show
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
        Injectable;
import "package:angular2/src/core/di/provider.dart" show mergeResolvedProviders;
import "package:angular2/src/core/di/injector.dart"
    show
        UNDEFINED,
        ProtoInjector,
        Visibility,
        InjectorInlineStrategy,
        InjectorDynamicStrategy,
        ProviderWithVisibility,
        DependencyProvider;
import "package:angular2/src/core/di/provider.dart"
    show resolveProvider, ResolvedFactory, ResolvedProvider_;
import "../metadata/di.dart" show AttributeMetadata, QueryMetadata;
import "view.dart" show AppView;
import "view_type.dart" show ViewType;
import "element_ref.dart" show ElementRef_;
import "view_container_ref.dart" show ViewContainerRef;
import "element_ref.dart" show ElementRef;
import "package:angular2/src/core/render/api.dart" show Renderer;
import "template_ref.dart" show TemplateRef, TemplateRef_;
import "../metadata/directives.dart" show DirectiveMetadata, ComponentMetadata;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show ChangeDetector, ChangeDetectorRef;
import "query_list.dart" show QueryList;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
import "package:angular2/src/core/reflection/types.dart" show SetterFn;
import "package:angular2/src/core/linker/interfaces.dart" show AfterViewChecked;
import "package:angular2/src/core/pipes/pipe_provider.dart" show PipeProvider;
import "view_container_ref.dart" show ViewContainerRef_;
import "resolved_metadata_cache.dart" show ResolvedMetadataCache;

var _staticKeys;

class StaticKeys {
  num templateRefId;
  num viewContainerId;
  num changeDetectorRefId;
  num elementRefId;
  num rendererId;
  StaticKeys() {
    this.templateRefId = Key.get(TemplateRef).id;
    this.viewContainerId = Key.get(ViewContainerRef).id;
    this.changeDetectorRefId = Key.get(ChangeDetectorRef).id;
    this.elementRefId = Key.get(ElementRef).id;
    this.rendererId = Key.get(Renderer).id;
  }
  static StaticKeys instance() {
    if (isBlank(_staticKeys)) _staticKeys = new StaticKeys();
    return _staticKeys;
  }
}

class DirectiveDependency extends Dependency {
  String attributeName;
  QueryMetadata queryDecorator;
  DirectiveDependency(
      Key key,
      bool optional,
      Object lowerBoundVisibility,
      Object upperBoundVisibility,
      List<dynamic> properties,
      this.attributeName,
      this.queryDecorator)
      : super(key, optional, lowerBoundVisibility, upperBoundVisibility,
            properties) {
    /* super call moved to initializer */;
    this._verify();
  }
  /** @internal */
  void _verify() {
    var count = 0;
    if (isPresent(this.queryDecorator)) count++;
    if (isPresent(this.attributeName)) count++;
    if (count > 1) throw new BaseException(
        "A directive injectable can contain only one of the following @Attribute or @Query.");
  }

  static DirectiveDependency createFrom(Dependency d) {
    return new DirectiveDependency(
        d.key,
        d.optional,
        d.lowerBoundVisibility,
        d.upperBoundVisibility,
        d.properties,
        DirectiveDependency._attributeName(d.properties),
        DirectiveDependency._query(d.properties));
  }

  /** @internal */
  static String _attributeName(List<dynamic> properties) {
    var p = (properties.firstWhere((p) => p is AttributeMetadata,
        orElse: () => null) as AttributeMetadata);
    return isPresent(p) ? p.attributeName : null;
  }

  /** @internal */
  static QueryMetadata _query(List<dynamic> properties) {
    return (properties.firstWhere((p) => p is QueryMetadata, orElse: () => null)
        as QueryMetadata);
  }
}

class DirectiveProvider extends ResolvedProvider_ {
  bool isComponent;
  List<ResolvedProvider> providers;
  List<ResolvedProvider> viewProviders;
  List<QueryMetadataWithSetter> queries;
  DirectiveProvider(Key key, Function factory, List<Dependency> deps,
      this.isComponent, this.providers, this.viewProviders, this.queries)
      : super(key, [new ResolvedFactory(factory, deps)], false) {
    /* super call moved to initializer */;
  }
  String get displayName {
    return this.key.displayName;
  }

  static DirectiveProvider createFromType(Type type, DirectiveMetadata meta) {
    var provider = new Provider(type, useClass: type);
    if (isBlank(meta)) {
      meta = new DirectiveMetadata();
    }
    var rb = resolveProvider(provider);
    var rf = rb.resolvedFactories[0];
    List<DirectiveDependency> deps =
        rf.dependencies.map(DirectiveDependency.createFrom).toList();
    var isComponent = meta is ComponentMetadata;
    var resolvedProviders =
        isPresent(meta.providers) ? Injector.resolve(meta.providers) : null;
    var resolvedViewProviders = meta is ComponentMetadata &&
            isPresent(meta.viewProviders)
        ? Injector.resolve(meta.viewProviders)
        : null;
    var queries = [];
    if (isPresent(meta.queries)) {
      StringMapWrapper.forEach(meta.queries, (meta, fieldName) {
        var setter = reflector.setter(fieldName);
        queries.add(new QueryMetadataWithSetter(setter, meta));
      });
    }
    // queries passed into the constructor.

    // TODO: remove this after constructor queries are no longer supported
    deps.forEach((d) {
      if (isPresent(d.queryDecorator)) {
        queries.add(new QueryMetadataWithSetter(null, d.queryDecorator));
      }
    });
    return new DirectiveProvider(rb.key, rf.factory, deps, isComponent,
        resolvedProviders, resolvedViewProviders, queries);
  }
}

class QueryMetadataWithSetter {
  SetterFn setter;
  QueryMetadata metadata;
  QueryMetadataWithSetter(this.setter, this.metadata) {}
}

setProvidersVisibility(List<ResolvedProvider> providers, Visibility visibility,
    Map<num, Visibility> result) {
  for (var i = 0; i < providers.length; i++) {
    result[providers[i].key.id] = visibility;
  }
}

class AppProtoElement {
  bool firstProviderIsComponent;
  num index;
  Map<String, String> attributes;
  List<ProtoQueryRef> protoQueryRefs;
  Map<String, num> directiveVariableBindings;
  ProtoInjector protoInjector;
  static AppProtoElement create(
      ResolvedMetadataCache metadataCache,
      num index,
      Map<String, String> attributes,
      List<Type> directiveTypes,
      Map<String, num> directiveVariableBindings) {
    var componentDirProvider = null;
    Map<num, ResolvedProvider> mergedProvidersMap =
        new Map<num, ResolvedProvider>();
    Map<num, Visibility> providerVisibilityMap = new Map<num, Visibility>();
    var providers = ListWrapper.createGrowableSize(directiveTypes.length);
    var protoQueryRefs = [];
    for (var i = 0; i < directiveTypes.length; i++) {
      var dirProvider =
          metadataCache.getResolvedDirectiveMetadata(directiveTypes[i]);
      providers[i] = new ProviderWithVisibility(
          dirProvider,
          dirProvider.isComponent
              ? Visibility.PublicAndPrivate
              : Visibility.Public);
      if (dirProvider.isComponent) {
        componentDirProvider = dirProvider;
      } else {
        if (isPresent(dirProvider.providers)) {
          mergeResolvedProviders(dirProvider.providers, mergedProvidersMap);
          setProvidersVisibility(
              dirProvider.providers, Visibility.Public, providerVisibilityMap);
        }
      }
      if (isPresent(dirProvider.viewProviders)) {
        mergeResolvedProviders(dirProvider.viewProviders, mergedProvidersMap);
        setProvidersVisibility(dirProvider.viewProviders, Visibility.Private,
            providerVisibilityMap);
      }
      for (var queryIdx = 0;
          queryIdx < dirProvider.queries.length;
          queryIdx++) {
        var q = dirProvider.queries[queryIdx];
        protoQueryRefs.add(new ProtoQueryRef(i, q.setter, q.metadata));
      }
    }
    if (isPresent(componentDirProvider) &&
        isPresent(componentDirProvider.providers)) {
      // directive providers need to be prioritized over component providers
      mergeResolvedProviders(
          componentDirProvider.providers, mergedProvidersMap);
      setProvidersVisibility(componentDirProvider.providers, Visibility.Public,
          providerVisibilityMap);
    }
    mergedProvidersMap.forEach((_, provider) {
      providers.add(new ProviderWithVisibility(
          provider, providerVisibilityMap[provider.key.id]));
    });
    return new AppProtoElement(isPresent(componentDirProvider), index,
        attributes, providers, protoQueryRefs, directiveVariableBindings);
  }

  AppProtoElement(
      this.firstProviderIsComponent,
      this.index,
      this.attributes,
      List<ProviderWithVisibility> pwvs,
      this.protoQueryRefs,
      this.directiveVariableBindings) {
    var length = pwvs.length;
    if (length > 0) {
      this.protoInjector = new ProtoInjector(pwvs);
    } else {
      this.protoInjector = null;
      this.protoQueryRefs = [];
    }
  }
  dynamic getProviderAtIndex(num index) {
    return this.protoInjector.getProviderAtIndex(index);
  }
}

class _Context {
  dynamic element;
  dynamic componentElement;
  dynamic injector;
  _Context(this.element, this.componentElement, this.injector) {}
}

class InjectorWithHostBoundary {
  Injector injector;
  bool hostInjectorBoundary;
  InjectorWithHostBoundary(this.injector, this.hostInjectorBoundary) {}
}

class AppElement implements DependencyProvider, ElementRef, AfterViewChecked {
  AppProtoElement proto;
  AppView parentView;
  AppElement parent;
  dynamic nativeElement;
  Function embeddedViewFactory;
  static InjectorWithHostBoundary getViewParentInjector(
      ViewType parentViewType,
      AppElement containerAppElement,
      List<ResolvedProvider> imperativelyCreatedProviders,
      Injector rootInjector) {
    var parentInjector;
    var hostInjectorBoundary;
    switch (parentViewType) {
      case ViewType.COMPONENT:
        parentInjector = containerAppElement._injector;
        hostInjectorBoundary = true;
        break;
      case ViewType.EMBEDDED:
        parentInjector = isPresent(containerAppElement.proto.protoInjector)
            ? containerAppElement._injector.parent
            : containerAppElement._injector;
        hostInjectorBoundary = containerAppElement._injector.hostBoundary;
        break;
      case ViewType.HOST:
        if (isPresent(containerAppElement)) {
          // host view is attached to a container
          parentInjector = isPresent(containerAppElement.proto.protoInjector)
              ? containerAppElement._injector.parent
              : containerAppElement._injector;
          if (isPresent(imperativelyCreatedProviders)) {
            var imperativeProvidersWithVisibility = imperativelyCreatedProviders
                .map((p) => new ProviderWithVisibility(p, Visibility.Public))
                .toList();
            // The imperative injector is similar to having an element between

            // the dynamic-loaded component and its parent => no boundary between

            // the component and imperativelyCreatedInjector.
            parentInjector = new Injector(
                new ProtoInjector(imperativeProvidersWithVisibility),
                parentInjector,
                true,
                null,
                null);
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

  List<AppView> nestedViews = null;
  AppView componentView = null;
  _QueryStrategy _queryStrategy;
  Injector _injector;
  _ElementDirectiveStrategy _strategy;
  ElementRef_ ref;
  AppElement(this.proto, this.parentView, this.parent, this.nativeElement,
      this.embeddedViewFactory) {
    this.ref = new ElementRef_(this);
    var parentInjector =
        isPresent(parent) ? parent._injector : parentView.parentInjector;
    if (isPresent(this.proto.protoInjector)) {
      var isBoundary;
      if (isPresent(parent) && isPresent(parent.proto.protoInjector)) {
        isBoundary = false;
      } else {
        isBoundary = parentView.hostInjectorBoundary;
      }
      this._queryStrategy = this._buildQueryStrategy();
      this._injector = new Injector(this.proto.protoInjector, parentInjector,
          isBoundary, this, () => this._debugContext());
      // we couple ourselves to the injector strategy to avoid polymorphic calls
      var injectorStrategy = (this._injector.internalStrategy as dynamic);
      this._strategy = injectorStrategy is InjectorInlineStrategy
          ? new ElementDirectiveInlineStrategy(injectorStrategy, this)
          : new ElementDirectiveDynamicStrategy(injectorStrategy, this);
      this._strategy.init();
    } else {
      this._queryStrategy = null;
      this._injector = parentInjector;
      this._strategy = null;
    }
  }
  attachComponentView(AppView componentView) {
    this.componentView = componentView;
  }

  dynamic _debugContext() {
    var c = this.parentView.getDebugContext(this, null, null);
    return isPresent(c)
        ? new _Context(c.element, c.componentElement, c.injector)
        : null;
  }

  bool hasVariableBinding(String name) {
    var vb = this.proto.directiveVariableBindings;
    return isPresent(vb) && StringMapWrapper.contains(vb, name);
  }

  dynamic getVariableBinding(String name) {
    var index = this.proto.directiveVariableBindings[name];
    return isPresent(index)
        ? this.getDirectiveAtIndex((index as num))
        : this.getElementRef();
  }

  dynamic get(dynamic token) {
    return this._injector.get(token);
  }

  bool hasDirective(Type type) {
    return isPresent(this._injector.getOptional(type));
  }

  dynamic getComponent() {
    return isPresent(this._strategy) ? this._strategy.getComponent() : null;
  }

  Injector getInjector() {
    return this._injector;
  }

  ElementRef getElementRef() {
    return this.ref;
  }

  ViewContainerRef getViewContainerRef() {
    return new ViewContainerRef_(this);
  }

  TemplateRef getTemplateRef() {
    if (isPresent(this.embeddedViewFactory)) {
      return new TemplateRef_(this.ref);
    }
    return null;
  }

  dynamic getDependency(
      Injector injector, ResolvedProvider provider, Dependency dep) {
    if (provider is DirectiveProvider) {
      var dirDep = (dep as DirectiveDependency);
      if (isPresent(dirDep.attributeName)) return this._buildAttribute(dirDep);
      if (isPresent(dirDep.queryDecorator)) return this
          ._queryStrategy
          .findQuery(dirDep.queryDecorator)
          .list;
      if (identical(dirDep.key.id, StaticKeys.instance().changeDetectorRefId)) {
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
      if (identical(dirDep.key.id, StaticKeys.instance().elementRefId)) {
        return this.getElementRef();
      }
      if (identical(dirDep.key.id, StaticKeys.instance().viewContainerId)) {
        return this.getViewContainerRef();
      }
      if (identical(dirDep.key.id, StaticKeys.instance().templateRefId)) {
        var tr = this.getTemplateRef();
        if (isBlank(tr) && !dirDep.optional) {
          throw new NoProviderError(null, dirDep.key);
        }
        return tr;
      }
      if (identical(dirDep.key.id, StaticKeys.instance().rendererId)) {
        return this.parentView.renderer;
      }
    } else if (provider is PipeProvider) {
      if (identical(dep.key.id, StaticKeys.instance().changeDetectorRefId)) {
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

  String _buildAttribute(DirectiveDependency dep) {
    var attributes = this.proto.attributes;
    if (isPresent(attributes) &&
        StringMapWrapper.contains(attributes, dep.attributeName)) {
      return attributes[dep.attributeName];
    } else {
      return null;
    }
  }

  void addDirectivesMatchingQuery(QueryMetadata query, List<dynamic> list) {
    var templateRef = this.getTemplateRef();
    if (identical(query.selector, TemplateRef) && isPresent(templateRef)) {
      list.add(templateRef);
    }
    if (this._strategy != null) {
      this._strategy.addDirectivesMatchingQuery(query, list);
    }
  }

  _QueryStrategy _buildQueryStrategy() {
    if (identical(this.proto.protoQueryRefs.length, 0)) {
      return _emptyQueryStrategy;
    } else if (this.proto.protoQueryRefs.length <=
        InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES) {
      return new InlineQueryStrategy(this);
    } else {
      return new DynamicQueryStrategy(this);
    }
  }

  dynamic getDirectiveAtIndex(num index) {
    return this._injector.getAt(index);
  }

  void ngAfterViewChecked() {
    if (isPresent(this._queryStrategy)) this._queryStrategy.updateViewQueries();
  }

  void ngAfterContentChecked() {
    if (isPresent(this._queryStrategy)) this
        ._queryStrategy
        .updateContentQueries();
  }

  void traverseAndSetQueriesAsDirty() {
    AppElement inj = this;
    while (isPresent(inj)) {
      inj._setQueriesAsDirty();
      inj = inj.parent;
    }
  }

  void _setQueriesAsDirty() {
    if (isPresent(this._queryStrategy)) {
      this._queryStrategy.setContentQueriesAsDirty();
    }
    if (identical(this.parentView.proto.type, ViewType.COMPONENT)) {
      this
          .parentView
          .containerAppElement
          ._queryStrategy
          .setViewQueriesAsDirty();
    }
  }
}

abstract class _QueryStrategy {
  void setContentQueriesAsDirty();
  void setViewQueriesAsDirty();
  void updateContentQueries();
  void updateViewQueries();
  QueryRef findQuery(QueryMetadata query);
}

class _EmptyQueryStrategy implements _QueryStrategy {
  void setContentQueriesAsDirty() {}
  void setViewQueriesAsDirty() {}
  void updateContentQueries() {}
  void updateViewQueries() {}
  QueryRef findQuery(QueryMetadata query) {
    throw new BaseException('''Cannot find query for directive ${ query}.''');
  }
}

var _emptyQueryStrategy = new _EmptyQueryStrategy();

class InlineQueryStrategy implements _QueryStrategy {
  static var NUMBER_OF_SUPPORTED_QUERIES = 3;
  QueryRef query0;
  QueryRef query1;
  QueryRef query2;
  InlineQueryStrategy(AppElement ei) {
    var protoRefs = ei.proto.protoQueryRefs;
    if (protoRefs.length > 0) this.query0 = new QueryRef(protoRefs[0], ei);
    if (protoRefs.length > 1) this.query1 = new QueryRef(protoRefs[1], ei);
    if (protoRefs.length > 2) this.query2 = new QueryRef(protoRefs[2], ei);
  }
  void setContentQueriesAsDirty() {
    if (isPresent(this.query0) && !this.query0.isViewQuery) this.query0.dirty =
        true;
    if (isPresent(this.query1) && !this.query1.isViewQuery) this.query1.dirty =
        true;
    if (isPresent(this.query2) && !this.query2.isViewQuery) this.query2.dirty =
        true;
  }

  void setViewQueriesAsDirty() {
    if (isPresent(this.query0) && this.query0.isViewQuery) this.query0.dirty =
        true;
    if (isPresent(this.query1) && this.query1.isViewQuery) this.query1.dirty =
        true;
    if (isPresent(this.query2) && this.query2.isViewQuery) this.query2.dirty =
        true;
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

  QueryRef findQuery(QueryMetadata query) {
    if (isPresent(this.query0) &&
        identical(this.query0.protoQueryRef.query, query)) {
      return this.query0;
    }
    if (isPresent(this.query1) &&
        identical(this.query1.protoQueryRef.query, query)) {
      return this.query1;
    }
    if (isPresent(this.query2) &&
        identical(this.query2.protoQueryRef.query, query)) {
      return this.query2;
    }
    throw new BaseException('''Cannot find query for directive ${ query}.''');
  }
}

class DynamicQueryStrategy implements _QueryStrategy {
  List<QueryRef> queries;
  DynamicQueryStrategy(AppElement ei) {
    this.queries =
        ei.proto.protoQueryRefs.map((p) => new QueryRef(p, ei)).toList();
  }
  void setContentQueriesAsDirty() {
    for (var i = 0; i < this.queries.length; ++i) {
      var q = this.queries[i];
      if (!q.isViewQuery) q.dirty = true;
    }
  }

  void setViewQueriesAsDirty() {
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

  QueryRef findQuery(QueryMetadata query) {
    for (var i = 0; i < this.queries.length; ++i) {
      var q = this.queries[i];
      if (identical(q.protoQueryRef.query, query)) {
        return q;
      }
    }
    throw new BaseException('''Cannot find query for directive ${ query}.''');
  }
}

abstract class _ElementDirectiveStrategy {
  dynamic getComponent();
  bool isComponentKey(Key key);
  void addDirectivesMatchingQuery(QueryMetadata q, List<dynamic> res);
  void init();
}

/**
 * Strategy used by the `ElementInjector` when the number of providers is 10 or less.
 * In such a case, inlining fields is beneficial for performances.
 */
class ElementDirectiveInlineStrategy implements _ElementDirectiveStrategy {
  InjectorInlineStrategy injectorStrategy;
  AppElement _ei;
  ElementDirectiveInlineStrategy(this.injectorStrategy, this._ei) {}
  void init() {
    var i = this.injectorStrategy;
    var p = i.protoStrategy;
    i.resetConstructionCounter();
    if (p.provider0 is DirectiveProvider &&
        isPresent(p.keyId0) &&
        identical(i.obj0, UNDEFINED)) i.obj0 =
        i.instantiateProvider(p.provider0, p.visibility0);
    if (p.provider1 is DirectiveProvider &&
        isPresent(p.keyId1) &&
        identical(i.obj1, UNDEFINED)) i.obj1 =
        i.instantiateProvider(p.provider1, p.visibility1);
    if (p.provider2 is DirectiveProvider &&
        isPresent(p.keyId2) &&
        identical(i.obj2, UNDEFINED)) i.obj2 =
        i.instantiateProvider(p.provider2, p.visibility2);
    if (p.provider3 is DirectiveProvider &&
        isPresent(p.keyId3) &&
        identical(i.obj3, UNDEFINED)) i.obj3 =
        i.instantiateProvider(p.provider3, p.visibility3);
    if (p.provider4 is DirectiveProvider &&
        isPresent(p.keyId4) &&
        identical(i.obj4, UNDEFINED)) i.obj4 =
        i.instantiateProvider(p.provider4, p.visibility4);
    if (p.provider5 is DirectiveProvider &&
        isPresent(p.keyId5) &&
        identical(i.obj5, UNDEFINED)) i.obj5 =
        i.instantiateProvider(p.provider5, p.visibility5);
    if (p.provider6 is DirectiveProvider &&
        isPresent(p.keyId6) &&
        identical(i.obj6, UNDEFINED)) i.obj6 =
        i.instantiateProvider(p.provider6, p.visibility6);
    if (p.provider7 is DirectiveProvider &&
        isPresent(p.keyId7) &&
        identical(i.obj7, UNDEFINED)) i.obj7 =
        i.instantiateProvider(p.provider7, p.visibility7);
    if (p.provider8 is DirectiveProvider &&
        isPresent(p.keyId8) &&
        identical(i.obj8, UNDEFINED)) i.obj8 =
        i.instantiateProvider(p.provider8, p.visibility8);
    if (p.provider9 is DirectiveProvider &&
        isPresent(p.keyId9) &&
        identical(i.obj9, UNDEFINED)) i.obj9 =
        i.instantiateProvider(p.provider9, p.visibility9);
  }

  dynamic getComponent() {
    return this.injectorStrategy.obj0;
  }

  bool isComponentKey(Key key) {
    return this._ei.proto.firstProviderIsComponent &&
        isPresent(key) &&
        identical(key.id, this.injectorStrategy.protoStrategy.keyId0);
  }

  void addDirectivesMatchingQuery(QueryMetadata query, List<dynamic> list) {
    var i = this.injectorStrategy;
    var p = i.protoStrategy;
    if (isPresent(p.provider0) &&
        identical(p.provider0.key.token, query.selector)) {
      if (identical(i.obj0, UNDEFINED)) i.obj0 =
          i.instantiateProvider(p.provider0, p.visibility0);
      list.add(i.obj0);
    }
    if (isPresent(p.provider1) &&
        identical(p.provider1.key.token, query.selector)) {
      if (identical(i.obj1, UNDEFINED)) i.obj1 =
          i.instantiateProvider(p.provider1, p.visibility1);
      list.add(i.obj1);
    }
    if (isPresent(p.provider2) &&
        identical(p.provider2.key.token, query.selector)) {
      if (identical(i.obj2, UNDEFINED)) i.obj2 =
          i.instantiateProvider(p.provider2, p.visibility2);
      list.add(i.obj2);
    }
    if (isPresent(p.provider3) &&
        identical(p.provider3.key.token, query.selector)) {
      if (identical(i.obj3, UNDEFINED)) i.obj3 =
          i.instantiateProvider(p.provider3, p.visibility3);
      list.add(i.obj3);
    }
    if (isPresent(p.provider4) &&
        identical(p.provider4.key.token, query.selector)) {
      if (identical(i.obj4, UNDEFINED)) i.obj4 =
          i.instantiateProvider(p.provider4, p.visibility4);
      list.add(i.obj4);
    }
    if (isPresent(p.provider5) &&
        identical(p.provider5.key.token, query.selector)) {
      if (identical(i.obj5, UNDEFINED)) i.obj5 =
          i.instantiateProvider(p.provider5, p.visibility5);
      list.add(i.obj5);
    }
    if (isPresent(p.provider6) &&
        identical(p.provider6.key.token, query.selector)) {
      if (identical(i.obj6, UNDEFINED)) i.obj6 =
          i.instantiateProvider(p.provider6, p.visibility6);
      list.add(i.obj6);
    }
    if (isPresent(p.provider7) &&
        identical(p.provider7.key.token, query.selector)) {
      if (identical(i.obj7, UNDEFINED)) i.obj7 =
          i.instantiateProvider(p.provider7, p.visibility7);
      list.add(i.obj7);
    }
    if (isPresent(p.provider8) &&
        identical(p.provider8.key.token, query.selector)) {
      if (identical(i.obj8, UNDEFINED)) i.obj8 =
          i.instantiateProvider(p.provider8, p.visibility8);
      list.add(i.obj8);
    }
    if (isPresent(p.provider9) &&
        identical(p.provider9.key.token, query.selector)) {
      if (identical(i.obj9, UNDEFINED)) i.obj9 =
          i.instantiateProvider(p.provider9, p.visibility9);
      list.add(i.obj9);
    }
  }
}

/**
 * Strategy used by the `ElementInjector` when the number of bindings is 11 or more.
 * In such a case, there are too many fields to inline (see ElementInjectorInlineStrategy).
 */
class ElementDirectiveDynamicStrategy implements _ElementDirectiveStrategy {
  InjectorDynamicStrategy injectorStrategy;
  AppElement _ei;
  ElementDirectiveDynamicStrategy(this.injectorStrategy, this._ei) {}
  void init() {
    var inj = this.injectorStrategy;
    var p = inj.protoStrategy;
    inj.resetConstructionCounter();
    for (var i = 0; i < p.keyIds.length; i++) {
      if (p.providers[i] is DirectiveProvider &&
          isPresent(p.keyIds[i]) &&
          identical(inj.objs[i], UNDEFINED)) {
        inj.objs[i] =
            inj.instantiateProvider(p.providers[i], p.visibilities[i]);
      }
    }
  }

  dynamic getComponent() {
    return this.injectorStrategy.objs[0];
  }

  bool isComponentKey(Key key) {
    var p = this.injectorStrategy.protoStrategy;
    return this._ei.proto.firstProviderIsComponent &&
        isPresent(key) &&
        identical(key.id, p.keyIds[0]);
  }

  void addDirectivesMatchingQuery(QueryMetadata query, List<dynamic> list) {
    var ist = this.injectorStrategy;
    var p = ist.protoStrategy;
    for (var i = 0; i < p.providers.length; i++) {
      if (identical(p.providers[i].key.token, query.selector)) {
        if (identical(ist.objs[i], UNDEFINED)) {
          ist.objs[i] =
              ist.instantiateProvider(p.providers[i], p.visibilities[i]);
        }
        list.add(ist.objs[i]);
      }
    }
  }
}

class ProtoQueryRef {
  num dirIndex;
  SetterFn setter;
  QueryMetadata query;
  ProtoQueryRef(this.dirIndex, this.setter, this.query) {}
  bool get usesPropertySyntax {
    return isPresent(this.setter);
  }
}

class QueryRef {
  ProtoQueryRef protoQueryRef;
  AppElement originator;
  QueryList<dynamic> list;
  bool dirty;
  QueryRef(this.protoQueryRef, this.originator) {
    this.list = new QueryList<dynamic>();
    this.dirty = true;
  }
  bool get isViewQuery {
    return this.protoQueryRef.query.isViewQuery;
  }

  void update() {
    if (!this.dirty) return;
    this._update();
    this.dirty = false;
    // TODO delete the check once only field queries are supported
    if (this.protoQueryRef.usesPropertySyntax) {
      var dir =
          this.originator.getDirectiveAtIndex(this.protoQueryRef.dirIndex);
      if (this.protoQueryRef.query.first) {
        this
            .protoQueryRef
            .setter(dir, this.list.length > 0 ? this.list.first : null);
      } else {
        this.protoQueryRef.setter(dir, this.list);
      }
    }
    this.list.notifyOnChanges();
  }

  void _update() {
    var aggregator = [];
    if (this.protoQueryRef.query.isViewQuery) {
      // intentionally skipping originator for view queries.
      var nestedView = this.originator.componentView;
      if (isPresent(nestedView)) this._visitView(nestedView, aggregator);
    } else {
      this._visit(this.originator, aggregator);
    }
    this.list.reset(aggregator);
  }

  void _visit(AppElement inj, List<dynamic> aggregator) {
    var view = inj.parentView;
    var startIdx = inj.proto.index;
    for (var i = startIdx; i < view.appElements.length; i++) {
      var curInj = view.appElements[i];
      // The first injector after inj, that is outside the subtree rooted at

      // inj has to have a null parent or a parent that is an ancestor of inj.
      if (i > startIdx &&
          (isBlank(curInj.parent) || curInj.parent.proto.index < startIdx)) {
        break;
      }
      if (!this.protoQueryRef.query.descendants &&
          !(curInj.parent == this.originator ||
              curInj == this.originator)) continue;
      // We visit the view container(VC) views right after the injector that contains

      // the VC. Theoretically, that might not be the right order if there are

      // child injectors of said injector. Not clear whether if such case can

      // even be constructed with the current apis.
      this._visitInjector(curInj, aggregator);
      this._visitViewContainerViews(curInj.nestedViews, aggregator);
    }
  }

  _visitInjector(AppElement inj, List<dynamic> aggregator) {
    if (this.protoQueryRef.query.isVarBindingQuery) {
      this._aggregateVariableBinding(inj, aggregator);
    } else {
      this._aggregateDirective(inj, aggregator);
    }
  }

  _visitViewContainerViews(List<AppView> views, List<dynamic> aggregator) {
    if (isPresent(views)) {
      for (var j = 0; j < views.length; j++) {
        this._visitView(views[j], aggregator);
      }
    }
  }

  _visitView(AppView view, List<dynamic> aggregator) {
    for (var i = 0; i < view.appElements.length; i++) {
      var inj = view.appElements[i];
      this._visitInjector(inj, aggregator);
      this._visitViewContainerViews(inj.nestedViews, aggregator);
    }
  }

  void _aggregateVariableBinding(AppElement inj, List<dynamic> aggregator) {
    var vb = this.protoQueryRef.query.varBindings;
    for (var i = 0; i < vb.length; ++i) {
      if (inj.hasVariableBinding(vb[i])) {
        aggregator.add(inj.getVariableBinding(vb[i]));
      }
    }
  }

  void _aggregateDirective(AppElement inj, List<dynamic> aggregator) {
    inj.addDirectivesMatchingQuery(this.protoQueryRef.query, aggregator);
  }
}

class _ComponentViewChangeDetectorRef extends ChangeDetectorRef {
  AppElement _appElement;
  _ComponentViewChangeDetectorRef(this._appElement) : super() {
    /* super call moved to initializer */;
  }
  void markForCheck() {
    this._appElement.componentView.changeDetector.ref.markForCheck();
  }

  void detach() {
    this._appElement.componentView.changeDetector.ref.detach();
  }

  void detectChanges() {
    this._appElement.componentView.changeDetector.ref.detectChanges();
  }

  void checkNoChanges() {
    this._appElement.componentView.changeDetector.ref.checkNoChanges();
  }

  void reattach() {
    this._appElement.componentView.changeDetector.ref.reattach();
  }
}
