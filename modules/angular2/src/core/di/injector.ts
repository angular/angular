import {Map, MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {
  ResolvedProvider,
  Provider,
  Dependency,
  ProviderBuilder,
  ResolvedFactory,
  provide,
  resolveProviders
} from './provider';
import {
  AbstractProviderError,
  NoProviderError,
  CyclicDependencyError,
  InstantiationError,
  InvalidProviderError,
  OutOfBoundsError
} from './exceptions';
import {FunctionWrapper, Type, isPresent, isBlank, CONST_EXPR} from 'angular2/src/core/facade/lang';
import {Key} from './key';
import {SelfMetadata, HostMetadata, SkipSelfMetadata} from './metadata';


// Threshold for the dynamic version
const _MAX_CONSTRUCTION_COUNTER = 10;

export const UNDEFINED: Object = CONST_EXPR(new Object());

/**
 * Visibility of a {@link Provider}.
 */
export enum Visibility {
  /**
   * A `Public` {@link Provider} is only visible to regular (as opposed to host) child injectors.
   */
  Public,
  /**
   * A `Private` {@link Provider} is only visible to host (as opposed to regular) child injectors.
   */
  Private,
  /**
   * A `PublicAndPrivate` {@link Provider} is visible to both host and regular child injectors.
   */
  PublicAndPrivate
}

function canSee(src: Visibility, dst: Visibility): boolean {
  return (src === dst) ||
         (dst === Visibility.PublicAndPrivate || src === Visibility.PublicAndPrivate);
}


export interface ProtoInjectorStrategy {
  getProviderAtIndex(index: number): ResolvedProvider;
  createInjectorStrategy(inj: Injector): InjectorStrategy;
}

export class ProtoInjectorInlineStrategy implements ProtoInjectorStrategy {
  provider0: ResolvedProvider = null;
  provider1: ResolvedProvider = null;
  provider2: ResolvedProvider = null;
  provider3: ResolvedProvider = null;
  provider4: ResolvedProvider = null;
  provider5: ResolvedProvider = null;
  provider6: ResolvedProvider = null;
  provider7: ResolvedProvider = null;
  provider8: ResolvedProvider = null;
  provider9: ResolvedProvider = null;

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

  visibility0: Visibility = null;
  visibility1: Visibility = null;
  visibility2: Visibility = null;
  visibility3: Visibility = null;
  visibility4: Visibility = null;
  visibility5: Visibility = null;
  visibility6: Visibility = null;
  visibility7: Visibility = null;
  visibility8: Visibility = null;
  visibility9: Visibility = null;

  constructor(protoEI: ProtoInjector, bwv: ProviderWithVisibility[]) {
    var length = bwv.length;

    if (length > 0) {
      this.provider0 = bwv[0].provider;
      this.keyId0 = bwv[0].getKeyId();
      this.visibility0 = bwv[0].visibility;
    }
    if (length > 1) {
      this.provider1 = bwv[1].provider;
      this.keyId1 = bwv[1].getKeyId();
      this.visibility1 = bwv[1].visibility;
    }
    if (length > 2) {
      this.provider2 = bwv[2].provider;
      this.keyId2 = bwv[2].getKeyId();
      this.visibility2 = bwv[2].visibility;
    }
    if (length > 3) {
      this.provider3 = bwv[3].provider;
      this.keyId3 = bwv[3].getKeyId();
      this.visibility3 = bwv[3].visibility;
    }
    if (length > 4) {
      this.provider4 = bwv[4].provider;
      this.keyId4 = bwv[4].getKeyId();
      this.visibility4 = bwv[4].visibility;
    }
    if (length > 5) {
      this.provider5 = bwv[5].provider;
      this.keyId5 = bwv[5].getKeyId();
      this.visibility5 = bwv[5].visibility;
    }
    if (length > 6) {
      this.provider6 = bwv[6].provider;
      this.keyId6 = bwv[6].getKeyId();
      this.visibility6 = bwv[6].visibility;
    }
    if (length > 7) {
      this.provider7 = bwv[7].provider;
      this.keyId7 = bwv[7].getKeyId();
      this.visibility7 = bwv[7].visibility;
    }
    if (length > 8) {
      this.provider8 = bwv[8].provider;
      this.keyId8 = bwv[8].getKeyId();
      this.visibility8 = bwv[8].visibility;
    }
    if (length > 9) {
      this.provider9 = bwv[9].provider;
      this.keyId9 = bwv[9].getKeyId();
      this.visibility9 = bwv[9].visibility;
    }
  }

  getProviderAtIndex(index: number): any {
    if (index == 0) return this.provider0;
    if (index == 1) return this.provider1;
    if (index == 2) return this.provider2;
    if (index == 3) return this.provider3;
    if (index == 4) return this.provider4;
    if (index == 5) return this.provider5;
    if (index == 6) return this.provider6;
    if (index == 7) return this.provider7;
    if (index == 8) return this.provider8;
    if (index == 9) return this.provider9;
    throw new OutOfBoundsError(index);
  }

  createInjectorStrategy(injector: Injector): InjectorStrategy {
    return new InjectorInlineStrategy(injector, this);
  }
}

export class ProtoInjectorDynamicStrategy implements ProtoInjectorStrategy {
  providers: ResolvedProvider[];
  keyIds: number[];
  visibilities: Visibility[];

  constructor(protoInj: ProtoInjector, bwv: ProviderWithVisibility[]) {
    var len = bwv.length;

    this.providers = ListWrapper.createFixedSize(len);
    this.keyIds = ListWrapper.createFixedSize(len);
    this.visibilities = ListWrapper.createFixedSize(len);

    for (var i = 0; i < len; i++) {
      this.providers[i] = bwv[i].provider;
      this.keyIds[i] = bwv[i].getKeyId();
      this.visibilities[i] = bwv[i].visibility;
    }
  }

  getProviderAtIndex(index: number): any {
    if (index < 0 || index >= this.providers.length) {
      throw new OutOfBoundsError(index);
    }
    return this.providers[index];
  }

  createInjectorStrategy(ei: Injector): InjectorStrategy {
    return new InjectorDynamicStrategy(this, ei);
  }
}

export class ProtoInjector {
  /** @internal */
  _strategy: ProtoInjectorStrategy;
  numberOfProviders: number;

  constructor(bwv: ProviderWithVisibility[]) {
    this.numberOfProviders = bwv.length;
    this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER ?
                         new ProtoInjectorDynamicStrategy(this, bwv) :
                         new ProtoInjectorInlineStrategy(this, bwv);
  }

  getProviderAtIndex(index: number): any { return this._strategy.getProviderAtIndex(index); }
}



export interface InjectorStrategy {
  getObjByKeyId(keyId: number, visibility: Visibility): any;
  getObjAtIndex(index: number): any;
  getMaxNumberOfObjects(): number;

  attach(parent: Injector, isHost: boolean): void;
  resetConstructionCounter(): void;
  instantiateProvider(provider: ResolvedProvider, visibility: Visibility): any;
}

export class InjectorInlineStrategy implements InjectorStrategy {
  obj0: any = UNDEFINED;
  obj1: any = UNDEFINED;
  obj2: any = UNDEFINED;
  obj3: any = UNDEFINED;
  obj4: any = UNDEFINED;
  obj5: any = UNDEFINED;
  obj6: any = UNDEFINED;
  obj7: any = UNDEFINED;
  obj8: any = UNDEFINED;
  obj9: any = UNDEFINED;

  constructor(public injector: Injector, public protoStrategy: ProtoInjectorInlineStrategy) {}

  resetConstructionCounter(): void { this.injector._constructionCounter = 0; }

  instantiateProvider(provider: ResolvedProvider, visibility: Visibility): any {
    return this.injector._new(provider, visibility);
  }

  attach(parent: Injector, isHost: boolean): void {
    var inj = this.injector;
    inj._parent = parent;
    inj._isHost = isHost;
  }

  getObjByKeyId(keyId: number, visibility: Visibility): any {
    var p = this.protoStrategy;
    var inj = this.injector;

    if (p.keyId0 === keyId && canSee(p.visibility0, visibility)) {
      if (this.obj0 === UNDEFINED) {
        this.obj0 = inj._new(p.provider0, p.visibility0);
      }
      return this.obj0;
    }
    if (p.keyId1 === keyId && canSee(p.visibility1, visibility)) {
      if (this.obj1 === UNDEFINED) {
        this.obj1 = inj._new(p.provider1, p.visibility1);
      }
      return this.obj1;
    }
    if (p.keyId2 === keyId && canSee(p.visibility2, visibility)) {
      if (this.obj2 === UNDEFINED) {
        this.obj2 = inj._new(p.provider2, p.visibility2);
      }
      return this.obj2;
    }
    if (p.keyId3 === keyId && canSee(p.visibility3, visibility)) {
      if (this.obj3 === UNDEFINED) {
        this.obj3 = inj._new(p.provider3, p.visibility3);
      }
      return this.obj3;
    }
    if (p.keyId4 === keyId && canSee(p.visibility4, visibility)) {
      if (this.obj4 === UNDEFINED) {
        this.obj4 = inj._new(p.provider4, p.visibility4);
      }
      return this.obj4;
    }
    if (p.keyId5 === keyId && canSee(p.visibility5, visibility)) {
      if (this.obj5 === UNDEFINED) {
        this.obj5 = inj._new(p.provider5, p.visibility5);
      }
      return this.obj5;
    }
    if (p.keyId6 === keyId && canSee(p.visibility6, visibility)) {
      if (this.obj6 === UNDEFINED) {
        this.obj6 = inj._new(p.provider6, p.visibility6);
      }
      return this.obj6;
    }
    if (p.keyId7 === keyId && canSee(p.visibility7, visibility)) {
      if (this.obj7 === UNDEFINED) {
        this.obj7 = inj._new(p.provider7, p.visibility7);
      }
      return this.obj7;
    }
    if (p.keyId8 === keyId && canSee(p.visibility8, visibility)) {
      if (this.obj8 === UNDEFINED) {
        this.obj8 = inj._new(p.provider8, p.visibility8);
      }
      return this.obj8;
    }
    if (p.keyId9 === keyId && canSee(p.visibility9, visibility)) {
      if (this.obj9 === UNDEFINED) {
        this.obj9 = inj._new(p.provider9, p.visibility9);
      }
      return this.obj9;
    }

    return UNDEFINED;
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
    this.objs = ListWrapper.createFixedSize(protoStrategy.providers.length);
    ListWrapper.fill(this.objs, UNDEFINED);
  }

  resetConstructionCounter(): void { this.injector._constructionCounter = 0; }

  instantiateProvider(provider: ResolvedProvider, visibility: Visibility): any {
    return this.injector._new(provider, visibility);
  }

  attach(parent: Injector, isHost: boolean): void {
    var inj = this.injector;
    inj._parent = parent;
    inj._isHost = isHost;
  }

  getObjByKeyId(keyId: number, visibility: Visibility): any {
    var p = this.protoStrategy;

    for (var i = 0; i < p.keyIds.length; i++) {
      if (p.keyIds[i] === keyId && canSee(p.visibilities[i], visibility)) {
        if (this.objs[i] === UNDEFINED) {
          this.objs[i] = this.injector._new(p.providers[i], p.visibilities[i]);
        }

        return this.objs[i];
      }
    }

    return UNDEFINED;
  }

  getObjAtIndex(index: number): any {
    if (index < 0 || index >= this.objs.length) {
      throw new OutOfBoundsError(index);
    }

    return this.objs[index];
  }

  getMaxNumberOfObjects(): number { return this.objs.length; }
}

export class ProviderWithVisibility {
  constructor(public provider: ResolvedProvider, public visibility: Visibility){};

  getKeyId(): number { return this.provider.key.id; }
}

/**
 * Used to provide dependencies that cannot be easily expressed as providers.
 */
export interface DependencyProvider {
  getDependency(injector: Injector, provider: ResolvedProvider, dependency: Dependency): any;
}

/**
 * A dependency injection container used for instantiating objects and resolving dependencies.
 *
 * An `Injector` is a replacement for a `new` operator, which can automatically resolve the
 * constructor dependencies.
 *
 * In typical use, application code asks for the dependencies in the constructor and they are
 * resolved by the `Injector`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jzjec0?p=preview))
 *
 * The following example creates an `Injector` configured to create `Engine` and `Car`.
 *
 * ```typescript
 * @Injectable()
 * class Engine {
 * }
 *
 * @Injectable()
 * class Car {
 *   constructor(public engine:Engine) {}
 * }
 *
 * var injector = Injector.resolveAndCreate([Car, Engine]);
 * var car = injector.get(Car);
 * expect(car instanceof Car).toBe(true);
 * expect(car.engine instanceof Engine).toBe(true);
 * ```
 *
 * Notice, we don't use the `new` operator because we explicitly want to have the `Injector`
 * resolve all of the object's dependencies automatically.
 */
export class Injector {
  /**
   * Turns an array of provider definitions into an array of resolved providers.
   *
   * A resolution is a process of flattening multiple nested arrays and converting individual
   * providers into an array of {@link ResolvedProvider}s.
   *
   * ### Example ([live demo](http://plnkr.co/edit/AiXTHi?p=preview))
   *
   * ```typescript
   * @Injectable()
   * class Engine {
   * }
   *
   * @Injectable()
   * class Car {
   *   constructor(public engine:Engine) {}
   * }
   *
   * var providers = Injector.resolve([Car, [[Engine]]]);
   *
   * expect(providers.length).toEqual(2);
   *
   * expect(providers[0] instanceof ResolvedProvider).toBe(true);
   * expect(providers[0].key.displayName).toBe("Car");
   * expect(providers[0].dependencies.length).toEqual(1);
   * expect(providers[0].factory).toBeDefined();
   *
   * expect(providers[1].key.displayName).toBe("Engine");
   * });
   * ```
   *
   * See {@link Injector#fromResolvedProviders} for more info.
   */
  static resolve(providers: Array<Type | Provider | any[]>): ResolvedProvider[] {
    return resolveProviders(providers);
  }

  /**
   * Resolves an array of providers and creates an injector from those providers.
   *
   * The passed-in providers can be an array of `Type`, {@link Provider},
   * or a recursive array of more providers.
   *
   * ### Example ([live demo](http://plnkr.co/edit/ePOccA?p=preview))
   *
   * ```typescript
   * @Injectable()
   * class Engine {
   * }
   *
   * @Injectable()
   * class Car {
   *   constructor(public engine:Engine) {}
   * }
   *
   * var injector = Injector.resolveAndCreate([Car, Engine]);
   * expect(injector.get(Car) instanceof Car).toBe(true);
   * ```
   *
   * This function is slower than the corresponding `fromResolvedProviders`
   * because it needs to resolve the passed-in providers first.
   * See {@link Injector#resolve} and {@link Injector#fromResolvedProviders}.
   */
  static resolveAndCreate(providers: Array<Type | Provider | any[]>): Injector {
    var resolvedProviders = Injector.resolve(providers);
    return Injector.fromResolvedProviders(resolvedProviders);
  }

  /**
   * Creates an injector from previously resolved providers.
   *
   * This API is the recommended way to construct injectors in performance-sensitive parts.
   *
   * ### Example ([live demo](http://plnkr.co/edit/KrSMci?p=preview))
   *
   * ```typescript
   * @Injectable()
   * class Engine {
   * }
   *
   * @Injectable()
   * class Car {
   *   constructor(public engine:Engine) {}
   * }
   *
   * var providers = Injector.resolve([Car, Engine]);
   * var injector = Injector.fromResolvedProviders(providers);
   * expect(injector.get(Car) instanceof Car).toBe(true);
   * ```
   */
  static fromResolvedProviders(providers: ResolvedProvider[]): Injector {
    var bd = providers.map(b => new ProviderWithVisibility(b, Visibility.Public));
    var proto = new ProtoInjector(bd);
    return new Injector(proto, null, null);
  }

  /**
   * @deprecated
   */
  static fromResolvedBindings(providers: ResolvedProvider[]): Injector {
    return Injector.fromResolvedProviders(providers);
  }

  /** @internal */
  _strategy: InjectorStrategy;
  /** @internal */
  _isHost: boolean = false;
  /** @internal */
  _constructionCounter: number = 0;
  /** @internal */
  public _proto: any /* ProtoInjector */;
  /** @internal */
  public _parent: Injector;
  /**
   * Private
   */
  constructor(_proto: any /* ProtoInjector */, _parent: Injector = null,
              private _depProvider: any /* DependencyProvider */ = null,
              private _debugContext: Function = null) {
    this._proto = _proto;
    this._parent = _parent;
    this._strategy = _proto._strategy.createInjectorStrategy(this);
  }

  /**
   * @internal
   */
  debugContext(): any { return this._debugContext(); }

  /**
   * Retrieves an instance from the injector based on the provided token.
   * Throws {@link NoProviderError} if not found.
   *
   * ### Example ([live demo](http://plnkr.co/edit/HeXSHg?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   provide("validToken", {useValue: "Value"})
   * ]);
   * expect(injector.get("validToken")).toEqual("Value");
   * expect(() => injector.get("invalidToken")).toThrowError();
   * ```
   *
   * `Injector` returns itself when given `Injector` as a token.
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([]);
   * expect(injector.get(Injector)).toBe(injector);
   * ```
   */
  get(token: any): any {
    return this._getByKey(Key.get(token), null, null, false, Visibility.PublicAndPrivate);
  }

  /**
   * Retrieves an instance from the injector based on the provided token.
   * Returns null if not found.
   *
   * ### Example ([live demo](http://plnkr.co/edit/tpEbEy?p=preview))
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([
   *   provide("validToken", {useValue: "Value"})
   * ]);
   * expect(injector.getOptional("validToken")).toEqual("Value");
   * expect(injector.getOptional("invalidToken")).toBe(null);
   * ```
   *
   * `Injector` returns itself when given `Injector` as a token.
   *
   * ```typescript
   * var injector = Injector.resolveAndCreate([]);
   * expect(injector.getOptional(Injector)).toBe(injector);
   * ```
   */
  getOptional(token: any): any {
    return this._getByKey(Key.get(token), null, null, true, Visibility.PublicAndPrivate);
  }

  /**
   * @internal
   */
  getAt(index: number): any { return this._strategy.getObjAtIndex(index); }

  /**
   * Parent of this injector.
   *
   * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
   * -->
   *
   * ### Example ([live demo](http://plnkr.co/edit/eosMGo?p=preview))
   *
   * ```typescript
   * var parent = Injector.resolveAndCreate([]);
   * var child = parent.resolveAndCreateChild([]);
   * expect(child.parent).toBe(parent);
   * ```
   */
  get parent(): Injector { return this._parent; }

  /**
   * @internal
   * Internal. Do not use.
   * We return `any` not to export the InjectorStrategy type.
   */
  get internalStrategy(): any { return this._strategy; }

  /**
   * Resolves an array of providers and creates a child injector from those providers.
   *
   * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
   * -->
   *
   * The passed-in providers can be an array of `Type`, {@link Provider},
   * or a recursive array of more providers.
   *
   * ### Example ([live demo](http://plnkr.co/edit/opB3T4?p=preview))
   *
   * ```typescript
   * class ParentProvider {}
   * class ChildProvider {}
   *
   * var parent = Injector.resolveAndCreate([ParentProvider]);
   * var child = parent.resolveAndCreateChild([ChildProvider]);
   *
   * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
   * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
   * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
   * ```
   *
   * This function is slower than the corresponding `createChildFromResolved`
   * because it needs to resolve the passed-in providers first.
   * See {@link Injector#resolve} and {@link Injector#createChildFromResolved}.
   */
  resolveAndCreateChild(providers: Array<Type | Provider | any[]>): Injector {
    var resolvedProviders = Injector.resolve(providers);
    return this.createChildFromResolved(resolvedProviders);
  }

  /**
   * Creates a child injector from previously resolved providers.
   *
   * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
   * -->
   *
   * This API is the recommended way to construct injectors in performance-sensitive parts.
   *
   * ### Example ([live demo](http://plnkr.co/edit/VhyfjN?p=preview))
   *
   * ```typescript
   * class ParentProvider {}
   * class ChildProvider {}
   *
   * var parentProviders = Injector.resolve([ParentProvider]);
   * var childProviders = Injector.resolve([ChildProvider]);
   *
   * var parent = Injector.fromResolvedProviders(parentProviders);
   * var child = parent.createChildFromResolved(childProviders);
   *
   * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
   * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
   * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
   * ```
   */
  createChildFromResolved(providers: ResolvedProvider[]): Injector {
    var bd = providers.map(b => new ProviderWithVisibility(b, Visibility.Public));
    var proto = new ProtoInjector(bd);
    var inj = new Injector(proto, null, null);
    inj._parent = this;
    return inj;
  }

  /**
   * Resolves a provider and instantiates an object in the context of the injector.
   *
   * The created object does not get cached by the injector.
   *
   * ### Example ([live demo](http://plnkr.co/edit/yvVXoB?p=preview))
   *
   * ```typescript
   * @Injectable()
   * class Engine {
   * }
   *
   * @Injectable()
   * class Car {
   *   constructor(public engine:Engine) {}
   * }
   *
   * var injector = Injector.resolveAndCreate([Engine]);
   *
   * var car = injector.resolveAndInstantiate(Car);
   * expect(car.engine).toBe(injector.get(Engine));
   * expect(car).not.toBe(injector.resolveAndInstantiate(Car));
   * ```
   */
  resolveAndInstantiate(provider: Type | Provider): any {
    return this.instantiateResolved(Injector.resolve([provider])[0]);
  }

  /**
   * Instantiates an object using a resolved provider in the context of the injector.
   *
   * The created object does not get cached by the injector.
   *
   * ### Example ([live demo](http://plnkr.co/edit/ptCImQ?p=preview))
   *
   * ```typescript
   * @Injectable()
   * class Engine {
   * }
   *
   * @Injectable()
   * class Car {
   *   constructor(public engine:Engine) {}
   * }
   *
   * var injector = Injector.resolveAndCreate([Engine]);
   * var carProvider = Injector.resolve([Car])[0];
   * var car = injector.instantiateResolved(carProvider);
   * expect(car.engine).toBe(injector.get(Engine));
   * expect(car).not.toBe(injector.instantiateResolved(carProvider));
   * ```
   */
  instantiateResolved(provider: ResolvedProvider): any {
    return this._instantiateProvider(provider, Visibility.PublicAndPrivate);
  }

  /** @internal */
  _new(provider: ResolvedProvider, visibility: Visibility): any {
    if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
      throw new CyclicDependencyError(this, provider.key);
    }
    return this._instantiateProvider(provider, visibility);
  }

  private _instantiateProvider(provider: ResolvedProvider, visibility: Visibility): any {
    if (provider.multiProvider) {
      var res = ListWrapper.createFixedSize(provider.resolvedFactories.length);
      for (var i = 0; i < provider.resolvedFactories.length; ++i) {
        res[i] = this._instantiate(provider, provider.resolvedFactories[i], visibility);
      }
      return res;
    } else {
      return this._instantiate(provider, provider.resolvedFactories[0], visibility);
    }
  }

  private _instantiate(provider: ResolvedProvider, resolvedFactory: ResolvedFactory,
                       visibility: Visibility): any {
    var factory = resolvedFactory.factory;
    var deps = resolvedFactory.dependencies;
    var length = deps.length;

    var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19;
    try {
      d0 = length > 0 ? this._getByDependency(provider, deps[0], visibility) : null;
      d1 = length > 1 ? this._getByDependency(provider, deps[1], visibility) : null;
      d2 = length > 2 ? this._getByDependency(provider, deps[2], visibility) : null;
      d3 = length > 3 ? this._getByDependency(provider, deps[3], visibility) : null;
      d4 = length > 4 ? this._getByDependency(provider, deps[4], visibility) : null;
      d5 = length > 5 ? this._getByDependency(provider, deps[5], visibility) : null;
      d6 = length > 6 ? this._getByDependency(provider, deps[6], visibility) : null;
      d7 = length > 7 ? this._getByDependency(provider, deps[7], visibility) : null;
      d8 = length > 8 ? this._getByDependency(provider, deps[8], visibility) : null;
      d9 = length > 9 ? this._getByDependency(provider, deps[9], visibility) : null;
      d10 = length > 10 ? this._getByDependency(provider, deps[10], visibility) : null;
      d11 = length > 11 ? this._getByDependency(provider, deps[11], visibility) : null;
      d12 = length > 12 ? this._getByDependency(provider, deps[12], visibility) : null;
      d13 = length > 13 ? this._getByDependency(provider, deps[13], visibility) : null;
      d14 = length > 14 ? this._getByDependency(provider, deps[14], visibility) : null;
      d15 = length > 15 ? this._getByDependency(provider, deps[15], visibility) : null;
      d16 = length > 16 ? this._getByDependency(provider, deps[16], visibility) : null;
      d17 = length > 17 ? this._getByDependency(provider, deps[17], visibility) : null;
      d18 = length > 18 ? this._getByDependency(provider, deps[18], visibility) : null;
      d19 = length > 19 ? this._getByDependency(provider, deps[19], visibility) : null;
    } catch (e) {
      if (e instanceof AbstractProviderError || e instanceof InstantiationError) {
        e.addKey(this, provider.key);
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
      throw new InstantiationError(this, e, e.stack, provider.key);
    }
    return obj;
  }

  private _getByDependency(provider: ResolvedProvider, dep: Dependency,
                           providerVisibility: Visibility): any {
    var special = isPresent(this._depProvider) ?
                      this._depProvider.getDependency(this, provider, dep) :
                      UNDEFINED;
    if (special !== UNDEFINED) {
      return special;
    } else {
      return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility,
                            dep.optional, providerVisibility);
    }
  }

  private _getByKey(key: Key, lowerBoundVisibility: Object, upperBoundVisibility: Object,
                    optional: boolean, providerVisibility: Visibility): any {
    if (key === INJECTOR_KEY) {
      return this;
    }

    if (upperBoundVisibility instanceof SelfMetadata) {
      return this._getByKeySelf(key, optional, providerVisibility);

    } else if (upperBoundVisibility instanceof HostMetadata) {
      return this._getByKeyHost(key, optional, providerVisibility, lowerBoundVisibility);

    } else {
      return this._getByKeyDefault(key, optional, providerVisibility, lowerBoundVisibility);
    }
  }

  /** @internal */
  _throwOrNull(key: Key, optional: boolean): any {
    if (optional) {
      return null;
    } else {
      throw new NoProviderError(this, key);
    }
  }

  /** @internal */
  _getByKeySelf(key: Key, optional: boolean, providerVisibility: Visibility): any {
    var obj = this._strategy.getObjByKeyId(key.id, providerVisibility);
    return (obj !== UNDEFINED) ? obj : this._throwOrNull(key, optional);
  }

  /** @internal */
  _getByKeyHost(key: Key, optional: boolean, providerVisibility: Visibility,
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
      var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
      if (obj !== UNDEFINED) return obj;

      if (isPresent(inj._parent) && inj._isHost) {
        return this._getPrivateDependency(key, optional, inj);
      } else {
        inj = inj._parent;
      }
    }

    return this._throwOrNull(key, optional);
  }

  /** @internal */
  _getPrivateDependency(key: Key, optional: boolean, inj: Injector): any {
    var obj = inj._parent._strategy.getObjByKeyId(key.id, Visibility.Private);
    return (obj !== UNDEFINED) ? obj : this._throwOrNull(key, optional);
  }

  /** @internal */
  _getByKeyDefault(key: Key, optional: boolean, providerVisibility: Visibility,
                   lowerBoundVisibility: Object): any {
    var inj = this;

    if (lowerBoundVisibility instanceof SkipSelfMetadata) {
      providerVisibility = inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
      inj = inj._parent;
    }

    while (inj != null) {
      var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
      if (obj !== UNDEFINED) return obj;

      providerVisibility = inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
      inj = inj._parent;
    }

    return this._throwOrNull(key, optional);
  }

  get displayName(): string {
    return `Injector(providers: [${_mapProviders(this, b => ` "${b.key.displayName}" `).join(", ")}])`;
  }

  toString(): string { return this.displayName; }
}

var INJECTOR_KEY = Key.get(Injector);


function _mapProviders(injector: Injector, fn: Function): any[] {
  var res = [];
  for (var i = 0; i < injector._proto.numberOfProviders; ++i) {
    res.push(fn(injector._proto.getProviderAtIndex(i)));
  }
  return res;
}
