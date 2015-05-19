import {ListWrapper, List} from 'angular2/src/facade/collection';
import {stringify, BaseException, isBlank} from 'angular2/src/facade/lang';

function findFirstClosedCycle(keys: List<any>): List<any> {
  var res = [];
  for (var i = 0; i < keys.length; ++i) {
    if (ListWrapper.contains(res, keys[i])) {
      ListWrapper.push(res, keys[i]);
      return res;
    } else {
      ListWrapper.push(res, keys[i]);
    }
  }
  return res;
}

function constructResolvingPath(keys: List<any>): string {
  if (keys.length > 1) {
    var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
    var tokenStrs = ListWrapper.map(reversed, (k) => stringify(k.token));
    return " (" + tokenStrs.join(' -> ') + ")";
  } else {
    return "";
  }
}


/**
 * Base class for all errors arising from misconfigured bindings.
 *
 * @exportedAs angular2/di_errors
 */
export class AbstractBindingError extends BaseException {
  name: string;
  message: string;
  keys: List<any>;
  constructResolvingMessage: Function;
  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  constructor(key, constructResolvingMessage: Function) {
    super();
    this.keys = [key];
    this.constructResolvingMessage = constructResolvingMessage;
    this.message = this.constructResolvingMessage(this.keys);
  }

  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  addKey(key): void {
    ListWrapper.push(this.keys, key);
    this.message = this.constructResolvingMessage(this.keys);
  }

  toString(): string { return this.message; }
}

/**
 * Thrown when trying to retrieve a dependency by `Key` from {@link Injector}, but the
 * {@link Injector} does not have a {@link Binding} for {@link Key}.
 *
 * @exportedAs angular2/di_errors
 */
export class NoBindingError extends AbstractBindingError {
  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  constructor(key) {
    super(key, function(keys: List<any>) {
      var first = stringify(ListWrapper.first(keys).token);
      return `No provider for ${first}!${constructResolvingPath(keys)}`;
    });
  }
}

/**
 * Thrown when trying to retrieve an async {@link Binding} using the sync API.
 *
 * ## Example
 *
 * ```javascript
 * var injector = Injector.resolveAndCreate([
 *   bind(Number).toAsyncFactory(() => {
 *     return new Promise((resolve) => resolve(1 + 2));
 *   }),
 *   bind(String).toFactory((v) => { return "Value: " + v; }, [String])
 * ]);
 *
 * injector.asyncGet(String).then((v) => expect(v).toBe('Value: 3'));
 * expect(() => {
 *   injector.get(String);
 * }).toThrowError(AsycBindingError);
 * ```
 *
 * The above example throws because `String` depends on `Number` which is async. If any binding in
 * the dependency graph is async then the graph can only be retrieved using the `asyncGet` API.
 *
 * @exportedAs angular2/di_errors
 */
export class AsyncBindingError extends AbstractBindingError {
  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  constructor(key) {
    super(key, function(keys: List<any>) {
      var first = stringify(ListWrapper.first(keys).token);
      return `Cannot instantiate ${first} synchronously. It is provided as a promise!${constructResolvingPath(keys)}`;
    });
  }
}

/**
 * Thrown when dependencies form a cycle.
 *
 * ## Example:
 *
 * ```javascript
 * class A {
 *   constructor(b:B) {}
 * }
 * class B {
 *   constructor(a:A) {}
 * }
 * ```
 *
 * Retrieving `A` or `B` throws a `CyclicDependencyError` as the graph above cannot be constructed.
 *
 * @exportedAs angular2/di_errors
 */
export class CyclicDependencyError extends AbstractBindingError {
  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  constructor(key) {
    super(key, function(keys: List<any>) {
      return `Cannot instantiate cyclic dependency!${constructResolvingPath(keys)}`;
    });
  }
}

/**
 * Thrown when a constructing type returns with an Error.
 *
 * The `InstantiationError` class contains the original error plus the dependency graph which caused
 * this object to be instantiated.
 *
 * @exportedAs angular2/di_errors
 */
export class InstantiationError extends AbstractBindingError {
  cause;
  causeKey;
  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  constructor(cause, key) {
    super(key, function(keys: List<any>) {
      var first = stringify(ListWrapper.first(keys).token);
      return `Error during instantiation of ${first}!${constructResolvingPath(keys)}. ORIGINAL ERROR: ${cause}`;
    });
    this.cause = cause;
    this.causeKey = key;
  }
}

/**
 * Thrown when an object other then {@link Binding} (or `Type`) is passed to {@link Injector}
 * creation.
 *
 * @exportedAs angular2/di_errors
 */
export class InvalidBindingError extends BaseException {
  message: string;
  constructor(binding) {
    super();
    this.message = "Invalid binding - only instances of Binding and Type are allowed, got: " +
                   binding.toString();
  }

  toString(): string { return this.message; }
}

/**
 * Thrown when the class has no annotation information.
 *
 * Lack of annotation information prevents the {@link Injector} from determining which dependencies
 * need to be injected into the constructor.
 *
 * @exportedAs angular2/di_errors
 */
export class NoAnnotationError extends BaseException {
  name: string;
  message: string;
  constructor(typeOrFunc, params: List<List<any>>) {
    super();
    var signature = ListWrapper.create();
    for (var i = 0, ii = params.length; i < ii; i++) {
      var parameter = params[i];
      if (isBlank(parameter) || parameter.length == 0) {
        ListWrapper.push(signature, '?');
      } else {
        ListWrapper.push(signature, ListWrapper.map(parameter, stringify).join(' '));
      }
    }
    this.message = "Cannot resolve all parameters for " + stringify(typeOrFunc) + "(" +
                   signature.join(', ') + "). " +
                   'Make sure they all have valid type or annotations.';
  }

  toString(): string { return this.message; }
}
