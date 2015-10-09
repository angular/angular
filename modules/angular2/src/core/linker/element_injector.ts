import {
  isPresent,
  isBlank,
  Type,
  stringify,
  CONST_EXPR,
  StringWrapper
} from 'angular2/src/core/facade/lang';
import {BaseException} from 'angular2/src/core/facade/exceptions';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {
  Injector,
  Key,
  Dependency,
  bind,
  Binding,
  ResolvedBinding,
  NoBindingError,
  AbstractBindingError,
  CyclicDependencyError,
  resolveForwardRef
} from 'angular2/src/core/di';
import {
  UNDEFINED,
  ProtoInjector,
  Visibility,
  InjectorInlineStrategy,
  InjectorDynamicStrategy,
  BindingWithVisibility,
  DependencyProvider
} from 'angular2/src/core/di/injector';
import {resolveBinding, ResolvedFactory, ResolvedBinding_} from 'angular2/src/core/di/binding';

import {AttributeMetadata, QueryMetadata} from '../metadata/di';

import * as viewModule from './view';
import * as avmModule from './view_manager';
import {ViewContainerRef} from './view_container_ref';
import {ElementRef} from './element_ref';
import {TemplateRef} from './template_ref';
import {DirectiveMetadata, ComponentMetadata} from '../metadata/directives';
import {hasLifecycleHook} from './directive_lifecycle_reflector';
import {
  ChangeDetector,
  ChangeDetectorRef
} from 'angular2/src/core/change_detection/change_detection';
import {QueryList} from './query_list';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {SetterFn} from 'angular2/src/core/reflection/types';
import {EventConfig} from 'angular2/src/core/linker/event_config';
import {PipeBinding} from '../pipes/pipe_binding';

import {LifecycleHooks} from './interfaces';
import {ViewContainerRef_} from "./view_container_ref";

var _staticKeys;

export class StaticKeys {
  viewManagerId: number;
  templateRefId: number;
  viewContainerId: number;
  changeDetectorRefId: number;
  elementRefId: number;

  constructor() {
    this.viewManagerId = Key.get(avmModule.AppViewManager).id;
    this.templateRefId = Key.get(TemplateRef).id;
    this.viewContainerId = Key.get(ViewContainerRef).id;
    this.changeDetectorRefId = Key.get(ChangeDetectorRef).id;
    this.elementRefId = Key.get(ElementRef).id;
  }

  static instance(): StaticKeys {
    if (isBlank(_staticKeys)) _staticKeys = new StaticKeys();
    return _staticKeys;
  }
}

export class TreeNode<T extends TreeNode<any>> {
  _parent: T;
  constructor(parent: T) {
    if (isPresent(parent)) {
      parent.addChild(this);
    } else {
      this._parent = null;
    }
  }

  addChild(child: T): void { child._parent = this; }

  remove(): void { this._parent = null; }

  get parent() { return this._parent; }
}

export class DirectiveDependency extends Dependency {
  constructor(key: Key, optional: boolean, lowerBoundVisibility: Object,
              upperBoundVisibility: Object, properties: any[], public attributeName: string,
              public queryDecorator: QueryMetadata) {
    super(key, optional, lowerBoundVisibility, upperBoundVisibility, properties);
    this._verify();
  }

  _verify(): void {
    var count = 0;
    if (isPresent(this.queryDecorator)) count++;
    if (isPresent(this.attributeName)) count++;
    if (count > 1)
      throw new BaseException(
          'A directive injectable can contain only one of the following @Attribute or @Query.');
  }

  static createFrom(d: Dependency): Dependency {
    return new DirectiveDependency(
        d.key, d.optional, d.lowerBoundVisibility, d.upperBoundVisibility, d.properties,
        DirectiveDependency._attributeName(d.properties), DirectiveDependency._query(d.properties));
  }

  static _attributeName(properties): string {
    var p = <AttributeMetadata>ListWrapper.find(properties, (p) => p instanceof AttributeMetadata);
    return isPresent(p) ? p.attributeName : null;
  }

  static _query(properties): QueryMetadata {
    return <QueryMetadata>ListWrapper.find(properties, (p) => p instanceof QueryMetadata);
  }
}

export class DirectiveBinding extends ResolvedBinding_ {
  public callOnDestroy: boolean;

  constructor(key: Key, factory: Function, deps: Dependency[], public metadata: DirectiveMetadata,
              public bindings: Array<Type | Binding | any[]>,
              public viewBindings: Array<Type | Binding | any[]>) {
    super(key, [new ResolvedFactory(factory, deps)], false);
    this.callOnDestroy = hasLifecycleHook(LifecycleHooks.OnDestroy, key.token);
  }

  get displayName(): string { return this.key.displayName; }

  get queries(): QueryMetadataWithSetter[] {
    if (isBlank(this.metadata.queries)) return [];

    var res = [];
    StringMapWrapper.forEach(this.metadata.queries, (meta, fieldName) => {
      var setter = reflector.setter(fieldName);
      res.push(new QueryMetadataWithSetter(setter, meta));
    });
    return res;
  }

  get eventEmitters(): string[] {
    return isPresent(this.metadata) && isPresent(this.metadata.outputs) ? this.metadata.outputs :
                                                                          [];
  }

  static createFromBinding(binding: Binding, meta: DirectiveMetadata): DirectiveBinding {
    if (isBlank(meta)) {
      meta = new DirectiveMetadata();
    }

    var rb = resolveBinding(binding);
    var rf = rb.resolvedFactories[0];
    var deps = rf.dependencies.map(DirectiveDependency.createFrom);

    var bindings = isPresent(meta.bindings) ? meta.bindings : [];
    var viewBindigs =
        meta instanceof ComponentMetadata && isPresent(meta.viewBindings) ? meta.viewBindings : [];
    return new DirectiveBinding(rb.key, rf.factory, deps, meta, bindings, viewBindigs);
  }

  static createFromType(type: Type, annotation: DirectiveMetadata): DirectiveBinding {
    var binding = new Binding(type, {toClass: type});
    return DirectiveBinding.createFromBinding(binding, annotation);
  }
}

// TODO(rado): benchmark and consider rolling in as ElementInjector fields.
export class PreBuiltObjects {
  nestedView: viewModule.AppView = null;
  constructor(public viewManager: avmModule.AppViewManager, public view: viewModule.AppView,
              public elementRef: ElementRef, public templateRef: TemplateRef) {}
}

export class QueryMetadataWithSetter {
  constructor(public setter: SetterFn, public metadata: QueryMetadata) {}
}

export class EventEmitterAccessor {
  constructor(public eventName: string, public getter: Function) {}

  subscribe(view: viewModule.AppView, boundElementIndex: number, directive: Object): Object {
    var eventEmitter = this.getter(directive);
    return ObservableWrapper.subscribe<Event>(
        eventEmitter,
        eventObj => view.triggerEventHandlers(this.eventName, eventObj, boundElementIndex));
  }
}

function _createEventEmitterAccessors(bwv: BindingWithVisibility): EventEmitterAccessor[] {
  var binding = bwv.binding;
  if (!(binding instanceof DirectiveBinding)) return [];
  var db = <DirectiveBinding>binding;
  return db.eventEmitters.map(eventConfig => {
    var parsedEvent = EventConfig.parse(eventConfig);
    return new EventEmitterAccessor(parsedEvent.eventName, reflector.getter(parsedEvent.fieldName));
  });
}

function _createProtoQueryRefs(bindings: BindingWithVisibility[]): ProtoQueryRef[] {
  var res = [];
  ListWrapper.forEachWithIndex(bindings, (b, i) => {
    if (b.binding instanceof DirectiveBinding) {
      var directiveBinding = <DirectiveBinding>b.binding;
      // field queries
      var queries: QueryMetadataWithSetter[] = directiveBinding.queries;
      queries.forEach(q => res.push(new ProtoQueryRef(i, q.setter, q.metadata)));

      // queries passed into the constructor.
      // TODO: remove this after constructor queries are no longer supported
      var deps: DirectiveDependency[] =
          <DirectiveDependency[]>directiveBinding.resolvedFactory.dependencies;
      deps.forEach(d => {
        if (isPresent(d.queryDecorator)) res.push(new ProtoQueryRef(i, null, d.queryDecorator));
      });
    }
  });
  return res;
}

export class ProtoElementInjector {
  view: viewModule.AppView;
  attributes: Map<string, string>;
  eventEmitterAccessors: EventEmitterAccessor[][];
  protoQueryRefs: ProtoQueryRef[];
  protoInjector: ProtoInjector;

  static create(parent: ProtoElementInjector, index: number, bindings: DirectiveBinding[],
                firstBindingIsComponent: boolean, distanceToParent: number,
                directiveVariableBindings: Map<string, number>): ProtoElementInjector {
    var bd = [];

    ProtoElementInjector._createDirectiveBindingWithVisibility(bindings, bd,
                                                               firstBindingIsComponent);
    if (firstBindingIsComponent) {
      ProtoElementInjector._createViewBindingsWithVisibility(bindings, bd);
    }

    ProtoElementInjector._createBindingsWithVisibility(bindings, bd);
    return new ProtoElementInjector(parent, index, bd, distanceToParent, firstBindingIsComponent,
                                    directiveVariableBindings);
  }

  private static _createDirectiveBindingWithVisibility(dirBindings: DirectiveBinding[],
                                                       bd: BindingWithVisibility[],
                                                       firstBindingIsComponent: boolean) {
    dirBindings.forEach(dirBinding => {
      bd.push(ProtoElementInjector._createBindingWithVisibility(firstBindingIsComponent, dirBinding,
                                                                dirBindings, dirBinding));
    });
  }

  private static _createBindingsWithVisibility(dirBindings: DirectiveBinding[],
                                               bd: BindingWithVisibility[]) {
    var bindingsFromAllDirectives = [];
    dirBindings.forEach(dirBinding => {
      bindingsFromAllDirectives =
          ListWrapper.concat(bindingsFromAllDirectives, dirBinding.bindings);
    });

    var resolved = Injector.resolve(bindingsFromAllDirectives);
    resolved.forEach(b => bd.push(new BindingWithVisibility(b, Visibility.Public)));
  }

  private static _createBindingWithVisibility(firstBindingIsComponent: boolean,
                                              dirBinding: DirectiveBinding,
                                              dirBindings: DirectiveBinding[],
                                              binding: ResolvedBinding) {
    var isComponent = firstBindingIsComponent && dirBindings[0] === dirBinding;
    return new BindingWithVisibility(binding,
                                     isComponent ? Visibility.PublicAndPrivate : Visibility.Public);
  }

  private static _createViewBindingsWithVisibility(dirBindings: DirectiveBinding[],
                                                   bd: BindingWithVisibility[]) {
    var resolvedViewBindings = Injector.resolve(dirBindings[0].viewBindings);
    resolvedViewBindings.forEach(b => bd.push(new BindingWithVisibility(b, Visibility.Private)));
  }



  constructor(public parent: ProtoElementInjector, public index: number,
              bwv: BindingWithVisibility[], public distanceToParent: number,
              public _firstBindingIsComponent: boolean,
              public directiveVariableBindings: Map<string, number>) {
    var length = bwv.length;
    this.protoInjector = new ProtoInjector(bwv);
    this.eventEmitterAccessors = ListWrapper.createFixedSize(length);
    for (var i = 0; i < length; ++i) {
      this.eventEmitterAccessors[i] = _createEventEmitterAccessors(bwv[i]);
    }
    this.protoQueryRefs = _createProtoQueryRefs(bwv);
  }

  instantiate(parent: ElementInjector): ElementInjector {
    return new ElementInjector(this, parent);
  }

  directParent(): ProtoElementInjector { return this.distanceToParent < 2 ? this.parent : null; }

  get hasBindings(): boolean { return this.eventEmitterAccessors.length > 0; }

  getBindingAtIndex(index: number): any { return this.protoInjector.getBindingAtIndex(index); }
}

class _Context {
  constructor(public element: any, public componentElement: any, public injector: any) {}
}

export class ElementInjector extends TreeNode<ElementInjector> implements DependencyProvider {
  private _host: ElementInjector;
  private _preBuiltObjects: PreBuiltObjects = null;
  private _queryStrategy: _QueryStrategy;

  hydrated: boolean;

  private _injector: Injector;
  private _strategy: _ElementInjectorStrategy;

  constructor(public _proto: ProtoElementInjector, parent: ElementInjector) {
    super(parent);

    this._injector =
        new Injector(this._proto.protoInjector, null, this, () => this._debugContext());

    // we couple ourselves to the injector strategy to avoid polymoprhic calls
    var injectorStrategy = <any>this._injector.internalStrategy;
    this._strategy = injectorStrategy instanceof InjectorInlineStrategy ?
                         new ElementInjectorInlineStrategy(injectorStrategy, this) :
                         new ElementInjectorDynamicStrategy(injectorStrategy, this);

    this.hydrated = false;

    this._queryStrategy = this._buildQueryStrategy();
  }

  dehydrate(): void {
    this.hydrated = false;
    this._host = null;
    this._preBuiltObjects = null;
    this._strategy.callOnDestroy();
    this._strategy.dehydrate();
    this._queryStrategy.dehydrate();
  }

  hydrate(imperativelyCreatedInjector: Injector, host: ElementInjector,
          preBuiltObjects: PreBuiltObjects): void {
    this._host = host;
    this._preBuiltObjects = preBuiltObjects;

    this._reattachInjectors(imperativelyCreatedInjector);
    this._queryStrategy.hydrate();
    this._strategy.hydrate();

    this.hydrated = true;
  }

  private _debugContext(): any {
    var p = this._preBuiltObjects;
    var index = p.elementRef.boundElementIndex - p.view.elementOffset;
    var c = this._preBuiltObjects.view.getDebugContext(index, null);
    return isPresent(c) ? new _Context(c.element, c.componentElement, c.injector) : null;
  }

  private _reattachInjectors(imperativelyCreatedInjector: Injector): void {
    // Dynamically-loaded component in the template. Not a root ElementInjector.
    if (isPresent(this._parent)) {
      if (isPresent(imperativelyCreatedInjector)) {
        // The imperative injector is similar to having an element between
        // the dynamic-loaded component and its parent => no boundaries.
        this._reattachInjector(this._injector, imperativelyCreatedInjector, false);
        this._reattachInjector(imperativelyCreatedInjector, this._parent._injector, false);
      } else {
        this._reattachInjector(this._injector, this._parent._injector, false);
      }

      // Dynamically-loaded component in the template. A root ElementInjector.
    } else if (isPresent(this._host)) {
      // The imperative injector is similar to having an element between
      // the dynamic-loaded component and its parent => no boundary between
      // the component and imperativelyCreatedInjector.
      // But since it is a root ElementInjector, we need to create a boundary
      // between imperativelyCreatedInjector and _host.
      if (isPresent(imperativelyCreatedInjector)) {
        this._reattachInjector(this._injector, imperativelyCreatedInjector, false);
        this._reattachInjector(imperativelyCreatedInjector, this._host._injector, true);
      } else {
        this._reattachInjector(this._injector, this._host._injector, true);
      }

      // Bootstrap
    } else {
      if (isPresent(imperativelyCreatedInjector)) {
        this._reattachInjector(this._injector, imperativelyCreatedInjector, true);
      }
    }
  }

  private _reattachInjector(injector: Injector, parentInjector: Injector, isBoundary: boolean) {
    injector.internalStrategy.attach(parentInjector, isBoundary);
  }

  hasVariableBinding(name: string): boolean {
    var vb = this._proto.directiveVariableBindings;
    return isPresent(vb) && vb.has(name);
  }

  getVariableBinding(name: string): any {
    var index = this._proto.directiveVariableBindings.get(name);
    return isPresent(index) ? this.getDirectiveAtIndex(<number>index) : this.getElementRef();
  }

  get(token: any): any { return this._injector.get(token); }

  hasDirective(type: Type): boolean { return isPresent(this._injector.getOptional(type)); }

  getEventEmitterAccessors(): EventEmitterAccessor[][] { return this._proto.eventEmitterAccessors; }

  getDirectiveVariableBindings(): Map<string, number> {
    return this._proto.directiveVariableBindings;
  }

  getComponent(): any { return this._strategy.getComponent(); }

  getInjector(): Injector { return this._injector; }

  getElementRef(): ElementRef { return this._preBuiltObjects.elementRef; }

  getViewContainerRef(): ViewContainerRef {
    return new ViewContainerRef_(this._preBuiltObjects.viewManager, this.getElementRef());
  }

  getNestedView(): viewModule.AppView { return this._preBuiltObjects.nestedView; }

  getView(): viewModule.AppView { return this._preBuiltObjects.view; }

  directParent(): ElementInjector { return this._proto.distanceToParent < 2 ? this.parent : null; }

  isComponentKey(key: Key): boolean { return this._strategy.isComponentKey(key); }

  getDependency(injector: Injector, binding: ResolvedBinding, dep: Dependency): any {
    var key: Key = dep.key;

    if (binding instanceof DirectiveBinding) {
      var dirDep = <DirectiveDependency>dep;
      var dirBin = binding;
      var staticKeys = StaticKeys.instance();


      if (key.id === staticKeys.viewManagerId) return this._preBuiltObjects.viewManager;

      if (isPresent(dirDep.attributeName)) return this._buildAttribute(dirDep);

      if (isPresent(dirDep.queryDecorator))
        return this._queryStrategy.findQuery(dirDep.queryDecorator).list;

      if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
        // We provide the component's view change detector to components and
        // the surrounding component's change detector to directives.
        if (dirBin.metadata instanceof ComponentMetadata) {
          var componentView = this._preBuiltObjects.view.getNestedView(
              this._preBuiltObjects.elementRef.boundElementIndex);
          return componentView.changeDetector.ref;
        } else {
          return this._preBuiltObjects.view.changeDetector.ref;
        }
      }

      if (dirDep.key.id === StaticKeys.instance().elementRefId) {
        return this.getElementRef();
      }

      if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
        return this.getViewContainerRef();
      }

      if (dirDep.key.id === StaticKeys.instance().templateRefId) {
        if (isBlank(this._preBuiltObjects.templateRef)) {
          if (dirDep.optional) {
            return null;
          }

          throw new NoBindingError(null, dirDep.key);
        }
        return this._preBuiltObjects.templateRef;
      }

    } else if (binding instanceof PipeBinding) {
      if (dep.key.id === StaticKeys.instance().changeDetectorRefId) {
        var componentView = this._preBuiltObjects.view.getNestedView(
            this._preBuiltObjects.elementRef.boundElementIndex);
        return componentView.changeDetector.ref;
      }
    }

    return UNDEFINED;
  }

  private _buildAttribute(dep: DirectiveDependency): string {
    var attributes = this._proto.attributes;
    if (isPresent(attributes) && attributes.has(dep.attributeName)) {
      return attributes.get(dep.attributeName);
    } else {
      return null;
    }
  }

  addDirectivesMatchingQuery(query: QueryMetadata, list: any[]): void {
    var templateRef = isBlank(this._preBuiltObjects) ? null : this._preBuiltObjects.templateRef;
    if (query.selector === TemplateRef && isPresent(templateRef)) {
      list.push(templateRef);
    }
    this._strategy.addDirectivesMatchingQuery(query, list);
  }

  private _buildQueryStrategy(): _QueryStrategy {
    if (this._proto.protoQueryRefs.length === 0) {
      return _emptyQueryStrategy;
    } else if (this._proto.protoQueryRefs.length <=
               InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES) {
      return new InlineQueryStrategy(this);
    } else {
      return new DynamicQueryStrategy(this);
    }
  }

  link(parent: ElementInjector): void { parent.addChild(this); }

  unlink(): void { this.remove(); }

  getDirectiveAtIndex(index: number): any { return this._injector.getAt(index); }

  hasInstances(): boolean { return this._proto.hasBindings && this.hydrated; }

  getHost(): ElementInjector { return this._host; }

  getBoundElementIndex(): number { return this._proto.index; }

  getRootViewInjectors(): ElementInjector[] {
    if (!this.hydrated) return [];
    var view = this._preBuiltObjects.view;
    var nestedView = view.getNestedView(view.elementOffset + this.getBoundElementIndex());
    return isPresent(nestedView) ? nestedView.rootElementInjectors : [];
  }

  afterViewChecked(): void { this._queryStrategy.updateViewQueries(); }

  afterContentChecked(): void { this._queryStrategy.updateContentQueries(); }

  traverseAndSetQueriesAsDirty(): void {
    var inj = this;
    while (isPresent(inj)) {
      inj._setQueriesAsDirty();
      inj = inj.parent;
    }
  }

  private _setQueriesAsDirty(): void {
    this._queryStrategy.setContentQueriesAsDirty();
    if (isPresent(this._host)) this._host._queryStrategy.setViewQueriesAsDirty();
  }
}

interface _QueryStrategy {
  setContentQueriesAsDirty(): void;
  setViewQueriesAsDirty(): void;
  hydrate(): void;
  dehydrate(): void;
  updateContentQueries(): void;
  updateViewQueries(): void;
  findQuery(query: QueryMetadata): QueryRef;
}

class _EmptyQueryStrategy implements _QueryStrategy {
  setContentQueriesAsDirty(): void {}
  setViewQueriesAsDirty(): void {}
  hydrate(): void {}
  dehydrate(): void {}
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

  constructor(ei: ElementInjector) {
    var protoRefs = ei._proto.protoQueryRefs;
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

  hydrate(): void {
    if (isPresent(this.query0)) this.query0.hydrate();
    if (isPresent(this.query1)) this.query1.hydrate();
    if (isPresent(this.query2)) this.query2.hydrate();
  }

  dehydrate(): void {
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

  constructor(ei: ElementInjector) {
    this.queries = ei._proto.protoQueryRefs.map(p => new QueryRef(p, ei));
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

  hydrate(): void {
    for (var i = 0; i < this.queries.length; ++i) {
      var q = this.queries[i];
      q.hydrate();
    }
  }

  dehydrate(): void {
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

interface _ElementInjectorStrategy {
  callOnDestroy(): void;
  getComponent(): any;
  isComponentKey(key: Key): boolean;
  addDirectivesMatchingQuery(q: QueryMetadata, res: any[]): void;
  hydrate(): void;
  dehydrate(): void;
}

/**
 * Strategy used by the `ElementInjector` when the number of bindings is 10 or less.
 * In such a case, inlining fields is beneficial for performances.
 */
class ElementInjectorInlineStrategy implements _ElementInjectorStrategy {
  constructor(public injectorStrategy: InjectorInlineStrategy, public _ei: ElementInjector) {}

  hydrate(): void {
    var i = this.injectorStrategy;
    var p = i.protoStrategy;
    i.resetConstructionCounter();

    if (p.binding0 instanceof DirectiveBinding && isPresent(p.keyId0) && i.obj0 === UNDEFINED)
      i.obj0 = i.instantiateBinding(p.binding0, p.visibility0);
    if (p.binding1 instanceof DirectiveBinding && isPresent(p.keyId1) && i.obj1 === UNDEFINED)
      i.obj1 = i.instantiateBinding(p.binding1, p.visibility1);
    if (p.binding2 instanceof DirectiveBinding && isPresent(p.keyId2) && i.obj2 === UNDEFINED)
      i.obj2 = i.instantiateBinding(p.binding2, p.visibility2);
    if (p.binding3 instanceof DirectiveBinding && isPresent(p.keyId3) && i.obj3 === UNDEFINED)
      i.obj3 = i.instantiateBinding(p.binding3, p.visibility3);
    if (p.binding4 instanceof DirectiveBinding && isPresent(p.keyId4) && i.obj4 === UNDEFINED)
      i.obj4 = i.instantiateBinding(p.binding4, p.visibility4);
    if (p.binding5 instanceof DirectiveBinding && isPresent(p.keyId5) && i.obj5 === UNDEFINED)
      i.obj5 = i.instantiateBinding(p.binding5, p.visibility5);
    if (p.binding6 instanceof DirectiveBinding && isPresent(p.keyId6) && i.obj6 === UNDEFINED)
      i.obj6 = i.instantiateBinding(p.binding6, p.visibility6);
    if (p.binding7 instanceof DirectiveBinding && isPresent(p.keyId7) && i.obj7 === UNDEFINED)
      i.obj7 = i.instantiateBinding(p.binding7, p.visibility7);
    if (p.binding8 instanceof DirectiveBinding && isPresent(p.keyId8) && i.obj8 === UNDEFINED)
      i.obj8 = i.instantiateBinding(p.binding8, p.visibility8);
    if (p.binding9 instanceof DirectiveBinding && isPresent(p.keyId9) && i.obj9 === UNDEFINED)
      i.obj9 = i.instantiateBinding(p.binding9, p.visibility9);
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

  callOnDestroy(): void {
    var i = this.injectorStrategy;
    var p = i.protoStrategy;

    if (p.binding0 instanceof DirectiveBinding && (<DirectiveBinding>p.binding0).callOnDestroy) {
      i.obj0.onDestroy();
    }
    if (p.binding1 instanceof DirectiveBinding && (<DirectiveBinding>p.binding1).callOnDestroy) {
      i.obj1.onDestroy();
    }
    if (p.binding2 instanceof DirectiveBinding && (<DirectiveBinding>p.binding2).callOnDestroy) {
      i.obj2.onDestroy();
    }
    if (p.binding3 instanceof DirectiveBinding && (<DirectiveBinding>p.binding3).callOnDestroy) {
      i.obj3.onDestroy();
    }
    if (p.binding4 instanceof DirectiveBinding && (<DirectiveBinding>p.binding4).callOnDestroy) {
      i.obj4.onDestroy();
    }
    if (p.binding5 instanceof DirectiveBinding && (<DirectiveBinding>p.binding5).callOnDestroy) {
      i.obj5.onDestroy();
    }
    if (p.binding6 instanceof DirectiveBinding && (<DirectiveBinding>p.binding6).callOnDestroy) {
      i.obj6.onDestroy();
    }
    if (p.binding7 instanceof DirectiveBinding && (<DirectiveBinding>p.binding7).callOnDestroy) {
      i.obj7.onDestroy();
    }
    if (p.binding8 instanceof DirectiveBinding && (<DirectiveBinding>p.binding8).callOnDestroy) {
      i.obj8.onDestroy();
    }
    if (p.binding9 instanceof DirectiveBinding && (<DirectiveBinding>p.binding9).callOnDestroy) {
      i.obj9.onDestroy();
    }
  }

  getComponent(): any { return this.injectorStrategy.obj0; }

  isComponentKey(key: Key): boolean {
    return this._ei._proto._firstBindingIsComponent && isPresent(key) &&
           key.id === this.injectorStrategy.protoStrategy.keyId0;
  }

  addDirectivesMatchingQuery(query: QueryMetadata, list: any[]): void {
    var i = this.injectorStrategy;
    var p = i.protoStrategy;

    if (isPresent(p.binding0) && p.binding0.key.token === query.selector) {
      if (i.obj0 === UNDEFINED) i.obj0 = i.instantiateBinding(p.binding0, p.visibility0);
      list.push(i.obj0);
    }
    if (isPresent(p.binding1) && p.binding1.key.token === query.selector) {
      if (i.obj1 === UNDEFINED) i.obj1 = i.instantiateBinding(p.binding1, p.visibility1);
      list.push(i.obj1);
    }
    if (isPresent(p.binding2) && p.binding2.key.token === query.selector) {
      if (i.obj2 === UNDEFINED) i.obj2 = i.instantiateBinding(p.binding2, p.visibility2);
      list.push(i.obj2);
    }
    if (isPresent(p.binding3) && p.binding3.key.token === query.selector) {
      if (i.obj3 === UNDEFINED) i.obj3 = i.instantiateBinding(p.binding3, p.visibility3);
      list.push(i.obj3);
    }
    if (isPresent(p.binding4) && p.binding4.key.token === query.selector) {
      if (i.obj4 === UNDEFINED) i.obj4 = i.instantiateBinding(p.binding4, p.visibility4);
      list.push(i.obj4);
    }
    if (isPresent(p.binding5) && p.binding5.key.token === query.selector) {
      if (i.obj5 === UNDEFINED) i.obj5 = i.instantiateBinding(p.binding5, p.visibility5);
      list.push(i.obj5);
    }
    if (isPresent(p.binding6) && p.binding6.key.token === query.selector) {
      if (i.obj6 === UNDEFINED) i.obj6 = i.instantiateBinding(p.binding6, p.visibility6);
      list.push(i.obj6);
    }
    if (isPresent(p.binding7) && p.binding7.key.token === query.selector) {
      if (i.obj7 === UNDEFINED) i.obj7 = i.instantiateBinding(p.binding7, p.visibility7);
      list.push(i.obj7);
    }
    if (isPresent(p.binding8) && p.binding8.key.token === query.selector) {
      if (i.obj8 === UNDEFINED) i.obj8 = i.instantiateBinding(p.binding8, p.visibility8);
      list.push(i.obj8);
    }
    if (isPresent(p.binding9) && p.binding9.key.token === query.selector) {
      if (i.obj9 === UNDEFINED) i.obj9 = i.instantiateBinding(p.binding9, p.visibility9);
      list.push(i.obj9);
    }
  }
}

/**
 * Strategy used by the `ElementInjector` when the number of bindings is 10 or less.
 * In such a case, inlining fields is beneficial for performances.
 */
class ElementInjectorDynamicStrategy implements _ElementInjectorStrategy {
  constructor(public injectorStrategy: InjectorDynamicStrategy, public _ei: ElementInjector) {}

  hydrate(): void {
    var inj = this.injectorStrategy;
    var p = inj.protoStrategy;
    inj.resetConstructionCounter();

    for (var i = 0; i < p.keyIds.length; i++) {
      if (p.bindings[i] instanceof DirectiveBinding && isPresent(p.keyIds[i]) &&
          inj.objs[i] === UNDEFINED) {
        inj.objs[i] = inj.instantiateBinding(p.bindings[i], p.visibilities[i]);
      }
    }
  }

  dehydrate(): void {
    var inj = this.injectorStrategy;
    ListWrapper.fill(inj.objs, UNDEFINED);
  }

  callOnDestroy(): void {
    var ist = this.injectorStrategy;
    var p = ist.protoStrategy;

    for (var i = 0; i < p.bindings.length; i++) {
      if (p.bindings[i] instanceof DirectiveBinding &&
          (<DirectiveBinding>p.bindings[i]).callOnDestroy) {
        ist.objs[i].onDestroy();
      }
    }
  }

  getComponent(): any { return this.injectorStrategy.objs[0]; }

  isComponentKey(key: Key): boolean {
    var p = this.injectorStrategy.protoStrategy;
    return this._ei._proto._firstBindingIsComponent && isPresent(key) && key.id === p.keyIds[0];
  }

  addDirectivesMatchingQuery(query: QueryMetadata, list: any[]): void {
    var ist = this.injectorStrategy;
    var p = ist.protoStrategy;

    for (var i = 0; i < p.bindings.length; i++) {
      if (p.bindings[i].key.token === query.selector) {
        if (ist.objs[i] === UNDEFINED) {
          ist.objs[i] = ist.instantiateBinding(p.bindings[i], p.visibilities[i]);
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

  constructor(public protoQueryRef: ProtoQueryRef, private originator: ElementInjector) {}

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
      var view = this.originator.getView();
      // intentionally skipping originator for view queries.
      var nestedView =
          view.getNestedView(view.elementOffset + this.originator.getBoundElementIndex());
      if (isPresent(nestedView)) this._visitView(nestedView, aggregator);
    } else {
      this._visit(this.originator, aggregator);
    }
    this.list.reset(aggregator);
  };

  private _visit(inj: ElementInjector, aggregator: any[]): void {
    var view = inj.getView();
    var startIdx = view.elementOffset + inj._proto.index;
    for (var i = startIdx; i < view.elementOffset + view.ownBindersCount; i++) {
      var curInj = view.elementInjectors[i];
      if (isBlank(curInj)) continue;
      // The first injector after inj, that is outside the subtree rooted at
      // inj has to have a null parent or a parent that is an ancestor of inj.
      if (i > startIdx && (isBlank(curInj) || isBlank(curInj.parent) ||
                           view.elementOffset + curInj.parent._proto.index < startIdx)) {
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
      var vc = view.viewContainers[i];
      if (isPresent(vc)) this._visitViewContainer(vc, aggregator);
    }
  }

  private _visitInjector(inj: ElementInjector, aggregator: any[]) {
    if (this.protoQueryRef.query.isVarBindingQuery) {
      this._aggregateVariableBindings(inj, aggregator);
    } else {
      this._aggregateDirective(inj, aggregator);
    }
  }

  private _visitViewContainer(vc: viewModule.AppViewContainer, aggregator: any[]) {
    for (var j = 0; j < vc.views.length; j++) {
      this._visitView(vc.views[j], aggregator);
    }
  }

  private _visitView(view: viewModule.AppView, aggregator: any[]) {
    for (var i = view.elementOffset; i < view.elementOffset + view.ownBindersCount; i++) {
      var inj = view.elementInjectors[i];
      if (isBlank(inj)) continue;

      this._visitInjector(inj, aggregator);

      var vc = view.viewContainers[i];
      if (isPresent(vc)) this._visitViewContainer(vc, aggregator);
    }
  }

  private _aggregateVariableBindings(inj: ElementInjector, aggregator: any[]): void {
    var vb = this.protoQueryRef.query.varBindings;
    for (var i = 0; i < vb.length; ++i) {
      if (inj.hasVariableBinding(vb[i])) {
        aggregator.push(inj.getVariableBinding(vb[i]));
      }
    }
  }

  private _aggregateDirective(inj: ElementInjector, aggregator: any[]): void {
    inj.addDirectivesMatchingQuery(this.protoQueryRef.query, aggregator);
  }

  dehydrate(): void { this.list = null; }

  hydrate(): void {
    this.list = new QueryList<any>();
    this.dirty = true;
  }
}
