library angular2.src.core.di.exceptions;

import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/lang.dart" show stringify, isBlank;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException, unimplemented;
import "key.dart" show Key;
import "injector.dart" show Injector;

List<dynamic> findFirstClosedCycle(List<dynamic> keys) {
  var res = [];
  for (var i = 0; i < keys.length; ++i) {
    if (ListWrapper.contains(res, keys[i])) {
      res.add(keys[i]);
      return res;
    } else {
      res.add(keys[i]);
    }
  }
  return res;
}

String constructResolvingPath(List<dynamic> keys) {
  if (keys.length > 1) {
    var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
    var tokenStrs = reversed.map((k) => stringify(k.token)).toList();
    return " (" + tokenStrs.join(" -> ") + ")";
  } else {
    return "";
  }
}

/**
 * Base class for all errors arising from misconfigured providers.
 */
class AbstractProviderError extends BaseException {
  /** @internal */
  String message;
  /** @internal */
  List<Key> keys;
  /** @internal */
  List<Injector> injectors;
  /** @internal */
  Function constructResolvingMessage;
  AbstractProviderError(
      Injector injector, Key key, Function constructResolvingMessage)
      : super("DI Exception") {
    /* super call moved to initializer */;
    this.keys = [key];
    this.injectors = [injector];
    this.constructResolvingMessage = constructResolvingMessage;
    this.message = this.constructResolvingMessage(this.keys);
  }
  void addKey(Injector injector, Key key) {
    this.injectors.add(injector);
    this.keys.add(key);
    this.message = this.constructResolvingMessage(this.keys);
  }

  get context {
    return this.injectors[this.injectors.length - 1].debugContext();
  }
}

/**
 * Thrown when trying to retrieve a dependency by `Key` from [Injector], but the
 * [Injector] does not have a [Provider] for [Key].
 *
 * ### Example ([live demo](http://plnkr.co/edit/vq8D3FRB9aGbnWJqtEPE?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor(b:B) {}
 * }
 *
 * expect(() => Injector.resolveAndCreate([A])).toThrowError();
 * ```
 */
class NoProviderError extends AbstractProviderError {
  NoProviderError(Injector injector, Key key)
      : super(injector, key, (List<dynamic> keys) {
          var first = stringify(ListWrapper.first(keys).token);
          return '''No provider for ${ first}!${ constructResolvingPath ( keys )}''';
        }) {
    /* super call moved to initializer */;
  }
}

/**
 * Thrown when dependencies form a cycle.
 *
 * ### Example ([live demo](http://plnkr.co/edit/wYQdNos0Tzql3ei1EV9j?p=info))
 *
 * ```typescript
 * var injector = Injector.resolveAndCreate([
 *   provide("one", {useFactory: (two) => "two", deps: [[new Inject("two")]]}),
 *   provide("two", {useFactory: (one) => "one", deps: [[new Inject("one")]]})
 * ]);
 *
 * expect(() => injector.get("one")).toThrowError();
 * ```
 *
 * Retrieving `A` or `B` throws a `CyclicDependencyError` as the graph above cannot be constructed.
 */
class CyclicDependencyError extends AbstractProviderError {
  CyclicDependencyError(Injector injector, Key key)
      : super(injector, key, (List<dynamic> keys) {
          return '''Cannot instantiate cyclic dependency!${ constructResolvingPath ( keys )}''';
        }) {
    /* super call moved to initializer */;
  }
}

/**
 * Thrown when a constructing type returns with an Error.
 *
 * The `InstantiationError` class contains the original error plus the dependency graph which caused
 * this object to be instantiated.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7aWYdcqTQsP0eNqEdUAf?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor() {
 *     throw new Error('message');
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([A]);

 * try {
 *   injector.get(A);
 * } catch (e) {
 *   expect(e instanceof InstantiationError).toBe(true);
 *   expect(e.originalException.message).toEqual("message");
 *   expect(e.originalStack).toBeDefined();
 * }
 * ```
 */
class InstantiationError extends WrappedException {
  /** @internal */
  List<Key> keys;
  /** @internal */
  List<Injector> injectors;
  InstantiationError(
      Injector injector, originalException, originalStack, Key key)
      : super("DI Exception", originalException, originalStack, null) {
    /* super call moved to initializer */;
    this.keys = [key];
    this.injectors = [injector];
  }
  void addKey(Injector injector, Key key) {
    this.injectors.add(injector);
    this.keys.add(key);
  }

  String get wrapperMessage {
    var first = stringify(ListWrapper.first(this.keys).token);
    return '''Error during instantiation of ${ first}!${ constructResolvingPath ( this . keys )}.''';
  }

  Key get causeKey {
    return this.keys[0];
  }

  get context {
    return this.injectors[this.injectors.length - 1].debugContext();
  }
}

/**
 * Thrown when an object other then [Provider] (or `Type`) is passed to [Injector]
 * creation.
 *
 * ### Example ([live demo](http://plnkr.co/edit/YatCFbPAMCL0JSSQ4mvH?p=preview))
 *
 * ```typescript
 * expect(() => Injector.resolveAndCreate(["not a type"])).toThrowError();
 * ```
 */
class InvalidProviderError extends BaseException {
  InvalidProviderError(provider)
      : super(
            "Invalid provider - only instances of Provider and Type are allowed, got: " +
                provider.toString()) {
    /* super call moved to initializer */;
  }
}

/**
 * Thrown when the class has no annotation information.
 *
 * Lack of annotation information prevents the [Injector] from determining which dependencies
 * need to be injected into the constructor.
 *
 * ### Example ([live demo](http://plnkr.co/edit/rHnZtlNS7vJOPQ6pcVkm?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor(b) {}
 * }
 *
 * expect(() => Injector.resolveAndCreate([A])).toThrowError();
 * ```
 *
 * This error is also thrown when the class not marked with [Injectable] has parameter types.
 *
 * ```typescript
 * class B {}
 *
 * class A {
 *   constructor(b:B) {} // no information about the parameter types of A is available at runtime.
 * }
 *
 * expect(() => Injector.resolveAndCreate([A,B])).toThrowError();
 * ```
 */
class NoAnnotationError extends BaseException {
  NoAnnotationError(typeOrFunc, List<List<dynamic>> params)
      : super(NoAnnotationError._genMessage(typeOrFunc, params)) {
    /* super call moved to initializer */;
  }
  static _genMessage(typeOrFunc, List<List<dynamic>> params) {
    var signature = [];
    for (var i = 0, ii = params.length; i < ii; i++) {
      var parameter = params[i];
      if (isBlank(parameter) || parameter.length == 0) {
        signature.add("?");
      } else {
        signature.add(parameter.map(stringify).toList().join(" "));
      }
    }
    return "Cannot resolve all parameters for " +
        stringify(typeOrFunc) +
        "(" +
        signature.join(", ") +
        "). " +
        "Make sure they all have valid type or annotations.";
  }
}

/**
 * Thrown when getting an object by index.
 *
 * ### Example ([live demo](http://plnkr.co/edit/bRs0SX2OTQiJzqvjgl8P?p=preview))
 *
 * ```typescript
 * class A {}
 *
 * var injector = Injector.resolveAndCreate([A]);
 *
 * expect(() => injector.getAt(100)).toThrowError();
 * ```
 */
class OutOfBoundsError extends BaseException {
  OutOfBoundsError(index) : super('''Index ${ index} is out-of-bounds.''') {
    /* super call moved to initializer */;
  }
}
// TODO: add a working example after alpha38 is released

/**
 * Thrown when a multi provider and a regular provider are bound to the same token.
 *
 * ### Example
 *
 * ```typescript
 * expect(() => Injector.resolveAndCreate([
 *   new Provider("Strings", {useValue: "string1", multi: true}),
 *   new Provider("Strings", {useValue: "string2", multi: false})
 * ])).toThrowError();
 * ```
 */
class MixingMultiProvidersWithRegularProvidersError extends BaseException {
  MixingMultiProvidersWithRegularProvidersError(provider1, provider2)
      : super("Cannot mix multi providers and regular providers, got: " +
            provider1.toString() +
            " " +
            provider2.toString()) {
    /* super call moved to initializer */;
  }
}
