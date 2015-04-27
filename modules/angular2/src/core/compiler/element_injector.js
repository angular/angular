import {isPresent, isBlank, Type, int, BaseException} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {Math} from 'angular2/src/facade/math';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {Injector, Key, Dependency, bind, Binding, ResolvedBinding, NoBindingError,
  AbstractBindingError, CyclicDependencyError} from 'angular2/di';
import {Parent, Ancestor} from 'angular2/src/core/annotations/visibility';
import {Attribute, Query} from 'angular2/src/core/annotations/di';
import * as viewModule from 'angular2/src/core/compiler/view';
import * as avmModule from './view_manager';
import {ViewContainerRef} from 'angular2/src/core/compiler/view_container_ref';
import {NgElement} from 'angular2/src/core/compiler/ng_element';
import {Directive, Component, onChange, onDestroy, onAllChangesDone} from 'angular2/src/core/annotations/annotations';
import {ChangeDetector, ChangeDetectorRef} from 'angular2/change_detection';
import {QueryList} from './query_list';
import {reflector} from 'angular2/src/reflection/reflection';

var _MAX_DIRECTIVE_CONSTRUCTION_COUNTER = 10;

var MAX_DEPTH = Math.pow(2, 30) - 1;

var _undefined = new Object();

var _staticKeys;

/**
 * @exportedAs angular2/view
 */
export class ElementRef {
  hostView:viewModule.AppView;
  boundElementIndex:number;
  injector:Injector;
  elementInjector:ElementInjector;
  viewContainer:ViewContainerRef;

  constructor(elementInjector, hostView, boundElementIndex, injector, viewManager, defaultProtoView){
    this.elementInjector = elementInjector;
    this.hostView = hostView;
    this.boundElementIndex = boundElementIndex;
    this.injector = injector;
    this.viewContainer = new ViewContainerRef(viewManager, this, defaultProtoView);
  }
}

class StaticKeys {
  viewManagerId:number;
  viewId:number;
  ngElementId:number;
  defaultProtoViewId:number;
  viewContainerId:number;
  changeDetectorRefId:number;
  elementRefId:number;

  constructor() {
    //TODO: vsavkin Key.annotate(Key.get(AppView), 'static')
    this.viewManagerId = Key.get(avmModule.AppViewManager).id;
    this.defaultProtoViewId = Key.get(viewModule.AppProtoView).id;
    this.viewId = Key.get(viewModule.AppView).id;
    this.ngElementId = Key.get(NgElement).id;
    this.viewContainerId = Key.get(ViewContainerRef).id;
    this.changeDetectorRefId = Key.get(ChangeDetectorRef).id;
    this.elementRefId = Key.get(ElementRef).id;
  }

  static instance():StaticKeys {
    if (isBlank(_staticKeys)) _staticKeys = new StaticKeys();
    return _staticKeys;
  }
}

export class TreeNode {
  _parent:TreeNode;
  _head:TreeNode;
  _tail:TreeNode;
  _next:TreeNode;
  constructor(parent:TreeNode) {
    this._head = null;
    this._tail = null;
    this._next = null;
    if (isPresent(parent)) parent.addChild(this);
  }

  _assertConsistency():void {
    this._assertHeadBeforeTail();
    this._assertTailReachable();
    this._assertPresentInParentList();
  }

  _assertHeadBeforeTail():void {
    if (isBlank(this._tail) && isPresent(this._head)) throw new BaseException('null tail but non-null head');
  }

  _assertTailReachable():void {
    if (isBlank(this._tail)) return;
    if (isPresent(this._tail._next)) throw new BaseException('node after tail');
    var p = this._head;
    while (isPresent(p) && p != this._tail) p = p._next;
    if (isBlank(p) && isPresent(this._tail)) throw new BaseException('tail not reachable.')
  }

  _assertPresentInParentList():void {
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
  addChild(child:TreeNode):void {
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
  addChildAfter(child:TreeNode, prevSibling:TreeNode):void {
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
  remove():void {
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

  get parent() {
    return this._parent;
  }

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

export class DirectiveDependency extends Dependency {
  depth:int;
  attributeName:string;
  queryDirective;

  constructor(key:Key, asPromise:boolean, lazy:boolean, optional:boolean, properties:List,
              depth:int, attributeName:string, queryDirective) {
    super(key, asPromise, lazy, optional, properties);
    this.depth = depth;
    this.attributeName = attributeName;
    this.queryDirective = queryDirective;
    this._verify();
  }

  _verify():void {
    var count = 0;
    if (isPresent(this.queryDirective)) count++;
    if (isPresent(this.attributeName)) count++;
    if (count > 1) throw new BaseException(
      'A directive injectable can contain only one of the following @Attribute or @Query.');
  }

  static createFrom(d:Dependency):Dependency {
    return new DirectiveDependency(d.key, d.asPromise, d.lazy, d.optional,
      d.properties, DirectiveDependency._depth(d.properties),
      DirectiveDependency._attributeName(d.properties),
      DirectiveDependency._query(d.properties)
    );
  }

  static _depth(properties):int {
    if (properties.length == 0) return 0;
    if (ListWrapper.any(properties, p => p instanceof Parent)) return 1;
    if (ListWrapper.any(properties, p => p instanceof Ancestor)) return MAX_DEPTH;
    return 0;
  }

  static _attributeName(properties):string {
    var p = ListWrapper.find(properties, (p) => p instanceof Attribute);
    return isPresent(p) ? p.attributeName : null;
  }

  static _query(properties) {
    var p = ListWrapper.find(properties, (p) => p instanceof Query);
    return isPresent(p) ? p.directive : null;
  }
}

export class DirectiveBinding extends ResolvedBinding {
  callOnDestroy:boolean;
  callOnChange:boolean;
  callOnAllChangesDone:boolean;
  annotation:Directive;
  resolvedInjectables:List<ResolvedBinding>;

  constructor(key:Key, factory:Function, dependencies:List, providedAsPromise:boolean, annotation:Directive) {
    super(key, factory, dependencies, providedAsPromise);
    this.callOnDestroy = isPresent(annotation) && annotation.hasLifecycleHook(onDestroy);
    this.callOnChange = isPresent(annotation) && annotation.hasLifecycleHook(onChange);
    this.callOnAllChangesDone = isPresent(annotation) && annotation.hasLifecycleHook(onAllChangesDone);
    this.annotation = annotation;
    if (annotation instanceof Component && isPresent(annotation.injectables)) {
      this.resolvedInjectables = Injector.resolve(annotation.injectables);
    }
  }

  get displayName() {
    return this.key.displayName;
  }

  get eventEmitters():List<string> {
    return isPresent(this.annotation) && isPresent(this.annotation.events) ? this.annotation.events : [];
  }

  get changeDetection() {
    if (this.annotation instanceof Component) {
      var c:Component = this.annotation;
      return c.changeDetection;
    } else {
      return null;
    }
  }

  static createFromBinding(b:Binding, annotation:Directive):DirectiveBinding {
    var rb = b.resolve();
    var deps = ListWrapper.map(rb.dependencies, DirectiveDependency.createFrom);
    return new DirectiveBinding(rb.key, rb.factory, deps, rb.providedAsPromise, annotation);
  }

  static createFromType(type:Type, annotation:Directive):DirectiveBinding {
    var binding = new Binding(type, {toClass: type});
    return DirectiveBinding.createFromBinding(binding, annotation);
  }
}

// TODO(rado): benchmark and consider rolling in as ElementInjector fields.
export class PreBuiltObjects {
  viewManager:avmModule.AppViewManager;
  defaultProtoView:viewModule.AppProtoView;
  view:viewModule.AppView;
  element:NgElement;
  constructor(viewManager:avmModule.AppViewManager, view:viewModule.AppView, element:NgElement, defaultProtoView:viewModule.AppProtoView) {
    this.viewManager = viewManager;
    this.view = view;
    this.defaultProtoView = defaultProtoView;
    this.element = element;
  }
}

class EventEmitterAccessor {
  eventName:string;
  getter:Function;

  constructor(eventName:string, getter:Function) {
    this.eventName = eventName;
    this.getter = getter;
  }

  subscribe(view:viewModule.AppView, boundElementIndex:number, directive:Object) {
    var eventEmitter = this.getter(directive);
    return ObservableWrapper.subscribe(eventEmitter,
        eventObj => view.triggerEventHandlers(this.eventName, eventObj, boundElementIndex));
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

 PERF BENCHMARK: http://www.williambrownstreet.net/blog/2014/04/faster-angularjs-rendering-angularjs-and-reactjs/
 */


export class ProtoElementInjector  {
  _binding0:DirectiveBinding;
  _binding1:DirectiveBinding;
  _binding2:DirectiveBinding;
  _binding3:DirectiveBinding;
  _binding4:DirectiveBinding;
  _binding5:DirectiveBinding;
  _binding6:DirectiveBinding;
  _binding7:DirectiveBinding;
  _binding8:DirectiveBinding;
  _binding9:DirectiveBinding;
  _binding0IsComponent:boolean;
  _keyId0:int;
  _keyId1:int;
  _keyId2:int;
  _keyId3:int;
  _keyId4:int;
  _keyId5:int;
  _keyId6:int;
  _keyId7:int;
  _keyId8:int;
  _keyId9:int;
  parent:ProtoElementInjector;
  index:int;
  view:viewModule.AppView;
  distanceToParent:number;
  attributes:Map;
  eventEmitterAccessors:List<List<EventEmitterAccessor>>;

  numberOfDirectives:number;

  /** Whether the element is exported as $implicit. */
  exportElement:boolean;

  /** Whether the component instance is exported as $implicit. */
  exportComponent:boolean;

  /** The variable name that will be set to $implicit for the element. */
  exportImplicitName:string;

  constructor(parent:ProtoElementInjector, index:int, bindings:List, firstBindingIsComponent:boolean = false, distanceToParent:number = 0) {
    this.parent = parent;
    this.index = index;
    this.distanceToParent = distanceToParent;
    this.exportComponent = false;
    this.exportElement = false;

    this._binding0IsComponent = firstBindingIsComponent;
    this._binding0 = null; this._keyId0 = null;
    this._binding1 = null; this._keyId1 = null;
    this._binding2 = null; this._keyId2 = null;
    this._binding3 = null; this._keyId3 = null;
    this._binding4 = null; this._keyId4 = null;
    this._binding5 = null; this._keyId5 = null;
    this._binding6 = null; this._keyId6 = null;
    this._binding7 = null; this._keyId7 = null;
    this._binding8 = null; this._keyId8 = null;
    this._binding9 = null; this._keyId9 = null;

    this.numberOfDirectives = bindings.length;
    var length = bindings.length;
    this.eventEmitterAccessors = ListWrapper.createFixedSize(length);

    if (length > 0) {
      this._binding0 = this._createBinding(bindings[0]);
      this._keyId0 = this._binding0.key.id;
      this.eventEmitterAccessors[0] = this._createEventEmitterAccessors(this._binding0);
    }
    if (length > 1) {
      this._binding1 = this._createBinding(bindings[1]);
      this._keyId1 = this._binding1.key.id;
      this.eventEmitterAccessors[1] = this._createEventEmitterAccessors(this._binding1);
    }
    if (length > 2) {
      this._binding2 = this._createBinding(bindings[2]);
      this._keyId2 = this._binding2.key.id;
      this.eventEmitterAccessors[2] = this._createEventEmitterAccessors(this._binding2);
    }
    if (length > 3) {
      this._binding3 = this._createBinding(bindings[3]);
      this._keyId3 = this._binding3.key.id;
      this.eventEmitterAccessors[3] = this._createEventEmitterAccessors(this._binding3);
    }
    if (length > 4) {
      this._binding4 = this._createBinding(bindings[4]);
      this._keyId4 = this._binding4.key.id;
      this.eventEmitterAccessors[4] = this._createEventEmitterAccessors(this._binding4);
    }
    if (length > 5) {
      this._binding5 = this._createBinding(bindings[5]);
      this._keyId5 = this._binding5.key.id;
      this.eventEmitterAccessors[5] = this._createEventEmitterAccessors(this._binding5);
    }
    if (length > 6) {
      this._binding6 = this._createBinding(bindings[6]);
      this._keyId6 = this._binding6.key.id;
      this.eventEmitterAccessors[6] = this._createEventEmitterAccessors(this._binding6);
    }
    if (length > 7) {
      this._binding7 = this._createBinding(bindings[7]);
      this._keyId7 = this._binding7.key.id;
      this.eventEmitterAccessors[7] = this._createEventEmitterAccessors(this._binding7);
    }
    if (length > 8) {
      this._binding8 = this._createBinding(bindings[8]);
      this._keyId8 = this._binding8.key.id;
      this.eventEmitterAccessors[8] = this._createEventEmitterAccessors(this._binding8);
    }
    if (length > 9) {
      this._binding9 = this._createBinding(bindings[9]);
      this._keyId9 = this._binding9.key.id;
      this.eventEmitterAccessors[9] = this._createEventEmitterAccessors(this._binding9);
    }
    if (length > 10) {
      throw 'Maximum number of directives per element has been reached.';
    }
  }

  _createEventEmitterAccessors(b:DirectiveBinding) {
    return ListWrapper.map(b.eventEmitters, eventName =>
      new EventEmitterAccessor(eventName, reflector.getter(eventName))
    );
  }

  instantiate(parent:ElementInjector):ElementInjector {
    return new ElementInjector(this, parent);
  }

  directParent(): ProtoElementInjector {
    return this.distanceToParent < 2 ? this.parent : null;
  }

  _createBinding(bindingOrType) {
    if (bindingOrType instanceof DirectiveBinding) {
      return bindingOrType;
    } else {
      var b = bind(bindingOrType).toClass(bindingOrType);
      return DirectiveBinding.createFromBinding(b, null);
    }
  }

  get hasBindings():boolean {
    return isPresent(this._binding0);
  }

  getDirectiveBindingAtIndex(index:int) {
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

export class ElementInjector extends TreeNode {
  _proto:ProtoElementInjector;
  _lightDomAppInjector:Injector;
  _shadowDomAppInjector:Injector;
  _host:ElementInjector;

  // If this element injector has a component, the component instance will be stored in _obj0
  _obj0:any;
  _obj1:any;
  _obj2:any;
  _obj3:any;
  _obj4:any;
  _obj5:any;
  _obj6:any;
  _obj7:any;
  _obj8:any;
  _obj9:any;
  _preBuiltObjects;
  _constructionCounter;

  _dynamicallyCreatedComponent:any;
  _dynamicallyCreatedComponentBinding:DirectiveBinding;

  // Queries are added during construction or linking with a new parent.
  // They are never removed.
  _query0: QueryRef;
  _query1: QueryRef;
  _query2: QueryRef;
  constructor(proto:ProtoElementInjector, parent:ElementInjector) {
    super(parent);
    this._proto = proto;

    //we cannot call clearDirectives because fields won't be detected
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

  clearDirectives() {
    this._host = null;
    this._preBuiltObjects = null;
    this._lightDomAppInjector = null;
    this._shadowDomAppInjector = null;

    var p = this._proto;

    if (isPresent(p._binding0) && p._binding0.callOnDestroy) {this._obj0.onDestroy();}
    if (isPresent(p._binding1) && p._binding1.callOnDestroy) {this._obj1.onDestroy();}
    if (isPresent(p._binding2) && p._binding2.callOnDestroy) {this._obj2.onDestroy();}
    if (isPresent(p._binding3) && p._binding3.callOnDestroy) {this._obj3.onDestroy();}
    if (isPresent(p._binding4) && p._binding4.callOnDestroy) {this._obj4.onDestroy();}
    if (isPresent(p._binding5) && p._binding5.callOnDestroy) {this._obj5.onDestroy();}
    if (isPresent(p._binding6) && p._binding6.callOnDestroy) {this._obj6.onDestroy();}
    if (isPresent(p._binding7) && p._binding7.callOnDestroy) {this._obj7.onDestroy();}
    if (isPresent(p._binding8) && p._binding8.callOnDestroy) {this._obj8.onDestroy();}
    if (isPresent(p._binding9) && p._binding9.callOnDestroy) {this._obj9.onDestroy();}
    if (isPresent(this._dynamicallyCreatedComponentBinding) && this._dynamicallyCreatedComponentBinding.callOnDestroy) {
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

  instantiateDirectives(lightDomAppInjector:Injector, host:ElementInjector, shadowDomAppInjector:Injector, preBuiltObjects:PreBuiltObjects) {
    this._host = host;
    this._checkShadowDomAppInjector(shadowDomAppInjector);

    this._preBuiltObjects = preBuiltObjects;
    this._lightDomAppInjector = lightDomAppInjector;
    this._shadowDomAppInjector = shadowDomAppInjector;

    var p = this._proto;
    if (isPresent(p._keyId0)) this._getDirectiveByKeyId(p._keyId0);
    if (isPresent(p._keyId1)) this._getDirectiveByKeyId(p._keyId1);
    if (isPresent(p._keyId2)) this._getDirectiveByKeyId(p._keyId2);
    if (isPresent(p._keyId3)) this._getDirectiveByKeyId(p._keyId3);
    if (isPresent(p._keyId4)) this._getDirectiveByKeyId(p._keyId4);
    if (isPresent(p._keyId5)) this._getDirectiveByKeyId(p._keyId5);
    if (isPresent(p._keyId6)) this._getDirectiveByKeyId(p._keyId6);
    if (isPresent(p._keyId7)) this._getDirectiveByKeyId(p._keyId7);
    if (isPresent(p._keyId8)) this._getDirectiveByKeyId(p._keyId8);
    if (isPresent(p._keyId9)) this._getDirectiveByKeyId(p._keyId9);
  }

  dynamicallyCreateComponent(directiveBinding, injector:Injector) {
    this._shadowDomAppInjector = injector;
    this._dynamicallyCreatedComponentBinding = directiveBinding;
    this._dynamicallyCreatedComponent = this._new(this._dynamicallyCreatedComponentBinding);
    return this._dynamicallyCreatedComponent;
  }

  _checkShadowDomAppInjector(shadowDomAppInjector:Injector) {
    if (this._proto._binding0IsComponent && isBlank(shadowDomAppInjector)) {
      throw new BaseException('A shadowDomAppInjector is required as this ElementInjector contains a component');
    } else if (!this._proto._binding0IsComponent && isPresent(shadowDomAppInjector)) {
      throw new BaseException('No shadowDomAppInjector allowed as there is not component stored in this ElementInjector');
    }
  }

  get(token) {
    if (this._isDynamicallyLoadedComponent(token)) {
      return this._dynamicallyCreatedComponent;
    }

    return this._getByKey(Key.get(token), 0, false, null);
  }

  _isDynamicallyLoadedComponent(token) {
    return isPresent(this._dynamicallyCreatedComponentBinding) &&
      Key.get(token) === this._dynamicallyCreatedComponentBinding.key;
  }

  hasDirective(type:Type):boolean {
    return this._getDirectiveByKeyId(Key.get(type).id) !== _undefined;
  }

  getEventEmitterAccessors() {
    return this._proto.eventEmitterAccessors;
  }

  /** Gets the NgElement associated with this ElementInjector */
  getNgElement() {
    return this._preBuiltObjects.element;
  }

  getComponent() {
    if (this._proto._binding0IsComponent) {
      return this._obj0;
    } else {
      throw new BaseException('There is no component stored in this ElementInjector');
    }
  }

  getElementRef() {
    return new ElementRef(this, this._preBuiltObjects.view, this._proto.index, this._lightDomAppInjector,
        this._preBuiltObjects.viewManager, this._preBuiltObjects.defaultProtoView);
  }

  getDynamicallyLoadedComponent() {
    return this._dynamicallyCreatedComponent;
  }

  directParent(): ElementInjector {
    return this._proto.distanceToParent < 2 ? this.parent : null;
  }

  _isComponentKey(key:Key) {
    return this._proto._binding0IsComponent && key.id === this._proto._keyId0;
  }

  _isDynamicallyLoadedComponentKey(key:Key) {
    return isPresent(this._dynamicallyCreatedComponentBinding) && key.id ===
      this._dynamicallyCreatedComponentBinding.key.id;
  }

  _new(binding:ResolvedBinding) {
    if (this._constructionCounter++ > _MAX_DIRECTIVE_CONSTRUCTION_COUNTER) {
      throw new CyclicDependencyError(binding.key);
    }

    var factory = binding.factory;
    var deps = binding.dependencies;
    var length = deps.length;

    var d0,d1,d2,d3,d4,d5,d6,d7,d8,d9;
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
    } catch(e) {
      if (e instanceof AbstractBindingError) e.addKey(binding.key);
      throw e;
    }

    var obj;
    switch(length) {
      case 0: obj = factory(); break;
      case 1: obj = factory(d0); break;
      case 2: obj = factory(d0, d1); break;
      case 3: obj = factory(d0, d1, d2); break;
      case 4: obj = factory(d0, d1, d2, d3); break;
      case 5: obj = factory(d0, d1, d2, d3, d4); break;
      case 6: obj = factory(d0, d1, d2, d3, d4, d5); break;
      case 7: obj = factory(d0, d1, d2, d3, d4, d5, d6); break;
      case 8: obj = factory(d0, d1, d2, d3, d4, d5, d6, d7); break;
      case 9: obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8); break;
      case 10: obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9); break;
      default: throw `Directive ${binding.key.token} can only have up to 10 dependencies.`;
    }

    this._addToQueries(obj, binding.key.token);

    return obj;
  }

  _getByDependency(dep:DirectiveDependency, requestor:Key) {
    if (isPresent(dep.attributeName)) return this._buildAttribute(dep);
    if (isPresent(dep.queryDirective)) return this._findQuery(dep.queryDirective).list;
    if (dep.key.id === StaticKeys.instance().changeDetectorRefId) {
      var componentView = this._preBuiltObjects.view.componentChildViews[this._proto.index];
      return componentView.changeDetector.ref;
    }
    if (dep.key.id === StaticKeys.instance().elementRefId) {
      return this.getElementRef();
    }
    if (dep.key.id === StaticKeys.instance().viewContainerId) {
      return this.getElementRef().viewContainer;
    }
    return this._getByKey(dep.key, dep.depth, dep.optional, requestor);
  }

  _buildAttribute(dep): string {
    var attributes = this._proto.attributes;
    if (isPresent(attributes) && MapWrapper.contains(attributes, dep.attributeName)) {
      return MapWrapper.get(attributes, dep.attributeName);
    } else {
      return null;
    }
  }

  _buildQueriesForDeps(deps: List<DirectiveDependency>) {
    for (var i = 0; i < deps.length; i++) {
      var dep = deps[i];
      if (isPresent(dep.queryDirective)) {
        this._createQueryRef(dep.queryDirective);
      }
    }
  }

  _createQueryRef(directive) {
    var queryList = new QueryList();
    if (isBlank(this._query0)) {this._query0 = new QueryRef(directive, queryList, this);}
    else if (isBlank(this._query1)) {this._query1 = new QueryRef(directive, queryList, this);}
    else if (isBlank(this._query2)) {this._query2 = new QueryRef(directive, queryList, this);}
    else throw new QueryError();
  }

  _addToQueries(obj, token) {
    if (isPresent(this._query0) && (this._query0.directive === token)) {this._query0.list.add(obj);}
    if (isPresent(this._query1) && (this._query1.directive === token)) {this._query1.list.add(obj);}
    if (isPresent(this._query2) && (this._query2.directive === token)) {this._query2.list.add(obj);}
  }

  // TODO(rado): unify with _addParentQueries.
  _inheritQueries(parent: ElementInjector) {
    if (isBlank(parent)) return;
    if (isPresent(parent._query0)) {this._query0 = parent._query0;}
    if (isPresent(parent._query1)) {this._query1 = parent._query1;}
    if (isPresent(parent._query2)) {this._query2 = parent._query2;}
  }

  _buildQueries() {
    if (isBlank(this._proto)) return;
    var p = this._proto;
    if (isPresent(p._binding0)) {this._buildQueriesForDeps(p._binding0.dependencies);}
    if (isPresent(p._binding1)) {this._buildQueriesForDeps(p._binding1.dependencies);}
    if (isPresent(p._binding2)) {this._buildQueriesForDeps(p._binding2.dependencies);}
    if (isPresent(p._binding3)) {this._buildQueriesForDeps(p._binding3.dependencies);}
    if (isPresent(p._binding4)) {this._buildQueriesForDeps(p._binding4.dependencies);}
    if (isPresent(p._binding5)) {this._buildQueriesForDeps(p._binding5.dependencies);}
    if (isPresent(p._binding6)) {this._buildQueriesForDeps(p._binding6.dependencies);}
    if (isPresent(p._binding7)) {this._buildQueriesForDeps(p._binding7.dependencies);}
    if (isPresent(p._binding8)) {this._buildQueriesForDeps(p._binding8.dependencies);}
    if (isPresent(p._binding9)) {this._buildQueriesForDeps(p._binding9.dependencies);}
  }

  _findQuery(token) {
    if (isPresent(this._query0) && this._query0.directive === token) {return this._query0;}
    if (isPresent(this._query1) && this._query1.directive === token) {return this._query1;}
    if (isPresent(this._query2) && this._query2.directive === token) {return this._query2;}
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

  _addParentQueries() {
    if (isPresent(this.parent._query0)) {this._addQueryToTree(this.parent._query0); this.parent._query0.update();}
    if (isPresent(this.parent._query1)) {this._addQueryToTree(this.parent._query1); this.parent._query1.update();}
    if (isPresent(this.parent._query2)) {this._addQueryToTree(this.parent._query2); this.parent._query2.update();}
  }

  unlink() {
    var queriesToUpDate = [];
    if (isPresent(this.parent._query0)) {this._pruneQueryFromTree(this.parent._query0); ListWrapper.push(queriesToUpDate, this.parent._query0);}
    if (isPresent(this.parent._query1)) {this._pruneQueryFromTree(this.parent._query1); ListWrapper.push(queriesToUpDate, this.parent._query1);}
    if (isPresent(this.parent._query2)) {this._pruneQueryFromTree(this.parent._query2); ListWrapper.push(queriesToUpDate, this.parent._query2);}

    this.remove();

    ListWrapper.forEach(queriesToUpDate, (q) => q.update());
  }


  _pruneQueryFromTree(query: QueryRef) {
    this._removeQueryRef(query);

    var child = this._head;
    while (isPresent(child)) {
      child._pruneQueryFromTree(query);
      child = child._next;
    }
  }

  _addQueryToTree(query: QueryRef) {
    this._assignQueryRef(query);

    var child = this._head;
    while (isPresent(child)) {
      child._addQueryToTree(query);
      child = child._next;
    }
  }

  _assignQueryRef(query: QueryRef) {
    if (isBlank(this._query0)) {this._query0 = query; return;}
    else if (isBlank(this._query1)) {this._query1 = query; return;}
    else if (isBlank(this._query2)) {this._query2 = query; return;}
    throw new QueryError();
  }

  _removeQueryRef(query: QueryRef) {
    if (this._query0 == query) this._query0 = null;
    if (this._query1 == query) this._query1 = null;
    if (this._query2 == query) this._query2 = null;
  }

  _getByKey(key:Key, depth:number, optional:boolean, requestor:Key) {
    var ei = this;
    if (! this._shouldIncludeSelf(depth)) {
      depth -= ei._proto.distanceToParent;
      ei = ei._parent;
    }

    while (ei != null && depth >= 0) {
      var preBuiltObj = ei._getPreBuiltObjectByKeyId(key.id);
      if (preBuiltObj !== _undefined) return preBuiltObj;

      var dir = ei._getDirectiveByKeyId(key.id);
      if (dir !== _undefined) return dir;

      depth -= ei._proto.distanceToParent;
      ei = ei._parent;
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

  _appInjector(requestor:Key) {
    if (isPresent(requestor) && (this._isComponentKey(requestor) || this._isDynamicallyLoadedComponentKey(requestor))) {
      return this._shadowDomAppInjector;
    } else {
      return this._lightDomAppInjector;
    }
  }

  _shouldIncludeSelf(depth:int) {
    return depth === 0;
  }

  _getPreBuiltObjectByKeyId(keyId:int) {
    var staticKeys = StaticKeys.instance();
    // TODO: AppView should not be injectable. Remove it.
    if (keyId === staticKeys.viewManagerId) return this._preBuiltObjects.viewManagerId;
    if (keyId === staticKeys.viewId) return this._preBuiltObjects.view;
    if (keyId === staticKeys.ngElementId) return this._preBuiltObjects.element;
    if (keyId === staticKeys.defaultProtoViewId) return this._preBuiltObjects.defaultProtoView;

    //TODO add other objects as needed
    return _undefined;
  }

  _getDirectiveByKeyId(keyId:int) {
    var p = this._proto;

    if (p._keyId0 === keyId) {if (isBlank(this._obj0)){this._obj0 = this._new(p._binding0);} return this._obj0;}
    if (p._keyId1 === keyId) {if (isBlank(this._obj1)){this._obj1 = this._new(p._binding1);} return this._obj1;}
    if (p._keyId2 === keyId) {if (isBlank(this._obj2)){this._obj2 = this._new(p._binding2);} return this._obj2;}
    if (p._keyId3 === keyId) {if (isBlank(this._obj3)){this._obj3 = this._new(p._binding3);} return this._obj3;}
    if (p._keyId4 === keyId) {if (isBlank(this._obj4)){this._obj4 = this._new(p._binding4);} return this._obj4;}
    if (p._keyId5 === keyId) {if (isBlank(this._obj5)){this._obj5 = this._new(p._binding5);} return this._obj5;}
    if (p._keyId6 === keyId) {if (isBlank(this._obj6)){this._obj6 = this._new(p._binding6);} return this._obj6;}
    if (p._keyId7 === keyId) {if (isBlank(this._obj7)){this._obj7 = this._new(p._binding7);} return this._obj7;}
    if (p._keyId8 === keyId) {if (isBlank(this._obj8)){this._obj8 = this._new(p._binding8);} return this._obj8;}
    if (p._keyId9 === keyId) {if (isBlank(this._obj9)){this._obj9 = this._new(p._binding9);} return this._obj9;}
    return _undefined;
  }

  getDirectiveAtIndex(index:int) {
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

  hasInstances() {
    return this._constructionCounter > 0;
  }

  /** Gets whether this element is exporting a component instance as $implicit. */
  isExportingComponent() {
    return this._proto.exportComponent;
  }

  /** Gets whether this element is exporting its element as $implicit. */
  isExportingElement() {
    return this._proto.exportElement;
  }

  /** Get the name to which this element's $implicit is to be assigned. */
  getExportImplicitName() {
    return this._proto.exportImplicitName;
  }

  getLightDomAppInjector() {
    return this._lightDomAppInjector;
  }

  getShadowDomAppInjector() {
    return this._shadowDomAppInjector;
  }

  getHost() {
    return this._host;
  }

  getBoundElementIndex() {
    return this._proto.index;
  }
}

class OutOfBoundsAccess extends Error {
  message:string;
  constructor(index) {
    super();
    this.message = `Index ${index} is out-of-bounds.`;
  }

  toString() {
    return this.message;
  }
}

class QueryError extends Error {
  message:string;
  // TODO(rado): pass the names of the active directives.
  constructor() {
    super();
    this.message = 'Only 3 queries can be concurrently active in a template.';
  }

  toString() {
    return this.message;
  }
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
