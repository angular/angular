import {MapWrapper} from 'angular2/src/facade/collection';
//import {int} from 'angular2/src/facade/lang';

// TODO: uncoment `int` once https://github.com/angular/angular/issues/1414 is fixed

/**
 * A unique object used for retrieving items from the Injector.
 *
 * [Key]s have:
 * - system wide unique [id].
 * - [token] usually the [Type] of the instance.
 *
 * [Key]s are used internaly in [Injector] becouse they have system wide unique [id]s which allow the injector to
 * index in arrays rather ther look up items in maps.
 *
 * @exportedAs angular2/di
 */
export class Key {
  token;
  id/* :int */;
  metadata:any;
  constructor(token, id/* :int */) {
    this.token = token;
    this.id = id;
    this.metadata = null;
  }

  /**
   * Retrieve a [Key] for a token.
   */
  static get(token):Key {
    return _globalKeyRegistry.get(token);
  }

  /**
   * @returns number of [Key]s registered in the system.
   */
  static get numberOfKeys()/* :int */ {
    return _globalKeyRegistry.numberOfKeys;
  }
}

/**
 * @private
 */
export class KeyRegistry {
  _allKeys:Map;
  constructor() {
    this._allKeys = MapWrapper.create();
  }

  get(token):Key {
    if (token instanceof Key) return token;

    if (MapWrapper.contains(this._allKeys, token)) {
      return MapWrapper.get(this._allKeys, token);
    }

    var newKey = new Key(token, Key.numberOfKeys);
    MapWrapper.set(this._allKeys, token, newKey);
    return newKey;
  }

  get numberOfKeys()/* :int */ {
    return MapWrapper.size(this._allKeys);
  }
}

var _globalKeyRegistry = new KeyRegistry();
