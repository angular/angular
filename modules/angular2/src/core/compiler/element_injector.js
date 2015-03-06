import {FIELD, isPresent, isBlank, Type, int, BaseException} from 'angular2/src/facade/lang';
import {Math} from 'angular2/src/facade/math';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {Injector, Key, Dependency, bind, Binding, NoProviderError, ProviderError, CyclicDependencyError} from 'angular2/di';
import {Parent, Ancestor} from 'angular2/src/core/annotations/visibility';
import {EventEmitter, PropertySetter} from 'angular2/src/core/annotations/di';
import {View, ProtoView} from 'angular2/src/core/compiler/view';
import {LightDom, SourceLightDom, DestinationLightDom} from 'angular2/src/core/compiler/shadow_dom_emulation/light_dom';
import {ViewContainer} from 'angular2/src/core/compiler/view_container';
import {NgElement} from 'angular2/src/core/dom/element';
import {Directive, onChange, onDestroy} from 'angular2/src/core/annotations/annotations'
import {BindingPropagationConfig} from 'angular2/src/core/compiler/binding_propagation_config'
import {Reflector} from 'angular2/src/reflection/reflection';

var _MAX_DIRECTIVE_CONSTRUCTION_COUNTER = 10;

var MAX_DEPTH = Math.pow(2, 30) - 1;

var _undefined = new Object();

var _staticKeys;

class StaticKeys {
  viewId:number;
  ngElementId:number;
  viewContainerId:number;
  destinationLightDomId:number;
  sourceLightDomId:number;
  bindingPropagationConfigId:number;

  constructor() {
    //TODO: vsavkin Key.annotate(Key.get(View), 'static')
    this.viewId = Key.get(View).id;
    this.ngElementId = Key.get(NgElement).id;
    this.viewContainerId = Key.get(ViewContainer).id;
    this.destinationLightDomId = Key.get(DestinationLightDom).id;
    this.sourceLightDomId = Key.get(SourceLightDom).id;
    this.bindingPropagationConfigId = Key.get(BindingPropagationConfig).id;
  }

  static instance() {
    if (isBlank(_staticKeys)) _staticKeys = new StaticKeys();
    return _staticKeys;
  }
}

class TreeNode {
  _parent:TreeNode;
  _head:TreeNode;
  _tail:TreeNode;
  _next:TreeNode;
  constructor(parent:TreeNode) {
    this._parent = parent;
    this._head = null;
    this._tail = null;
    this._next = null;
    if (isPresent(parent)) parent._addChild(this);
  }

  /**
   * Adds a child to the parent node. The child MUST NOT be a part of a tree.
   */
  _addChild(child:TreeNode) {
    if (isPresent(this._tail)) {
      this._tail._next = child;
      this._tail = child;
    } else {
      this._tail = this._head = child;
    }
  }

  get parent() {
    return this._parent;
  }

  set parent(node:TreeNode) {
    this._parent = node;
  }

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
  eventEmitterName:string;
  propSetterName:string;

  constructor(key:Key, asPromise:boolean, lazy:boolean, optional:boolean,
              properties:List, depth:int, eventEmitterName: string, propSetterName: string) {
    super(key, asPromise, lazy, optional, properties);
    this.depth = depth;
    this.eventEmitterName = eventEmitterName;
    this.propSetterName = propSetterName;
  }

  static createFrom(d:Dependency):Dependency {
    return new DirectiveDependency(d.key, d.asPromise, d.lazy, d.optional,
      d.properties, DirectiveDependency._depth(d.properties),
      DirectiveDependency._eventEmitterName(d.properties),
      DirectiveDependency._propSetterName(d.properties)
    );
  }

  static _depth(properties):int {
    if (properties.length == 0) return 0;
    if (ListWrapper.any(properties, p => p instanceof Parent)) return 1;
    if (ListWrapper.any(properties, p => p instanceof Ancestor)) return MAX_DEPTH;
    return 0;
  }

  static _eventEmitterName(properties):string {
    for (var i = 0; i < properties.length; i++) {
      if (properties[i] instanceof EventEmitter) {
        return properties[i].eventName;
      }
    }
    return null;
  }

  static _propSetterName(properties):string {
    for (var i = 0; i < properties.length; i++) {
      if (properties[i] instanceof PropertySetter) {
        return properties[i].propName;
      }
    }
    return null;
  }
}

export class DirectiveBinding extends Binding {
  callOnDestroy:boolean;
  callOnChange:boolean;

  constructor(key:Key, factory:Function, dependencies:List, providedAsPromise:boolean, annotation:Directive) {
    super(key, factory, dependencies, providedAsPromise);
    this.callOnDestroy = isPresent(annotation) && annotation.hasLifecycleHook(onDestroy);
    this.callOnChange = isPresent(annotation) && annotation.hasLifecycleHook(onChange);
  }

  static createFromBinding(b:Binding, annotation:Directive):Binding {
    var deps = ListWrapper.map(b.dependencies, DirectiveDependency.createFrom);
    return new DirectiveBinding(b.key, b.factory, deps, b.providedAsPromise, annotation);
  }

  static createFromType(type:Type, annotation:Directive):Binding {
    var binding = bind(type).toClass(type);
    return DirectiveBinding.createFromBinding(binding, annotation);
  }

  static _hasEventEmitter(eventName: string, binding: DirectiveBinding) {
    return ListWrapper.any(binding.dependencies, (d) => (d.eventEmitterName == eventName));
  }
}


// TODO(rado): benchmark and consider rolling in as ElementInjector fields.
export class PreBuiltObjects {
  view:View;
  element:NgElement;
  viewContainer:ViewContainer;
  lightDom:LightDom;
  bindingPropagationConfig:BindingPropagationConfig;
  constructor(view, element:NgElement, viewContainer:ViewContainer, lightDom:LightDom,
              bindingPropagationConfig:BindingPropagationConfig) {
    this.view = view;
    this.element = element;
    this.viewContainer = viewContainer;
    this.lightDom = lightDom;
    this.bindingPropagationConfig = bindingPropagationConfig;
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
  _binding0:Binding;
  _binding1:Binding;
  _binding2:Binding;
  _binding3:Binding;
  _binding4:Binding;
  _binding5:Binding;
  _binding6:Binding;
  _binding7:Binding;
  _binding8:Binding;
  _binding9:Binding;
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
  view:View;
  distanceToParent:number;

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

    var length = bindings.length;

    if (length > 0) {this._binding0 = this._createBinding(bindings[0]); this._keyId0 = this._binding0.key.id;}
    if (length > 1) {this._binding1 = this._createBinding(bindings[1]); this._keyId1 = this._binding1.key.id;}
    if (length > 2) {this._binding2 = this._createBinding(bindings[2]); this._keyId2 = this._binding2.key.id;}
    if (length > 3) {this._binding3 = this._createBinding(bindings[3]); this._keyId3 = this._binding3.key.id;}
    if (length > 4) {this._binding4 = this._createBinding(bindings[4]); this._keyId4 = this._binding4.key.id;}
    if (length > 5) {this._binding5 = this._createBinding(bindings[5]); this._keyId5 = this._binding5.key.id;}
    if (length > 6) {this._binding6 = this._createBinding(bindings[6]); this._keyId6 = this._binding6.key.id;}
    if (length > 7) {this._binding7 = this._createBinding(bindings[7]); this._keyId7 = this._binding7.key.id;}
    if (length > 8) {this._binding8 = this._createBinding(bindings[8]); this._keyId8 = this._binding8.key.id;}
    if (length > 9) {this._binding9 = this._createBinding(bindings[9]); this._keyId9 = this._binding9.key.id;}
    if (length > 10) {
      throw 'Maximum number of directives per element has been reached.';
    }
  }

  instantiate(parent:ElementInjector, host:ElementInjector, eventCallbacks,
    reflector: Reflector):ElementInjector {
    return new ElementInjector(this, parent, host, eventCallbacks, reflector);
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

  hasEventEmitter(eventName: string) {
    var p = this;
    if (isPresent(p._binding0) && DirectiveBinding._hasEventEmitter(eventName, p._binding0)) return true;
    if (isPresent(p._binding1) && DirectiveBinding._hasEventEmitter(eventName, p._binding1)) return true;
    if (isPresent(p._binding2) && DirectiveBinding._hasEventEmitter(eventName, p._binding2)) return true;
    if (isPresent(p._binding3) && DirectiveBinding._hasEventEmitter(eventName, p._binding3)) return true;
    if (isPresent(p._binding4) && DirectiveBinding._hasEventEmitter(eventName, p._binding4)) return true;
    if (isPresent(p._binding5) && DirectiveBinding._hasEventEmitter(eventName, p._binding5)) return true;
    if (isPresent(p._binding6) && DirectiveBinding._hasEventEmitter(eventName, p._binding6)) return true;
    if (isPresent(p._binding7) && DirectiveBinding._hasEventEmitter(eventName, p._binding7)) return true;
    if (isPresent(p._binding8) && DirectiveBinding._hasEventEmitter(eventName, p._binding8)) return true;
    if (isPresent(p._binding9) && DirectiveBinding._hasEventEmitter(eventName, p._binding9)) return true;
    return false;
  }
}

export class ElementInjector extends TreeNode {
  _proto:ProtoElementInjector;
  _lightDomAppInjector:Injector;
  _shadowDomAppInjector:Injector;
  _host:ElementInjector;
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
  _eventCallbacks;
  _refelector: Reflector;

  constructor(proto:ProtoElementInjector, parent:ElementInjector, host:ElementInjector,
    eventCallbacks: Map, reflector: Reflector) {
    super(parent);
    if (isPresent(parent) && isPresent(host)) {
      throw new BaseException('Only either parent or host is allowed');
    }
    this._host = null; // needed to satisfy Dart
    if (isPresent(parent)) {
      this._host = parent._host;
    } else {
      this._host = host;
    }

    this._proto = proto;
    this._refelector = reflector;

    //we cannot call clearDirectives because fields won't be detected
    this._preBuiltObjects = null;
    this._lightDomAppInjector = null;
    this._shadowDomAppInjector = null;
    this._eventCallbacks = eventCallbacks;
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
  }

  clearDirectives() {
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
  }

  instantiateDirectives(lightDomAppInjector:Injector, shadowDomAppInjector:Injector, preBuiltObjects:PreBuiltObjects) {
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

  _checkShadowDomAppInjector(shadowDomAppInjector:Injector) {
    if (this._proto._binding0IsComponent && isBlank(shadowDomAppInjector)) {
      throw new BaseException('A shadowDomAppInjector is required as this ElementInjector contains a component');
    } else if (!this._proto._binding0IsComponent && isPresent(shadowDomAppInjector)) {
      throw new BaseException('No shadowDomAppInjector allowed as there is not component stored in this ElementInjector');
    }
  }

  get(token) {
    return this._getByKey(Key.get(token), 0, false, null);
  }

  hasDirective(type:Type):boolean {
    return this._getDirectiveByKeyId(Key.get(type).id) !== _undefined;
  }

  hasPreBuiltObject(type:Type):boolean {
    var pb = this._getPreBuiltObjectByKeyId(Key.get(type).id);
    return pb !== _undefined && isPresent(pb);
  }

  forElement(el):boolean {
    return this._preBuiltObjects.element.domElement === el;
  }

  /** Gets the NgElement associated with this ElementInjector */
  getNgElement() {
    return this._preBuiltObjects.element;
  }

  getComponent() {
    if (this._proto._binding0IsComponent) {
      return this._obj0;
    } else {
      throw new BaseException('There is not component stored in this ElementInjector');
    }
  }

  directParent(): ElementInjector {
    return this._proto.distanceToParent < 2 ? this.parent : null;
  }

  _isComponentKey(key:Key) {
    return this._proto._binding0IsComponent && key.id === this._proto._keyId0;
  }

  _new(binding:Binding) {
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
      if (e instanceof ProviderError) e.addKey(binding.key);
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

    return obj;
  }

  _getByDependency(dep:DirectiveDependency, requestor:Key) {
    if (isPresent(dep.eventEmitterName)) return this._buildEventEmitter(dep);
    if (isPresent(dep.propSetterName)) return this._buildPropSetter(dep);
    return this._getByKey(dep.key, dep.depth, dep.optional, requestor);
  }

  _buildEventEmitter(dep) {
    var view = this._getPreBuiltObjectByKeyId(StaticKeys.instance().viewId);
    if (isPresent(this._eventCallbacks)) {
      var callback = MapWrapper.get(this._eventCallbacks, dep.eventEmitterName);
      if (isPresent(callback)) {
        return ProtoView.buildInnerCallback(callback, view);
      }
    }
    return (_) => {};
  }

  _buildPropSetter(dep) {
    var ngElement = this._getPreBuiltObjectByKeyId(StaticKeys.instance().ngElementId);
    var domElement = ngElement.domElement;
    var setter = this._refelector.setter(dep.propSetterName);
    return function(v) { setter(domElement, v) };
  }

  /*
   * It is fairly easy to annotate keys with metadata.
   * For example, key.metadata = 'directive'.
   *
   * This would allows to do the lookup more efficiently.
   *
   * for example
   * we would lookup pre built objects only when metadata = 'preBuilt'
   * we would lookup directives only when metadata = 'directive'
   *
   * Write benchmarks before doing this optimization.
   */
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
    } else if (optional) {
      return this._appInjector(requestor).getOptional(key);
    } else {
      return this._appInjector(requestor).get(key);
    }
  }

  _appInjector(requestor:Key) {
    if (isPresent(requestor) && this._isComponentKey(requestor)) {
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
    if (keyId === staticKeys.viewId) return this._preBuiltObjects.view;
    if (keyId === staticKeys.ngElementId) return this._preBuiltObjects.element;
    if (keyId === staticKeys.viewContainerId) return this._preBuiltObjects.viewContainer;
    if (keyId === staticKeys.bindingPropagationConfigId) return this._preBuiltObjects.bindingPropagationConfig;
    if (keyId === staticKeys.destinationLightDomId) {
      var p:ElementInjector = this.directParent();
      return isPresent(p) ? p._preBuiltObjects.lightDom : null;
    }
    if (keyId === staticKeys.sourceLightDomId)   {
      return this._host._preBuiltObjects.lightDom;
    }

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

  getDirectiveBindingAtIndex(index:int) {
    var p = this._proto;
    if (index == 0) return p._binding0;
    if (index == 1) return p._binding1;
    if (index == 2) return p._binding2;
    if (index == 3) return p._binding3;
    if (index == 4) return p._binding4;
    if (index == 5) return p._binding5;
    if (index == 6) return p._binding6;
    if (index == 7) return p._binding7;
    if (index == 8) return p._binding8;
    if (index == 9) return p._binding9;
    throw new OutOfBoundsAccess(index);
  }

  hasInstances() {
    return this._constructionCounter > 0;
  }

  hasEventEmitter(eventName: string) {
    return this._proto.hasEventEmitter(eventName);
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
