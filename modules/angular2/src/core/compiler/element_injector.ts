import {isPresent, isBlank, Type, int, BaseException, stringify} from 'angular2/src/facade/lang';
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
  onAllChangesDone
} from 'angular2/src/core/annotations_impl/annotations';
import {ChangeDetector, ChangeDetectorRef} from 'angular2/change_detection';
import {QueryList} from './query_list';
import {reflector} from 'angular2/src/reflection/reflection';
import {DirectiveMetadata} from 'angular2/src/render/api';


var _MAX_DIRECTIVE_CONSTRUCTION_COUNTER = 10;

var _undefined = new Object();

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
  _head: T;
  _tail: T;
  _next: T;
  constructor(parent: T) {
    this._head = null;
    this._tail = null;
    this._next = null;
    if (isPresent(parent)) parent.addChild(this);
  }

  _assertConsistency(): void {
    this._assertHeadBeforeTail();
    this._assertTailReachable();
    this._assertPresentInParentList();
  }

  _assertHeadBeforeTail(): void {
    if (isBlank(this._tail) && isPresent(this._head))
      throw new BaseException('null tail but non-null head');
  }

  _assertTailReachable(): void {
    if (isBlank(this._tail)) return;
    if (isPresent(this._tail._next)) throw new BaseException('node after tail');
    var p = this._head;
    while (isPresent(p) && p != this._tail) p = p._next;
    if (isBlank(p) && isPresent(this._tail)) throw new BaseException('tail not reachable.')
  }

  _assertPresentInParentList(): void {
    var p = this._parent;
    if (isBlank(p)) {
      return;
    }
    var cur = p._head;
    while (isPresent(cur) && cur != this) cur = cur._next;
    if (isBlank(cur)) throw new BaseException('node not reachable through parent.')
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
    this._assertConsistency();
  }

  /**
   * Adds a child to the parent node after a given sibling.
   * The child MUST NOT be a part of a tree and the sibling must be present.
   */
  addChildAfter(child: T, prevSibling: T): void {
    this._assertConsistency();
    if (isBlank(prevSibling)) {
      var prevHead = this._head;
      this._head = child;
      child._next = prevHead;
      if (isBlank(this._tail)) this._tail = child;
    } else if (isBlank(prevSibling._next)) {
      this.addChild(child);
      return;
    } else {
      prevSibling._assertPresentInParentList();
      child._next = prevSibling._next;
      prevSibling._next = child;
    }
    child._parent = this;
    this._assertConsistency();
  }

  /**
   * Detaches a node from the parent's tree.
   */
  remove(): void {
    this._assertConsistency();
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
    this._parent._assertConsistency();
    this._parent = null;
    this._next = null;
    this._assertConsistency();
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
  get children() {
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
              visibility: Visibility, public attributeName: string, public queryDirective) {
    super(key, asPromise, lazy, optional, properties, visibility);
    this._verify();
  }

  _verify(): void {
    var count = 0;
    if (isPresent(this.queryDirective)) count++;
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

  static _query(properties) {
    var p = ListWrapper.find(properties, (p) => p instanceof Query);
    return isPresent(p) ? resolveForwardRef(p.directive) : null;
  }
}

export class DirectiveBinding extends ResolvedBinding {
  constructor(key: Key, factory: Function, dependencies: List<Dependency>,
              providedAsPromise: boolean, public resolvedAppInjectables: List<ResolvedBinding>,
              public resolvedHostInjectables: List<ResolvedBinding>,
              public resolvedViewInjectables: List<ResolvedBinding>,
              public metadata: DirectiveMetadata) {
    super(key, factory, dependencies, providedAsPromise);
  }

  get callOnDestroy() { return this.metadata.callOnDestroy; }

  get callOnChange() { return this.metadata.callOnChange; }

  get callOnAllChangesDone() { return this.metadata.callOnAllChangesDone; }

  get displayName() { return this.key.displayName; }

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

    var metadata = new DirectiveMetadata({
      id: stringify(rb.key.token),
      type: ann instanceof
          Component ? DirectiveMetadata.COMPONENT_TYPE : DirectiveMetadata.DIRECTIVE_TYPE,
      selector: ann.selector,
      compileChildren: ann.compileChildren,
      events: ann.events,
      hostListeners:
          isPresent(ann.hostListeners) ? MapWrapper.createFromStringMap(ann.hostListeners) : null,
      hostProperties:
          isPresent(ann.hostProperties) ? MapWrapper.createFromStringMap(ann.hostProperties) : null,
      hostAttributes:
          isPresent(ann.hostAttributes) ? MapWrapper.createFromStringMap(ann.hostAttributes) : null,
      hostActions: isPresent(ann.hostActions) ? MapWrapper.createFromStringMap(ann.hostActions) :
                                                null,
      properties: isPresent(ann.properties) ? MapWrapper.createFromStringMap(ann.properties) : null,
      readAttributes: DirectiveBinding._readAttributes(deps),
      callOnDestroy: ann.hasLifecycleHook(onDestroy),
      callOnChange: ann.hasLifecycleHook(onChange),
      callOnAllChangesDone: ann.hasLifecycleHook(onAllChangesDone),
      changeDetection: ann instanceof
          Component ? ann.changeDetection : null
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
    return ListWrapper.map(db.eventEmitters, eventName => new EventEmitterAccessor(
                                                 eventName, reflector.getter(eventName)));
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
  // only _binding0 can contain a component
  _binding0: ResolvedBinding;
  _binding1: ResolvedBinding;
  _binding2: ResolvedBinding;
  _binding3: ResolvedBinding;
  _binding4: ResolvedBinding;
  _binding5: ResolvedBinding;
  _binding6: ResolvedBinding;
  _binding7: ResolvedBinding;
  _binding8: ResolvedBinding;
  _binding9: ResolvedBinding;

  _keyId0: int;
  _keyId1: int;
  _keyId2: int;
  _keyId3: int;
  _keyId4: int;
  _keyId5: int;
  _keyId6: int;
  _keyId7: int;
  _keyId8: int;
  _keyId9: int;

  _visibility0: number;
  _visibility1: number;
  _visibility2: number;
  _visibility3: number;
  _visibility4: number;
  _visibility5: number;
  _visibility6: number;
  _visibility7: number;
  _visibility8: number;
  _visibility9: number;

  parent: ProtoElementInjector;
  index: int;
  view: viewModule.AppView;
  distanceToParent: number;
  attributes: Map<string, string>;
  eventEmitterAccessors: List<List<EventEmitterAccessor>>;
  hostActionAccessors: List<List<HostActionAccessor>>;

  /** Whether the element is exported as $implicit. */
  exportElement: boolean;

  /** Whether the component instance is exported as $implicit. */
  exportComponent: boolean;

  /** The variable name that will be set to $implicit for the element. */
  exportImplicitName: string;

  _firstBindingIsComponent: boolean;

  static create(parent: ProtoElementInjector, index: int, bindings: List<ResolvedBinding>,
                firstBindingIsComponent: boolean, distanceToParent: number) {
    var bd = [];

    ProtoElementInjector._createDirectiveBindingData(bindings, bd, firstBindingIsComponent);
    ProtoElementInjector._createHostInjectorBindingData(bindings, bd);
    if (firstBindingIsComponent) {
      ProtoElementInjector._createViewInjectorBindingData(bindings, bd);
    }

    return new ProtoElementInjector(parent, index, bd, distanceToParent, firstBindingIsComponent);
  }

  private static _createDirectiveBindingData(bindings: List<ResolvedBinding>, bd: List<BindingData>,
                                             firstBindingIsComponent: boolean) {
    if (firstBindingIsComponent) {
      ListWrapper.push(bd, new BindingData(bindings[0], LIGHT_DOM_AND_SHADOW_DOM));
      for (var i = 1; i < bindings.length; ++i) {
        ListWrapper.push(bd, new BindingData(bindings[i], LIGHT_DOM));
      }
    } else {
      ListWrapper.forEach(bindings, b => {ListWrapper.push(bd, new BindingData(b, LIGHT_DOM))});
    }
  }

  private static _createHostInjectorBindingData(bindings: List<ResolvedBinding>,
                                                bd: List<BindingData>) {
    ListWrapper.forEach(bindings, b => {
      ListWrapper.forEach(b.resolvedHostInjectables, b => {
        ListWrapper.push(bd, new BindingData(ProtoElementInjector._createBinding(b), LIGHT_DOM));
      });
    });
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

  constructor(parent: ProtoElementInjector, index: int, bd: List<BindingData>,
              distanceToParent: number, firstBindingIsComponent: boolean) {
    this.parent = parent;
    this.index = index;
    this.distanceToParent = distanceToParent;
    this.exportComponent = false;
    this.exportElement = false;
    this._firstBindingIsComponent = firstBindingIsComponent;

    this._binding0 = null;
    this._keyId0 = null;
    this._visibility0 = null;
    this._binding1 = null;
    this._keyId1 = null;
    this._visibility1 = null;
    this._binding2 = null;
    this._keyId2 = null;
    this._visibility2 = null;
    this._binding3 = null;
    this._keyId3 = null;
    this._visibility3 = null;
    this._binding4 = null;
    this._keyId4 = null;
    this._visibility4 = null;
    this._binding5 = null;
    this._keyId5 = null;
    this._visibility5 = null;
    this._binding6 = null;
    this._keyId6 = null;
    this._visibility6 = null;
    this._binding7 = null;
    this._keyId7 = null;
    this._visibility7 = null;
    this._binding8 = null;
    this._keyId8 = null;
    this._visibility8 = null;
    this._binding9 = null;
    this._keyId9 = null;
    this._visibility9 = null;

    var length = bd.length;
    this.eventEmitterAccessors = ListWrapper.createFixedSize(length);
    this.hostActionAccessors = ListWrapper.createFixedSize(length);

    if (length > 0) {
      this._binding0 = bd[0].binding;
      this._keyId0 = bd[0].getKeyId();
      this._visibility0 = bd[0].visibility;
      this.eventEmitterAccessors[0] = bd[0].createEventEmitterAccessors();
      this.hostActionAccessors[0] = bd[0].createHostActionAccessors();
    }
    if (length > 1) {
      this._binding1 = bd[1].binding;
      this._keyId1 = bd[1].getKeyId();
      this._visibility1 = bd[1].visibility;
      this.eventEmitterAccessors[1] = bd[1].createEventEmitterAccessors();
      this.hostActionAccessors[1] = bd[1].createHostActionAccessors();
    }
    if (length > 2) {
      this._binding2 = bd[2].binding;
      this._keyId2 = bd[2].getKeyId();
      this._visibility2 = bd[2].visibility;
      this.eventEmitterAccessors[2] = bd[2].createEventEmitterAccessors();
      this.hostActionAccessors[2] = bd[2].createHostActionAccessors();
    }
    if (length > 3) {
      this._binding3 = bd[3].binding;
      this._keyId3 = bd[3].getKeyId();
      this._visibility3 = bd[3].visibility;
      this.eventEmitterAccessors[3] = bd[3].createEventEmitterAccessors();
      this.hostActionAccessors[3] = bd[3].createHostActionAccessors();
    }
    if (length > 4) {
      this._binding4 = bd[4].binding;
      this._keyId4 = bd[4].getKeyId();
      this._visibility4 = bd[4].visibility;
      this.eventEmitterAccessors[4] = bd[4].createEventEmitterAccessors();
      this.hostActionAccessors[4] = bd[4].createHostActionAccessors();
    }
    if (length > 5) {
      this._binding5 = bd[5].binding;
      this._keyId5 = bd[5].getKeyId();
      this._visibility5 = bd[5].visibility;
      this.eventEmitterAccessors[5] = bd[5].createEventEmitterAccessors();
      this.hostActionAccessors[5] = bd[5].createHostActionAccessors();
    }
    if (length > 6) {
      this._binding6 = bd[6].binding;
      this._keyId6 = bd[6].getKeyId();
      this._visibility6 = bd[6].visibility;
      this.eventEmitterAccessors[6] = bd[6].createEventEmitterAccessors();
      this.hostActionAccessors[6] = bd[6].createHostActionAccessors();
    }
    if (length > 7) {
      this._binding7 = bd[7].binding;
      this._keyId7 = bd[7].getKeyId();
      this._visibility7 = bd[7].visibility;
      this.eventEmitterAccessors[7] = bd[7].createEventEmitterAccessors();
      this.hostActionAccessors[7] = bd[7].createHostActionAccessors();
    }
    if (length > 8) {
      this._binding8 = bd[8].binding;
      this._keyId8 = bd[8].getKeyId();
      this._visibility8 = bd[8].visibility;
      this.eventEmitterAccessors[8] = bd[8].createEventEmitterAccessors();
      this.hostActionAccessors[8] = bd[8].createHostActionAccessors();
    }
    if (length > 9) {
      this._binding9 = bd[9].binding;
      this._keyId9 = bd[9].getKeyId();
      this._visibility9 = bd[9].visibility;
      this.eventEmitterAccessors[9] = bd[9].createEventEmitterAccessors();
      this.hostActionAccessors[9] = bd[9].createHostActionAccessors();
    }
    if (length > 10) {
      throw 'Maximum number of directives per element has been reached.';
    }
  }

  instantiate(parent: ElementInjector): ElementInjector {
    return new ElementInjector(this, parent);
  }

  directParent(): ProtoElementInjector { return this.distanceToParent < 2 ? this.parent : null; }

  get hasBindings(): boolean { return isPresent(this._binding0); }

  getBindingAtIndex(index: int) {
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
}

export class ElementInjector extends TreeNode<ElementInjector> {
  private _proto: ProtoElementInjector;
  private _lightDomAppInjector: Injector;
  private _shadowDomAppInjector: Injector;
  private _host: ElementInjector;

  // If this element injector has a component, the component instance will be stored in _obj0
  private _obj0: any;
  private _obj1: any;
  private _obj2: any;
  private _obj3: any;
  private _obj4: any;
  private _obj5: any;
  private _obj6: any;
  private _obj7: any;
  private _obj8: any;
  private _obj9: any;
  private _preBuiltObjects;
  private _constructionCounter;

  private _dynamicallyCreatedComponent: any;
  private _dynamicallyCreatedComponentBinding: DirectiveBinding;

  // Queries are added during construction or linking with a new parent.
  // They are never removed.
  private _query0: QueryRef;
  private _query1: QueryRef;
  private _query2: QueryRef;

  constructor(proto: ProtoElementInjector, parent: ElementInjector) {
    super(parent);
    this._proto = proto;

    // we cannot call dehydrate because fields won't be detected
    this._preBuiltObjects = null;
    this._lightDomAppInjector = null;
    this._shadowDomAppInjector = null;
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
    this._constructionCounter = 0;

    this._inheritQueries(parent);
    this._buildQueries();
  }

  dehydrate() {
    this._host = null;
    this._preBuiltObjects = null;
    this._lightDomAppInjector = null;
    this._shadowDomAppInjector = null;

    var p = this._proto;

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
    if (isPresent(this._dynamicallyCreatedComponentBinding) &&
        this._dynamicallyCreatedComponentBinding.callOnDestroy) {
      this._dynamicallyCreatedComponent.onDestroy();
    }

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
    this._dynamicallyCreatedComponent = null;
    this._dynamicallyCreatedComponentBinding = null;

    this._constructionCounter = 0;
  }


  hydrate(injector: Injector, host: ElementInjector, preBuiltObjects: PreBuiltObjects) {
    var p = this._proto;

    this._host = host;
    this._lightDomAppInjector = injector;
    this._preBuiltObjects = preBuiltObjects;

    if (p._firstBindingIsComponent) {
      this._shadowDomAppInjector =
          this._createShadowDomAppInjector(<DirectiveBinding>p._binding0, injector);
    }

    this._checkShadowDomAppInjector(this._shadowDomAppInjector);

    if (isPresent(p._keyId0)) this._getObjByKeyId(p._keyId0, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId1)) this._getObjByKeyId(p._keyId1, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId2)) this._getObjByKeyId(p._keyId2, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId3)) this._getObjByKeyId(p._keyId3, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId4)) this._getObjByKeyId(p._keyId4, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId5)) this._getObjByKeyId(p._keyId5, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId6)) this._getObjByKeyId(p._keyId6, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId7)) this._getObjByKeyId(p._keyId7, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId8)) this._getObjByKeyId(p._keyId8, LIGHT_DOM_AND_SHADOW_DOM);
    if (isPresent(p._keyId9)) this._getObjByKeyId(p._keyId9, LIGHT_DOM_AND_SHADOW_DOM);
  }

  private _createShadowDomAppInjector(componentDirective: DirectiveBinding, appInjector: Injector) {
    if (!ListWrapper.isEmpty(componentDirective.resolvedAppInjectables)) {
      return appInjector.createChildFromResolved(componentDirective.resolvedAppInjectables);
    } else {
      return appInjector;
    }
  }

  dynamicallyCreateComponent(componentDirective: DirectiveBinding, parentInjector: Injector) {
    this._shadowDomAppInjector =
        this._createShadowDomAppInjector(componentDirective, parentInjector);
    this._dynamicallyCreatedComponentBinding = componentDirective;
    this._dynamicallyCreatedComponent = this._new(this._dynamicallyCreatedComponentBinding);
    return this._dynamicallyCreatedComponent;
  }

  private _checkShadowDomAppInjector(shadowDomAppInjector: Injector) {
    if (this._proto._firstBindingIsComponent && isBlank(shadowDomAppInjector)) {
      throw new BaseException(
          'A shadowDomAppInjector is required as this ElementInjector contains a component');
    } else if (!this._proto._firstBindingIsComponent && isPresent(shadowDomAppInjector)) {
      throw new BaseException(
          'No shadowDomAppInjector allowed as there is not component stored in this ElementInjector');
    }
  }

  get(token) {
    if (this._isDynamicallyLoadedComponent(token)) {
      return this._dynamicallyCreatedComponent;
    }

    return this._getByKey(Key.get(token), self, false, null);
  }

  private _isDynamicallyLoadedComponent(token) {
    return isPresent(this._dynamicallyCreatedComponentBinding) &&
           Key.get(token) === this._dynamicallyCreatedComponentBinding.key;
  }

  hasDirective(type: Type): boolean {
    return this._getObjByKeyId(Key.get(type).id, LIGHT_DOM_AND_SHADOW_DOM) !== _undefined;
  }

  getEventEmitterAccessors() { return this._proto.eventEmitterAccessors; }

  getHostActionAccessors() { return this._proto.hostActionAccessors; }

  getComponent() { return this._obj0; }

  getElementRef() {
    return new ElementRef(new ViewRef(this._preBuiltObjects.view), this._proto.index);
  }

  getViewContainerRef() {
    return new ViewContainerRef(this._preBuiltObjects.viewManager, this.getElementRef());
  }

  getDynamicallyLoadedComponent() { return this._dynamicallyCreatedComponent; }

  directParent(): ElementInjector { return this._proto.distanceToParent < 2 ? this.parent : null; }

  private _isComponentKey(key: Key) {
    return this._proto._firstBindingIsComponent && isPresent(key) && key.id === this._proto._keyId0;
  }

  private _isDynamicallyLoadedComponentKey(key: Key) {
    return isPresent(this._dynamicallyCreatedComponentBinding) &&
           key.id === this._dynamicallyCreatedComponentBinding.key.id;
  }

  private _new(binding: ResolvedBinding) {
    if (this._constructionCounter++ > _MAX_DIRECTIVE_CONSTRUCTION_COUNTER) {
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
      default:
        throw `Directive ${binding.key.token} can only have up to 10 dependencies.`;
    }

    this._addToQueries(obj, binding.key.token);

    return obj;
  }

  private _getByDependency(dep: DependencyWithVisibility, requestor: Key) {
    if (!(dep instanceof DirectiveDependency)) {
      return this._getByKey(dep.key, dep.visibility, dep.optional, requestor);
    }

    var dirDep = <DirectiveDependency>dep;

    if (isPresent(dirDep.attributeName)) return this._buildAttribute(dirDep);
    if (isPresent(dirDep.queryDirective)) return this._findQuery(dirDep.queryDirective).list;
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

  private _buildAttribute(dep): string {
    var attributes = this._proto.attributes;
    if (isPresent(attributes) && MapWrapper.contains(attributes, dep.attributeName)) {
      return MapWrapper.get(attributes, dep.attributeName);
    } else {
      return null;
    }
  }

  private _buildQueriesForDeps(deps: List<DirectiveDependency>) {
    for (var i = 0; i < deps.length; i++) {
      var dep = deps[i];
      if (isPresent(dep.queryDirective)) {
        this._createQueryRef(dep.queryDirective);
      }
    }
  }

  private _createQueryRef(directive) {
    var queryList = new QueryList();
    if (isBlank(this._query0)) {
      this._query0 = new QueryRef(directive, queryList, this);
    } else if (isBlank(this._query1)) {
      this._query1 = new QueryRef(directive, queryList, this);
    } else if (isBlank(this._query2)) {
      this._query2 = new QueryRef(directive, queryList, this);
    } else
      throw new QueryError();
  }

  private _addToQueries(obj, token) {
    if (isPresent(this._query0) && (this._query0.directive === token)) {
      this._query0.list.add(obj);
    }
    if (isPresent(this._query1) && (this._query1.directive === token)) {
      this._query1.list.add(obj);
    }
    if (isPresent(this._query2) && (this._query2.directive === token)) {
      this._query2.list.add(obj);
    }
  }

  // TODO(rado): unify with _addParentQueries.
  private _inheritQueries(parent: ElementInjector) {
    if (isBlank(parent)) return;
    if (isPresent(parent._query0)) {
      this._query0 = parent._query0;
    }
    if (isPresent(parent._query1)) {
      this._query1 = parent._query1;
    }
    if (isPresent(parent._query2)) {
      this._query2 = parent._query2;
    }
  }

  private _buildQueries() {
    if (isBlank(this._proto)) return;
    var p = this._proto;
    if (p._binding0 instanceof DirectiveBinding) {
      this._buildQueriesForDeps(<List<DirectiveDependency>>p._binding0.dependencies);
    }
    if (p._binding1 instanceof DirectiveBinding) {
      this._buildQueriesForDeps(<List<DirectiveDependency>>p._binding1.dependencies);
    }
    if (p._binding2 instanceof DirectiveBinding) {
      this._buildQueriesForDeps(<List<DirectiveDependency>>p._binding2.dependencies);
    }
    if (p._binding3 instanceof DirectiveBinding) {
      this._buildQueriesForDeps(<List<DirectiveDependency>>p._binding3.dependencies);
    }
    if (p._binding4 instanceof DirectiveBinding) {
      this._buildQueriesForDeps(<List<DirectiveDependency>>p._binding4.dependencies);
    }
    if (p._binding5 instanceof DirectiveBinding) {
      this._buildQueriesForDeps(<List<DirectiveDependency>>p._binding5.dependencies);
    }
    if (p._binding6 instanceof DirectiveBinding) {
      this._buildQueriesForDeps(<List<DirectiveDependency>>p._binding6.dependencies);
    }
    if (p._binding7 instanceof DirectiveBinding) {
      this._buildQueriesForDeps(<List<DirectiveDependency>>p._binding7.dependencies);
    }
    if (p._binding8 instanceof DirectiveBinding) {
      this._buildQueriesForDeps(<List<DirectiveDependency>>p._binding8.dependencies);
    }
    if (p._binding9 instanceof DirectiveBinding) {
      this._buildQueriesForDeps(<List<DirectiveDependency>>p._binding9.dependencies);
    }
  }

  private _findQuery(token) {
    if (isPresent(this._query0) && this._query0.directive === token) {
      return this._query0;
    }
    if (isPresent(this._query1) && this._query1.directive === token) {
      return this._query1;
    }
    if (isPresent(this._query2) && this._query2.directive === token) {
      return this._query2;
    }
    throw new BaseException(`Cannot find query for directive ${token}.`);
  }

  link(parent: ElementInjector) {
    parent.addChild(this);
    this._addParentQueries();
  }

  linkAfter(parent: ElementInjector, prevSibling: ElementInjector) {
    parent.addChildAfter(this, prevSibling);
    this._addParentQueries();
  }

  private _addParentQueries() {
    if (isPresent(this.parent._query0)) {
      this._addQueryToTree(this.parent._query0);
      this.parent._query0.update();
    }
    if (isPresent(this.parent._query1)) {
      this._addQueryToTree(this.parent._query1);
      this.parent._query1.update();
    }
    if (isPresent(this.parent._query2)) {
      this._addQueryToTree(this.parent._query2);
      this.parent._query2.update();
    }
  }

  unlink() {
    var queriesToUpDate = [];
    if (isPresent(this.parent._query0)) {
      this._pruneQueryFromTree(this.parent._query0);
      ListWrapper.push(queriesToUpDate, this.parent._query0);
    }
    if (isPresent(this.parent._query1)) {
      this._pruneQueryFromTree(this.parent._query1);
      ListWrapper.push(queriesToUpDate, this.parent._query1);
    }
    if (isPresent(this.parent._query2)) {
      this._pruneQueryFromTree(this.parent._query2);
      ListWrapper.push(queriesToUpDate, this.parent._query2);
    }

    this.remove();

    ListWrapper.forEach(queriesToUpDate, (q) => q.update());
  }


  private _pruneQueryFromTree(query: QueryRef) {
    this._removeQueryRef(query);

    var child = this._head;
    while (isPresent(child)) {
      child._pruneQueryFromTree(query);
      child = child._next;
    }
  }

  private _addQueryToTree(query: QueryRef) {
    this._assignQueryRef(query);

    var child = this._head;
    while (isPresent(child)) {
      child._addQueryToTree(query);
      child = child._next;
    }
  }

  private _assignQueryRef(query: QueryRef) {
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

  private _removeQueryRef(query: QueryRef) {
    if (this._query0 == query) this._query0 = null;
    if (this._query1 == query) this._query1 = null;
    if (this._query2 == query) this._query2 = null;
  }

  private _getByKey(key: Key, visibility: Visibility, optional: boolean, requestor: Key) {
    var ei = this;

    var currentVisibility = this._isComponentKey(requestor) ?
                                LIGHT_DOM_AND_SHADOW_DOM :  // component can access both shadow dom
                                                            // and light dom dependencies
                                LIGHT_DOM;

    var depth = visibility.depth;

    if (!visibility.shouldIncludeSelf()) {
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

  private _appInjector(requestor: Key) {
    if (isPresent(requestor) &&
        (this._isComponentKey(requestor) || this._isDynamicallyLoadedComponentKey(requestor))) {
      return this._shadowDomAppInjector;
    } else {
      return this._lightDomAppInjector;
    }
  }

  private _getPreBuiltObjectByKeyId(keyId: int) {
    var staticKeys = StaticKeys.instance();
    if (keyId === staticKeys.viewManagerId) return this._preBuiltObjects.viewManager;

    // TODO add other objects as needed
    return _undefined;
  }

  private _getObjByKeyId(keyId: int, visibility: number) {
    var p = this._proto;

    if (p._keyId0 === keyId && (p._visibility0 & visibility) > 0) {
      if (isBlank(this._obj0)) {
        this._obj0 = this._new(p._binding0);
      }
      return this._obj0;
    }
    if (p._keyId1 === keyId && (p._visibility1 & visibility) > 0) {
      if (isBlank(this._obj1)) {
        this._obj1 = this._new(p._binding1);
      }
      return this._obj1;
    }
    if (p._keyId2 === keyId && (p._visibility2 & visibility) > 0) {
      if (isBlank(this._obj2)) {
        this._obj2 = this._new(p._binding2);
      }
      return this._obj2;
    }
    if (p._keyId3 === keyId && (p._visibility3 & visibility) > 0) {
      if (isBlank(this._obj3)) {
        this._obj3 = this._new(p._binding3);
      }
      return this._obj3;
    }
    if (p._keyId4 === keyId && (p._visibility4 & visibility) > 0) {
      if (isBlank(this._obj4)) {
        this._obj4 = this._new(p._binding4);
      }
      return this._obj4;
    }
    if (p._keyId5 === keyId && (p._visibility5 & visibility) > 0) {
      if (isBlank(this._obj5)) {
        this._obj5 = this._new(p._binding5);
      }
      return this._obj5;
    }
    if (p._keyId6 === keyId && (p._visibility6 & visibility) > 0) {
      if (isBlank(this._obj6)) {
        this._obj6 = this._new(p._binding6);
      }
      return this._obj6;
    }
    if (p._keyId7 === keyId && (p._visibility7 & visibility) > 0) {
      if (isBlank(this._obj7)) {
        this._obj7 = this._new(p._binding7);
      }
      return this._obj7;
    }
    if (p._keyId8 === keyId && (p._visibility8 & visibility) > 0) {
      if (isBlank(this._obj8)) {
        this._obj8 = this._new(p._binding8);
      }
      return this._obj8;
    }
    if (p._keyId9 === keyId && (p._visibility9 & visibility) > 0) {
      if (isBlank(this._obj9)) {
        this._obj9 = this._new(p._binding9);
      }
      return this._obj9;
    }

    return _undefined;
  }

  getDirectiveAtIndex(index: int) {
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

  hasInstances() { return this._constructionCounter > 0; }

  /** Gets whether this element is exporting a component instance as $implicit. */
  isExportingComponent() { return this._proto.exportComponent; }

  /** Gets whether this element is exporting its element as $implicit. */
  isExportingElement() { return this._proto.exportElement; }

  /** Get the name to which this element's $implicit is to be assigned. */
  getExportImplicitName() { return this._proto.exportImplicitName; }

  getLightDomAppInjector() { return this._lightDomAppInjector; }

  getShadowDomAppInjector() { return this._shadowDomAppInjector; }

  getHost() { return this._host; }

  getBoundElementIndex() { return this._proto.index; }
}

class OutOfBoundsAccess extends BaseException {
  message: string;
  constructor(index) {
    super();
    this.message = `Index ${index} is out-of-bounds.`;
  }

  toString() { return this.message; }
}

class QueryError extends BaseException {
  message: string;
  // TODO(rado): pass the names of the active directives.
  constructor() {
    super();
    this.message = 'Only 3 queries can be concurrently active in a template.';
  }

  toString() { return this.message; }
}

class QueryRef {
  directive;
  list: QueryList;
  originator: ElementInjector;
  constructor(directive, list: QueryList, originator: ElementInjector) {
    this.directive = directive;
    this.list = list;
    this.originator = originator;
  }

  update() {
    var aggregator = [];
    this.visit(this.originator, aggregator);
    this.list.reset(aggregator);
  }

  visit(inj: ElementInjector, aggregator) {
    if (isBlank(inj)) return;
    if (inj.hasDirective(this.directive)) {
      ListWrapper.push(aggregator, inj.get(this.directive));
    }
    var child = inj._head;
    while (isPresent(child)) {
      this.visit(child, aggregator);
      child = child._next;
    }
  }
}
