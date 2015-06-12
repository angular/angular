import {
  isPresent,
  isBlank,
  Type,
  BaseException,
  stringify,
  CONST_EXPR,
  StringWrapper
} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
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
  resolveForwardRef,
  resolveBindings
} from 'angular2/di';
import {Visibility, self} from 'angular2/src/core/annotations_impl/visibility';
import {Attribute, Query} from 'angular2/src/core/annotations_impl/di';
import * as viewModule from './view';
import * as avmModule from './view_manager';
import {ViewContainerRef} from './view_container_ref';
import {ElementRef} from './element_ref';
import {ProtoViewRef, ViewRef} from './view_ref';
import {
  Directive,
  Component,
  onChange,
  onDestroy,
  onCheck,
  onInit,
  onAllChangesDone
} from 'angular2/src/core/annotations_impl/annotations';
import {hasLifecycleHook} from './directive_lifecycle_reflector';
import {ChangeDetector, ChangeDetectorRef} from 'angular2/change_detection';
import {QueryList} from './query_list';
import {reflector} from 'angular2/src/reflection/reflection';
import {DirectiveMetadata} from 'angular2/src/render/api';

// Threshold for the dynamic version
var _MAX_DIRECTIVE_CONSTRUCTION_COUNTER = 10;

const _undefined = CONST_EXPR(new Object());

var _staticKeys;

class StaticKeys {
  viewManagerId: number;
  protoViewId: number;
  viewContainerId: number;
  changeDetectorRefId: number;
  elementRefId: number;

  constructor() {
    // TODO: vsavkin Key.annotate(Key.get(AppView), 'static')
    this.viewManagerId = Key.get(avmModule.AppViewManager).id;
    this.protoViewId = Key.get(ProtoViewRef).id;
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
  _head: T = null;
  _tail: T = null;
  _next: T = null;
  constructor(parent: T) {
    if (isPresent(parent)) parent.addChild(this);
  }

  /**
   * Adds a child to the parent node. The child MUST NOT be a part of a tree.
   */
  addChild(child: T): void {
    if (isPresent(this._tail)) {
      this._tail._next = child;
      this._tail = child;
    } else {
      this._tail = this._head = child;
    }
    child._next = null;
    child._parent = this;
  }

  /**
   * Adds a child to the parent node after a given sibling.
   * The child MUST NOT be a part of a tree and the sibling must be present.
   */
  addChildAfter(child: T, prevSibling: T): void {
    if (isBlank(prevSibling)) {
      var prevHead = this._head;
      this._head = child;
      child._next = prevHead;
      if (isBlank(this._tail)) this._tail = child;
    } else if (isBlank(prevSibling._next)) {
      this.addChild(child);
      return;
    } else {
      child._next = prevSibling._next;
      prevSibling._next = child;
    }
    child._parent = this;
  }

  /**
   * Detaches a node from the parent's tree.
   */
  remove(): void {
    if (isBlank(this.parent)) return;
    var nextSibling = this._next;
    var prevSibling = this._findPrev();
    if (isBlank(prevSibling)) {
      this.parent._head = this._next;
    } else {
      prevSibling._next = this._next;
    }
    if (isBlank(nextSibling)) {
      this._parent._tail = prevSibling;
    }
    this._parent = null;
    this._next = null;
  }

  /**
   * Finds a previous sibling or returns null if first child.
   * Assumes the node has a parent.
   * TODO(rado): replace with DoublyLinkedList to avoid O(n) here.
   */
  _findPrev() {
    var node = this.parent._head;
    if (node == this) return null;
    while (node._next !== this) node = node._next;
    return node;
  }

  get parent() { return this._parent; }

  // TODO(rado): replace with a function call, does too much work for a getter.
  get children(): T[] {
    var res = [];
    var child = this._head;
    while (child != null) {
      ListWrapper.push(res, child);
      child = child._next;
    }
    return res;
  }
}

export class DependencyWithVisibility extends Dependency {
  constructor(key: Key, asPromise: boolean, lazy: boolean, optional: boolean, properties: List<any>,
              public visibility: Visibility) {
    super(key, asPromise, lazy, optional, properties);
  }

  static createFrom(d: Dependency): Dependency {
    return new DependencyWithVisibility(d.key, d.asPromise, d.lazy, d.optional, d.properties,
                                        DependencyWithVisibility._visibility(d.properties));
  }

  static _visibility(properties): Visibility {
    if (properties.length == 0) return self;
    var p = ListWrapper.find(properties, p => p instanceof Visibility);
    return isPresent(p) ? p : self;
  }
}

export class DirectiveDependency extends DependencyWithVisibility {
  constructor(key: Key, asPromise: boolean, lazy: boolean, optional: boolean, properties: List<any>,
              visibility: Visibility, public attributeName: string, public queryDecorator: Query) {
    super(key, asPromise, lazy, optional, properties, visibility);
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
    return new DirectiveDependency(d.key, d.asPromise, d.lazy, d.optional, d.properties,
                                   DependencyWithVisibility._visibility(d.properties),
                                   DirectiveDependency._attributeName(d.properties),
                                   DirectiveDependency._query(d.properties));
  }

  static _attributeName(properties): string {
    var p = ListWrapper.find(properties, (p) => p instanceof Attribute);
    return isPresent(p) ? p.attributeName : null;
  }

  static _query(properties) { return ListWrapper.find(properties, (p) => p instanceof Query); }
}

export class DirectiveBinding extends ResolvedBinding {
  constructor(key: Key, factory: Function, dependencies: List<Dependency>,
              providedAsPromise: boolean, public resolvedAppInjectables: List<ResolvedBinding>,
              public resolvedHostInjectables: List<ResolvedBinding>,
              public resolvedViewInjectables: List<ResolvedBinding>,
              public metadata: DirectiveMetadata) {
    super(key, factory, dependencies, providedAsPromise);
  }

  get callOnDestroy(): boolean { return this.metadata.callOnDestroy; }

  get callOnChange(): boolean { return this.metadata.callOnChange; }

  get callOnAllChangesDone(): boolean { return this.metadata.callOnAllChangesDone; }

  get displayName(): string { return this.key.displayName; }

  get eventEmitters(): List<string> {
    return isPresent(this.metadata) && isPresent(this.metadata.events) ? this.metadata.events : [];
  }

  get hostActions(): Map<string, string> {
    return isPresent(this.metadata) && isPresent(this.metadata.hostActions) ?
               this.metadata.hostActions :
               MapWrapper.create();
  }

  get changeDetection() { return this.metadata.changeDetection; }

  static createFromBinding(binding: Binding, ann: Directive): DirectiveBinding {
    if (isBlank(ann)) {
      ann = new Directive();
    }

    var rb = binding.resolve();
    var deps = ListWrapper.map(rb.dependencies, DirectiveDependency.createFrom);
    var resolvedAppInjectables = ann instanceof Component && isPresent(ann.appInjector) ?
                                                    Injector.resolve(ann.appInjector) :
                                                    [];
    var resolvedHostInjectables =
        isPresent(ann.hostInjector) ? resolveBindings(ann.hostInjector) : [];
    var resolvedViewInjectables = ann instanceof Component && isPresent(ann.viewInjector) ?
                                                     resolveBindings(ann.viewInjector) :
                                                     [];
    var metadata = DirectiveMetadata.create({
      id: stringify(rb.key.token),
      type: ann instanceof
          Component ? DirectiveMetadata.COMPONENT_TYPE : DirectiveMetadata.DIRECTIVE_TYPE,
      selector: ann.selector,
      compileChildren: ann.compileChildren,
      events: ann.events,
      host: isPresent(ann.host) ? MapWrapper.createFromStringMap(ann.host) : null,
      properties: ann.properties,
      readAttributes: DirectiveBinding._readAttributes(deps),

      callOnDestroy: hasLifecycleHook(onDestroy, rb.key.token, ann),
      callOnChange: hasLifecycleHook(onChange, rb.key.token, ann),
      callOnCheck: hasLifecycleHook(onCheck, rb.key.token, ann),
      callOnInit: hasLifecycleHook(onInit, rb.key.token, ann),
      callOnAllChangesDone: hasLifecycleHook(onAllChangesDone, rb.key.token, ann),

      changeDetection: ann instanceof
          Component ? ann.changeDetection : null,

      exportAs: ann.exportAs
    });
    return new DirectiveBinding(rb.key, rb.factory, deps, rb.providedAsPromise,
                                resolvedAppInjectables, resolvedHostInjectables,
                                resolvedViewInjectables, metadata);
  }

  static _readAttributes(deps) {
    var readAttributes = [];
    ListWrapper.forEach(deps, (dep) => {
      if (isPresent(dep.attributeName)) {
        ListWrapper.push(readAttributes, dep.attributeName);
      }
    });
    return readAttributes;
  }

  static createFromType(type: Type, annotation: Directive): DirectiveBinding {
    var binding = new Binding(type, {toClass: type});
    return DirectiveBinding.createFromBinding(binding, annotation);
  }
}

// TODO(rado): benchmark and consider rolling in as ElementInjector fields.
export class PreBuiltObjects {
  constructor(public viewManager: avmModule.AppViewManager, public view: viewModule.AppView,
              public protoView: viewModule.AppProtoView) {}
}

export class EventEmitterAccessor {
  constructor(public eventName: string, public getter: Function) {}

  subscribe(view: viewModule.AppView, boundElementIndex: number, directive: Object) {
    var eventEmitter = this.getter(directive);
    return ObservableWrapper.subscribe(
        eventEmitter,
        eventObj => view.triggerEventHandlers(this.eventName, eventObj, boundElementIndex));
  }
}

export class HostActionAccessor {
  constructor(public actionExpression: string, public getter: Function) {}

  subscribe(view: viewModule.AppView, boundElementIndex: number, directive: Object) {
    var eventEmitter = this.getter(directive);
    return ObservableWrapper.subscribe(
        eventEmitter,
        actionObj => view.callAction(boundElementIndex, this.actionExpression, actionObj));
  }
}

const LIGHT_DOM = 1;
const SHADOW_DOM = 2;
const LIGHT_DOM_AND_SHADOW_DOM = 3;

export class BindingData {
  constructor(public binding: ResolvedBinding, public visibility: number) {}

  getKeyId() { return this.binding.key.id; }

  createEventEmitterAccessors() {
    if (!(this.binding instanceof DirectiveBinding)) return [];
    var db = <DirectiveBinding>this.binding;
    return ListWrapper.map(db.eventEmitters, eventConfig => {
      let fieldName;
      let eventName;
      var colonIdx = eventConfig.indexOf(':');
      if (colonIdx > -1) {
        // long format: 'fieldName: eventName'
        fieldName = StringWrapper.substring(eventConfig, 0, colonIdx).trim();
        eventName = StringWrapper.substring(eventConfig, colonIdx + 1).trim();
      } else {
        // short format: 'name' when fieldName and eventName are the same
        fieldName = eventName = eventConfig;
      }
      return new EventEmitterAccessor(eventName, reflector.getter(fieldName))
    });
  }

  createHostActionAccessors() {
    if (!(this.binding instanceof DirectiveBinding)) return [];
    var res = [];
    var db = <DirectiveBinding>this.binding;
    MapWrapper.forEach(
        db.hostActions,
        (actionExpression, actionName) => {ListWrapper.push(
            res, new HostActionAccessor(actionExpression, reflector.getter(actionName)))});
    return res;
  }
}

/**

Difference between di.Injector and ElementInjector

di.Injector:
 - imperative based (can create child injectors imperativly)
 - Lazy loading of code
 - Component/App Level services which are usually not DOM Related.


ElementInjector:
  - ProtoBased (Injector structure fixed at compile time)
  - understands @Ancestor, @Parent, @Child, @Descendent
  - Fast
  - Query mechanism for children
  - 1:1 to DOM structure.

 PERF BENCHMARK:
http://www.williambrownstreet.net/blog/2014/04/faster-angularjs-rendering-angularjs-and-reactjs/
 */
export class ProtoElementInjector {
  view: viewModule.AppView;
  attributes: Map<string, string>;
  eventEmitterAccessors: List<List<EventEmitterAccessor>>;
  hostActionAccessors: List<List<HostActionAccessor>>;

  _strategy: _ProtoElementInjectorStrategy;

  static create(parent: ProtoElementInjector, index: number, bindings: List<ResolvedBinding>,
                firstBindingIsComponent: boolean, distanceToParent: number) {
    var bd = [];

    ProtoElementInjector._createDirectiveBindingData(bindings, bd, firstBindingIsComponent);
    if (firstBindingIsComponent) {
      ProtoElementInjector._createViewInjectorBindingData(bindings, bd);
    }
    ProtoElementInjector._createHostInjectorBindingData(bindings, bd, firstBindingIsComponent);
    return new ProtoElementInjector(parent, index, bd, distanceToParent, firstBindingIsComponent);
  }

  private static _createDirectiveBindingData(dirBindings: List<ResolvedBinding>,
                                             bd: List<BindingData>,
                                             firstBindingIsComponent: boolean) {
    ListWrapper.forEach(dirBindings, dirBinding => {
      ListWrapper.push(bd, ProtoElementInjector._createBindingData(
                               firstBindingIsComponent, dirBinding, dirBindings, dirBinding));
    });
  }

  private static _createHostInjectorBindingData(dirBindings: List<ResolvedBinding>,
                                                bd: List<BindingData>,
                                                firstBindingIsComponent: boolean) {
    var visitedIds: Map<number, boolean> = MapWrapper.create();
    ListWrapper.forEach(dirBindings, dirBinding => {
      ListWrapper.forEach(dirBinding.resolvedHostInjectables, b => {
        if (MapWrapper.contains(visitedIds, b.key.id)) {
          throw new BaseException(
              `Multiple directives defined the same host injectable: "${stringify(b.key.token)}"`);
        }
        MapWrapper.set(visitedIds, b.key.id, true);
        ListWrapper.push(bd, ProtoElementInjector._createBindingData(
                                 firstBindingIsComponent, dirBinding, dirBindings,
                                 ProtoElementInjector._createBinding(b)));
      });
    });
  }

  private static _createBindingData(firstBindingIsComponent, dirBinding, dirBindings, binding) {
    var isComponent = firstBindingIsComponent && dirBindings[0] === dirBinding;
    return new BindingData(binding, isComponent ? LIGHT_DOM_AND_SHADOW_DOM : LIGHT_DOM);
  }

  private static _createViewInjectorBindingData(bindings: List<ResolvedBinding>,
                                                bd: List<BindingData>) {
    var db = <DirectiveBinding>bindings[0];
    ListWrapper.forEach(
        db.resolvedViewInjectables,
        b => ListWrapper.push(bd,
                              new BindingData(ProtoElementInjector._createBinding(b), SHADOW_DOM)));
  }

  private static _createBinding(b: ResolvedBinding) {
    var deps = ListWrapper.map(b.dependencies, d => DependencyWithVisibility.createFrom(d));
    return new ResolvedBinding(b.key, b.factory, deps, b.providedAsPromise);
  }

  constructor(public parent: ProtoElementInjector, public index: int, bd: List<BindingData>,
              public distanceToParent: number, public _firstBindingIsComponent: boolean) {
    var length = bd.length;
    this.eventEmitterAccessors = ListWrapper.createFixedSize(length);
    this.hostActionAccessors = ListWrapper.createFixedSize(length);

    this._strategy = length > _MAX_DIRECTIVE_CONSTRUCTION_COUNTER ?
                         new _ProtoElementInjectorDynamicStrategy(this, bd) :
                         new _ProtoElementInjectorInlineStrategy(this, bd);
  }

  instantiate(parent: ElementInjector): ElementInjector {
    return new ElementInjector(this, parent);
  }

  directParent(): ProtoElementInjector { return this.distanceToParent < 2 ? this.parent : null; }

  get hasBindings(): boolean { return this._strategy.hasBindings(); }

  getBindingAtIndex(index: number): any { return this._strategy.getBindingAtIndex(index); }
}

interface _ProtoElementInjectorStrategy {
  hasBindings(): boolean;
  getBindingAtIndex(index: number): any;
  createElementInjectorStrategy(ei: ElementInjector): _ElementInjectorStrategy;
}

/**
 * Strategy used by the `ProtoElementInjector` when the number of bindings is 10 or less.
 * In such a case, inlining fields is benefitial for performances.
 */
class _ProtoElementInjectorInlineStrategy implements _ProtoElementInjectorStrategy {
  // only _binding0 can contain a component
  _binding0: ResolvedBinding = null;
  _binding1: ResolvedBinding = null;
  _binding2: ResolvedBinding = null;
  _binding3: ResolvedBinding = null;
  _binding4: ResolvedBinding = null;
  _binding5: ResolvedBinding = null;
  _binding6: ResolvedBinding = null;
  _binding7: ResolvedBinding = null;
  _binding8: ResolvedBinding = null;
  _binding9: ResolvedBinding = null;

  _keyId0: number = null;
  _keyId1: number = null;
  _keyId2: number = null;
  _keyId3: number = null;
  _keyId4: number = null;
  _keyId5: number = null;
  _keyId6: number = null;
  _keyId7: number = null;
  _keyId8: number = null;
  _keyId9: number = null;

  _visibility0: number = null;
  _visibility1: number = null;
  _visibility2: number = null;
  _visibility3: number = null;
  _visibility4: number = null;
  _visibility5: number = null;
  _visibility6: number = null;
  _visibility7: number = null;
  _visibility8: number = null;
  _visibility9: number = null;

  constructor(protoEI: ProtoElementInjector, bd: List<BindingData>) {
    var length = bd.length;

    if (length > 0) {
      this._binding0 = bd[0].binding;
      this._keyId0 = bd[0].getKeyId();
      this._visibility0 = bd[0].visibility;
      protoEI.eventEmitterAccessors[0] = bd[0].createEventEmitterAccessors();
      protoEI.hostActionAccessors[0] = bd[0].createHostActionAccessors();
    }
    if (length > 1) {
      this._binding1 = bd[1].binding;
      this._keyId1 = bd[1].getKeyId();
      this._visibility1 = bd[1].visibility;
      protoEI.eventEmitterAccessors[1] = bd[1].createEventEmitterAccessors();
      protoEI.hostActionAccessors[1] = bd[1].createHostActionAccessors();
    }
    if (length > 2) {
      this._binding2 = bd[2].binding;
      this._keyId2 = bd[2].getKeyId();
      this._visibility2 = bd[2].visibility;
      protoEI.eventEmitterAccessors[2] = bd[2].createEventEmitterAccessors();
      protoEI.hostActionAccessors[2] = bd[2].createHostActionAccessors();
    }
    if (length > 3) {
      this._binding3 = bd[3].binding;
      this._keyId3 = bd[3].getKeyId();
      this._visibility3 = bd[3].visibility;
      protoEI.eventEmitterAccessors[3] = bd[3].createEventEmitterAccessors();
      protoEI.hostActionAccessors[3] = bd[3].createHostActionAccessors();
    }
    if (length > 4) {
      this._binding4 = bd[4].binding;
      this._keyId4 = bd[4].getKeyId();
      this._visibility4 = bd[4].visibility;
      protoEI.eventEmitterAccessors[4] = bd[4].createEventEmitterAccessors();
      protoEI.hostActionAccessors[4] = bd[4].createHostActionAccessors();
    }
    if (length > 5) {
      this._binding5 = bd[5].binding;
      this._keyId5 = bd[5].getKeyId();
      this._visibility5 = bd[5].visibility;
      protoEI.eventEmitterAccessors[5] = bd[5].createEventEmitterAccessors();
      protoEI.hostActionAccessors[5] = bd[5].createHostActionAccessors();
    }
    if (length > 6) {
      this._binding6 = bd[6].binding;
      this._keyId6 = bd[6].getKeyId();
      this._visibility6 = bd[6].visibility;
      protoEI.eventEmitterAccessors[6] = bd[6].createEventEmitterAccessors();
      protoEI.hostActionAccessors[6] = bd[6].createHostActionAccessors();
    }
    if (length > 7) {
      this._binding7 = bd[7].binding;
      this._keyId7 = bd[7].getKeyId();
      this._visibility7 = bd[7].visibility;
      protoEI.eventEmitterAccessors[7] = bd[7].createEventEmitterAccessors();
      protoEI.hostActionAccessors[7] = bd[7].createHostActionAccessors();
    }
    if (length > 8) {
      this._binding8 = bd[8].binding;
      this._keyId8 = bd[8].getKeyId();
      this._visibility8 = bd[8].visibility;
      protoEI.eventEmitterAccessors[8] = bd[8].createEventEmitterAccessors();
      protoEI.hostActionAccessors[8] = bd[8].createHostActionAccessors();
    }
    if (length > 9) {
      this._binding9 = bd[9].binding;
      this._keyId9 = bd[9].getKeyId();
      this._visibility9 = bd[9].visibility;
      protoEI.eventEmitterAccessors[9] = bd[9].createEventEmitterAccessors();
      protoEI.hostActionAccessors[9] = bd[9].createHostActionAccessors();
    }
  }

  hasBindings(): boolean { return isPresent(this._binding0); }

  getBindingAtIndex(index: number): any {
    if (index == 0) return this._binding0;
    if (index == 1) return this._binding1;
    if (index == 2) return this._binding2;
    if (index == 3) return this._binding3;
    if (index == 4) return this._binding4;
    if (index == 5) return this._binding5;
    if (index == 6) return this._binding6;
    if (index == 7) return this._binding7;
    if (index == 8) return this._binding8;
    if (index == 9) return this._binding9;
    throw new OutOfBoundsAccess(index);
  }

  createElementInjectorStrategy(ei: ElementInjector): _ElementInjectorStrategy {
    return new ElementInjectorInlineStrategy(this, ei);
  }
}

/**
 * Strategy used by the `ProtoElementInjector` when the number of bindings is more than 10.
 */
class _ProtoElementInjectorDynamicStrategy implements _ProtoElementInjectorStrategy {
  // only _bindings[0] can contain a component
  _bindings: List<ResolvedBinding>;
  _keyIds: List<number>;
  _visibilities: List<number>;

  constructor(protoInj: ProtoElementInjector, bd: List<BindingData>) {
    var len = bd.length;

    this._bindings = ListWrapper.createFixedSize(len);
    this._keyIds = ListWrapper.createFixedSize(len);
    this._visibilities = ListWrapper.createFixedSize(len);

    for (var i = 0; i < len; i++) {
      this._bindings[i] = bd[i].binding;
      this._keyIds[i] = bd[i].getKeyId();
      this._visibilities[i] = bd[i].visibility;
      protoInj.eventEmitterAccessors[i] = bd[i].createEventEmitterAccessors();
      protoInj.hostActionAccessors[i] = bd[i].createHostActionAccessors();
    }
  }

  hasBindings(): boolean { return isPresent(this._bindings[0]); }

  getBindingAtIndex(index: number): any {
    if (index < 0 || index >= this._bindings.length) {
      throw new OutOfBoundsAccess(index);
    }

    return this._bindings[index];
  }

  createElementInjectorStrategy(ei: ElementInjector) {
    return new ElementInjectorDynamicStrategy(this, ei);
  }
}

export class ElementInjector extends TreeNode<ElementInjector> {
  private _lightDomAppInjector: Injector = null;
  private _shadowDomAppInjector: Injector = null;
  private _host: ElementInjector;

  private _preBuiltObjects = null;
  private _constructionCounter: number = 0;

  private _dynamicallyCreatedComponent: any;
  private _dynamicallyCreatedComponentBinding: DirectiveBinding;

  // Queries are added during construction or linking with a new parent.
  // They are never removed.
  private _query0: QueryRef;
  private _query1: QueryRef;
  private _query2: QueryRef;

  hydrated: boolean;

  _strategy: _ElementInjectorStrategy;

  constructor(public _proto: ProtoElementInjector, parent: ElementInjector) {
    super(parent);
    this._strategy = _proto._strategy.createElementInjectorStrategy(this);

    this._constructionCounter = 0;
    this.hydrated = false;

    this._buildQueries();
    this._addParentQueries();
  }

  dehydrate(): void {
    this.hydrated = false;
    this._host = null;
    this._preBuiltObjects = null;
    this._lightDomAppInjector = null;
    this._shadowDomAppInjector = null;
    this._strategy.callOnDestroy();
    this.destroyDynamicComponent();
    this._strategy.clearInstances();
    this._constructionCounter = 0;
  }

  destroyDynamicComponent(): void {
    if (isPresent(this._dynamicallyCreatedComponentBinding) &&
        this._dynamicallyCreatedComponentBinding.callOnDestroy) {
      this._dynamicallyCreatedComponent.onDestroy();
      this._dynamicallyCreatedComponentBinding = null;
      this._dynamicallyCreatedComponent = null;
    }
  }

  onAllChangesDone(): void {
    if (isPresent(this._query0) && this._query0.originator === this)
      this._query0.list.fireCallbacks();
    if (isPresent(this._query1) && this._query1.originator === this)
      this._query1.list.fireCallbacks();
    if (isPresent(this._query2) && this._query2.originator === this)
      this._query2.list.fireCallbacks();
  }

  hydrate(injector: Injector, host: ElementInjector, preBuiltObjects: PreBuiltObjects): void {
    var p = this._proto;

    this._host = host;
    this._lightDomAppInjector = injector;
    this._preBuiltObjects = preBuiltObjects;

    if (p._firstBindingIsComponent) {
      this._shadowDomAppInjector =
          this._createShadowDomAppInjector(this._strategy.getComponentBinding(), injector);
    }

    this._checkShadowDomAppInjector(this._shadowDomAppInjector);

    this._strategy.hydrate();
    this.hydrated = true;
  }

  private _createShadowDomAppInjector(componentDirective: DirectiveBinding,
                                      appInjector: Injector): Injector {
    if (!ListWrapper.isEmpty(componentDirective.resolvedAppInjectables)) {
      return appInjector.createChildFromResolved(componentDirective.resolvedAppInjectables);
    } else {
      return appInjector;
    }
  }

  dynamicallyCreateComponent(componentDirective: DirectiveBinding, parentInjector: Injector): any {
    this._shadowDomAppInjector =
        this._createShadowDomAppInjector(componentDirective, parentInjector);
    this._dynamicallyCreatedComponentBinding = componentDirective;
    this._dynamicallyCreatedComponent = this._new(this._dynamicallyCreatedComponentBinding);
    return this._dynamicallyCreatedComponent;
  }

  private _checkShadowDomAppInjector(shadowDomAppInjector: Injector): void {
    if (this._proto._firstBindingIsComponent && isBlank(shadowDomAppInjector)) {
      throw new BaseException(
          'A shadowDomAppInjector is required as this ElementInjector contains a component');
    } else if (!this._proto._firstBindingIsComponent && isPresent(shadowDomAppInjector)) {
      throw new BaseException(
          'No shadowDomAppInjector allowed as there is not component stored in this ElementInjector');
    }
  }

  get(token): any {
    if (this._isDynamicallyLoadedComponent(token)) {
      return this._dynamicallyCreatedComponent;
    }

    return this._getByKey(Key.get(token), self, false, null);
  }

  private _isDynamicallyLoadedComponent(token): boolean {
    return isPresent(this._dynamicallyCreatedComponentBinding) &&
           Key.get(token) === this._dynamicallyCreatedComponentBinding.key;
  }

  hasDirective(type: Type): boolean {
    return this._strategy.getObjByKeyId(Key.get(type).id, LIGHT_DOM_AND_SHADOW_DOM) !== _undefined;
  }

  getEventEmitterAccessors(): List<List<EventEmitterAccessor>> {
    return this._proto.eventEmitterAccessors;
  }

  getHostActionAccessors(): List<List<HostActionAccessor>> {
    return this._proto.hostActionAccessors;
  }

  getComponent(): any { return this._strategy.getComponent(); }

  getElementRef(): ElementRef {
    return new ElementRef(new ViewRef(this._preBuiltObjects.view), this._proto.index);
  }

  getViewContainerRef(): ViewContainerRef {
    return new ViewContainerRef(this._preBuiltObjects.viewManager, this.getElementRef());
  }

  getDynamicallyLoadedComponent(): any { return this._dynamicallyCreatedComponent; }

  directParent(): ElementInjector { return this._proto.distanceToParent < 2 ? this.parent : null; }

  private _isComponentKey(key: Key): boolean { return this._strategy.isComponentKey(key); }

  private _isDynamicallyLoadedComponentKey(key: Key): boolean {
    return isPresent(this._dynamicallyCreatedComponentBinding) &&
           key.id === this._dynamicallyCreatedComponentBinding.key.id;
  }

  _new(binding: ResolvedBinding): any {
    if (this._constructionCounter++ > this._strategy.getMaxDirectives()) {
      throw new CyclicDependencyError(binding.key);
    }

    var factory = binding.factory;
    var deps = <List<DirectiveDependency>>binding.dependencies;
    var length = deps.length;

    var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
    try {
      d0 = length > 0 ? this._getByDependency(deps[0], binding.key) : null;
      d1 = length > 1 ? this._getByDependency(deps[1], binding.key) : null;
      d2 = length > 2 ? this._getByDependency(deps[2], binding.key) : null;
      d3 = length > 3 ? this._getByDependency(deps[3], binding.key) : null;
      d4 = length > 4 ? this._getByDependency(deps[4], binding.key) : null;
      d5 = length > 5 ? this._getByDependency(deps[5], binding.key) : null;
      d6 = length > 6 ? this._getByDependency(deps[6], binding.key) : null;
      d7 = length > 7 ? this._getByDependency(deps[7], binding.key) : null;
      d8 = length > 8 ? this._getByDependency(deps[8], binding.key) : null;
      d9 = length > 9 ? this._getByDependency(deps[9], binding.key) : null;
    } catch (e) {
      if (e instanceof AbstractBindingError) e.addKey(binding.key);
      throw e;
    }

    var obj;
    switch (length) {
      case 0:
        obj = factory();
        break;
      case 1:
        obj = factory(d0);
        break;
      case 2:
        obj = factory(d0, d1);
        break;
      case 3:
        obj = factory(d0, d1, d2);
        break;
      case 4:
        obj = factory(d0, d1, d2, d3);
        break;
      case 5:
        obj = factory(d0, d1, d2, d3, d4);
        break;
      case 6:
        obj = factory(d0, d1, d2, d3, d4, d5);
        break;
      case 7:
        obj = factory(d0, d1, d2, d3, d4, d5, d6);
        break;
      case 8:
        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
        break;
      case 9:
        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
        break;
      case 10:
        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
        break;
    }

    this._addToQueries(obj, binding.key.token);

    return obj;
  }

  private _getByDependency(dep: DependencyWithVisibility, requestor: Key): any {
    if (!(dep instanceof DirectiveDependency)) {
      return this._getByKey(dep.key, dep.visibility, dep.optional, requestor);
    }

    var dirDep = <DirectiveDependency>dep;

    if (isPresent(dirDep.attributeName)) return this._buildAttribute(dirDep);
    if (isPresent(dirDep.queryDecorator)) return this._findQuery(dirDep.queryDecorator).list;
    if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
      var componentView = this._preBuiltObjects.view.componentChildViews[this._proto.index];
      return componentView.changeDetector.ref;
    }
    if (dirDep.key.id === StaticKeys.instance().elementRefId) {
      return this.getElementRef();
    }
    if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
      return this.getViewContainerRef();
    }
    if (dirDep.key.id === StaticKeys.instance().protoViewId) {
      if (isBlank(this._preBuiltObjects.protoView)) {
        if (dirDep.optional) {
          return null;
        }

        throw new NoBindingError(dirDep.key);
      }
      return new ProtoViewRef(this._preBuiltObjects.protoView);
    }
    return this._getByKey(dirDep.key, dirDep.visibility, dirDep.optional, requestor);
  }

  private _buildAttribute(dep: DirectiveDependency): string {
    var attributes = this._proto.attributes;
    if (isPresent(attributes) && MapWrapper.contains(attributes, dep.attributeName)) {
      return MapWrapper.get(attributes, dep.attributeName);
    } else {
      return null;
    }
  }

  _buildQueriesForDeps(deps: List<DirectiveDependency>): void {
    for (var i = 0; i < deps.length; i++) {
      var dep = deps[i];
      if (isPresent(dep.queryDecorator)) {
        this._createQueryRef(dep.queryDecorator);
      }
    }
  }

  private _createQueryRef(query: Query): void {
    var queryList = new QueryList<any>();
    if (isBlank(this._query0)) {
      this._query0 = new QueryRef(query, queryList, this);
    } else if (isBlank(this._query1)) {
      this._query1 = new QueryRef(query, queryList, this);
    } else if (isBlank(this._query2)) {
      this._query2 = new QueryRef(query, queryList, this);
    } else
      throw new QueryError();
  }

  private _addToQueries(obj, token): void {
    if (isPresent(this._query0) && (this._query0.query.directive === token)) {
      this._query0.list.add(obj);
    }
    if (isPresent(this._query1) && (this._query1.query.directive === token)) {
      this._query1.list.add(obj);
    }
    if (isPresent(this._query2) && (this._query2.query.directive === token)) {
      this._query2.list.add(obj);
    }
  }

  private _buildQueries(): void {
    if (isPresent(this._proto)) {
      this._strategy.buildQueries();
    }
  }

  private _findQuery(query): QueryRef {
    if (isPresent(this._query0) && this._query0.query === query) {
      return this._query0;
    }
    if (isPresent(this._query1) && this._query1.query === query) {
      return this._query1;
    }
    if (isPresent(this._query2) && this._query2.query === query) {
      return this._query2;
    }
    throw new BaseException(`Cannot find query for directive ${query}.`);
  }

  _hasQuery(query: QueryRef): boolean {
    return this._query0 == query || this._query1 == query || this._query2 == query;
  }

  link(parent: ElementInjector): void {
    parent.addChild(this);
    this._addParentQueries();
  }

  linkAfter(parent: ElementInjector, prevSibling: ElementInjector): void {
    parent.addChildAfter(this, prevSibling);
    this._addParentQueries();
  }

  private _addParentQueries(): void {
    if (isBlank(this.parent)) return;
    if (isPresent(this.parent._query0)) {
      this._addQueryToTree(this.parent._query0);
      if (this.hydrated) this.parent._query0.update();
    }
    if (isPresent(this.parent._query1)) {
      this._addQueryToTree(this.parent._query1);
      if (this.hydrated) this.parent._query1.update();
    }
    if (isPresent(this.parent._query2)) {
      this._addQueryToTree(this.parent._query2);
      if (this.hydrated) this.parent._query2.update();
    }
  }

  unlink(): void {
    var queriesToUpdate = [];
    if (isPresent(this.parent._query0)) {
      this._pruneQueryFromTree(this.parent._query0);
      ListWrapper.push(queriesToUpdate, this.parent._query0);
    }
    if (isPresent(this.parent._query1)) {
      this._pruneQueryFromTree(this.parent._query1);
      ListWrapper.push(queriesToUpdate, this.parent._query1);
    }
    if (isPresent(this.parent._query2)) {
      this._pruneQueryFromTree(this.parent._query2);
      ListWrapper.push(queriesToUpdate, this.parent._query2);
    }

    this.remove();

    ListWrapper.forEach(queriesToUpdate, (q) => q.update());
  }

  private _pruneQueryFromTree(query: QueryRef): void {
    this._removeQueryRef(query);

    var child = this._head;
    while (isPresent(child)) {
      child._pruneQueryFromTree(query);
      child = child._next;
    }
  }

  private _addQueryToTree(queryRef: QueryRef): void {
    if (queryRef.query.descendants == false) {
      if (this == queryRef.originator) {
        this._addQueryToTreeSelfAndRecurse(queryRef);
      } else if (this.parent == queryRef.originator && this._proto.distanceToParent == 1) {
        this._assignQueryRef(queryRef);
      }
    } else {
      this._addQueryToTreeSelfAndRecurse(queryRef);
    }
  }

  private _addQueryToTreeSelfAndRecurse(queryRef: QueryRef): void {
    this._assignQueryRef(queryRef);

    var child = this._head;
    while (isPresent(child)) {
      child._addQueryToTree(queryRef);
      child = child._next;
    }
  }

  private _assignQueryRef(query: QueryRef): void {
    if (isBlank(this._query0)) {
      this._query0 = query;
      return;
    } else if (isBlank(this._query1)) {
      this._query1 = query;
      return;
    } else if (isBlank(this._query2)) {
      this._query2 = query;
      return;
    }
    throw new QueryError();
  }

  private _removeQueryRef(query: QueryRef): void {
    if (this._query0 == query) this._query0 = null;
    if (this._query1 == query) this._query1 = null;
    if (this._query2 == query) this._query2 = null;
  }

  private _getByKey(key: Key, visibility: Visibility, optional: boolean, requestor: Key): any {
    var ei = this;

    var currentVisibility = this._isComponentKey(requestor) ?
                                LIGHT_DOM_AND_SHADOW_DOM :  // component can access both shadow dom
                                                            // and light dom dependencies
                                LIGHT_DOM;

    var depth = visibility.depth;

    if (!visibility.includeSelf) {
      depth -= ei._proto.distanceToParent;

      if (isPresent(ei._parent)) {
        ei = ei._parent;
      } else {
        ei = ei._host;
        currentVisibility = visibility.crossComponentBoundaries ? LIGHT_DOM : SHADOW_DOM;
      }
    }

    while (ei != null && depth >= 0) {
      var preBuiltObj = ei._getPreBuiltObjectByKeyId(key.id);
      if (preBuiltObj !== _undefined) return preBuiltObj;

      var dir = ei._getObjByKeyId(key.id, currentVisibility);
      if (dir !== _undefined) return dir;

      depth -= ei._proto.distanceToParent;

      // we check only one mode with the SHADOW_DOM visibility
      if (currentVisibility === SHADOW_DOM) break;

      if (isPresent(ei._parent)) {
        ei = ei._parent;
      } else {
        ei = ei._host;
        currentVisibility = visibility.crossComponentBoundaries ? LIGHT_DOM : SHADOW_DOM;
      }
    }

    if (isPresent(this._host) && this._host._isComponentKey(key)) {
      return this._host.getComponent();
    } else if (isPresent(this._host) && this._host._isDynamicallyLoadedComponentKey(key)) {
      return this._host.getDynamicallyLoadedComponent();
    } else if (optional) {
      return this._appInjector(requestor).getOptional(key);
    } else {
      return this._appInjector(requestor).get(key);
    }
  }

  private _appInjector(requestor: Key): Injector {
    if (isPresent(requestor) &&
        (this._isComponentKey(requestor) || this._isDynamicallyLoadedComponentKey(requestor))) {
      return this._shadowDomAppInjector;
    } else {
      return this._lightDomAppInjector;
    }
  }

  private _getPreBuiltObjectByKeyId(keyId: number): any {
    var staticKeys = StaticKeys.instance();
    if (keyId === staticKeys.viewManagerId) return this._preBuiltObjects.viewManager;

    return _undefined;
  }

  private _getObjByKeyId(keyId: number, visibility: number) {
    return this._strategy.getObjByKeyId(keyId, visibility);
  }

  getDirectiveAtIndex(index: number) { return this._strategy.getDirectiveAtIndex(index); }

  hasInstances(): boolean { return this._constructionCounter > 0; }

  getLightDomAppInjector(): Injector { return this._lightDomAppInjector; }

  getShadowDomAppInjector(): Injector { return this._shadowDomAppInjector; }

  getHost(): ElementInjector { return this._host; }

  getBoundElementIndex(): number { return this._proto.index; }
}

interface _ElementInjectorStrategy {
  callOnDestroy(): void;
  clearInstances(): void;
  hydrate(): void;
  getComponent(): any;
  isComponentKey(key: Key): boolean;
  buildQueries(): void;
  getObjByKeyId(keyId: number, visibility: number): any;
  getDirectiveAtIndex(index: number): any;
  getComponentBinding(): DirectiveBinding;
  getMaxDirectives(): number;
}

/**
 * Strategy used by the `ElementInjector` when the number of bindings is 10 or less.
 * In such a case, inlining fields is benefitial for performances.
 */
class ElementInjectorInlineStrategy implements _ElementInjectorStrategy {
  // If this element injector has a component, the component instance will be stored in _obj0
  _obj0: any = null;
  _obj1: any = null;
  _obj2: any = null;
  _obj3: any = null;
  _obj4: any = null;
  _obj5: any = null;
  _obj6: any = null;
  _obj7: any = null;
  _obj8: any = null;
  _obj9: any = null;

  constructor(public _protoStrategy: _ProtoElementInjectorInlineStrategy,
              public _ei: ElementInjector) {}

  callOnDestroy(): void {
    var p = this._protoStrategy;

    if (p._binding0 instanceof DirectiveBinding && (<DirectiveBinding>p._binding0).callOnDestroy) {
      this._obj0.onDestroy();
    }
    if (p._binding1 instanceof DirectiveBinding && (<DirectiveBinding>p._binding1).callOnDestroy) {
      this._obj1.onDestroy();
    }
    if (p._binding2 instanceof DirectiveBinding && (<DirectiveBinding>p._binding2).callOnDestroy) {
      this._obj2.onDestroy();
    }
    if (p._binding3 instanceof DirectiveBinding && (<DirectiveBinding>p._binding3).callOnDestroy) {
      this._obj3.onDestroy();
    }
    if (p._binding4 instanceof DirectiveBinding && (<DirectiveBinding>p._binding4).callOnDestroy) {
      this._obj4.onDestroy();
    }
    if (p._binding5 instanceof DirectiveBinding && (<DirectiveBinding>p._binding5).callOnDestroy) {
      this._obj5.onDestroy();
    }
    if (p._binding6 instanceof DirectiveBinding && (<DirectiveBinding>p._binding6).callOnDestroy) {
      this._obj6.onDestroy();
    }
    if (p._binding7 instanceof DirectiveBinding && (<DirectiveBinding>p._binding7).callOnDestroy) {
      this._obj7.onDestroy();
    }
    if (p._binding8 instanceof DirectiveBinding && (<DirectiveBinding>p._binding8).callOnDestroy) {
      this._obj8.onDestroy();
    }
    if (p._binding9 instanceof DirectiveBinding && (<DirectiveBinding>p._binding9).callOnDestroy) {
      this._obj9.onDestroy();
    }
  }

  clearInstances(): void {
    this._obj0 = null;
    this._obj1 = null;
    this._obj2 = null;
    this._obj3 = null;
    this._obj4 = null;
    this._obj5 = null;
    this._obj6 = null;
    this._obj7 = null;
    this._obj8 = null;
    this._obj9 = null;
  }

  hydrate(): void {
    var p = this._protoStrategy;

    if (isPresent(p._keyId0)) this.getObjByKeyId(p._keyId0, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId1)) this.getObjByKeyId(p._keyId1, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId2)) this.getObjByKeyId(p._keyId2, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId3)) this.getObjByKeyId(p._keyId3, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId4)) this.getObjByKeyId(p._keyId4, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId5)) this.getObjByKeyId(p._keyId5, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId6)) this.getObjByKeyId(p._keyId6, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId7)) this.getObjByKeyId(p._keyId7, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId8)) this.getObjByKeyId(p._keyId8, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId9)) this.getObjByKeyId(p._keyId9, LIGHT_DOM_AND_SHADOW_DOM);
  }

  getComponent(): any { return this._obj0; }

  isComponentKey(key: Key): boolean {
    return this._ei._proto._firstBindingIsComponent && isPresent(key) &&
           key.id === this._protoStrategy._keyId0;
  }

  buildQueries(): void {
    var p = this._protoStrategy;
    if (p._binding0 instanceof DirectiveBinding) {
      this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._binding0.dependencies);
    }
    if (p._binding1 instanceof DirectiveBinding) {
      this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._binding1.dependencies);
    }
    if (p._binding2 instanceof DirectiveBinding) {
      this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._binding2.dependencies);
    }
    if (p._binding3 instanceof DirectiveBinding) {
      this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._binding3.dependencies);
    }
    if (p._binding4 instanceof DirectiveBinding) {
      this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._binding4.dependencies);
    }
    if (p._binding5 instanceof DirectiveBinding) {
      this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._binding5.dependencies);
    }
    if (p._binding6 instanceof DirectiveBinding) {
      this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._binding6.dependencies);
    }
    if (p._binding7 instanceof DirectiveBinding) {
      this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._binding7.dependencies);
    }
    if (p._binding8 instanceof DirectiveBinding) {
      this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._binding8.dependencies);
    }
    if (p._binding9 instanceof DirectiveBinding) {
      this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._binding9.dependencies);
    }
  }

  getObjByKeyId(keyId: number, visibility: number): any {
    var p = this._protoStrategy;

    if (p._keyId0 === keyId && (p._visibility0 & visibility) > 0) {
      if (isBlank(this._obj0)) {
        this._obj0 = this._ei._new(p._binding0);
      }
      return this._obj0;
    }
    if (p._keyId1 === keyId && (p._visibility1 & visibility) > 0) {
      if (isBlank(this._obj1)) {
        this._obj1 = this._ei._new(p._binding1);
      }
      return this._obj1;
    }
    if (p._keyId2 === keyId && (p._visibility2 & visibility) > 0) {
      if (isBlank(this._obj2)) {
        this._obj2 = this._ei._new(p._binding2);
      }
      return this._obj2;
    }
    if (p._keyId3 === keyId && (p._visibility3 & visibility) > 0) {
      if (isBlank(this._obj3)) {
        this._obj3 = this._ei._new(p._binding3);
      }
      return this._obj3;
    }
    if (p._keyId4 === keyId && (p._visibility4 & visibility) > 0) {
      if (isBlank(this._obj4)) {
        this._obj4 = this._ei._new(p._binding4);
      }
      return this._obj4;
    }
    if (p._keyId5 === keyId && (p._visibility5 & visibility) > 0) {
      if (isBlank(this._obj5)) {
        this._obj5 = this._ei._new(p._binding5);
      }
      return this._obj5;
    }
    if (p._keyId6 === keyId && (p._visibility6 & visibility) > 0) {
      if (isBlank(this._obj6)) {
        this._obj6 = this._ei._new(p._binding6);
      }
      return this._obj6;
    }
    if (p._keyId7 === keyId && (p._visibility7 & visibility) > 0) {
      if (isBlank(this._obj7)) {
        this._obj7 = this._ei._new(p._binding7);
      }
      return this._obj7;
    }
    if (p._keyId8 === keyId && (p._visibility8 & visibility) > 0) {
      if (isBlank(this._obj8)) {
        this._obj8 = this._ei._new(p._binding8);
      }
      return this._obj8;
    }
    if (p._keyId9 === keyId && (p._visibility9 & visibility) > 0) {
      if (isBlank(this._obj9)) {
        this._obj9 = this._ei._new(p._binding9);
      }
      return this._obj9;
    }

    return _undefined;
  }

  getDirectiveAtIndex(index: number) {
    if (index == 0) return this._obj0;
    if (index == 1) return this._obj1;
    if (index == 2) return this._obj2;
    if (index == 3) return this._obj3;
    if (index == 4) return this._obj4;
    if (index == 5) return this._obj5;
    if (index == 6) return this._obj6;
    if (index == 7) return this._obj7;
    if (index == 8) return this._obj8;
    if (index == 9) return this._obj9;
    throw new OutOfBoundsAccess(index);
  }

  getComponentBinding(): DirectiveBinding {
    return <DirectiveBinding>this._protoStrategy._binding0;
  }

  getMaxDirectives(): number { return _MAX_DIRECTIVE_CONSTRUCTION_COUNTER; }
}

/**
 * Strategy used by the `ElementInjector` when the number of bindings is 10 or less.
 * In such a case, inlining fields is benefitial for performances.
 */
class ElementInjectorDynamicStrategy implements _ElementInjectorStrategy {
  // If this element injector has a component, the component instance will be stored in _objs[0]
  _objs: List<any>;

  constructor(public _protoStrategy: _ProtoElementInjectorDynamicStrategy,
              public _ei: ElementInjector) {
    this._objs = ListWrapper.createFixedSize(_protoStrategy._bindings.length);
  }

  callOnDestroy(): void {
    var p = this._protoStrategy;

    for (var i = 0; i < p._bindings.length; i++) {
      if (p._bindings[i] instanceof DirectiveBinding &&
                                        (<DirectiveBinding>p._bindings[i]).callOnDestroy) {
        this._objs[i].onDestroy();
      }
    }
  }

  clearInstances(): void { ListWrapper.fill(this._objs, null); }

  hydrate(): void {
    var p = this._protoStrategy;

    for (var i = 0; i < p._keyIds.length; i++) {
      if (isPresent(p._keyIds[i])) {
        this.getObjByKeyId(p._keyIds[i], LIGHT_DOM_AND_SHADOW_DOM);
      }
    }
  }

  getComponent(): any { return this._objs[0]; }

  isComponentKey(key: Key): boolean {
    return this._ei._proto._firstBindingIsComponent && isPresent(key) &&
           key.id === this._protoStrategy._keyIds[0];
  }

  buildQueries(): void {
    var p = this._protoStrategy;

    for (var i = 0; i < p._bindings.length; i++) {
      if (p._bindings[i] instanceof DirectiveBinding) {
        this._ei._buildQueriesForDeps(<List<DirectiveDependency>>p._bindings[i].dependencies);
      }
    }
  }

  getObjByKeyId(keyId: number, visibility: number): any {
    var p = this._protoStrategy;

    // TODO(vicb): optimize lookup ?
    for (var i = 0; i < p._keyIds.length; i++) {
      if (p._keyIds[i] === keyId && (p._visibilities[i] & visibility) > 0) {
        if (isBlank(this._objs[i])) {
          this._objs[i] = this._ei._new(p._bindings[i]);
        }

        return this._objs[i];
      }
    }

    return _undefined;
  }

  getDirectiveAtIndex(index: number): any {
    if (index < 0 || index >= this._objs.length) {
      throw new OutOfBoundsAccess(index);
    }

    return this._objs[index];
  }

  getComponentBinding(): DirectiveBinding {
    return <DirectiveBinding>this._protoStrategy._bindings[0];
  }

  getMaxDirectives(): number { return this._objs.length; }
}

class OutOfBoundsAccess extends BaseException {
  message: string;
  constructor(index) {
    super();
    this.message = `Index ${index} is out-of-bounds.`;
  }

  toString(): string { return this.message; }
}

class QueryError extends BaseException {
  message: string;
  // TODO(rado): pass the names of the active directives.
  constructor() {
    super();
    this.message = 'Only 3 queries can be concurrently active in a template.';
  }

  toString(): string { return this.message; }
}

class QueryRef {
  constructor(public query: Query, public list: QueryList<any>,
              public originator: ElementInjector) {}

  update(): void {
    var aggregator = [];
    this.visit(this.originator, aggregator);
    this.list.reset(aggregator);
  }

  visit(inj: ElementInjector, aggregator): void {
    if (isBlank(inj) || !inj._hasQuery(this)) return;
    if (inj.hasDirective(this.query.directive)) {
      ListWrapper.push(aggregator, inj.get(this.query.directive));
    }
    var child = inj._head;
    while (isPresent(child)) {
      this.visit(child, aggregator);
      child = child._next;
    }
  }
}
