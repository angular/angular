import {ListWrapper} from 'angular2/src/core/facade/collection';
import {stringify, isBlank} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {Key} from './key';
import {Injector} from './injector';

function findFirstClosedCycle(keys: any[]): any[] {
  var res = [];
  for (var i = 0; i < keys.length; ++i) {
    if (ListWrapper.contains(res, keys[i])) {
      res.push(keys[i]);
      return res;
    } else {
      res.push(keys[i]);
    }
  }
  return res;
}

function constructResolvingPath(keys: any[]): string {
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
 */
export class AbstractBindingError extends BaseException {
  name: string;
  message: string;
  keys: Key[];
  injectors: Injector[];
  constructResolvingMessage: Function;

  constructor(injector: Injector, key: Key, constructResolvingMessage: Function) {
    super("DI Exception");
    this.keys = [key];
    this.injectors = [injector];
    this.constructResolvingMessage = constructResolvingMessage;
    this.message = this.constructResolvingMessage(this.keys);
  }

  addKey(injector: Injector, key: Key): void {
    this.injectors.push(injector);
    this.keys.push(key);
    this.message = this.constructResolvingMessage(this.keys);
  }

  get context() { return this.injectors[this.injectors.length - 1].debugContext(); }
}

/**
 * Thrown when trying to retrieve a dependency by `Key` from {@link Injector}, but the
 * {@link Injector} does not have a {@link Binding} for {@link Key}.
 */
export class NoBindingError extends AbstractBindingError {
  constructor(injector: Injector, key: Key) {
    super(injector, key, function(keys: any[]) {
      var first = stringify(ListWrapper.first(keys).token);
      return `No provider for ${first}!${constructResolvingPath(keys)}`;
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
 */
export class CyclicDependencyError extends AbstractBindingError {
  constructor(injector: Injector, key: Key) {
    super(injector, key, function(keys: any[]) {
      return `Cannot instantiate cyclic dependency!${constructResolvingPath(keys)}`;
    });
  }
}

/**
 * Thrown when a constructing type returns with an Error.
 *
 * The `InstantiationError` class contains the original error plus the dependency graph which caused
 * this object to be instantiated.
 */
export class InstantiationError extends WrappedException {
  name: string;
  keys: Key[];
  injectors: Injector[];

  constructor(injector: Injector, originalException, originalStack, key: Key) {
    super("DI Exception", originalException, originalStack, null);
    this.keys = [key];
    this.injectors = [injector];
  }

  addKey(injector: Injector, key: Key): void {
    this.injectors.push(injector);
    this.keys.push(key);
  }

  get wrapperMessage(): string {
    var first = stringify(ListWrapper.first(this.keys).token);
    return `Error during instantiation of ${first}!${constructResolvingPath(this.keys)}.`;
  }

  get causeKey(): Key { return this.keys[0]; }

  get context() { return this.injectors[this.injectors.length - 1].debugContext(); }
}

/**
 * Thrown when an object other then {@link Binding} (or `Type`) is passed to {@link Injector}
 * creation.
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
 */
export class NoAnnotationError extends BaseException {
  name: string;
  message: string;
  constructor(typeOrFunc, params: any[][]) {
    super();
    var signature = [];
    for (var i = 0, ii = params.length; i < ii; i++) {
      var parameter = params[i];
      if (isBlank(parameter) || parameter.length == 0) {
        signature.push('?');
      } else {
        signature.push(ListWrapper.map(parameter, stringify).join(' '));
      }
    }
    this.message = "Cannot resolve all parameters for " + stringify(typeOrFunc) + "(" +
                   signature.join(', ') + "). " +
                   'Make sure they all have valid type or annotations.';
  }

  toString(): string { return this.message; }
}

/**
 * Thrown when getting an object by index.
 */
export class OutOfBoundsError extends BaseException {
  message: string;
  constructor(index) {
    super();
    this.message = `Index ${index} is out-of-bounds.`;
  }

  toString(): string { return this.message; }
}

/**
 * Thrown when a multi binding and a regular binding are bound to the same token.
 */
export class MixingMultiBindingsWithRegularBindings extends BaseException {
  message: string;
  constructor(binding1, binding2) {
    super();
    this.message = "Cannot mix multi bindings and regular bindings, got: " + binding1.toString() +
                   " " + binding2.toString();
  }

  toString(): string { return this.message; }
}