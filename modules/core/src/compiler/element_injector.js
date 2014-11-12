import {FIELD, isPresent, isBlank, Type, int, BaseException} from 'facade/lang';
import {Math} from 'facade/math';
import {List, ListWrapper} from 'facade/collection';
import {Injector, Key, Dependency, bind, Binding, NoProviderError, ProviderError, CyclicDependencyError} from 'di/di';
import {Parent, Ancestor} from 'core/annotations/visibility';
import {StaticKeys} from './static_keys';
// Comment out as dartanalyzer does not look into @FIELD
// import {View} from './view';
import {NgElement} from 'core/dom/element';

var _MAX_DIRECTIVE_CONSTRUCTION_COUNTER = 10;

var MAX_DEPTH = Math.pow(2, 30) - 1;

var _undefined = new Object();

class TreeNode {
  @FIELD('_parent:TreeNode')
  @FIELD('_head:TreeNode')
  @FIELD('_tail:TreeNode')
  @FIELD('_next:TreeNode')
  @FIELD('_prev:TreeNode')
  constructor(parent:TreeNode) {
    this._parent = parent;
    this._head = null;
    this._tail = null;
    this._next = null;
    this._prev = null;
    if (isPresent(parent)) parent._addChild(this);
  }

  /**
   * Adds a child to the parent node. The child MUST NOT be a part of a tree.
   */
  _addChild(child:TreeNode) {
    if (isPresent(this._tail)) {
      this._tail._next = child;
      child._prev = this._tail;
      this._tail = child;
    } else {
      this._tail = this._head = child;
    }
  }

  get parent() {
    return this._parent;
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

class DirectiveDependency extends Dependency {
  constructor(key:Key, asPromise:boolean, lazy:boolean, properties:List, depth:int) {
    super(key, asPromise, lazy, properties);
    this.depth = depth;
  }

  static createFrom(d:Dependency):Dependency {
    return new DirectiveDependency(d.key, d.asPromise, d.lazy,
      d.properties, DirectiveDependency._depth(d.properties));
  }

  static _depth(properties):int {
    if (properties.length == 0) return 0;
    if (ListWrapper.any(properties, p => p instanceof Parent)) return 1;
    if (ListWrapper.any(properties, p => p instanceof Ancestor)) return MAX_DEPTH;
    return 0;
  }
}

export class PreBuiltObjects {
  @FIELD('final view:View')
  @FIELD('final element:NgElement')
  constructor(view, element:NgElement) {
    this.view = view;
    this.element = element;
  }
}

/**

Difference between di.Injector and ElementInjector

di.Injector (di.Module):
 - imperative based (can create child injectors imperativly)
 - Lazy loading of code
 - Component/App Level services which are usually not DOM Related.


ElementInjector (ElementModule):
  - ProtoBased (Injector structure fixed at compile time)
  - understands @Ancestor, @Parent, @Child, @Descendent
  - Fast
  - Query mechanism for children
  - 1:1 to DOM structure.

 PERF BENCHMARK: http://www.williambrownstreet.net/blog/2014/04/faster-angularjs-rendering-angularjs-and-reactjs/
 */

export class ProtoElementInjector  {
  @FIELD('_binding0:Binding')
  @FIELD('_binding1:Binding')
  @FIELD('_binding2:Binding')
  @FIELD('_binding3:Binding')
  @FIELD('_binding4:Binding')
  @FIELD('_binding5:Binding')
  @FIELD('_binding6:Binding')
  @FIELD('_binding7:Binding')
  @FIELD('_binding8:Binding')
  @FIELD('_binding9:Binding')
  @FIELD('_binding0IsComponent:int')
  @FIELD('_key0:int')
  @FIELD('_key1:int')
  @FIELD('_key2:int')
  @FIELD('_key3:int')
  @FIELD('_key4:int')
  @FIELD('_key5:int')
  @FIELD('_key6:int')
  @FIELD('_key7:int')
  @FIELD('_key8:int')
  @FIELD('_key9:int')
  @FIELD('final parent:ProtoElementInjector')
  @FIELD('final index:int')
  @FIELD('view:View')
  constructor(parent:ProtoElementInjector, index:int, bindings:List, firstBindingIsComponent:boolean = false) {
    this.parent = parent;
    this.index = index;

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

  instantiate(parent:ElementInjector, host:ElementInjector):ElementInjector {
    return new ElementInjector(this, parent, host);
  }

  _createBinding(bindingOrType) {
    var b = (bindingOrType instanceof Type) ?
      bind(bindingOrType).toClass(bindingOrType) :
      bindingOrType;
    var deps = ListWrapper.map(b.dependencies, DirectiveDependency.createFrom);
    return new Binding(b.key, b.factory, deps, b.providedAsPromise);
  }

  get hasBindings():boolean {
    return isPresent(this._binding0);
  }
}

export class ElementInjector extends TreeNode {
  @FIELD('_proto:ProtoElementInjector')
  @FIELD('_lightDomAppInjector:Injector')
  @FIELD('_shadowDomAppInjector:Injector')
  @FIELD('_host:ElementInjector')
  @FIELD('_obj0:Object')
  @FIELD('_obj1:Object')
  @FIELD('_obj2:Object')
  @FIELD('_obj3:Object')
  @FIELD('_obj4:Object')
  @FIELD('_obj5:Object')
  @FIELD('_obj6:Object')
  @FIELD('_obj7:Object')
  @FIELD('_obj8:Object')
  @FIELD('_obj9:Object')
  @FIELD('_view:View')
  constructor(proto:ProtoElementInjector, parent:ElementInjector, host:ElementInjector) {
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
  }

  clearDirectives() {
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
    return this._getByKey(Key.get(token), 0, null);
  }

  getComponent() {
    if (this._proto._binding0IsComponent) {
      return this._obj0;
    } else {
      throw new BaseException('There is not component stored in this ElementInjector');
    }
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
    return this._getByKey(dep.key, dep.depth, requestor);
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
  _getByKey(key:Key, depth:int, requestor:Key) {
    var ei = this;

    if (! this._shouldIncludeSelf(depth)) {
      depth -= 1;
      ei = ei._parent;
    }

    while (ei != null && depth >= 0) {
      var preBuiltObj = ei._getPreBuiltObjectByKeyId(key.id);
      if (preBuiltObj !== _undefined) return preBuiltObj;

      var dir = ei._getDirectiveByKeyId(key.id);
      if (dir !== _undefined) return dir;

      ei = ei._parent;
      depth -= 1;
    }

    if (isPresent(this._host) && this._host._isComponentKey(key)) {
      return this._host.getComponent();
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

  getAtIndex(index:int) {
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
}

class OutOfBoundsAccess extends Error {
  constructor(index) {
    this.message = `Index ${index} is out-of-bounds.`;
  }

  toString() {
    return this.message;
  }
}
