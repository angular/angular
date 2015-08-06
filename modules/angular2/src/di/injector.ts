import {Map, List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {ResolvedBinding, Binding, Dependency, BindingBuilder, bind} from './binding';
import {
  AbstractBindingError,
  NoBindingError,
  CyclicDependencyError,
  InstantiationError,
  InvalidBindingError,
  OutOfBoundsError
} from './exceptions';
import {FunctionWrapper, Type, isPresent, isBlank, CONST_EXPR} from 'angular2/src/facade/lang';
import {Key} from './key';
import {resolveForwardRef} from './forward_ref';
import {SelfMetadata, HostMetadata, SkipSelfMetadata} from './metadata';

// Threshold for the dynamic version
const _MAX_CONSTRUCTION_COUNTER = 10;

export const undefinedValue: Object = CONST_EXPR(new Object());

export const PUBLIC: number = 1;
export const PRIVATE: number = 2;
export const PUBLIC_AND_PRIVATE: number = 3;

export interface ProtoInjectorStrategy {
  getBindingAtIndex(index: number): ResolvedBinding;
  createInjectorStrategy(inj: Injector): InjectorStrategy;
}

export class ProtoInjectorInlineStrategy implements ProtoInjectorStrategy {
  binding0: ResolvedBinding = null;
  binding1: ResolvedBinding = null;
  binding2: ResolvedBinding = null;
  binding3: ResolvedBinding = null;
  binding4: ResolvedBinding = null;
  binding5: ResolvedBinding = null;
  binding6: ResolvedBinding = null;
  binding7: ResolvedBinding = null;
  binding8: ResolvedBinding = null;
  binding9: ResolvedBinding = null;

  keyId0: number = null;
  keyId1: number = null;
  keyId2: number = null;
  keyId3: number = null;
  keyId4: number = null;
  keyId5: number = null;
  keyId6: number = null;
  keyId7: number = null;
  keyId8: number = null;
  keyId9: number = null;

  visibility0: number = null;
  visibility1: number = null;
  visibility2: number = null;
  visibility3: number = null;
  visibility4: number = null;
  visibility5: number = null;
  visibility6: number = null;
  visibility7: number = null;
  visibility8: number = null;
  visibility9: number = null;

  constructor(protoEI: ProtoInjector, bwv: BindingWithVisibility[]) {
    var length = bwv.length;

    if (length > 0) {
      this.binding0 = bwv[0].binding;
      this.keyId0 = bwv[0].getKeyId();
      this.visibility0 = bwv[0].visibility;
    }
    if (length > 1) {
      this.binding1 = bwv[1].binding;
      this.keyId1 = bwv[1].getKeyId();
      this.visibility1 = bwv[1].visibility;
    }
    if (length > 2) {
      this.binding2 = bwv[2].binding;
      this.keyId2 = bwv[2].getKeyId();
      this.visibility2 = bwv[2].visibility;
    }
    if (length > 3) {
      this.binding3 = bwv[3].binding;
      this.keyId3 = bwv[3].getKeyId();
      this.visibility3 = bwv[3].visibility;
    }
    if (length > 4) {
      this.binding4 = bwv[4].binding;
      this.keyId4 = bwv[4].getKeyId();
      this.visibility4 = bwv[4].visibility;
    }
    if (length > 5) {
      this.binding5 = bwv[5].binding;
      this.keyId5 = bwv[5].getKeyId();
      this.visibility5 = bwv[5].visibility;
    }
    if (length > 6) {
      this.binding6 = bwv[6].binding;
      this.keyId6 = bwv[6].getKeyId();
      this.visibility6 = bwv[6].visibility;
    }
    if (length > 7) {
      this.binding7 = bwv[7].binding;
      this.keyId7 = bwv[7].getKeyId();
      this.visibility7 = bwv[7].visibility;
    }
    if (length > 8) {
      this.binding8 = bwv[8].binding;
      this.keyId8 = bwv[8].getKeyId();
      this.visibility8 = bwv[8].visibility;
    }
    if (length > 9) {
      this.binding9 = bwv[9].binding;
      this.keyId9 = bwv[9].getKeyId();
      this.visibility9 = bwv[9].visibility;
    }
  }

  getBindingAtIndex(index: number): any {
    if (index == 0) return this.binding0;
    if (index == 1) return this.binding1;
    if (index == 2) return this.binding2;
    if (index == 3) return this.binding3;
    if (index == 4) return this.binding4;
    if (index == 5) return this.binding5;
    if (index == 6) return this.binding6;
    if (index == 7) return this.binding7;
    if (index == 8) return this.binding8;
    if (index == 9) return this.binding9;
    throw new OutOfBoundsError(index);
  }

  createInjectorStrategy(injector: Injector): InjectorStrategy {
    return new InjectorInlineStrategy(injector, this);
  }
}

export class ProtoInjectorDynamicStrategy implements ProtoInjectorStrategy {
  bindings: ResolvedBinding[];
  keyIds: number[];
  visibilities: number[];

  constructor(protoInj: ProtoInjector, bwv: BindingWithVisibility[]) {
    var len = bwv.length;

    this.bindings = ListWrapper.createFixedSize(len);
    this.keyIds = ListWrapper.createFixedSize(len);
    this.visibilities = ListWrapper.createFixedSize(len);

    for (var i = 0; i < len; i++) {
      this.bindings[i] = bwv[i].binding;
      this.keyIds[i] = bwv[i].getKeyId();
      this.visibilities[i] = bwv[i].visibility;
    }
  }

  getBindingAtIndex(index: number): any {
    if (index < 0 || index >= this.bindings.length) {
      throw new OutOfBoundsError(index);
    }
    return this.bindings[index];
  }

  createInjectorStrategy(ei: Injector): InjectorStrategy {
    return new InjectorDynamicStrategy(this, ei);
  }
}

export class ProtoInjector {
  _strategy: ProtoInjectorStrategy;
  numberOfBindings: number;

  constructor(bwv: BindingWithVisibility[]) {
    this.numberOfBindings = bwv.length;
    this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER ?
                         new ProtoInjectorDynamicStrategy(this, bwv) :
                         new ProtoInjectorInlineStrategy(this, bwv);
  }

  getBindingAtIndex(index: number): any { return this._strategy.getBindingAtIndex(index); }
}



export interface InjectorStrategy {
  getObjByKeyId(keyId: number, visibility: number): any;
  getObjAtIndex(index: number): any;
  getMaxNumberOfObjects(): number;

  attach(parent: Injector, isHost: boolean): void;
  resetConstructionCounter(): void;
  instantiateBinding(binding: ResolvedBinding, visibility: number): any;
}

export class InjectorInlineStrategy implements InjectorStrategy {
  obj0: any = undefinedValue;
  obj1: any = undefinedValue;
  obj2: any = undefinedValue;
  obj3: any = undefinedValue;
  obj4: any = undefinedValue;
  obj5: any = undefinedValue;
  obj6: any = undefinedValue;
  obj7: any = undefinedValue;
  obj8: any = undefinedValue;
  obj9: any = undefinedValue;

  constructor(public injector: Injector, public protoStrategy: ProtoInjectorInlineStrategy) {}

  resetConstructionCounter(): void { this.injector._constructionCounter = 0; }

  instantiateBinding(binding: ResolvedBinding, visibility: number): any {
    return this.injector._new(binding, visibility);
  }

  attach(parent: Injector, isHost: boolean): void {
    var inj = this.injector;
    inj._parent = parent;
    inj._isHost = isHost;
  }

  getObjByKeyId(keyId: number, visibility: number): any {
    var p = this.protoStrategy;
    var inj = this.injector;

    if (p.keyId0 === keyId && (p.visibility0 & visibility) > 0) {
      if (this.obj0 === undefinedValue) {
        this.obj0 = inj._new(p.binding0, p.visibility0);
      }
      return this.obj0;
    }
    if (p.keyId1 === keyId && (p.visibility1 & visibility) > 0) {
      if (this.obj1 === undefinedValue) {
        this.obj1 = inj._new(p.binding1, p.visibility1);
      }
      return this.obj1;
    }
    if (p.keyId2 === keyId && (p.visibility2 & visibility) > 0) {
      if (this.obj2 === undefinedValue) {
        this.obj2 = inj._new(p.binding2, p.visibility2);
      }
      return this.obj2;
    }
    if (p.keyId3 === keyId && (p.visibility3 & visibility) > 0) {
      if (this.obj3 === undefinedValue) {
        this.obj3 = inj._new(p.binding3, p.visibility3);
      }
      return this.obj3;
    }
    if (p.keyId4 === keyId && (p.visibility4 & visibility) > 0) {
      if (this.obj4 === undefinedValue) {
        this.obj4 = inj._new(p.binding4, p.visibility4);
      }
      return this.obj4;
    }
    if (p.keyId5 === keyId && (p.visibility5 & visibility) > 0) {
      if (this.obj5 === undefinedValue) {
        this.obj5 = inj._new(p.binding5, p.visibility5);
      }
      return this.obj5;
    }
    if (p.keyId6 === keyId && (p.visibility6 & visibility) > 0) {
      if (this.obj6 === undefinedValue) {
        this.obj6 = inj._new(p.binding6, p.visibility6);
      }
      return this.obj6;
    }
    if (p.keyId7 === keyId && (p.visibility7 & visibility) > 0) {
      if (this.obj7 === undefinedValue) {
        this.obj7 = inj._new(p.binding7, p.visibility7);
      }
      return this.obj7;
    }
    if (p.keyId8 === keyId && (p.visibility8 & visibility) > 0) {
      if (this.obj8 === undefinedValue) {
        this.obj8 = inj._new(p.binding8, p.visibility8);
      }
      return this.obj8;
    }
    if (p.keyId9 === keyId && (p.visibility9 & visibility) > 0) {
      if (this.obj9 === undefinedValue) {
        this.obj9 = inj._new(p.binding9, p.visibility9);
      }
      return this.obj9;
    }

    return undefinedValue;
  }

  getObjAtIndex(index: number): any {
    if (index == 0) return this.obj0;
    if (index == 1) return this.obj1;
    if (index == 2) return this.obj2;
    if (index == 3) return this.obj3;
    if (index == 4) return this.obj4;
    if (index == 5) return this.obj5;
    if (index == 6) return this.obj6;
    if (index == 7) return this.obj7;
    if (index == 8) return this.obj8;
    if (index == 9) return this.obj9;
    throw new OutOfBoundsError(index);
  }

  getMaxNumberOfObjects(): number { return _MAX_CONSTRUCTION_COUNTER; }
}


export class InjectorDynamicStrategy implements InjectorStrategy {
  objs: any[];

  constructor(public protoStrategy: ProtoInjectorDynamicStrategy, public injector: Injector) {
    this.objs = ListWrapper.createFixedSize(protoStrategy.bindings.length);
    ListWrapper.fill(this.objs, undefinedValue);
  }

  resetConstructionCounter(): void { this.injector._constructionCounter = 0; }

  instantiateBinding(binding: ResolvedBinding, visibility: number): any {
    return this.injector._new(binding, visibility);
  }

  attach(parent: Injector, isHost: boolean): void {
    var inj = this.injector;
    inj._parent = parent;
    inj._isHost = isHost;
  }

  getObjByKeyId(keyId: number, visibility: number): any {
    var p = this.protoStrategy;

    for (var i = 0; i < p.keyIds.length; i++) {
      if (p.keyIds[i] === keyId && (p.visibilities[i] & visibility) > 0) {
        if (this.objs[i] === undefinedValue) {
          this.objs[i] = this.injector._new(p.bindings[i], p.visibilities[i]);
        }

        return this.objs[i];
      }
    }

    return undefinedValue;
  }

  getObjAtIndex(index: number): any {
    if (index < 0 || index >= this.objs.length) {
      throw new OutOfBoundsError(index);
    }

    return this.objs[index];
  }

  getMaxNumberOfObjects(): number { return this.objs.length; }
}

export class BindingWithVisibility {
  constructor(public binding: ResolvedBinding, public visibility: number){};

  getKeyId(): number { return this.binding.key.id; }
}

/**
 * Used to provide dependencies that cannot be easily expressed as bindings.
 */
export interface DependencyProvider {
  getDependency(injector: Injector, binding: ResolvedBinding, dependency: Dependency): any;
}

/**
 * A dependency injection container used for resolving dependencies.
 *
 * An `Injector` is a replacement for a `new` operator, which can automatically resolve the
 * constructor dependencies.
 * In typical use, application code asks for the dependencies in the constructor and they are
 * resolved by the `Injector`.
 *
 * ## Example:
 *
 * Suppose that we want to inject an `Engine` into class `Car`, we would define it like this:
 *
 * ```javascript
 * class Engine {
 * }
 *
 * class Car {
 *   constructor(@Inject(Engine) engine) {
 *   }
 * }
 *
 * ```
 *
 * Next we need to write the code that creates and instantiates the `Injector`. We then ask for the
 * `root` object, `Car`, so that the `Injector` can recursively build all of that object's
 *dependencies.
 *
 * ```javascript
 * main() {
 *   var injector = Injector.resolveAndCreate([Car, Engine]);
 *
 *   // Get a reference to the `root` object, which will recursively instantiate the tree.
 *   var car = injector.get(Car);
 * }
 * ```
 * Notice that we don't use the `new` operator because we explicitly want to have the `Injector`
 * resolve all of the object's dependencies automatically.
 */
export class Injector {
  /**
   * Turns a list of binding definitions into an internal resolved list of resolved bindings.
   *
   * A resolution is a process of flattening multiple nested lists and converting individual
   * bindings into a list of {@link ResolvedBinding}s. The resolution can be cached by `resolve`
   * for the {@link Injector} for performance-sensitive code.
   *
   * @param `bindings` can be a list of `Type`, {@link Binding}, {@link ResolvedBinding}, or a
   * recursive list of more bindings.
   *
   * The returned list is sparse, indexed by `id` for the {@link Key}. It is generally not useful to
   *application code
   * other than for passing it to {@link Injector} functions that require resolved binding lists,
   *such as
   * `fromResolvedBindings` and `createChildFromResolved`.
   */
  static resolve(bindings: List<Type | Binding | List<any>>): List<ResolvedBinding> {
    var resolvedBindings = _resolveBindings(bindings);
    var flatten = _flattenBindings(resolvedBindings, new Map());
    return _createListOfBindings(flatten);
  }

  /**
   * Resolves bindings and creates an injector based on those bindings. This function is slower than
   * the corresponding `fromResolvedBindings` because it needs to resolve bindings first. See
   *`resolve`
   * for the {@link Injector}.
   *
   * Prefer `fromResolvedBindings` in performance-critical code that creates lots of injectors.
   *
   * @param `bindings` can be a list of `Type`, {@link Binding}, {@link ResolvedBinding}, or a
   *recursive list of more
   * bindings.
   * @param `depProvider`
   */
  static resolveAndCreate(bindings: List<Type | Binding | List<any>>,
                          depProvider: DependencyProvider = null): Injector {
    var resolvedBindings = Injector.resolve(bindings);
    return Injector.fromResolvedBindings(resolvedBindings, depProvider);
  }

  /**
   * Creates an injector from previously resolved bindings. This bypasses resolution and flattening.
   * This API is the recommended way to construct injectors in performance-sensitive parts.
   *
   * @param `bindings` A sparse list of {@link ResolvedBinding}s. See `resolve` for the
   * {@link Injector}.
   * @param `depProvider`
   */
  static fromResolvedBindings(bindings: List<ResolvedBinding>,
                              depProvider: DependencyProvider = null): Injector {
    var bd = bindings.map(b => new BindingWithVisibility(b, PUBLIC));
    var proto = new ProtoInjector(bd);
    var inj = new Injector(proto, null, depProvider);
    return inj;
  }

  _strategy: InjectorStrategy;
  _isHost: boolean = false;
  _constructionCounter: number = 0;

  constructor(public _proto: ProtoInjector, public _parent: Injector = null,
              private _depProvider: DependencyProvider = null,
              private _debugContext: Function = null) {
    this._strategy = _proto._strategy.createInjectorStrategy(this);
  }

  /**
   * Returns debug information about the injector.
   *
   * This information is included into exceptions thrown by the injector.
   */
  debugContext(): any { return this._debugContext(); }

  /**
   * Retrieves an instance from the injector.
   *
   * @param `token`: usually the `Type` of an object. (Same as the token used while setting up a
   *binding).
   * @returns an instance represented by the token. Throws if not found.
   */
  get(token: any): any {
    return this._getByKey(Key.get(token), null, null, false, PUBLIC_AND_PRIVATE);
  }

  /**
   * Retrieves an instance from the injector.
   *
   * @param `token`: usually a `Type`. (Same as the token used while setting up a binding).
   * @returns an instance represented by the token. Returns `null` if not found.
   */
  getOptional(token: any): any {
    return this._getByKey(Key.get(token), null, null, true, PUBLIC_AND_PRIVATE);
  }

  /**
   * Retrieves an instance from the injector.
   *
   * @param `index`: index of an instance.
   * @returns an instance represented by the index. Throws if not found.
   */
  getAt(index: number): any { return this._strategy.getObjAtIndex(index); }

  /**
   * Direct parent of this injector.
   */
  get parent(): Injector { return this._parent; }

  /**
   * Internal. Do not use.
   *
   * We return `any` not to export the InjectorStrategy type.
   */
  get internalStrategy(): any { return this._strategy; }

  /**
  * Creates a child injector and loads a new set of bindings into it.
  *
  * A resolution is a process of flattening multiple nested lists and converting individual
  * bindings into a list of {@link ResolvedBinding}s. The resolution can be cached by `resolve`
  * for the {@link Injector} for performance-sensitive code.
  *
  * @param `bindings` can be a list of `Type`, {@link Binding}, {@link ResolvedBinding}, or a
  * recursive list of more bindings.
  * @param `depProvider`
  */
  resolveAndCreateChild(bindings: List<Type | Binding | List<any>>,
                        depProvider: DependencyProvider = null): Injector {
    var resovledBindings = Injector.resolve(bindings);
    return this.createChildFromResolved(resovledBindings, depProvider);
  }

  /**
   * Creates a child injector and loads a new set of {@link ResolvedBinding}s into it.
   *
   * @param `bindings`: A sparse list of {@link ResolvedBinding}s.
   * See `resolve` for the {@link Injector}.
   * @param `depProvider`
   * @returns a new child {@link Injector}.
   */
  createChildFromResolved(bindings: List<ResolvedBinding>,
                          depProvider: DependencyProvider = null): Injector {
    var bd = bindings.map(b => new BindingWithVisibility(b, PUBLIC));
    var proto = new ProtoInjector(bd);
    var inj = new Injector(proto, null, depProvider);
    inj._parent = this;
    return inj;
  }

  /**
   * Resolves a binding and instantiates an object in the context of the injector.
   *
   * @param `binding`: either a type or a binding.
   * @returns an object created using binding.
   */
  resolveAndInstantiate(binding: Type | Binding): any {
    return this.instantiateResolved(Injector.resolve([binding])[0]);
  }

  /**
   * Instantiates an object using a resolved bindin in the context of the injector.
   *
   * @param `binding`: a resolved binding
   * @returns an object created using binding.
   */
  instantiateResolved(binding: ResolvedBinding): any {
    return this._instantiate(binding, PUBLIC_AND_PRIVATE);
  }

  _new(binding: ResolvedBinding, visibility: number): any {
    if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
      throw new CyclicDependencyError(this, binding.key);
    }
    return this._instantiate(binding, visibility);
  }

  private _instantiate(binding: ResolvedBinding, visibility: number): any {
    var factory = binding.factory;
    var deps = binding.dependencies;
    var length = deps.length;

    var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19;
    try {
      d0 = length > 0 ? this._getByDependency(binding, deps[0], visibility) : null;
      d1 = length > 1 ? this._getByDependency(binding, deps[1], visibility) : null;
      d2 = length > 2 ? this._getByDependency(binding, deps[2], visibility) : null;
      d3 = length > 3 ? this._getByDependency(binding, deps[3], visibility) : null;
      d4 = length > 4 ? this._getByDependency(binding, deps[4], visibility) : null;
      d5 = length > 5 ? this._getByDependency(binding, deps[5], visibility) : null;
      d6 = length > 6 ? this._getByDependency(binding, deps[6], visibility) : null;
      d7 = length > 7 ? this._getByDependency(binding, deps[7], visibility) : null;
      d8 = length > 8 ? this._getByDependency(binding, deps[8], visibility) : null;
      d9 = length > 9 ? this._getByDependency(binding, deps[9], visibility) : null;
      d10 = length > 10 ? this._getByDependency(binding, deps[10], visibility) : null;
      d11 = length > 11 ? this._getByDependency(binding, deps[11], visibility) : null;
      d12 = length > 12 ? this._getByDependency(binding, deps[12], visibility) : null;
      d13 = length > 13 ? this._getByDependency(binding, deps[13], visibility) : null;
      d14 = length > 14 ? this._getByDependency(binding, deps[14], visibility) : null;
      d15 = length > 15 ? this._getByDependency(binding, deps[15], visibility) : null;
      d16 = length > 16 ? this._getByDependency(binding, deps[16], visibility) : null;
      d17 = length > 17 ? this._getByDependency(binding, deps[17], visibility) : null;
      d18 = length > 18 ? this._getByDependency(binding, deps[18], visibility) : null;
      d19 = length > 19 ? this._getByDependency(binding, deps[19], visibility) : null;
    } catch (e) {
      if (e instanceof AbstractBindingError) {
        e.addKey(this, binding.key);
      }
      throw e;
    }

    var obj;
    try {
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
        case 11:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
          break;
        case 12:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
          break;
        case 13:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
          break;
        case 14:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
          break;
        case 15:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
          break;
        case 16:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
          break;
        case 17:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
          break;
        case 18:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16,
                        d17);
          break;
        case 19:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16,
                        d17, d18);
          break;
        case 20:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16,
                        d17, d18, d19);
          break;
      }
    } catch (e) {
      throw new InstantiationError(this, e, e.stack, binding.key);
    }
    return obj;
  }

  private _getByDependency(binding: ResolvedBinding, dep: Dependency,
                           bindingVisibility: number): any {
    var special = isPresent(this._depProvider) ?
                      this._depProvider.getDependency(this, binding, dep) :
                      undefinedValue;
    if (special !== undefinedValue) {
      return special;
    } else {
      return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility,
                            dep.optional, bindingVisibility);
    }
  }

  private _getByKey(key: Key, lowerBoundVisibility: Object, upperBoundVisibility: Object,
                    optional: boolean, bindingVisibility: number): any {
    if (key === INJECTOR_KEY) {
      return this;
    }

    if (upperBoundVisibility instanceof SelfMetadata) {
      return this._getByKeySelf(key, optional, bindingVisibility);

    } else if (upperBoundVisibility instanceof HostMetadata) {
      return this._getByKeyHost(key, optional, bindingVisibility, lowerBoundVisibility);

    } else {
      return this._getByKeyDefault(key, optional, bindingVisibility, lowerBoundVisibility);
    }
  }

  _throwOrNull(key: Key, optional: boolean): any {
    if (optional) {
      return null;
    } else {
      throw new NoBindingError(this, key);
    }
  }

  _getByKeySelf(key: Key, optional: boolean, bindingVisibility: number): any {
    var obj = this._strategy.getObjByKeyId(key.id, bindingVisibility);
    return (obj !== undefinedValue) ? obj : this._throwOrNull(key, optional);
  }

  _getByKeyHost(key: Key, optional: boolean, bindingVisibility: number,
                lowerBoundVisibility: Object): any {
    var inj = this;

    if (lowerBoundVisibility instanceof SkipSelfMetadata) {
      if (inj._isHost) {
        return this._getPrivateDependency(key, optional, inj);
      } else {
        inj = inj._parent;
      }
    }

    while (inj != null) {
      var obj = inj._strategy.getObjByKeyId(key.id, bindingVisibility);
      if (obj !== undefinedValue) return obj;

      if (isPresent(inj._parent) && inj._isHost) {
        return this._getPrivateDependency(key, optional, inj);
      } else {
        inj = inj._parent;
      }
    }

    return this._throwOrNull(key, optional);
  }

  _getPrivateDependency(key: Key, optional: boolean, inj: Injector): any {
    var obj = inj._parent._strategy.getObjByKeyId(key.id, PRIVATE);
    return (obj !== undefinedValue) ? obj : this._throwOrNull(key, optional);
  }

  _getByKeyDefault(key: Key, optional: boolean, bindingVisibility: number,
                   lowerBoundVisibility: Object): any {
    var inj = this;

    if (lowerBoundVisibility instanceof SkipSelfMetadata) {
      bindingVisibility = inj._isHost ? PUBLIC_AND_PRIVATE : PUBLIC;
      inj = inj._parent;
    }

    while (inj != null) {
      var obj = inj._strategy.getObjByKeyId(key.id, bindingVisibility);
      if (obj !== undefinedValue) return obj;

      bindingVisibility = inj._isHost ? PUBLIC_AND_PRIVATE : PUBLIC;
      inj = inj._parent;
    }

    return this._throwOrNull(key, optional);
  }

  get displayName(): string {
    return `Injector(bindings: [${_mapBindings(this, b => ` "${b.key.displayName}" `).join(", ")}])`;
  }

  toString(): string { return this.displayName; }
}

var INJECTOR_KEY = Key.get(Injector);


function _resolveBindings(bindings: List<Type | Binding | List<any>>): List<ResolvedBinding> {
  var resolvedList = ListWrapper.createFixedSize(bindings.length);
  for (var i = 0; i < bindings.length; i++) {
    var unresolved = resolveForwardRef(bindings[i]);
    var resolved;
    if (unresolved instanceof ResolvedBinding) {
      resolved = unresolved;  // ha-ha! I'm easily amused
    } else if (unresolved instanceof Type) {
      resolved = bind(unresolved).toClass(unresolved).resolve();
    } else if (unresolved instanceof Binding) {
      resolved = unresolved.resolve();
    } else if (unresolved instanceof List) {
      resolved = _resolveBindings(unresolved);
    } else if (unresolved instanceof BindingBuilder) {
      throw new InvalidBindingError(unresolved.token);
    } else {
      throw new InvalidBindingError(unresolved);
    }
    resolvedList[i] = resolved;
  }
  return resolvedList;
}

function _createListOfBindings(flattenedBindings: Map<number, ResolvedBinding>):
    List<ResolvedBinding> {
  return MapWrapper.values(flattenedBindings);
}

function _flattenBindings(bindings: List<ResolvedBinding | List<any>>,
                          res: Map<number, ResolvedBinding>): Map<number, ResolvedBinding> {
  ListWrapper.forEach(bindings, function(b) {
    if (b instanceof ResolvedBinding) {
      res.set(b.key.id, b);
    } else if (b instanceof List) {
      _flattenBindings(b, res);
    }
  });
  return res;
}

function _mapBindings(injector: Injector, fn: Function): any[] {
  var res = [];
  for (var i = 0; i < injector._proto.numberOfBindings; ++i) {
    res.push(fn(injector._proto.getBindingAtIndex(i)));
  }
  return res;
}
