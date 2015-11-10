library angular2.src.core.di.injector;

import "package:angular2/src/facade/collection.dart"
    show Map, MapWrapper, ListWrapper;
import "provider.dart"
    show
        ResolvedProvider,
        Provider,
        Dependency,
        ProviderBuilder,
        ResolvedFactory,
        provide,
        resolveProviders;
import "exceptions.dart"
    show
        AbstractProviderError,
        NoProviderError,
        CyclicDependencyError,
        InstantiationError,
        InvalidProviderError,
        OutOfBoundsError;
import "package:angular2/src/facade/lang.dart"
    show FunctionWrapper, Type, isPresent, isBlank;
import "key.dart" show Key;
import "metadata.dart" show SelfMetadata, HostMetadata, SkipSelfMetadata;

// Threshold for the dynamic version
const _MAX_CONSTRUCTION_COUNTER = 10;
const Object UNDEFINED = const Object();
/**
 * Visibility of a [Provider].
 */
enum Visibility {
  /**
   * A `Public` [Provider] is only visible to regular (as opposed to host) child injectors.
   */
  Public,
  /**
   * A `Private` [Provider] is only visible to host (as opposed to regular) child injectors.
   */
  Private,
  /**
   * A `PublicAndPrivate` [Provider] is visible to both host and regular child injectors.
   */
  PublicAndPrivate
}
bool canSee(Visibility src, Visibility dst) {
  return (identical(src, dst)) ||
      (identical(dst, Visibility.PublicAndPrivate) ||
          identical(src, Visibility.PublicAndPrivate));
}

abstract class ProtoInjectorStrategy {
  ResolvedProvider getProviderAtIndex(num index);
  InjectorStrategy createInjectorStrategy(Injector inj);
}

class ProtoInjectorInlineStrategy implements ProtoInjectorStrategy {
  ResolvedProvider provider0 = null;
  ResolvedProvider provider1 = null;
  ResolvedProvider provider2 = null;
  ResolvedProvider provider3 = null;
  ResolvedProvider provider4 = null;
  ResolvedProvider provider5 = null;
  ResolvedProvider provider6 = null;
  ResolvedProvider provider7 = null;
  ResolvedProvider provider8 = null;
  ResolvedProvider provider9 = null;
  num keyId0 = null;
  num keyId1 = null;
  num keyId2 = null;
  num keyId3 = null;
  num keyId4 = null;
  num keyId5 = null;
  num keyId6 = null;
  num keyId7 = null;
  num keyId8 = null;
  num keyId9 = null;
  Visibility visibility0 = null;
  Visibility visibility1 = null;
  Visibility visibility2 = null;
  Visibility visibility3 = null;
  Visibility visibility4 = null;
  Visibility visibility5 = null;
  Visibility visibility6 = null;
  Visibility visibility7 = null;
  Visibility visibility8 = null;
  Visibility visibility9 = null;
  ProtoInjectorInlineStrategy(
      ProtoInjector protoEI, List<ProviderWithVisibility> bwv) {
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
  dynamic getProviderAtIndex(num index) {
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

  InjectorStrategy createInjectorStrategy(Injector injector) {
    return new InjectorInlineStrategy(injector, this);
  }
}

class ProtoInjectorDynamicStrategy implements ProtoInjectorStrategy {
  List<ResolvedProvider> providers;
  List<num> keyIds;
  List<Visibility> visibilities;
  ProtoInjectorDynamicStrategy(
      ProtoInjector protoInj, List<ProviderWithVisibility> bwv) {
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
  dynamic getProviderAtIndex(num index) {
    if (index < 0 || index >= this.providers.length) {
      throw new OutOfBoundsError(index);
    }
    return this.providers[index];
  }

  InjectorStrategy createInjectorStrategy(Injector ei) {
    return new InjectorDynamicStrategy(this, ei);
  }
}

class ProtoInjector {
  /** @internal */
  ProtoInjectorStrategy _strategy;
  num numberOfProviders;
  ProtoInjector(List<ProviderWithVisibility> bwv) {
    this.numberOfProviders = bwv.length;
    this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER
        ? new ProtoInjectorDynamicStrategy(this, bwv)
        : new ProtoInjectorInlineStrategy(this, bwv);
  }
  dynamic getProviderAtIndex(num index) {
    return this._strategy.getProviderAtIndex(index);
  }
}

abstract class InjectorStrategy {
  dynamic getObjByKeyId(num keyId, Visibility visibility);
  dynamic getObjAtIndex(num index);
  num getMaxNumberOfObjects();
  void attach(Injector parent, bool isHost);
  void resetConstructionCounter();
  dynamic instantiateProvider(ResolvedProvider provider, Visibility visibility);
}

class InjectorInlineStrategy implements InjectorStrategy {
  Injector injector;
  ProtoInjectorInlineStrategy protoStrategy;
  dynamic obj0 = UNDEFINED;
  dynamic obj1 = UNDEFINED;
  dynamic obj2 = UNDEFINED;
  dynamic obj3 = UNDEFINED;
  dynamic obj4 = UNDEFINED;
  dynamic obj5 = UNDEFINED;
  dynamic obj6 = UNDEFINED;
  dynamic obj7 = UNDEFINED;
  dynamic obj8 = UNDEFINED;
  dynamic obj9 = UNDEFINED;
  InjectorInlineStrategy(this.injector, this.protoStrategy) {}
  void resetConstructionCounter() {
    this.injector._constructionCounter = 0;
  }

  dynamic instantiateProvider(
      ResolvedProvider provider, Visibility visibility) {
    return this.injector._new(provider, visibility);
  }

  void attach(Injector parent, bool isHost) {
    var inj = this.injector;
    inj._parent = parent;
    inj._isHost = isHost;
  }

  dynamic getObjByKeyId(num keyId, Visibility visibility) {
    var p = this.protoStrategy;
    var inj = this.injector;
    if (identical(p.keyId0, keyId) && canSee(p.visibility0, visibility)) {
      if (identical(this.obj0, UNDEFINED)) {
        this.obj0 = inj._new(p.provider0, p.visibility0);
      }
      return this.obj0;
    }
    if (identical(p.keyId1, keyId) && canSee(p.visibility1, visibility)) {
      if (identical(this.obj1, UNDEFINED)) {
        this.obj1 = inj._new(p.provider1, p.visibility1);
      }
      return this.obj1;
    }
    if (identical(p.keyId2, keyId) && canSee(p.visibility2, visibility)) {
      if (identical(this.obj2, UNDEFINED)) {
        this.obj2 = inj._new(p.provider2, p.visibility2);
      }
      return this.obj2;
    }
    if (identical(p.keyId3, keyId) && canSee(p.visibility3, visibility)) {
      if (identical(this.obj3, UNDEFINED)) {
        this.obj3 = inj._new(p.provider3, p.visibility3);
      }
      return this.obj3;
    }
    if (identical(p.keyId4, keyId) && canSee(p.visibility4, visibility)) {
      if (identical(this.obj4, UNDEFINED)) {
        this.obj4 = inj._new(p.provider4, p.visibility4);
      }
      return this.obj4;
    }
    if (identical(p.keyId5, keyId) && canSee(p.visibility5, visibility)) {
      if (identical(this.obj5, UNDEFINED)) {
        this.obj5 = inj._new(p.provider5, p.visibility5);
      }
      return this.obj5;
    }
    if (identical(p.keyId6, keyId) && canSee(p.visibility6, visibility)) {
      if (identical(this.obj6, UNDEFINED)) {
        this.obj6 = inj._new(p.provider6, p.visibility6);
      }
      return this.obj6;
    }
    if (identical(p.keyId7, keyId) && canSee(p.visibility7, visibility)) {
      if (identical(this.obj7, UNDEFINED)) {
        this.obj7 = inj._new(p.provider7, p.visibility7);
      }
      return this.obj7;
    }
    if (identical(p.keyId8, keyId) && canSee(p.visibility8, visibility)) {
      if (identical(this.obj8, UNDEFINED)) {
        this.obj8 = inj._new(p.provider8, p.visibility8);
      }
      return this.obj8;
    }
    if (identical(p.keyId9, keyId) && canSee(p.visibility9, visibility)) {
      if (identical(this.obj9, UNDEFINED)) {
        this.obj9 = inj._new(p.provider9, p.visibility9);
      }
      return this.obj9;
    }
    return UNDEFINED;
  }

  dynamic getObjAtIndex(num index) {
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

  num getMaxNumberOfObjects() {
    return _MAX_CONSTRUCTION_COUNTER;
  }
}

class InjectorDynamicStrategy implements InjectorStrategy {
  ProtoInjectorDynamicStrategy protoStrategy;
  Injector injector;
  List<dynamic> objs;
  InjectorDynamicStrategy(this.protoStrategy, this.injector) {
    this.objs = ListWrapper.createFixedSize(protoStrategy.providers.length);
    ListWrapper.fill(this.objs, UNDEFINED);
  }
  void resetConstructionCounter() {
    this.injector._constructionCounter = 0;
  }

  dynamic instantiateProvider(
      ResolvedProvider provider, Visibility visibility) {
    return this.injector._new(provider, visibility);
  }

  void attach(Injector parent, bool isHost) {
    var inj = this.injector;
    inj._parent = parent;
    inj._isHost = isHost;
  }

  dynamic getObjByKeyId(num keyId, Visibility visibility) {
    var p = this.protoStrategy;
    for (var i = 0; i < p.keyIds.length; i++) {
      if (identical(p.keyIds[i], keyId) &&
          canSee(p.visibilities[i], visibility)) {
        if (identical(this.objs[i], UNDEFINED)) {
          this.objs[i] = this.injector._new(p.providers[i], p.visibilities[i]);
        }
        return this.objs[i];
      }
    }
    return UNDEFINED;
  }

  dynamic getObjAtIndex(num index) {
    if (index < 0 || index >= this.objs.length) {
      throw new OutOfBoundsError(index);
    }
    return this.objs[index];
  }

  num getMaxNumberOfObjects() {
    return this.objs.length;
  }
}

class ProviderWithVisibility {
  ResolvedProvider provider;
  Visibility visibility;
  ProviderWithVisibility(this.provider, this.visibility) {}
  num getKeyId() {
    return this.provider.key.id;
  }
}

/**
 * Used to provide dependencies that cannot be easily expressed as providers.
 */
abstract class DependencyProvider {
  dynamic getDependency(
      Injector injector, ResolvedProvider provider, Dependency dependency);
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
class Injector {
  dynamic _depProvider;
  Function _debugContext;
  /**
   * Turns an array of provider definitions into an array of resolved providers.
   *
   * A resolution is a process of flattening multiple nested arrays and converting individual
   * providers into an array of [ResolvedProvider]s.
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
   * See [Injector#fromResolvedProviders] for more info.
   */
  static List<ResolvedProvider> resolve(
      List<dynamic /* Type | Provider | List < dynamic > */ > providers) {
    return resolveProviders(providers);
  }

  /**
   * Resolves an array of providers and creates an injector from those providers.
   *
   * The passed-in providers can be an array of `Type`, [Provider],
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
   * See [Injector#resolve] and [Injector#fromResolvedProviders].
   */
  static Injector resolveAndCreate(
      List<dynamic /* Type | Provider | List < dynamic > */ > providers) {
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
  static Injector fromResolvedProviders(List<ResolvedProvider> providers) {
    var bd = providers
        .map((b) => new ProviderWithVisibility(b, Visibility.Public))
        .toList();
    var proto = new ProtoInjector(bd);
    return new Injector(proto, null, null);
  }

  /**
   * @deprecated
   */
  static Injector fromResolvedBindings(List<ResolvedProvider> providers) {
    return Injector.fromResolvedProviders(providers);
  }

  /** @internal */
  InjectorStrategy _strategy;
  /** @internal */
  bool _isHost = false;
  /** @internal */
  num _constructionCounter = 0;
  /** @internal */
  dynamic _proto;
  /** @internal */
  Injector _parent;
  /**
   * Private
   */
  Injector(dynamic _proto,
      [Injector _parent = null,
      this._depProvider = null,
      this._debugContext = null]) {
    this._proto = _proto;
    this._parent = _parent;
    this._strategy = _proto._strategy.createInjectorStrategy(this);
  }
  /**
   * @internal
   */
  dynamic debugContext() {
    return this._debugContext();
  }

  /**
   * Retrieves an instance from the injector based on the provided token.
   * Throws [NoProviderError] if not found.
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
  dynamic get(dynamic token) {
    return this._getByKey(
        Key.get(token), null, null, false, Visibility.PublicAndPrivate);
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
  dynamic getOptional(dynamic token) {
    return this._getByKey(
        Key.get(token), null, null, true, Visibility.PublicAndPrivate);
  }

  /**
   * @internal
   */
  dynamic getAt(num index) {
    return this._strategy.getObjAtIndex(index);
  }

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
  Injector get parent {
    return this._parent;
  }

  /**
   * @internal
   * Internal. Do not use.
   * We return `any` not to export the InjectorStrategy type.
   */
  dynamic get internalStrategy {
    return this._strategy;
  }

  /**
   * Resolves an array of providers and creates a child injector from those providers.
   *
   * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
   * -->
   *
   * The passed-in providers can be an array of `Type`, [Provider],
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
   * See [Injector#resolve] and [Injector#createChildFromResolved].
   */
  Injector resolveAndCreateChild(
      List<dynamic /* Type | Provider | List < dynamic > */ > providers) {
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
  Injector createChildFromResolved(List<ResolvedProvider> providers) {
    var bd = providers
        .map((b) => new ProviderWithVisibility(b, Visibility.Public))
        .toList();
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
  dynamic resolveAndInstantiate(dynamic /* Type | Provider */ provider) {
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
  dynamic instantiateResolved(ResolvedProvider provider) {
    return this._instantiateProvider(provider, Visibility.PublicAndPrivate);
  }

  /** @internal */
  dynamic _new(ResolvedProvider provider, Visibility visibility) {
    if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
      throw new CyclicDependencyError(this, provider.key);
    }
    return this._instantiateProvider(provider, visibility);
  }

  dynamic _instantiateProvider(
      ResolvedProvider provider, Visibility visibility) {
    if (provider.multiProvider) {
      var res = ListWrapper.createFixedSize(provider.resolvedFactories.length);
      for (var i = 0; i < provider.resolvedFactories.length; ++i) {
        res[i] = this
            ._instantiate(provider, provider.resolvedFactories[i], visibility);
      }
      return res;
    } else {
      return this
          ._instantiate(provider, provider.resolvedFactories[0], visibility);
    }
  }

  dynamic _instantiate(ResolvedProvider provider,
      ResolvedFactory resolvedFactory, Visibility visibility) {
    var factory = resolvedFactory.factory;
    var deps = resolvedFactory.dependencies;
    var length = deps.length;
    var d0,
        d1,
        d2,
        d3,
        d4,
        d5,
        d6,
        d7,
        d8,
        d9,
        d10,
        d11,
        d12,
        d13,
        d14,
        d15,
        d16,
        d17,
        d18,
        d19;
    try {
      d0 = length > 0
          ? this._getByDependency(provider, deps[0], visibility)
          : null;
      d1 = length > 1
          ? this._getByDependency(provider, deps[1], visibility)
          : null;
      d2 = length > 2
          ? this._getByDependency(provider, deps[2], visibility)
          : null;
      d3 = length > 3
          ? this._getByDependency(provider, deps[3], visibility)
          : null;
      d4 = length > 4
          ? this._getByDependency(provider, deps[4], visibility)
          : null;
      d5 = length > 5
          ? this._getByDependency(provider, deps[5], visibility)
          : null;
      d6 = length > 6
          ? this._getByDependency(provider, deps[6], visibility)
          : null;
      d7 = length > 7
          ? this._getByDependency(provider, deps[7], visibility)
          : null;
      d8 = length > 8
          ? this._getByDependency(provider, deps[8], visibility)
          : null;
      d9 = length > 9
          ? this._getByDependency(provider, deps[9], visibility)
          : null;
      d10 = length > 10
          ? this._getByDependency(provider, deps[10], visibility)
          : null;
      d11 = length > 11
          ? this._getByDependency(provider, deps[11], visibility)
          : null;
      d12 = length > 12
          ? this._getByDependency(provider, deps[12], visibility)
          : null;
      d13 = length > 13
          ? this._getByDependency(provider, deps[13], visibility)
          : null;
      d14 = length > 14
          ? this._getByDependency(provider, deps[14], visibility)
          : null;
      d15 = length > 15
          ? this._getByDependency(provider, deps[15], visibility)
          : null;
      d16 = length > 16
          ? this._getByDependency(provider, deps[16], visibility)
          : null;
      d17 = length > 17
          ? this._getByDependency(provider, deps[17], visibility)
          : null;
      d18 = length > 18
          ? this._getByDependency(provider, deps[18], visibility)
          : null;
      d19 = length > 19
          ? this._getByDependency(provider, deps[19], visibility)
          : null;
    } catch (e, e_stack) {
      if (e is AbstractProviderError || e is InstantiationError) {
        e.addKey(this, provider.key);
      }
      rethrow;
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
          obj = factory(
              d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
          break;
        case 15:
          obj = factory(
              d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
          break;
        case 16:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12,
              d13, d14, d15);
          break;
        case 17:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12,
              d13, d14, d15, d16);
          break;
        case 18:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12,
              d13, d14, d15, d16, d17);
          break;
        case 19:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12,
              d13, d14, d15, d16, d17, d18);
          break;
        case 20:
          obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12,
              d13, d14, d15, d16, d17, d18, d19);
          break;
      }
    } catch (e, e_stack) {
      throw new InstantiationError(this, e, e_stack, provider.key);
    }
    return obj;
  }

  dynamic _getByDependency(ResolvedProvider provider, Dependency dep,
      Visibility providerVisibility) {
    var special = isPresent(this._depProvider)
        ? this._depProvider.getDependency(this, provider, dep)
        : UNDEFINED;
    if (!identical(special, UNDEFINED)) {
      return special;
    } else {
      return this._getByKey(dep.key, dep.lowerBoundVisibility,
          dep.upperBoundVisibility, dep.optional, providerVisibility);
    }
  }

  dynamic _getByKey(
      Key key,
      Object lowerBoundVisibility,
      Object upperBoundVisibility,
      bool optional,
      Visibility providerVisibility) {
    if (identical(key, INJECTOR_KEY)) {
      return this;
    }
    if (upperBoundVisibility is SelfMetadata) {
      return this._getByKeySelf(key, optional, providerVisibility);
    } else if (upperBoundVisibility is HostMetadata) {
      return this._getByKeyHost(
          key, optional, providerVisibility, lowerBoundVisibility);
    } else {
      return this._getByKeyDefault(
          key, optional, providerVisibility, lowerBoundVisibility);
    }
  }

  /** @internal */
  dynamic _throwOrNull(Key key, bool optional) {
    if (optional) {
      return null;
    } else {
      throw new NoProviderError(this, key);
    }
  }

  /** @internal */
  dynamic _getByKeySelf(Key key, bool optional, Visibility providerVisibility) {
    var obj = this._strategy.getObjByKeyId(key.id, providerVisibility);
    return (!identical(obj, UNDEFINED))
        ? obj
        : this._throwOrNull(key, optional);
  }

  /** @internal */
  dynamic _getByKeyHost(Key key, bool optional, Visibility providerVisibility,
      Object lowerBoundVisibility) {
    var inj = this;
    if (lowerBoundVisibility is SkipSelfMetadata) {
      if (inj._isHost) {
        return this._getPrivateDependency(key, optional, inj);
      } else {
        inj = inj._parent;
      }
    }
    while (inj != null) {
      var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
      if (!identical(obj, UNDEFINED)) return obj;
      if (isPresent(inj._parent) && inj._isHost) {
        return this._getPrivateDependency(key, optional, inj);
      } else {
        inj = inj._parent;
      }
    }
    return this._throwOrNull(key, optional);
  }

  /** @internal */
  dynamic _getPrivateDependency(Key key, bool optional, Injector inj) {
    var obj = inj._parent._strategy.getObjByKeyId(key.id, Visibility.Private);
    return (!identical(obj, UNDEFINED))
        ? obj
        : this._throwOrNull(key, optional);
  }

  /** @internal */
  dynamic _getByKeyDefault(Key key, bool optional,
      Visibility providerVisibility, Object lowerBoundVisibility) {
    var inj = this;
    if (lowerBoundVisibility is SkipSelfMetadata) {
      providerVisibility =
          inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
      inj = inj._parent;
    }
    while (inj != null) {
      var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
      if (!identical(obj, UNDEFINED)) return obj;
      providerVisibility =
          inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
      inj = inj._parent;
    }
    return this._throwOrNull(key, optional);
  }

  String get displayName {
    return '''Injector(providers: [${ _mapProviders ( this , ( b ) => ''' "${ b . key . displayName}" ''' ) . join ( ", " )}])''';
  }

  String toString() {
    return this.displayName;
  }
}

var INJECTOR_KEY = Key.get(Injector);
List<dynamic> _mapProviders(Injector injector, Function fn) {
  var res = [];
  for (var i = 0; i < injector._proto.numberOfProviders; ++i) {
    res.add(fn(injector._proto.getProviderAtIndex(i)));
  }
  return res;
}
