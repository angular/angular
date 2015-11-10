library angular2.src.core.di.key;

import "package:angular2/src/facade/lang.dart" show stringify, Type, isBlank;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "type_literal.dart" show TypeLiteral;
import "forward_ref.dart" show resolveForwardRef;
export "type_literal.dart" show TypeLiteral;

/**
 * A unique object used for retrieving items from the [Injector].
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`.
 *
 * `Key` is used internally by [Injector] because its system-wide unique `id` allows the
 * injector to store created objects in a more efficient way.
 *
 * `Key` should not be created directly. [Injector] creates keys automatically when resolving
 * providers.
 */
class Key {
  Object token;
  num id;
  /**
   * Private
   */
  Key(this.token, this.id) {
    if (isBlank(token)) {
      throw new BaseException("Token must be defined!");
    }
  }
  /**
   * Returns a stringified token.
   */
  String get displayName {
    return stringify(this.token);
  }

  /**
   * Retrieves a `Key` for a token.
   */
  static Key get(Object token) {
    return _globalKeyRegistry.get(resolveForwardRef(token));
  }

  /**
   * @returns the number of keys registered in the system.
   */
  static num get numberOfKeys {
    return _globalKeyRegistry.numberOfKeys;
  }
}

/**
 * @internal
 */
class KeyRegistry {
  var _allKeys = new Map<Object, Key>();
  Key get(Object token) {
    if (token is Key) return token;
    // TODO: workaround for https://github.com/Microsoft/TypeScript/issues/3123
    var theToken = token;
    if (token is TypeLiteral) {
      theToken = token.type;
    }
    token = theToken;
    if (this._allKeys.containsKey(token)) {
      return this._allKeys[token];
    }
    var newKey = new Key(token, Key.numberOfKeys);
    this._allKeys[token] = newKey;
    return newKey;
  }

  num get numberOfKeys {
    return this._allKeys.length;
  }
}

var _globalKeyRegistry = new KeyRegistry();
