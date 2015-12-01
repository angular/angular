library angular2.src.core.linker.element_injector;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, Type, stringify, StringWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper;
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
        resolveForwardRef;
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
import "view.dart" show AppViewContainer, AppView;
/* circular */ import "view_manager.dart" as avmModule;
import "view_container_ref.dart" show ViewContainerRef;
import "element_ref.dart" show ElementRef;
import "template_ref.dart" show TemplateRef;
import "../metadata/directives.dart" show DirectiveMetadata, ComponentMetadata;
import "directive_lifecycle_reflector.dart" show hasLifecycleHook;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show ChangeDetector, ChangeDetectorRef;
import "query_list.dart" show QueryList;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
import "package:angular2/src/core/reflection/types.dart" show SetterFn;
import "package:angular2/src/core/linker/event_config.dart" show EventConfig;
import "package:angular2/src/core/linker/interfaces.dart" show AfterViewChecked;
import "package:angular2/src/core/pipes/pipe_provider.dart" show PipeProvider;
import "interfaces.dart" show LifecycleHooks;
import "view_container_ref.dart" show ViewContainerRef_;

var _staticKeys;

class StaticKeys {
  num viewManagerId;
  num templateRefId;
  num viewContainerId;
  num changeDetectorRefId;
  num elementRefId;
  StaticKeys() {
    this.viewManagerId = Key.get(avmModule.AppViewManager).id;
    this.templateRefId = Key.get(TemplateRef).id;
    this.viewContainerId = Key.get(ViewContainerRef).id;
    this.changeDetectorRefId = Key.get(ChangeDetectorRef).id;
    this.elementRefId = Key.get(ElementRef).id;
  }
  static StaticKeys instance() {
    if (isBlank(_staticKeys)) _staticKeys = new StaticKeys();
    return _staticKeys;
  }
}

class TreeNode<T extends TreeNode<dynamic>> {
  /** @internal */
  T _parent;
  TreeNode(T parent) {
    if (isPresent(parent)) {
      parent.addChild(this);
    } else {
      this._parent = null;
    }
  }
  void addChild(T child) {
    child._parent = this;
  }

  void remove() {
    this._parent = null;
  }

  get parent {
    return this._parent;
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

  static Dependency createFrom(Dependency d) {
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
  DirectiveMetadata metadata;
  List<dynamic /* Type | Provider | List < dynamic > */ > providers;
  List<dynamic /* Type | Provider | List < dynamic > */ > viewProviders;
  bool callOnDestroy;
  DirectiveProvider(Key key, Function factory, List<Dependency> deps,
      this.metadata, this.providers, this.viewProviders)
      : super(key, [new ResolvedFactory(factory, deps)], false) {
    /* super call moved to initializer */;
    this.callOnDestroy = hasLifecycleHook(LifecycleHooks.OnDestroy, key.token);
  }
  String get displayName {
    return this.key.displayName;
  }

  List<QueryMetadataWithSetter> get queries {
    if (isBlank(this.metadata.queries)) return [];
    var res = [];
    StringMapWrapper.forEach(this.metadata.queries, (meta, fieldName) {
      var setter = reflector.setter(fieldName);
      res.add(new QueryMetadataWithSetter(setter, meta));
    });
    return res;
  }

  List<String> get eventEmitters {
    return isPresent(this.metadata) && isPresent(this.metadata.outputs)
        ? this.metadata.outputs
        : [];
  }

  static DirectiveProvider createFromProvider(
      Provider provider, DirectiveMetadata meta) {
    if (isBlank(meta)) {
      meta = new DirectiveMetadata();
    }
    var rb = resolveProvider(provider);
    var rf = rb.resolvedFactories[0];
    var deps = rf.dependencies.map(DirectiveDependency.createFrom).toList();
    var providers = isPresent(meta.providers) ? meta.providers : [];
    var viewBindigs = meta is ComponentMetadata && isPresent(meta.viewProviders)
        ? meta.viewProviders
        : [];
    return new DirectiveProvider(
        rb.key, rf.factory, deps, meta, providers, viewBindigs);
  }

  static DirectiveProvider createFromType(
      Type type, DirectiveMetadata annotation) {
    var provider = new Provider(type, useClass: type);
    return DirectiveProvider.createFromProvider(provider, annotation);
  }
}

// TODO(rado): benchmark and consider rolling in as ElementInjector fields.
class PreBuiltObjects {
  avmModule.AppViewManager viewManager;
  AppView view;
  ElementRef elementRef;
  TemplateRef templateRef;
  AppView nestedView = null;
  PreBuiltObjects(
      this.viewManager, this.view, this.elementRef, this.templateRef) {}
}

class QueryMetadataWithSetter {
  SetterFn setter;
  QueryMetadata metadata;
  QueryMetadataWithSetter(this.setter, this.metadata) {}
}

class EventEmitterAccessor {
  String eventName;
  Function getter;
  EventEmitterAccessor(this.eventName, this.getter) {}
  Object subscribe(AppView view, num boundElementIndex, Object directive) {
    var eventEmitter = this.getter(directive);
    return ObservableWrapper.subscribe(
        eventEmitter,
        (eventObj) => view.triggerEventHandlers(
            this.eventName, eventObj, boundElementIndex));
  }
}

List<EventEmitterAccessor> _createEventEmitterAccessors(
    ProviderWithVisibility bwv) {
  var provider = bwv.provider;
  if (!(provider is DirectiveProvider)) return [];
  var db = (provider as DirectiveProvider);
  return db.eventEmitters.map((eventConfig) {
    var parsedEvent = EventConfig.parse(eventConfig);
    return new EventEmitterAccessor(
        parsedEvent.eventName, reflector.getter(parsedEvent.fieldName));
  }).toList();
}

List<ProtoQueryRef> _createProtoQueryRefs(
    List<ProviderWithVisibility> providers) {
  var res = [];
  ListWrapper.forEachWithIndex(providers, (b, i) {
    if (b.provider is DirectiveProvider) {
      var directiveProvider = (b.provider as DirectiveProvider);
      // field queries
      List<QueryMetadataWithSetter> queries = directiveProvider.queries;
      queries
          .forEach((q) => res.add(new ProtoQueryRef(i, q.setter, q.metadata)));
      // queries passed into the constructor.

      // TODO: remove this after constructor queries are no longer supported
      List<DirectiveDependency> deps = (directiveProvider
          .resolvedFactory.dependencies as List<DirectiveDependency>);
      deps.forEach((d) {
        if (isPresent(d.queryDecorator)) res
            .add(new ProtoQueryRef(i, null, d.queryDecorator));
      });
    }
  });
  return res;
}

class ProtoElementInjector {
  ProtoElementInjector parent;
  num index;
  num distanceToParent;
  Map<String, num> directiveVariableBindings;
  AppView view;
  Map<String, String> attributes;
  List<List<EventEmitterAccessor>> eventEmitterAccessors;
  List<ProtoQueryRef> protoQueryRefs;
  ProtoInjector protoInjector;
  static ProtoElementInjector create(
      ProtoElementInjector parent,
      num index,
      List<DirectiveProvider> providers,
      bool firstProviderIsComponent,
      num distanceToParent,
      Map<String, num> directiveVariableBindings) {
    var bd = [];
    ProtoElementInjector._createDirectiveProviderWithVisibility(
        providers, bd, firstProviderIsComponent);
    if (firstProviderIsComponent) {
      ProtoElementInjector._createViewProvidersWithVisibility(providers, bd);
    }
    ProtoElementInjector._createProvidersWithVisibility(providers, bd);
    return new ProtoElementInjector(parent, index, bd, distanceToParent,
        firstProviderIsComponent, directiveVariableBindings);
  }

  static _createDirectiveProviderWithVisibility(
      List<DirectiveProvider> dirProviders,
      List<ProviderWithVisibility> bd,
      bool firstProviderIsComponent) {
    dirProviders.forEach((dirProvider) {
      bd.add(ProtoElementInjector._createProviderWithVisibility(
          firstProviderIsComponent, dirProvider, dirProviders, dirProvider));
    });
  }

  static _createProvidersWithVisibility(
      List<DirectiveProvider> dirProviders, List<ProviderWithVisibility> bd) {
    var providersFromAllDirectives = [];
    dirProviders.forEach((dirProvider) {
      providersFromAllDirectives =
          ListWrapper.concat(providersFromAllDirectives, dirProvider.providers);
    });
    var resolved = Injector.resolve(providersFromAllDirectives);
    resolved.forEach(
        (b) => bd.add(new ProviderWithVisibility(b, Visibility.Public)));
  }

  static _createProviderWithVisibility(
      bool firstProviderIsComponent,
      DirectiveProvider dirProvider,
      List<DirectiveProvider> dirProviders,
      ResolvedProvider provider) {
    var isComponent =
        firstProviderIsComponent && identical(dirProviders[0], dirProvider);
    return new ProviderWithVisibility(provider,
        isComponent ? Visibility.PublicAndPrivate : Visibility.Public);
  }

  static _createViewProvidersWithVisibility(
      List<DirectiveProvider> dirProviders, List<ProviderWithVisibility> bd) {
    var resolvedViewProviders = Injector.resolve(dirProviders[0].viewProviders);
    resolvedViewProviders.forEach(
        (b) => bd.add(new ProviderWithVisibility(b, Visibility.Private)));
  }

  /** @internal */
  bool _firstProviderIsComponent;
  ProtoElementInjector(
      this.parent,
      this.index,
      List<ProviderWithVisibility> bwv,
      this.distanceToParent,
      bool _firstProviderIsComponent,
      this.directiveVariableBindings) {
    this._firstProviderIsComponent = _firstProviderIsComponent;
    var length = bwv.length;
    this.protoInjector = new ProtoInjector(bwv);
    this.eventEmitterAccessors = ListWrapper.createFixedSize(length);
    for (var i = 0; i < length; ++i) {
      this.eventEmitterAccessors[i] = _createEventEmitterAccessors(bwv[i]);
    }
    this.protoQueryRefs = _createProtoQueryRefs(bwv);
  }
  ElementInjector instantiate(ElementInjector parent) {
    return new ElementInjector(this, parent);
  }

  ProtoElementInjector directParent() {
    return this.distanceToParent < 2 ? this.parent : null;
  }

  bool get hasBindings {
    return this.eventEmitterAccessors.length > 0;
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

class ElementInjector extends TreeNode<ElementInjector>
    implements DependencyProvider, AfterViewChecked {
  ElementInjector _host;
  PreBuiltObjects _preBuiltObjects = null;
  _QueryStrategy _queryStrategy;
  bool hydrated;
  Injector _injector;
  _ElementInjectorStrategy _strategy;
  /** @internal */
  ProtoElementInjector _proto;
  ElementInjector(ProtoElementInjector _proto, ElementInjector parent)
      : super(parent) {
    /* super call moved to initializer */;
    this._proto = _proto;
    this._injector = new Injector(
        this._proto.protoInjector, null, this, () => this._debugContext());
    // we couple ourselves to the injector strategy to avoid polymoprhic calls
    var injectorStrategy = (this._injector.internalStrategy as dynamic);
    this._strategy = injectorStrategy is InjectorInlineStrategy
        ? new ElementInjectorInlineStrategy(injectorStrategy, this)
        : new ElementInjectorDynamicStrategy(injectorStrategy, this);
    this.hydrated = false;
    this._queryStrategy = this._buildQueryStrategy();
  }
  void dehydrate() {
    this.hydrated = false;
    this._host = null;
    this._preBuiltObjects = null;
    this._strategy.callOnDestroy();
    this._strategy.dehydrate();
    this._queryStrategy.dehydrate();
  }

  void hydrate(Injector imperativelyCreatedInjector, ElementInjector host,
      PreBuiltObjects preBuiltObjects) {
    this._host = host;
    this._preBuiltObjects = preBuiltObjects;
    this._reattachInjectors(imperativelyCreatedInjector);
    this._queryStrategy.hydrate();
    this._strategy.hydrate();
    this.hydrated = true;
  }

  dynamic _debugContext() {
    var p = this._preBuiltObjects;
    var index = p.elementRef.boundElementIndex - p.view.elementOffset;
    var c = this._preBuiltObjects.view.getDebugContext(index, null);
    return isPresent(c)
        ? new _Context(c.element, c.componentElement, c.injector)
        : null;
  }

  void _reattachInjectors(Injector imperativelyCreatedInjector) {
    // Dynamically-loaded component in the template. Not a root ElementInjector.
    if (isPresent(this._parent)) {
      if (isPresent(imperativelyCreatedInjector)) {
        // The imperative injector is similar to having an element between

        // the dynamic-loaded component and its parent => no boundaries.
        this._reattachInjector(
            this._injector, imperativelyCreatedInjector, false);
        this._reattachInjector(
            imperativelyCreatedInjector, this._parent._injector, false);
      } else {
        this._reattachInjector(this._injector, this._parent._injector, false);
      }
    } else if (isPresent(this._host)) {
      // The imperative injector is similar to having an element between

      // the dynamic-loaded component and its parent => no boundary between

      // the component and imperativelyCreatedInjector.

      // But since it is a root ElementInjector, we need to create a boundary

      // between imperativelyCreatedInjector and _host.
      if (isPresent(imperativelyCreatedInjector)) {
        this._reattachInjector(
            this._injector, imperativelyCreatedInjector, false);
        this._reattachInjector(
            imperativelyCreatedInjector, this._host._injector, true);
      } else {
        this._reattachInjector(this._injector, this._host._injector, true);
      }
    } else {
      if (isPresent(imperativelyCreatedInjector)) {
        this._reattachInjector(
            this._injector, imperativelyCreatedInjector, true);
      }
    }
  }

  _reattachInjector(
      Injector injector, Injector parentInjector, bool isBoundary) {
    injector.internalStrategy.attach(parentInjector, isBoundary);
  }

  bool hasVariableBinding(String name) {
    var vb = this._proto.directiveVariableBindings;
    return isPresent(vb) && vb.containsKey(name);
  }

  dynamic getVariableBinding(String name) {
    var index = this._proto.directiveVariableBindings[name];
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

  List<List<EventEmitterAccessor>> getEventEmitterAccessors() {
    return this._proto.eventEmitterAccessors;
  }

  Map<String, num> getDirectiveVariableBindings() {
    return this._proto.directiveVariableBindings;
  }

  dynamic getComponent() {
    return this._strategy.getComponent();
  }

  Injector getInjector() {
    return this._injector;
  }

  ElementRef getElementRef() {
    return this._preBuiltObjects.elementRef;
  }

  ViewContainerRef getViewContainerRef() {
    return new ViewContainerRef_(
        this._preBuiltObjects.viewManager, this.getElementRef());
  }

  AppView getNestedView() {
    return this._preBuiltObjects.nestedView;
  }

  AppView getView() {
    return this._preBuiltObjects.view;
  }

  ElementInjector directParent() {
    return this._proto.distanceToParent < 2 ? this.parent : null;
  }

  bool isComponentKey(Key key) {
    return this._strategy.isComponentKey(key);
  }

  dynamic getDependency(
      Injector injector, ResolvedProvider provider, Dependency dep) {
    Key key = dep.key;
    if (provider is DirectiveProvider) {
      var dirDep = (dep as DirectiveDependency);
      var dirProvider = provider;
      var staticKeys = StaticKeys.instance();
      if (identical(key.id, staticKeys.viewManagerId)) return this
          ._preBuiltObjects
          .viewManager;
      if (isPresent(dirDep.attributeName)) return this._buildAttribute(dirDep);
      if (isPresent(dirDep.queryDecorator)) return this
          ._queryStrategy
          .findQuery(dirDep.queryDecorator)
          .list;
      if (identical(dirDep.key.id, StaticKeys.instance().changeDetectorRefId)) {
        // We provide the component's view change detector to components and

        // the surrounding component's change detector to directives.
        if (dirProvider.metadata is ComponentMetadata) {
          var componentView = this._preBuiltObjects.view.getNestedView(
              this._preBuiltObjects.elementRef.boundElementIndex);
          return componentView.changeDetector.ref;
        } else {
          return this._preBuiltObjects.view.changeDetector.ref;
        }
      }
      if (identical(dirDep.key.id, StaticKeys.instance().elementRefId)) {
        return this.getElementRef();
      }
      if (identical(dirDep.key.id, StaticKeys.instance().viewContainerId)) {
        return this.getViewContainerRef();
      }
      if (identical(dirDep.key.id, StaticKeys.instance().templateRefId)) {
        if (isBlank(this._preBuiltObjects.templateRef)) {
          if (dirDep.optional) {
            return null;
          }
          throw new NoProviderError(null, dirDep.key);
        }
        return this._preBuiltObjects.templateRef;
      }
    } else if (provider is PipeProvider) {
      if (identical(dep.key.id, StaticKeys.instance().changeDetectorRefId)) {
        var componentView = this
            ._preBuiltObjects
            .view
            .getNestedView(this._preBuiltObjects.elementRef.boundElementIndex);
        return componentView.changeDetector.ref;
      }
    }
    return UNDEFINED;
  }

  String _buildAttribute(DirectiveDependency dep) {
    var attributes = this._proto.attributes;
    if (isPresent(attributes) && attributes.containsKey(dep.attributeName)) {
      return attributes[dep.attributeName];
    } else {
      return null;
    }
  }

  void addDirectivesMatchingQuery(QueryMetadata query, List<dynamic> list) {
    var templateRef = isBlank(this._preBuiltObjects)
        ? null
        : this._preBuiltObjects.templateRef;
    if (identical(query.selector, TemplateRef) && isPresent(templateRef)) {
      list.add(templateRef);
    }
    this._strategy.addDirectivesMatchingQuery(query, list);
  }

  _QueryStrategy _buildQueryStrategy() {
    if (identical(this._proto.protoQueryRefs.length, 0)) {
      return _emptyQueryStrategy;
    } else if (this._proto.protoQueryRefs.length <=
        InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES) {
      return new InlineQueryStrategy(this);
    } else {
      return new DynamicQueryStrategy(this);
    }
  }

  void link(ElementInjector parent) {
    parent.addChild(this);
  }

  void unlink() {
    this.remove();
  }

  dynamic getDirectiveAtIndex(num index) {
    return this._injector.getAt(index);
  }

  bool hasInstances() {
    return this._proto.hasBindings && this.hydrated;
  }

  ElementInjector getHost() {
    return this._host;
  }

  num getBoundElementIndex() {
    return this._proto.index;
  }

  List<ElementInjector> getRootViewInjectors() {
    if (!this.hydrated) return [];
    var view = this._preBuiltObjects.view;
    var nestedView =
        view.getNestedView(view.elementOffset + this.getBoundElementIndex());
    return isPresent(nestedView) ? nestedView.rootElementInjectors : [];
  }

  void ngAfterViewChecked() {
    this._queryStrategy.updateViewQueries();
  }

  void ngAfterContentChecked() {
    this._queryStrategy.updateContentQueries();
  }

  void traverseAndSetQueriesAsDirty() {
    var inj = this;
    while (isPresent(inj)) {
      inj._setQueriesAsDirty();
      inj = inj.parent;
    }
  }

  void _setQueriesAsDirty() {
    this._queryStrategy.setContentQueriesAsDirty();
    if (isPresent(this._host)) this
        ._host
        ._queryStrategy
        .setViewQueriesAsDirty();
  }
}

abstract class _QueryStrategy {
  void setContentQueriesAsDirty();
  void setViewQueriesAsDirty();
  void hydrate();
  void dehydrate();
  void updateContentQueries();
  void updateViewQueries();
  QueryRef findQuery(QueryMetadata query);
}

class _EmptyQueryStrategy implements _QueryStrategy {
  void setContentQueriesAsDirty() {}
  void setViewQueriesAsDirty() {}
  void hydrate() {}
  void dehydrate() {}
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
  InlineQueryStrategy(ElementInjector ei) {
    var protoRefs = ei._proto.protoQueryRefs;
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

  void hydrate() {
    if (isPresent(this.query0)) this.query0.hydrate();
    if (isPresent(this.query1)) this.query1.hydrate();
    if (isPresent(this.query2)) this.query2.hydrate();
  }

  void dehydrate() {
    if (isPresent(this.query0)) this.query0.dehydrate();
    if (isPresent(this.query1)) this.query1.dehydrate();
    if (isPresent(this.query2)) this.query2.dehydrate();
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
  DynamicQueryStrategy(ElementInjector ei) {
    this.queries =
        ei._proto.protoQueryRefs.map((p) => new QueryRef(p, ei)).toList();
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

  void hydrate() {
    for (var i = 0; i < this.queries.length; ++i) {
      var q = this.queries[i];
      q.hydrate();
    }
  }

  void dehydrate() {
    for (var i = 0; i < this.queries.length; ++i) {
      var q = this.queries[i];
      q.dehydrate();
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

abstract class _ElementInjectorStrategy {
  void callOnDestroy();
  dynamic getComponent();
  bool isComponentKey(Key key);
  void addDirectivesMatchingQuery(QueryMetadata q, List<dynamic> res);
  void hydrate();
  void dehydrate();
}

/**
 * Strategy used by the `ElementInjector` when the number of providers is 10 or less.
 * In such a case, inlining fields is beneficial for performances.
 */
class ElementInjectorInlineStrategy implements _ElementInjectorStrategy {
  InjectorInlineStrategy injectorStrategy;
  ElementInjector _ei;
  ElementInjectorInlineStrategy(this.injectorStrategy, this._ei) {}
  void hydrate() {
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

  dehydrate() {
    var i = this.injectorStrategy;
    i.obj0 = UNDEFINED;
    i.obj1 = UNDEFINED;
    i.obj2 = UNDEFINED;
    i.obj3 = UNDEFINED;
    i.obj4 = UNDEFINED;
    i.obj5 = UNDEFINED;
    i.obj6 = UNDEFINED;
    i.obj7 = UNDEFINED;
    i.obj8 = UNDEFINED;
    i.obj9 = UNDEFINED;
  }

  void callOnDestroy() {
    var i = this.injectorStrategy;
    var p = i.protoStrategy;
    if (p.provider0 is DirectiveProvider &&
        ((p.provider0 as DirectiveProvider)).callOnDestroy) {
      i.obj0.ngOnDestroy();
    }
    if (p.provider1 is DirectiveProvider &&
        ((p.provider1 as DirectiveProvider)).callOnDestroy) {
      i.obj1.ngOnDestroy();
    }
    if (p.provider2 is DirectiveProvider &&
        ((p.provider2 as DirectiveProvider)).callOnDestroy) {
      i.obj2.ngOnDestroy();
    }
    if (p.provider3 is DirectiveProvider &&
        ((p.provider3 as DirectiveProvider)).callOnDestroy) {
      i.obj3.ngOnDestroy();
    }
    if (p.provider4 is DirectiveProvider &&
        ((p.provider4 as DirectiveProvider)).callOnDestroy) {
      i.obj4.ngOnDestroy();
    }
    if (p.provider5 is DirectiveProvider &&
        ((p.provider5 as DirectiveProvider)).callOnDestroy) {
      i.obj5.ngOnDestroy();
    }
    if (p.provider6 is DirectiveProvider &&
        ((p.provider6 as DirectiveProvider)).callOnDestroy) {
      i.obj6.ngOnDestroy();
    }
    if (p.provider7 is DirectiveProvider &&
        ((p.provider7 as DirectiveProvider)).callOnDestroy) {
      i.obj7.ngOnDestroy();
    }
    if (p.provider8 is DirectiveProvider &&
        ((p.provider8 as DirectiveProvider)).callOnDestroy) {
      i.obj8.ngOnDestroy();
    }
    if (p.provider9 is DirectiveProvider &&
        ((p.provider9 as DirectiveProvider)).callOnDestroy) {
      i.obj9.ngOnDestroy();
    }
  }

  dynamic getComponent() {
    return this.injectorStrategy.obj0;
  }

  bool isComponentKey(Key key) {
    return this._ei._proto._firstProviderIsComponent &&
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
class ElementInjectorDynamicStrategy implements _ElementInjectorStrategy {
  InjectorDynamicStrategy injectorStrategy;
  ElementInjector _ei;
  ElementInjectorDynamicStrategy(this.injectorStrategy, this._ei) {}
  void hydrate() {
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

  void dehydrate() {
    var inj = this.injectorStrategy;
    ListWrapper.fill(inj.objs, UNDEFINED);
  }

  void callOnDestroy() {
    var ist = this.injectorStrategy;
    var p = ist.protoStrategy;
    for (var i = 0; i < p.providers.length; i++) {
      if (p.providers[i] is DirectiveProvider &&
          ((p.providers[i] as DirectiveProvider)).callOnDestroy) {
        ist.objs[i].ngOnDestroy();
      }
    }
  }

  dynamic getComponent() {
    return this.injectorStrategy.objs[0];
  }

  bool isComponentKey(Key key) {
    var p = this.injectorStrategy.protoStrategy;
    return this._ei._proto._firstProviderIsComponent &&
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
  ElementInjector originator;
  QueryList<dynamic> list;
  bool dirty;
  QueryRef(this.protoQueryRef, this.originator) {}
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
      var view = this.originator.getView();
      // intentionally skipping originator for view queries.
      var nestedView = view.getNestedView(
          view.elementOffset + this.originator.getBoundElementIndex());
      if (isPresent(nestedView)) this._visitView(nestedView, aggregator);
    } else {
      this._visit(this.originator, aggregator);
    }
    this.list.reset(aggregator);
  }

  void _visit(ElementInjector inj, List<dynamic> aggregator) {
    var view = inj.getView();
    var startIdx = view.elementOffset + inj._proto.index;
    for (var i = startIdx; i < view.elementOffset + view.ownBindersCount; i++) {
      var curInj = view.elementInjectors[i];
      if (isBlank(curInj)) continue;
      // The first injector after inj, that is outside the subtree rooted at

      // inj has to have a null parent or a parent that is an ancestor of inj.
      if (i > startIdx &&
          (isBlank(curInj) ||
              isBlank(curInj.parent) ||
              view.elementOffset + curInj.parent._proto.index < startIdx)) {
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
      var vc = view.viewContainers[i];
      if (isPresent(vc)) this._visitViewContainer(vc, aggregator);
    }
  }

  _visitInjector(ElementInjector inj, List<dynamic> aggregator) {
    if (this.protoQueryRef.query.isVarBindingQuery) {
      this._aggregateVariableBinding(inj, aggregator);
    } else {
      this._aggregateDirective(inj, aggregator);
    }
  }

  _visitViewContainer(AppViewContainer vc, List<dynamic> aggregator) {
    for (var j = 0; j < vc.views.length; j++) {
      this._visitView(vc.views[j], aggregator);
    }
  }

  _visitView(AppView view, List<dynamic> aggregator) {
    for (var i = view.elementOffset;
        i < view.elementOffset + view.ownBindersCount;
        i++) {
      var inj = view.elementInjectors[i];
      if (isBlank(inj)) continue;
      this._visitInjector(inj, aggregator);
      var vc = view.viewContainers[i];
      if (isPresent(vc)) this._visitViewContainer(vc, aggregator);
    }
  }

  void _aggregateVariableBinding(
      ElementInjector inj, List<dynamic> aggregator) {
    var vb = this.protoQueryRef.query.varBindings;
    for (var i = 0; i < vb.length; ++i) {
      if (inj.hasVariableBinding(vb[i])) {
        aggregator.add(inj.getVariableBinding(vb[i]));
      }
    }
  }

  void _aggregateDirective(ElementInjector inj, List<dynamic> aggregator) {
    inj.addDirectivesMatchingQuery(this.protoQueryRef.query, aggregator);
  }

  void dehydrate() {
    this.list = null;
  }

  void hydrate() {
    this.list = new QueryList<dynamic>();
    this.dirty = true;
  }
}
