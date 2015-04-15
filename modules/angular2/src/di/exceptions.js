import {ListWrapper, List} from 'angular2/src/facade/collection';
import {stringify} from 'angular2/src/facade/lang';

function findFirstClosedCycle(keys:List) {
  var res = [];
  for(var i = 0; i < keys.length; ++i) {
    if (ListWrapper.contains(res, keys[i])) {
      ListWrapper.push(res, keys[i]);
      return res;
    } else {
      ListWrapper.push(res, keys[i]);
    }
  }
  return res;
}

function constructResolvingPath(keys:List) {
  if (keys.length > 1) {
    var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
    var tokenStrs = ListWrapper.map(reversed, (k) => stringify(k.token));
    return " (" + tokenStrs.join(' -> ') + ")";
  } else {
    return "";
  }
}


/**
 * Base class for all errors arising from missconfigured bindings.
 *
 * @exportedAs angular2/di_errors
 */
export class ProviderError extends Error {
  keys:List;
  constructResolvingMessage:Function;
  message;
  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  constructor(key, constructResolvingMessage:Function) {
    super();
    this.keys = [key];
    this.constructResolvingMessage = constructResolvingMessage;
    this.message = this.constructResolvingMessage(this.keys);
  }

  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  addKey(key) {
    ListWrapper.push(this.keys, key);
    this.message = this.constructResolvingMessage(this.keys);
  }

  toString() {
    return this.message;
  }
}

/**
 * Thrown when trying to retrieve a dependency by [Key] from [Injector], but [Injector] does not have a [Binding] for
 * said [Key].
 *
 * @exportedAs angular2/di_errors
 */
export class NoProviderError extends ProviderError {
  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  constructor(key) {
    super(key, function (keys:List) {
      var first = stringify(ListWrapper.first(keys).token);
      return `No provider for ${first}!${constructResolvingPath(keys)}`;
    });
  }
}

/**
 * Throw when trying to retrieve async [Binding] using sync API.
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
 * The above example throws because `String` dependes no `Numeber` which is async. If any binding in the dependency
 * graph is async then the graph can only be retrieved using `asyncGet` API.
 *
 * @exportedAs angular2/di_errors
 */
export class AsyncBindingError extends ProviderError {
  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  constructor(key) {
    super(key, function (keys:List) {
      var first = stringify(ListWrapper.first(keys).token);
      return `Cannot instantiate ${first} synchronously. ` +
        `It is provided as a promise!${constructResolvingPath(keys)}`;
    });
  }
}

/**
 * Throw when dependencies from a cyle.
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
 * Retrieving `A` or `B` will throw `CyclicDependencyError` as such a graph can not be constructed.
 *
 * @exportedAs angular2/di_errors
 */
export class CyclicDependencyError extends ProviderError {
  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  constructor(key) {
    super(key, function (keys:List) {
      return `Cannot instantiate cyclic dependency!${constructResolvingPath(keys)}`;
    });
  }
}

/**
 * Thrown when constructing type returns with an Error.
 *
 * The `InstantiationError` class contains the original error plus dependency graph which caused this object to be
 * instantiated.
 *
 * @exportedAs angular2/di_errors
 */
export class InstantiationError extends ProviderError {
  // TODO(tbosch): Can't do key:Key as this results in a circular dependency!
  constructor(originalException, key) {
    super(key, function (keys:List) {
      var first = stringify(ListWrapper.first(keys).token);
      return `Error during instantiation of ${first}!${constructResolvingPath(keys)}.` +
        ` ORIGINAL ERROR: ${originalException}`;
    });
  }
}

/**
 * Thrown when object other then [Binding] (or [Type]) is passed to [Injector] creation.
 *
 * @exportedAs angular2/di_errors
 */
export class InvalidBindingError extends Error {
  message:string;
  constructor(binding) {
    super();
    this.message = `Invalid binding ${binding}`;
  }

  toString() {
    return this.message;
  }
}

/**
 * Thrown when the class as no annotation information.
 *
 * Lack of annotation prevents the [Injector] from determininig what dependencies need to be injected int the
 * constructor.
 *
 * @exportedAs angular2/di_errors
 */
export class NoAnnotationError extends Error {
  message:string;
  constructor(typeOrFunc) {
    super();
    this.message = `Cannot resolve all parameters for ${stringify(typeOrFunc)}.` +
      ` Make sure they all have valid type or annotations.`;
  }

  toString() {
    return this.message;
  }
}
